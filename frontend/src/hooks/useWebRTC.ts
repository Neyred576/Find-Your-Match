import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export const useWebRTC = (socket: Socket | null, isConnected: boolean) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [status, setStatus] = useState<'requesting' | 'waiting' | 'chatting' | 'error'>('requesting');
  const [partnerSocketId, setPartnerSocketId] = useState<string | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize media
  const getMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setStatus('waiting');
      if (socket && isConnected) {
        socket.emit('join_queue', { type: 'video' });
      }
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setStatus('error');
      toast.error('Could not access camera or microphone. Please check permissions.');
    }
  }, [socket, isConnected]);

  useEffect(() => {
    getMedia();
    
    return () => {
      // Cleanup media tracks on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Setup WebRTC connection
  const createPeerConnection = useCallback((targetSocketId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    peerConnectionRef.current = pc;

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote track arrival
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc_ice_candidate', {
          target: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        toast.error('Connection lost.');
        handleEndCall();
      }
    };

    return pc;
  }, [localStream, socket]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMatched = async (data: { partnerId: string, initiator: boolean }) => {
      setStatus('chatting');
      setPartnerSocketId(data.partnerId);
      toast.success('Found a match!');

      const pc = createPeerConnection(data.partnerId);
      
      if (data.initiator) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc_offer', { target: data.partnerId, offer });
        } catch (e) {
          console.error('Error creating offer', e);
        }
      }
    };

    const handleOffer = async (data: { senderId: string, offer: RTCSessionDescriptionInit }) => {
      if (status !== 'chatting') {
        setStatus('chatting');
        setPartnerSocketId(data.senderId);
      }
      
      let pc = peerConnectionRef.current;
      if (!pc || pc.signalingState === 'closed') {
         pc = createPeerConnection(data.senderId);
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc_answer', { target: data.senderId, answer });
      } catch (e) {
        console.error('Error handling offer', e);
      }
    };

    const handleAnswer = async (data: { senderId: string, answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.signalingState !== 'closed') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (e) {
          console.error('Error handling answer', e);
        }
      }
    };

    const handleIceCandidate = async (data: { senderId: string, candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.signalingState !== 'closed') {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      }
    };

    const handlePartnerDisconnected = () => {
      handleEndCall();
      toast.error('Partner left. Finding a new match...');
    };

    socket.on('video_matched', handleMatched);
    socket.on('webrtc_offer', handleOffer);
    socket.on('webrtc_answer', handleAnswer);
    socket.on('webrtc_ice_candidate', handleIceCandidate);
    socket.on('partner_disconnected', handlePartnerDisconnected);

    return () => {
      socket.off('video_matched', handleMatched);
      socket.off('webrtc_offer', handleOffer);
      socket.off('webrtc_answer', handleAnswer);
      socket.off('webrtc_ice_candidate', handleIceCandidate);
      socket.off('partner_disconnected', handlePartnerDisconnected);
    };
  }, [socket, isConnected, createPeerConnection, status]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isCamOn;
      setIsCamOn(!isCamOn);
    }
  };

  const handleEndCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setPartnerSocketId(null);
    setStatus('waiting');
    
    if (socket) {
      socket.emit('join_queue', { type: 'video' });
    }
  }, [socket]);

  const skipMatch = () => {
    if (socket) {
      socket.emit('skip');
    }
    handleEndCall();
    toast('Looking for new match...', { icon: '🔍' });
  };

  return {
    localVideoRef,
    remoteVideoRef,
    isMicOn,
    isCamOn,
    toggleMic,
    toggleCam,
    status,
    skipMatch,
    handleEndCall,
    remoteStream
  };
};
