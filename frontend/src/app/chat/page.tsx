import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Chat - Find Your Match',
};

export default function ChatPage() {
  return <ChatWindow />;
}
