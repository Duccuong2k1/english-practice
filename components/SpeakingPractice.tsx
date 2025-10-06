"use client";
import { useState } from "react";

export default function SpeakingPractice({
  target,
  onNext,
  onBackStep,
}: {
  target: string;
  onNext?: () => void;
  onBackStep?: () => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  function playTarget() {
    const u = new SpeechSynthesisUtterance(target);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }

  function startRecognition() {
    const Any = window as any;
    const SpeechRecognition =
      Any.webkitSpeechRecognition || Any.SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ SpeechRecognition. Dùng Chrome.");
      return;
    }
    const r = new SpeechRecognition();
    r.lang = "en-US";
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setTranscript(t);
    };
    r.onend = () => setListening(false);
    r.start();
    setListening(true);
  }

  async function sendForEval() {
    const res = await fetch("/api/speech-eval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, target }),
    });
    const data = await res.json();
    setFeedback(data.feedback ?? data.error ?? "No feedback");
  }

  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-xl font-semibold mb-2">Nói — Speaking practice</h2>
      <div className="mb-2">
        Câu mẫu: <strong>{target}</strong>
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 bg-green-600 text-white rounded"
          onClick={playTarget}
        >
          Nghe mẫu
        </button>
        <button
          className="px-3 py-1 bg-yellow-500 text-white rounded"
          onClick={startRecognition}
        >
          {listening ? "Đang nghe..." : "Ghi âm (browser STT)"}
        </button>
        <button
          className="px-3 py-1 border rounded ml-auto"
          onClick={sendForEval}
        >
          Kiểm tra
        </button>
      </div>
      <div className="mt-2">
        <div className="text-sm text-gray-600">Transcript:</div>
        <div className="p-2 bg-gray-50 rounded">{transcript}</div>
      </div>
      {feedback && (
        <div className="mt-3 p-3 bg-gray-50 border rounded whitespace-pre-wrap">
          {feedback}
        </div>
      )}
      {/* <div className="mt-3 flex justify-end gap-2">
        <button
          className="px-3 py-1 border rounded"
          onClick={() => onBackStep && onBackStep()}
        >
          Back
        </button>
        <button
          className="px-3 py-1 border rounded"
          onClick={() => onNext && onNext()}
        >
          Tiếp →
        </button>
      </div> */}
    </div>
  );
}
