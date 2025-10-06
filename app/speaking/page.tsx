import SpeakingPractice from "@/components/SpeakingPractice";
import React from "react";

type Props = {};
const sentences = [
  "I go to school every day.",
  "She doesn't like apples.",
  "Can you help me, please?",
];
export default function SpeakingPage({}: Props) {
  return (
    <SpeakingPractice
      target={sentences[0]}
      //  onNext={() => setStep(2)}
      //  onBackStep={() => setStep(0)}
    />
  );
}
