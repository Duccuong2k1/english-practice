"use client";

import { useState } from "react";

const sentencesVi = [
  "Hôm nay trời đẹp nên tôi đi dạo trong công viên.",
  "Tôi thích đọc sách vào buổi tối.",
  "Ngày mai tôi sẽ đi du lịch Đà Lạt với gia đình.",
  "Bạn có thể giúp tôi làm bài tập này không?",
  "Tôi đã học tiếng Anh được ba năm.",
];

export default function WritePage() {
  const [viSentence, setViSentence] = useState(sentencesVi[0]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const nextSentence = () => {
    const random = Math.floor(Math.random() * sentencesVi.length);
    setViSentence(sentencesVi[random]);
    setAnswer("");
    setFeedback("");
  };

  const checkAnswer = async () => {
    setLoading(true);
    setFeedback("Đang kiểm tra...");
    const res = await fetch("/api/check-translation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viSentence, userAnswer: answer }),
    });
    const data = await res.json();
    setFeedback(data.feedback);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">✍️ Luyện viết tiếng Anh</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p className="text-gray-800">👉 Hãy dịch câu sau sang tiếng Anh:</p>
        <p className="text-lg font-medium mt-2">{viSentence}</p>
      </div>

      <textarea
        className="w-full border rounded-lg p-3 mb-4"
        rows={3}
        placeholder="Nhập bản dịch tiếng Anh của bạn..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <div className="flex gap-3">
        <button
          onClick={checkAnswer}
          disabled={loading || !answer.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Đang kiểm tra..." : "Kiểm tra"}
        </button>

        <button
          onClick={nextSentence}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Câu khác 🔄
        </button>
      </div>

      {feedback && (
        <div className="mt-6 p-4 bg-white border rounded-lg shadow-sm whitespace-pre-wrap">
          {feedback}
        </div>
      )}
    </div>
  );
}
