import React from "react";
import { getInterviewById } from "@/lib/Actions/general.action";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import DisplayTechIcons from "@/components/ui/DisplayTechIcons";
import { getCurrentUser } from "@/lib/Actions/auth.action";
import Agent from "@/components/Agent";

const InterviewPage = async ({ params }) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview || !interview.id) {
    redirect("/");
  }

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={interview.coverImage || getRandomInterviewCover(id)}
              width={40}
              height={40}
              alt="interview cover"
              className="rounded-full object-fit size-[40px]"
            />
            <h3 className="capitalize">{interview.role}</h3>
          </div>
          <DisplayTechIcons techstack={interview.techstack} />
        </div>
        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">
          {interview.type}
        </p>
      </div>

      <Agent
        type="interview"
        interviewId={id}
        questions={interview.questions}
        userName={user?.name}
        userId={user?.id}
      />
    </>
  );
};

export default InterviewPage;
