import React from 'react'
import {getInterviewById} from '@/lib/Actions/general.action'
import { redirect } from 'next/navigation'

const InterviewPage = async ({params}) => {
    const {id} = await params;
    const interview = await getInterviewById(id);

    if (!interview || !interview.id) {
        redirect('/');
    }

  return (
    <div>
        <h1>Interview Details</h1>
        <p>Interview ID: {interview.id}</p>
        <p>Role: {interview.role}</p>
        <p>Level: {interview.level}</p>
        <p>Type: {interview.type}</p>
        {/* Add more interview details here */}
    </div>
  )
}

export default InterviewPage