import { getCurrentUser } from '@/lib/Actions/auth.action';
import { getFeedbackByInterviewId, getInterviewById } from '@/lib/Actions/general.action';
import { redirect } from 'next/dist/server/api-utils';
import React from 'react'

const feedbackPage = async ({params}) => {
  const { id } = await params;
  const user = getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview) redirect('/') 
    const feedback = await getFeedbackByInterviewId({
      interviewId : id ,
      userId : user?.id ,
    })

    console.log(feedback)

  return (
    <div></div>
  )
}

export default feedbackPage