import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/Actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/Actions/auth.action";

const Feedback = async ({ params }) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id,
  });

  const scoreColor = feedback?.totalScore >= 80 ? 'text-success-100' 
    : feedback?.totalScore >= 60 ? 'text-primary-200' 
    : 'text-destructive-100';

  return (
    <section className="section-feedback">
      <div className="flex flex-col items-center gap-4 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
          Interview Feedback
        </h1>
        <p className="text-xl text-light-400 capitalize">{interview.role} Interview</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        {/* Overall Score Card */}
        <div className="flex flex-row gap-3 items-center justify-center p-4 bg-dark-200 rounded-xl border border-border/40">
          <div className={`p-2 rounded-lg bg-dark-300 ${scoreColor}`}>
            <Image src="/star.svg" width={24} height={24} alt="star" />
          </div>
          <div>
            <p className="text-sm text-light-400">Overall Score</p>
            <p className={`text-2xl font-bold ${scoreColor}`}>
              {feedback?.totalScore || 'N/A'}/100
            </p>
          </div>
        </div>

        {/* Date Card */}
        <div className="flex flex-row gap-3 items-center justify-center p-4 bg-dark-200 rounded-xl border border-border/40">
          <div className="p-2 rounded-lg bg-dark-300">
            <Image src="/calendar.svg" width={24} height={24} alt="calendar" className="opacity-70" />
          </div>
          <div>
            <p className="text-sm text-light-400">Completed</p>
            <p className="text-lg font-semibold text-light-100">
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="card-border mb-8">
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary-100">Final Assessment</h2>
          <p className="text-lg leading-relaxed text-light-100">{feedback?.finalAssessment || "No assessment available."}</p>
        </div>
      </div>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-6 mb-8">
        <h2 className="text-2xl font-bold">Category Breakdown</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {feedback?.categoryScores?.map((category, index) => {
            const categoryScoreColor = category.score >= 80 ? 'text-success-100' 
              : category.score >= 60 ? 'text-primary-200' 
              : 'text-destructive-100';
            
            return (
              <div key={index} className="card-border">
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-light-100">{category.name}</h3>
                    <span className={`text-xl font-bold ${categoryScoreColor}`}>
                      {category.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-dark-300 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        category.score >= 80 ? 'bg-success-100' 
                        : category.score >= 60 ? 'bg-primary-200' 
                        : 'bg-destructive-100'
                      }`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-light-400 leading-relaxed">{category.comment}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="card-border">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-success-100/20">
                <svg className="w-5 h-5 text-success-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-success-100">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {feedback?.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-light-100">
                  <span className="text-success-100 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-border">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary-200/20">
                <svg className="w-5 h-5 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-200">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {feedback?.areasForImprovement?.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-light-100">
                  <span className="text-primary-200 mt-1">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1 group" asChild>
          <Link href="/" className="flex w-full justify-center items-center gap-2">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-semibold text-primary-200">Back to Dashboard</span>
          </Link>
        </Button>

        <Button className="btn-primary flex-1 group" asChild>
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center items-center gap-2"
          >
            <span className="text-sm font-semibold text-black">Retake Interview</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;