'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <nav className="flex items-center justify-between w-full border-b border-border/40 mb-0 py-3">
      <Link href={'/'} prefetch className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
        <Image src="/logo.svg" alt="logo" width={32} height={32} className="animate-pulse" />
        <h2 className="text-primary-100 font-bold text-xl">Talk2Hire</h2>
      </Link>

      <div className="flex items-center gap-4">
        <Link 
          href="/interview" 
          prefetch={true}
          className="hidden sm:block text-light-100 hover:text-primary-200 transition-colors font-medium"
        >
          New Interview
        </Link>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-200 hover:bg-dark-300 transition-colors"
            aria-label="User menu"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-200 text-dark-100 font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-light-100 font-medium max-w-[120px] truncate">
              {user?.name || 'User'}
            </span>
            <svg 
              className={`w-4 h-4 text-light-100 transition-transform ${showMenu ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-dark-200 rounded-lg shadow-lg border border-border/40 z-20 overflow-hidden animate-fadeIn">
                <div className="px-4 py-3 border-b border-border/40">
                  <p className="text-sm font-semibold text-light-100 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-light-400 truncate">{user?.email || ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/"
                    prefetch
                    className="block px-4 py-2 text-sm text-light-100 hover:bg-dark-300 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/interview"
                    prefetch
                    className="block px-4 py-2 text-sm text-light-100 hover:bg-dark-300 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    New Interview
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-destructive-100 hover:bg-dark-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

