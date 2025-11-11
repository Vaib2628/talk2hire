'use client';
import Agent from '@/components/Agent'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context';

const InterviewPage = () => {
 const {user , isLoading} = useAuth();
 const userName = user?.name || "Guest";
 const userId = user?.id || `guest_${Date.now()}`;

  return (
    <>
      <h3>Interview Generation</h3>
      <Agent type="generate" userName={userName} userId={userId} />
    </>
  )
}

export default InterviewPage