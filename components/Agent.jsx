import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const CallStatus = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  CONNECTING: "CONNECTING",
  FINISHED: "FINISHED",
};
const Agent = ({ userName }) => {
  const isSpeaking = false;
  const callStatus = CallStatus.CONNECTING;

  //Here the transcript messages will come from vapi , For testing we are using some dummy ones
  const messages = [
    "What is your name ?",
    "My name is Vaibhav Patil , Nice to meet you .",
  ];
  const lastMessage = messages[messages.length - 1] ;
  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src={"/ai-avatar.png"}
              alt="vapi"
              height={54}
              width={62}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>Ai interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src={"/user-avatar.png"}
              height={540}
              width={540}
              className="rounded-full object-cover size-[120px]"
              alt="user avatar image"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Transcript message will be shown here */}
        {messages.length > 0 && (
            <div className="transcript-border">
                <div className="transcript">
                   <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0' , 'animate-fadeIn opacity-100')}>
                        {lastMessage}
                    </p> 
                </div>
            </div>
        )}

      {/* The call and end button */}
      <div className="w-full justify-center flex">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call">
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-70",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span>
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect">
            <span>End</span>
          </button>
        )}
      </div>

    </>
  );
};

export default Agent;
