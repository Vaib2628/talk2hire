'use client';
import Agent from '@/components/Agent'
import React, { useState, useEffect } from 'react'

const InterviewPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state to show immediate feedback
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-100 mx-auto"></div>
          <p className="mt-4 text-primary-100">Preparing interview...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h3>Interview Generation</h3>
      <Agent type="generate" />
    </>
  )
}

export default InterviewPage