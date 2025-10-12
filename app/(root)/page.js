import React from "react";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import Link from "next/link";
import Image from "next/image";
import {
  getCurrentUser,
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/Actions/auth.action";
const HomePage = async () => {
  const userRecord = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    await getInterviewsByUserId(userRecord?.id),
    await getLatestInterviews({ userId: userRecord?.id }),
  ]);
  // this below will depend on each other , but we want to make it paraller
  // const userInterviews = await getInterviewsByUserId(userRecord?.id);
  // const latestInterviews = await getLatestInterviews({userId : userRecord?.id})

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = latestInterviews?.length > 0;
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-4 max-w-lg">
          <h2>Get the Interview ready with AI assistant</h2>
          <p className="text-lg">
            Practice your job interviews with the AI assistant and get the best
            results
          </p>
          <Link href={"/interview"}>
            <Button className="btn-primary max-lg:w-full">
              <span>Get Started</span>
            </Button>
          </Link>
        </div>
        <div className="max-lg:hidden">
          <Image src="/robot.png" alt="robot" width={400} height={400} />
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p> You haven&apos;t taken any interviews yet .</p>
          )}
        </div>
      </section>

      <section className="flex flex-col mt-8 gap-6">
        <h2>Take an interview</h2>
        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            latestInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p> There aren&apos;t any other interviews available .</p>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
