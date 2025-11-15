import React from "react";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import Link from "next/link";
import Image from "next/image";
import {
  getCurrentUser
} from "@/lib/Actions/auth.action";
import { getInterviewsByUserId , getLatestInterviews } from "@/lib/Actions/general.action";
const HomePage = async () => {
  const userRecord = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(userRecord?.id),
    getLatestInterviews({ userId: userRecord?.id }),
  ]);

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = latestInterviews?.length > 0;
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-4 max-w-lg">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
            Get the Interview ready with AI assistant
          </h2>
          <p className="text-lg text-light-100/80 leading-relaxed">
            Practice your job interviews with the AI assistant and get detailed feedback to improve your skills
          </p>
          <Link href={"/interview"} className="w-fit">
            <Button className="btn-primary max-lg:w-full group">
              <span>Get Started</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
        <div className="max-lg:hidden animate-float">
          <Image src="/robot.png" alt="robot" width={400} height={400} priority />
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Your Interviews</h2>
          {hasPastInterviews && (
            <span className="text-sm text-light-400 bg-dark-200 px-3 py-1 rounded-full">
              {userInterviews.length} {userInterviews.length === 1 ? 'interview' : 'interviews'}
            </span>
          )}
        </div>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews.map((interview, index) => (
              <div key={interview.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                <InterviewCard {...interview} />
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="flex flex-col items-center justify-center w-full py-16 px-8 bg-dark-200/50 rounded-2xl border border-border/40">
                <Image src="/calendar.svg" alt="empty" width={64} height={64} className="opacity-50 mb-4" />
                <h3 className="text-xl font-semibold text-light-100 mb-2">No interviews yet</h3>
                <p className="text-light-400 text-center mb-6">
                  You haven&apos;t taken any interviews yet. Start your first interview to get personalized feedback.
                </p>
                <Link href="/interview">
                  <Button className="btn-primary">
                    Start Your First Interview
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col mt-12 gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Take an Interview</h2>
          {hasUpcomingInterviews && (
            <span className="text-sm text-light-400 bg-dark-200 px-3 py-1 rounded-full">
              {latestInterviews.length} available
            </span>
          )}
        </div>
        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            latestInterviews.map((interview, index) => (
              <div key={interview.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                <InterviewCard {...interview} />
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="flex flex-col items-center justify-center w-full py-16 px-8 bg-dark-200/50 rounded-2xl border border-border/40">
                <Image src="/star.svg" alt="empty" width={64} height={64} className="opacity-50 mb-4" />
                <h3 className="text-xl font-semibold text-light-100 mb-2">No interviews available</h3>
                <p className="text-light-400 text-center">
                  There aren&apos;t any other interviews available at the moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
