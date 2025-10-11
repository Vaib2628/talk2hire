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
      
      // Handle tool calls for interview generation
      if (message.type === "tool-call") {
        console.log('Tool call received:', message);
        
        if (message.toolCall.name === 'generate_interview') {
          const params = message.toolCall.parameters;
          console.log('Generating interview with params:', params);
          
          // Generate the interview
          generateInterview(params)
            .then(result => {
              console.log('Interview generated successfully:', result);
              // Send success message to assistant
              vapi.send({
                type: 'tool-call-result',
                toolCallResult: {
                  result: {
                    success: true,
                    message: 'Interview generated successfully! You will be redirected to the home page shortly.',
                    interviewId: result.interviewId
                  }
                }
              });
            })
            .catch(error => {
              console.error('Error generating interview:', error);
              // Send error message to assistant
              vapi.send({
                type: 'tool-call-result',
                toolCallResult: {
                  result: {
                    success: false,
                    message: 'Failed to generate interview. Please try again.'
                  }
                }
              });
            });
        }
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
      
      // Handle specific error types
      if (error.action === 'error' && error.errorMsg === 'Meeting has ended') {
        console.error("Meeting ended unexpectedly. This usually means:");
        console.error("1. Assistant configuration issue");
        console.error("2. Tool not properly set up");
        console.error("3. API endpoint not accessible");
        console.error("4. Assistant ID incorrect");
        
        alert("Call ended unexpectedly. Please check your Assistant configuration in Vapi dashboard.");
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
      
      // Debug: Check if environment variables are set
      console.log('VAPI_WEB_TOKEN:', process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? 'Set' : 'Missing');
      console.log('VAPI_ASSISTANT_ID:', process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? 'Set' : 'Missing');
      
      if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
        throw new Error('VAPI_WEB_TOKEN is not set');
      }
      
      if (!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID) {
        throw new Error('VAPI_ASSISTANT_ID is not set. You need to create an Assistant in your Vapi dashboard and use its ID instead of a Workflow ID.');
      }
      
      console.log('Starting call with:', {
        assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
        assistantIdLength: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID?.length,
        userName: userName,
        userId: userId,
      });
      
      // Use the start method with Assistant ID
      console.log('Starting call with Assistant ID...');
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus(CallStatus.INACTIVE);
      alert(`Failed to start call: ${error.message}`);
    }
  }

  const generateInterview = async (interviewData) => {
    try {
      console.log('Generating interview with data:', interviewData);
      
      // Generate questions using your existing API
      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...interviewData,
          userid: userId,
          userName: userName
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Interview generated successfully:', result);
        
        // Redirect to home page after successful generation
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
        return result;
      } else {
        const error = await response.json();
        console.error('Error generating interview:', error);
        throw new Error(error.message || 'Failed to generate interview');
      }
    } catch (error) {
      console.error('Error generating interview:', error);
      throw error;
    }
  };

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