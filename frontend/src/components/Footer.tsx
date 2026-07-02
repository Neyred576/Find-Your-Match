import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 border-t border-white/10 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display font-bold text-2xl tracking-tight brand-gradient-text">
                Find Your Match
              </span>
            </Link>
            <p className="text-white/50 max-w-sm mb-6 leading-relaxed">
              The premium platform to connect with strangers worldwide instantly. 
              No signup, no hassle. Just meaningful connections.
            </p>
            <div className="flex gap-4">
              {/* Social links could go here */}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Connect</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/chat" className="text-white/50 hover:text-brand-red transition-colors">
                  Text Chat
                </Link>
              </li>
              <li>
                <Link href="/video" className="text-white/50 hover:text-brand-red transition-colors">
                  Video Chat
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/terms" className="text-white/50 hover:text-brand-red transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/50 hover:text-brand-red transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {currentYear} Find Your Match. All rights reserved.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-2">
            Made with <FiHeart className="text-brand-red" /> for connections
          </p>
        </div>
      </div>
    </footer>
  );
}
