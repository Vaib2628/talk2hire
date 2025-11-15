import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AuthProvider } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'

const RootLayout = ({children}) => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className='root-layout'>
          <Navbar />

          {children}
          
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default RootLayout