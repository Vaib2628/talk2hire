import React from "react";
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/constants";
import InterviewCard from "@/components/InterviewCard";
import Link from "next/link";
import Image from "next/image";
const HomePage = () => {
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-4 max-w-lg">
          <h2>Get the Interview ready with AI assistant</h2>
          <p className="text-lg">
            Practice your job interviews with the AI assistant and get the best
            results
          </p>
          <Button className="btn-primary max-lg:w-full">
            <Link href={"/interview"}>
              <span>Get Started</span>
            </Link>
          </Button>
        </div>
        <div className="max-lg:hidden">
          <Image src="/robot.png" alt="robot" width={400} height={400} />
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {dummyInterviews.map((interview) => (
            <InterviewCard {...interview} key={interview.id}/>
          ))}
        </div>
      </section>

      <section className="flex flex-col mt-8 gap-6">
        <h2>Take an interview</h2>
        <div className="interviews-section">
          {dummyInterviews.map((interview) => (
            <InterviewCard {...interview} key={interview.id}/>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
