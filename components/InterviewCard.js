import React from 'react'
import dayjs from 'dayjs';
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './ui/DisplayTechIcons';
const InterviewCard = ({id , userId ,role , type , techstack , level , questions , finalized , createdAt, feedback}) => {
    const normalizedType = /mix/gi.test(type) ? 'mixed' : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');
    
    

  const hasFeedback = !!feedback?.totalScore;
  const scoreColor = hasFeedback 
    ? feedback.totalScore >= 80 ? 'text-success-100' 
    : feedback.totalScore >= 60 ? 'text-primary-200' 
    : 'text-destructive-100'
    : 'text-light-400';

  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96 group hover:scale-[1.02] transition-transform duration-300'>
        <div className='card-interview hover:shadow-xl transition-shadow duration-300'>
            <div>
                <div className='absolute top-0 right-0 px-4 py-2 rounded-bl-lg w-fit bg-light-600 z-10'>
                    <p className='badge-text'>{normalizedType}</p>
                </div>  

                <div className="relative">
                  <Image 
                    src={getRandomInterviewCover(id)} 
                    height={90} 
                    width={90} 
                    alt='Cover Image' 
                    className='rounded-full object-fit size-[90px] ring-2 ring-primary-200/20 group-hover:ring-primary-200/50 transition-all duration-300' 
                  />
                  {hasFeedback && (
                    <div className="absolute -bottom-1 -right-1 bg-success-100 rounded-full p-1.5 shadow-lg">
                      <Image src={'/star.svg'} alt='completed' height={16} width={16} />
                    </div>
                  )}
                </div>

                <h3 className='mt-4 capitalize text-xl font-bold'>{role} Interview</h3>
                {level && (
                  <p className="text-sm text-light-400 mt-1 capitalize">{level} Level</p>
                )}

                <div className='flex gap-5 mt-4 justify-between'>
                    <div className='flex gap-2 items-center'>
                        <Image src={'/calendar.svg'} alt='calendar' height={20} width={20} className="opacity-70" />
                        <p className="text-sm">{formattedDate}</p>
                    </div>

                    <div className={`flex gap-2 items-center ${scoreColor} font-semibold`}>
                        <Image src={'/star.svg'} alt='star' height={20} width={20} />
                        <p className="text-sm">
                            {feedback?.totalScore || '---'}/100 
                        </p>
                    </div>
                </div>

                <div className="mt-5 min-h-[3rem]">
                  {hasFeedback ? (
                    <p className='line-clamp-2 text-sm leading-relaxed'>{feedback?.finalAssessment || "Interview completed. Check your detailed feedback."}</p>
                  ) : (
                    <p className='line-clamp-2 text-sm text-light-400 leading-relaxed'>
                      You haven&apos;t taken this interview yet. Take it now to improve your skills and get personalized feedback.
                    </p>
                  )}
                </div>
            </div>

            <div className='flex justify-between items-center gap-4 mt-auto pt-4 border-t border-border/20'>
                <DisplayTechIcons techstack={techstack} />

                <Button className={'btn-primary group/btn'} asChild>
                    <Link 
                      href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}
                      className="flex items-center gap-2"
                    >
                        <span>{feedback ? 'View Feedback' : 'Start Interview'}</span>
                        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  )
}

export default InterviewCard