"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
const CallStatus = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  CONNECTING: "CONNECTING",
  FINISHED: "FINISHED",
};
const Agent = ({ userName, userId, type }) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);

  //Here the transcript messages will come from vapi , For testing we are using some dummy ones
  // const messages = [
  //   "What is your name ?",
  //   "My name is Vaibhav Patil , Nice to meet you .",
  // ];

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => {
          return [...prev, newMessage];
        });
      }
    };

    const onSpeachStart = () => setIsSpeaking(true);
    const onSpeachEnd = () => setIsSpeaking(false);

    const onError = (error) => console.log("Error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeachStart);
    vapi.on("speech-end", onSpeachEnd);
    vapi.on("error", onError);

    //every time we call the eventhandlers in useeffect make sure to remove it in return
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeachStart);
      vapi.off("speech-end", onSpeachEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(()=>{
    if(callStatus === CallStatus.FINISHED) router.push('/');
  }, [messages, callStatus, type, userId])

  const handleCall = async ()=>{
    setCallStatus(CallStatus.CONNECTING) ;
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID , {
      variableValues : {
        username : userName ,
        userid : userId ,
      }
    });
  }

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED) ;
    await vapi.stop() ;
  }

  //now getting the latest transcripted message from the user 

  const latestMessage = messages[messages.length - 1]?.content ;

  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || CallStatus.FINISHED ;


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
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      {/* The call and end button */}
      <div className="w-full justify-center flex">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-70",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span>
              {isCallInactiveOrFinished ? "Call" : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            <span>End</span>
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
