import AuthForm from '@/components/AuthForm'
import { isAuthenticated } from '@/lib/Actions/auth.action'
import { redirect } from 'next/navigation'
import React from 'react'

const SignInPage = async () => {
  const isUserAuthenticated = await isAuthenticated();

  if (isUserAuthenticated) redirect('/');
  return (
    <AuthForm type="sign-in"/>
  )
}

export default SignInPage