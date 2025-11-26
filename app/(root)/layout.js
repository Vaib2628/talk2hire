import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'

const RootLayout = ({children}) => {
  return (
    <ProtectedRoute>
      <div className='root-layout'>
        <Navbar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default RootLayout
