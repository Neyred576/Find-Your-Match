'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiFilm, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVideosWarning, setShowVideosWarning] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Text Chat', href: '/chat' },
    { name: 'Video Chat', href: '/video' },
    { name: 'Videos', href: '/videos', requiresConfirm: true },
  ];

  const handleNavClick = (e: React.MouseEvent, link: { href: string; requiresConfirm?: boolean }) => {
    if (link.requiresConfirm) {
      e.preventDefault();
      setShowVideosWarning(true);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-dark-900/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 group-hover:border-brand-red/50 transition-colors">
                {/* Fallback heart if logo fails to load, otherwise use real logo */}
                <div className="absolute inset-0 bg-brand-red flex items-center justify-center text-white font-bold text-xl logo-heartbeat">
                  ❤
                </div>
                <Image 
                  src="/logo.jpg" 
                  alt="Find Your Match Logo" 
                  fill 
                  className="object-cover z-10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="font-display font-bold text-xl tracking-tight brand-gradient-text">
                Find Your Match
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6 glass-card px-6 py-2 rounded-full">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`text-sm font-medium transition-colors hover:text-brand-red ${
                      pathname === link.href ? 'text-brand-red' : 'text-white/70'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white/80 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-dark-800 border-b border-white/10 p-4 md:hidden shadow-glass"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      if (link.requiresConfirm) {
                        e.preventDefault();
                        setShowVideosWarning(true);
                        setMobileMenuOpen(false);
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={`text-lg font-medium p-3 rounded-xl transition-colors ${
                      pathname === link.href ? 'bg-brand-red/10 text-brand-red' : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Videos Warning Modal */}
      <AnimatePresence>
        {showVideosWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
                <FiFilm className="text-brand-red text-3xl" />
              </div>

              <h2 className="text-2xl font-display font-bold mb-2">Watch Videos?</h2>
              <p className="text-white/60 text-sm mb-6">
                You are about to visit the <strong className="text-white">Videos</strong> page where community content is displayed. Do you want to continue?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVideosWarning(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowVideosWarning(false);
                    router.push('/videos');
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-red hover:bg-brand-red/80 text-white transition-all text-sm font-bold"
                >
                  Yes, Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
