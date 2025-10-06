"use client";
import { useState } from "react";
import WritingTopicPractice from "./WritingTopicPractice";

export default function WritingPractice({ onNext }: { onNext?: () => void }) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    const res = await fetch("/api/grammar-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence: input }),
    });
    const data = await res.json();
    setFeedback(data.feedback ?? data.error ?? "Không có phản hồi");
    setLoading(false);
  }

  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-xl font-semibold mb-2 text-yellow-400">
        Viết — Grammar check
      </h2>

      <textarea
        className="w-full p-2 border"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={handleCheck}
          disabled={loading}
        >
          Kiểm tra
        </button>
        <button
          className="px-3 py-1 border rounded"
          onClick={() => {
            setInput("");
            setFeedback(null);
          }}
        >
          Clear
        </button>
        <button
          className="px-3 py-1 border rounded ml-auto"
          onClick={() => onNext && onNext()}
        >
          Tiếp →
        </button>
      </div>
      {feedback && (
        <div className="mt-3 p-3 bg-gray-50 border rounded">
          <strong>Phản hồi:</strong>
          <div className="whitespace-pre-wrap mt-2">{feedback}</div>
        </div>
      )}
    </div>
  );
}
