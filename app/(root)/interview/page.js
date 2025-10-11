import Agent from '@/components/Agent'
import { getCurrentUser } from '@/lib/Actions/auth.action'
import React from 'react'

const InterviewPage = async () => {
  //Getting the user details
  const user = await getCurrentUser();

  return (
    <>
      <h3>Interview Generation</h3>
        <Agent type="generate" userName={user?.name} userId={user?.id}/>
    </>
  )
}

export default InterviewPage