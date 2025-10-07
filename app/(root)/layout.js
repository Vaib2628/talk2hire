import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { isAuthenticated } from '@/lib/Actions/auth.action'
import { redirect } from 'next/navigation'
const RootLayout = async ({children}) => {
  //check wheather the user is authenticated or not ?

  const isUserAuthenticated = await isAuthenticated();

  if(!isUserAuthenticated) {
    redirect('/sign-in');
  }
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