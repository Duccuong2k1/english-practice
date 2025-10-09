"use client";
import { useEffect, useState } from "react";

const TOPICS = [
  "daily life",
  "travel",
  "business",
  "food",
  "technology",
  "TEST TOEIC",
  "introduce yourself",
];
const LEVELS = ["beginner", "intermediate", "advanced"];

export default function SpeakingPractice() {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("beginner");

  const [topicIndex, setTopicIndex] = useState(0);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [step, setStep] = useState<"select" | "practice">("select");
  const [target, setTarget] = useState("");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [loadingSentence, setLoadingSentence] = useState(false);

  const [sentenceCount, setSentenceCount] = useState(0);
  const [scoresThisTopic, setScoresThisTopic] = useState<number[]>([]);

  const TOTAL_PER_TOPIC = 10;

  // 👉 Khi user nhấn “Bắt đầu luyện”
  function startTopic() {
    if (!selectedTopic || !selectedLevel) {
      alert("Vui lòng chọn Topic và Level trước khi bắt đầu.");
      return;
    }
    setTopic(selectedTopic);
    setLevel(selectedLevel);
    setTopicIndex(TOPICS.indexOf(selectedTopic));
    setSentenceCount(0);
    setScoresThisTopic([]);
    generateSentence(selectedTopic, selectedLevel);
  }

  // 🔸 Sinh câu luyện nói mới
  async function generateSentence(topicValue = topic, levelValue = level) {
    if (!topicValue) return;
    setLoadingSentence(true);
    setFeedback(null);
    setScore(null);
    setTranscript("");
    try {
      const res = await fetch("/api/generate-speaking-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicValue, level: levelValue }),
      });
      const data = await res.json();
      setTarget(data.sentence);
    } finally {
      setLoadingSentence(false);
    }
  }

  useEffect(() => {
    if (topic && level) {
      generateSentence(topic, level);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, level]);

  // 🟢 Phát âm mẫu
  function playTarget() {
    const u = new SpeechSynthesisUtterance(target);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }

  // 🎤 Ghi âm
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

  // 📊 Gửi transcript lên AI để chấm điểm
  async function sendForEval() {
    if (!transcript) {
      alert("Bạn chưa nói gì!");
      return;
    }
    const res = await fetch("/api/speech-eval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, target }),
    });
    const data = await res.json();
    setFeedback(data.feedback ?? "Không có phản hồi");
    setScore(data.score ?? null);
  }

  // 👉 Câu tiếp theo (khi score >= 9)
  function nextSentence() {
    if (score !== null) {
      setScoresThisTopic((prev) => [...prev, score]);
    }

    if (sentenceCount + 1 >= TOTAL_PER_TOPIC) {
      // ✅ Đã hoàn thành 10 câu → sang topic mới
      const avg =
        [...scoresThisTopic, score ?? 0].reduce((a, b) => a + b, 0) /
        (scoresThisTopic.length + 1);
      alert(
        `🎉 Bạn đã hoàn thành topic "${topic}" với điểm TB: ${avg.toFixed(
          1
        )}/10`
      );

      if (topicIndex + 1 < TOPICS.length) {
        const nextTopic = TOPICS[topicIndex + 1];
        setTopic(nextTopic);
        setTopicIndex(topicIndex + 1);
        setSentenceCount(0);
        setScoresThisTopic([]);
        generateSentence(nextTopic, level);
      } else {
        alert("🏁 Bạn đã luyện hết tất cả các topic!");
        setTopic("");
      }
    } else {
      setSentenceCount((prev) => prev + 1);
      generateSentence();
    }
  }

  // 👉 Bỏ qua câu hiện tại
  function skipSentence() {
    setScoresThisTopic((prev) => [...prev, 0]);
    if (sentenceCount + 1 >= TOTAL_PER_TOPIC) {
      nextSentence();
    } else {
      setSentenceCount((prev) => prev + 1);
      generateSentence();
    }
  }

  const progressPercent = Math.round((sentenceCount / TOTAL_PER_TOPIC) * 100);

  return (
    <div className="max-w-xl p-4 mx-auto bg-white border rounded">
      <div className="flex flex-row items-center justify-between">
        <h2 className="mb-3 text-xl font-semibold">🗣️ Speaking Practice</h2>
        {step !== "select" && (
          <button
            className="px-3 py-1 text-white bg-green-600 rounded"
            onClick={() => setStep("select")}
          >
            ← Quay lại chọn chủ đề
          </button>
        )}
      </div>
      {/* UI chọn Topic & Level */}
      {step === "select" && (
        <div className="p-4 border rounded bg-gray-50">
          <div className="mb-3">
            <label className="block mb-1 text-sm font-medium">
              📝 Chọn Topic
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="">-- Chọn topic --</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              🎯 Chọn Level
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setStep("practice");
              startTopic();
            }}
            disabled={!selectedTopic}
            className={`w-full py-2 rounded text-white ${
              selectedTopic ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            🚀 Bắt đầu luyện
          </button>
        </div>
      )}

      {step === "practice" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-500">Chủ đề hiện tại:</div>
              <div className="font-bold">
                {topic} ({level})
              </div>
            </div>
            <div className="text-sm">
              {sentenceCount + 1}/{TOTAL_PER_TOPIC} câu
            </div>
          </div>

          {/* Progress */}
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-green-600 rounded"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-3">
            <div className="text-sm text-gray-600">Câu mẫu:</div>
            <strong className="text-lg">
              {loadingSentence ? "..." : target}
            </strong>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              className="px-3 py-1 text-white bg-green-600 rounded"
              onClick={playTarget}
            >
              Nghe mẫu
            </button>
            <button
              className="px-3 py-1 text-white bg-yellow-500 rounded"
              onClick={startRecognition}
            >
              {listening ? "🎤 Đang nghe..." : "Ghi âm"}
            </button>
            <button
              className="px-3 py-1 ml-auto border rounded"
              onClick={sendForEval}
            >
              Kiểm tra
            </button>
          </div>

          <div className="mt-2">
            <div className="text-sm text-gray-600">Transcript:</div>
            <div className="p-2 rounded bg-gray-50 min-h-[36px]">
              {transcript}
            </div>
          </div>

          {feedback && (
            <div className="p-3 mt-3 whitespace-pre-wrap border rounded bg-gray-50">
              <div>
                📊 Điểm: <strong>{score ?? "?"}/10</strong>
              </div>
              <div>{feedback}</div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button
              onClick={skipSentence}
              className="px-3 py-1 text-sm bg-gray-200 rounded"
            >
              ⏭ Bỏ qua
            </button>

            <button
              disabled={!score || score < 8}
              onClick={nextSentence}
              className={`px-4 py-1 rounded ${
                score && score >= 8
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              👉 Câu tiếp theo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
