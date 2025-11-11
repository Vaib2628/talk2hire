"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { useAuth } from "@/lib/auth-context"; // ← YOUR CUSTOM AUTH
import Router from "next/router";
import { interviewer } from "@/constants";

const CallStatus = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  CONNECTING: "CONNECTING",
  FINISHED: "FINISHED",
};

const Agent = ({ type, interviewId, questions, userName, userId }) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState([]);
  const hasStartedRef = useRef(false);

  // === REAL USER DATA (FALLBACK IF NOT LOGGED IN) ===
  // const userName = user?.name || "Guest";
  // const userId = user?.id || `guest_${Date.now()}`;

  // === NUCLEAR BYPASS (UNCHANGED) ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      delete window.navigator.__proto__.userAgentData;
    } catch (e) {}

    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      writable: false,
      configurable: true,
    });
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
      configurable: true,
    });
    Object.defineProperty(navigator, "plugins", {
      get: () => [{ name: "Chrome PDF Plugin" }, { name: "Chrome PDF Viewer" }],
      configurable: true,
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
      configurable: true,
    });

    window.chrome = window.chrome || {};
    window.chrome.runtime = window.chrome.runtime || {};
    window.chrome.runtime.id = "vapi-bypass-extension";

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      if (args[0]?.includes?.("api.vapi.ai")) {
        const headers = new Headers(args[1]?.headers || {});
        headers.set("Origin", "https://talk2hire-sepia.vercel.app");
        headers.set("Sec-Fetch-Site", "cross-site");
        args[1] = { ...args[1], headers };
      }
      return originalFetch.apply(this, args);
    };

    console.log("VAPI BYPASS ACTIVE");
  }, []);

  // === VAPI LISTENERS ===
  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (msg) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { role: msg.role, content: msg.transcript },
        ]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);
  //  HANDLING GENERATE FEEDBACK

  const handleGenerateFeedback = async (messages) => {
    console.log("generate feedback here");
    const { success, id } = {
      success: true,
      id: "feedback-id",
    };

    //TODO : create a server action that will generate the feedback

    if (success && id) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      console.log("Error saving the feedback");
      router.push("/");
    }
  };

  // === REDIRECT AFTER END ===
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") router.push(`/interview/${interviewId}`);
      else if (type === "interview") handleGenerateFeedback(messages);
    }
  }, [callStatus, router, type, interviewId]);

  // === START CALL — REAL USER VARS ===
  const handleCall = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    try {
      setCallStatus(CallStatus.CONNECTING);
      console.log("Starting Vapi with Firebase user:", { userId, userName });

      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID, {
          recordingEnabled: false,
          firstMessage: `Hey ${userName}! What role are you preparing for?`,
          variableValues: {
            userid: userId,
            username: userName,
          },
        });
      } else {
        let formattedQuestions = "" ;
        if ( questions) {
          formattedQuestions = questions.map((question)=> `- ${question}`).join('\n')
        }

        await vapi.start(interviewer, {
          variableValues : {
            questions : formattedQuestions
          }
        })
      }


      console.log("Vapi call started with real Firebase user");
    } catch (error) {
      console.error("Vapi start failed:", error);
      alert("Call failed. Are you logged in?");
      setCallStatus(CallStatus.INACTIVE);
      hasStartedRef.current = false;
    }
  };

  // === END CALL ===
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    await vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI"
              height={54}
              width={62}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              height={540}
              width={540}
              className="rounded-full object-cover size-[120px]"
              alt="user"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="transition-opacity duration-500 opacity-0 animate-fadeIn opacity-100">
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full justify-center flex">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-70",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span>{isCallInactiveOrFinished ? "Call" : ". . ."}</span>
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
