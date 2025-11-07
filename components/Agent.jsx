"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { useAuth } from "@/lib/auth-context";

const CallStatus = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  CONNECTING: "CONNECTING",
  FINISHED: "FINISHED",
};

const Agent = ({ type }) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState([]);
  const userName = user?.name;
  const userId = user?.id;

  console.log(userName , userId);
  
  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-100 mx-auto"></div>
          <p className="mt-4 text-primary-100">Loading...</p>
        </div>
      </div>
    );
  }

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

    const onError = async (error) => {
      console.error("Vapi Error:", error);
      console.error("Error details:", {
        type: error.type,
        stage: error.stage,
        error: error.error,
        context: error.context,
        action: error.action,
        errorMsg: error.errorMsg
      });
      
      // Handle specific error types - don't show alert for normal call endings
      if (error.action === 'error' && error.errorMsg === 'Meeting has ended') {
        // This is a normal call end, don't show error alert
        setCallStatus(CallStatus.INACTIVE);
        return;
      }
      
      setCallStatus(CallStatus.INACTIVE);
      alert(`Call error: ${error.errorMsg || error.error?.message || error.message || 'Unknown error'}`);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeachStart);
    vapi.on("speech-end", onSpeachEnd);
    vapi.on("error", onError);

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
    try {
      setCallStatus(CallStatus.CONNECTING) ;
      
      
      if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
        throw new Error('VAPI_WEB_TOKEN is not set');
      }
      
      if (!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID) {
        throw new Error('VAPI_ASSISTANT_ID is not set. You need to create an Assistant in your Vapi dashboard and use its ID instead of a Workflow ID.');
      }
      
      const assistantOverrides = {
        recordingEnabled: false,
        variableValues: {
          userid: userId,
          username: userName,
        },
      };
      
      await vapi.start(
        process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
        assistantOverrides,
      );
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus(CallStatus.INACTIVE);
      alert(`Failed to start call: ${error.message}`);
    }
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