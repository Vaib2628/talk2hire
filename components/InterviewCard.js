import React from 'react'
import dayjs from 'dayjs';
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './ui/DisplayTechIcons';
const InterviewCard = ({id , userId ,role , type , techstack , level , questions , finalized , createdAt}) => {
    const feedback = null ;
    const normalizedType = /mix/gi.test(type) ? 'mixed' : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');
    
    

  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
        <div className='card-interview'>
            <div>
                <div className='absolute top-0 right-0 px-4 py-2 rounded-bl-lg w-fit bg-light-600'>
                    <p className='badge-text'>{normalizedType}</p>
                </div>  

                <Image src={getRandomInterviewCover()} height={90} width={90} alt='Cover Image' className='rounded-full object-fit size-[90px]' />

                <h3 className='mt-2 capitalize'>{role} Interview</h3>

                <div className='flex gap-5 mt-3 justify-between'>
                    <div className='flex gap-2'>
                        <Image src={'/calendar.svg'} alt='calendar' height={22} width={22} />
                        <p>{formattedDate}</p>
                    </div>

                    <div className='flex gap-2 items-center'>
                        <Image src={'/star.svg'} alt='star' height={22} width={22} />
                        <p>
                            {feedback?.totalScore || '---' }/100 
                        </p>
                    </div>
                </div>

                <p className='line-clamp-2 mt-5'>{feedback?.finalScore || "You haven't taken the interview yet. Take it now to improve the skills."}</p>
            </div>

            <div className='flex justify-between'>
                <DisplayTechIcons techstack={techstack} />

                <Button className={'btn-primary'}>
                    <Link href={feedback ? `/interview/${id}/feedback`
                    : `/interview/${id}` }>
                        {feedback ? 'Check Feedback' : 'View Interview'}
                    </Link>
                </Button>
            </div>
        </div>

    </div>
  )
}

export default InterviewCard