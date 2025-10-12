import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AuthProvider } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

const RootLayout = ({children}) => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className='root-layout'>
          <nav>
            <Link href={'/'} className='flex items-center gap-2'>
              <Image src="/logo.svg" alt="logo" width={32} height={32} />
              <h2 className="text-primary-100">Talk2Hire</h2>
            </Link>
          </nav>

          {children}
          
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default RootLayout