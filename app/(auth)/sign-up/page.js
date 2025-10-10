import AuthForm from '@/components/AuthForm'
import { isAuthenticated } from '@/lib/Actions/auth.action'
import { redirect } from 'next/navigation';
import React from 'react'

const SignUpPage = async () => {

  //check first whather the user is authenticated already or not 
  const isUserAuthenticated = await isAuthenticated();

  if (isUserAuthenticated) redirect('/') ;  
  return (  
    <AuthForm type="sign-up"/>
  )
}

export default SignUpPage