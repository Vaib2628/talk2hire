import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
const RootLayout = ({children}) => {
  return (
    <div className='root-layout'>
      <nav>
        <Link href={'/'} className='flex items-center gap-2'>
          <Image src="/logo.svg" alt="logo" width={32} height={32} />
          <h2 className="text-primary-100">Talk2Hire</h2>
        </Link>
      </nav>

      {children}
      
    </div>
  )
}

export default RootLayout