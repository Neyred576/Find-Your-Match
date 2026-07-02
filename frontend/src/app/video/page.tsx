import VideoChat from '@/components/VideoChat';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Chat - Find Your Match',
};

export default function VideoPage() {
  return <VideoChat />;
}
