"use client";
import VocabularyMatching from "@/components/VocabularyMatching";
import { useState } from "react";

export default function Page() {
  const [mode, setMode] = useState<"menu" | "vocab">("menu");
  const [topic, setTopic] = useState("Daily Life");
  const [level, setLevel] = useState("Beginner");

  return (
    <div className="p-6">
      {mode === "menu" && (
        <div className="max-w-md p-4 mx-auto bg-white border rounded">
          <h2 className="mb-3 text-xl font-semibold">Chọn chủ đề & level</h2>

          <div className="mb-3">
            <label className="block mb-1 text-sm">Topic</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option>Daily Life</option>
              <option>Travel</option>
              <option>Business</option>
              <option>Food</option>
              <option>Technology</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-sm">Level</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <button
            onClick={() => setMode("vocab")}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded"
          >
            🧠 Bắt đầu học từ
          </button>
        </div>
      )}

      {mode === "vocab" && (
        <VocabularyMatching
          topic={topic}
          level={level}
          onBack={() => setMode("menu")}
        />
      )}
    </div>
  );
}
