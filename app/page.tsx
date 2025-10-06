"use client";
import { useState } from "react";
import SpeakingPractice from "../components/SpeakingPractice";
import WritingPractice from "../components/WrittingPractice";
import Link from "next/link";
import WritingTopicPractice from "@/components/WritingTopicPractice";

export default function Home() {
  const [step, setStep] = useState(0);
  const sentences = [
    "I go to school every day.",
    "She doesn't like apples.",
    "Can you help me, please?",
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded bg-white">
        <WritingTopicPractice />
      </div>

      {/* {step === 0 && <WritingPractice onNext={() => setStep(1)} />}

      {step === 1 && (
        <SpeakingPractice
          target={sentences[0]}
          onNext={() => setStep(2)}
          onBackStep={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <div className="p-4 bg-white border rounded">
          Placeholder for Listening / Reading exercises.
        </div>
      )} */}
    </div>
  );
}
