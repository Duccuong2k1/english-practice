"use client";

import { useState } from "react";

type Sentence = {
  tense?: string;
  difficulty?: string;
  topic?: string;
  sentence: string; // câu tiếng Việt
  formula?: string; // công thức
};

type CheckResult = {
  correctAnswer?: string;
  rating?: string;
  score?: number;
  feedback?: string;
  isCorrect?: boolean;
} | null;

const topics = [
  "Du lịch",
  "Công việc",
  "Học tập",
  "Cuộc sống hàng ngày",
  "Mua sắm",
  "Thời tiết",
  "Phỏng vấn",
  "Giới thiệu bản thân, công việc",
  "IELTS",
  "TOEIC",
];
const difficulties = ["A1", "A2", "B1", "B2", "C1"];

export default function WritingTopicPractice() {
  const [topic, setTopic] = useState(topics[0]);
  const [difficulty, setDifficulty] = useState("A1");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const batchSize = 10; // hoặc 3 lúc dev, production dùng 10

  // Utility: simple LCS-based diff to highlight matching words
  function computeWordDiff(aRaw = "", bRaw = "") {
    const tokenize = (s: string) =>
      s
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map((t) => t.trim())
        .filter(Boolean);

    const a = tokenize(aRaw);
    const b = tokenize(bRaw);

    // build LCS matrix
    const n = a.length,
      m = b.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
      Array(m + 1).fill(0)
    );
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        if (a[i].toLowerCase() === b[j].toLowerCase())
          dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    // reconstruct LCS positions
    let i = 0,
      j = 0;
    const aMatched = Array(n).fill(false);
    const bMatched = Array(m).fill(false);
    while (i < n && j < m) {
      if (a[i].toLowerCase() === b[j].toLowerCase()) {
        aMatched[i] = true;
        bMatched[j] = true;
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        i++;
      } else {
        j++;
      }
    }

    return {
      aTokens: a,
      bTokens: b,
      aMatched,
      bMatched,
    };
  }

  // generate sentences for chosen topic/level
  const generateTopicSentences = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setUserInput("");
    setCheckResult(null);
    setShowCorrect(false);
    setCanNext(false);

    try {
      const res = await fetch("/api/generate-topic-sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, topic, count: batchSize }),
      });
      const data = await res.json();

      // data expected: an array of {tense, difficulty, topic, sentence}
      if (!Array.isArray(data)) {
        console.error("generate-topic-sentences returned:", data);
        alert(
          "Không thể sinh câu: phản hồi không đúng định dạng. Xem console."
        );
        setLoading(false);
        return;
      }
      setSentences(data);
    } catch (err) {
      console.error("Lỗi generate:", err);
      alert("Lỗi khi sinh câu. Kiểm tra console.");
    } finally {
      setLoading(false);
    }
  };

  const current = sentences[currentIndex];

  // call check API
  const checkSentence = async () => {
    if (!current) return;
    if (!userInput.trim()) {
      alert("Vui lòng nhập bản dịch tiếng Anh trước khi kiểm tra.");
      return;
    }

    setChecking(true);
    setCheckResult(null);
    setShowCorrect(false);
    setCanNext(false);

    try {
      const res = await fetch("/api/check-translation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          viSentence: current.sentence,
          userAnswer: userInput,
        }),
      });
      const json = await res.json();

      // normalize different possible shapes
      // expected: { correctAnswer, rating, score, feedback } OR { isCorrect, feedback }
      const normalized: CheckResult = {
        correctAnswer:
          json.correctAnswer ??
          json.correct_answer ??
          json.correct ??
          undefined,
        rating:
          json.rating ??
          (json.isCorrect
            ? json.isCorrect === true
              ? "Đúng"
              : "Sai"
            : undefined),
        score: typeof json.score === "number" ? json.score : undefined,
        feedback:
          json.feedback ?? json.message ?? json.detail ?? json.raw ?? undefined,
        isCorrect:
          typeof json.isCorrect === "boolean" ? json.isCorrect : undefined,
      };

      setCheckResult(normalized);

      // decide whether allow next: allow after checking; optionally require correctness to allow next
      // Here: allow next after checking (set to true). If you want to require correctness, change logic.
      //   const allowNext =
      //     normalized.isCorrect === true ||
      //     normalized.rating === "Đúng" ||
      //     normalized.score! >= 8;
      //   setCanNext(Boolean(allowNext));
      const allowNext = normalized.score !== undefined && normalized.score >= 8;
      setCanNext(allowNext);
    } catch (err) {
      console.error("Lỗi khi check:", err);
      alert("Lỗi khi kiểm tra. Xem console.");
    } finally {
      setChecking(false);
    }
  };

  const nextSentence = () => {
    if (!current) return;
    // require to check before next
    if (!checkResult) {
      alert("Vui lòng kiểm tra câu trước khi chuyển tiếp.");
      return;
    }

    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((i) => i + 1);
      setUserInput("");
      setCheckResult(null);
      setShowCorrect(false);
      setCanNext(false);
    } else {
      alert(`🎉 Hoàn thành ${sentences.length} câu chủ đề "${topic}"!`);
      setSentences([]);
      setCurrentIndex(0);
      setUserInput("");
      setCheckResult(null);
      setShowCorrect(false);
      setCanNext(false);
    }
  };

  // helper render functions
  function renderBadge(rating?: string) {
    const map: Record<string, { text: string; cls: string }> = {
      Đúng: { text: "Đúng", cls: "bg-green-100 text-green-800" },
      "Gần đúng": { text: "Gần đúng", cls: "bg-yellow-100 text-yellow-800" },
      Sai: { text: "Sai", cls: "bg-red-100 text-red-800" },
    };
    if (!rating) return null;
    const meta = map[rating] ?? {
      text: rating,
      cls: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 rounded text-sm ${meta.cls}`}>
        {meta.text}
      </span>
    );
  }

  function renderScoreBar(score?: number) {
    const s = typeof score === "number" ? Math.max(0, Math.min(10, score)) : 0;
    const pct = (s / 10) * 100;
    return (
      <div className="w-full h-3 mt-2 overflow-hidden bg-gray-200 rounded">
        <div
          className="h-full rounded"
          style={{
            width: `${pct}%`,
            background:
              pct >= 80 ? "#059669" : pct >= 50 ? "#f59e0b" : "#ef4444",
          }}
        />
      </div>
    );
  }

  function renderDiffView(user?: string, correct?: string) {
    if (!user || !correct) return null;
    const { aTokens, bTokens, aMatched, bMatched } = computeWordDiff(
      user,
      correct
    );
    return (
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <div className="mb-1 text-xs text-gray-500">Your answer</div>
          <div className="p-2 border rounded min-h-[44px]">
            {aTokens.length === 0 ? (
              <span className="text-gray-400">—</span>
            ) : null}
            {aTokens.map((tok, idx) => (
              <span
                key={`u-${idx}`}
                className={`inline-block mr-1 mb-1 px-1 rounded ${
                  aMatched[idx]
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {tok}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-gray-500">Correct answer</div>
          <div className="p-2 border rounded min-h-[44px]">
            {bTokens.length === 0 ? (
              <span className="text-gray-400">—</span>
            ) : null}
            {bTokens.map((tok, idx) => (
              <span
                key={`c-${idx}`}
                className={`inline-block mr-1 mb-1 px-1 rounded ${
                  bMatched[idx]
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {tok}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl p-4 mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">
        ✍️ Luyện viết theo Topic (có chấm & giải thích)
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Chọn mức độ:</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={loading}
          >
            {difficulties.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Chọn chủ đề:</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 text-white bg-blue-600 rounded"
          onClick={generateTopicSentences}
          disabled={loading}
        >
          {loading
            ? `Đang sinh ${batchSize} câu...`
            : `🎲 Sinh ${batchSize} câu theo Topic`}
        </button>

        <div className="mt-2 ml-auto text-sm text-gray-600">
          {sentences.length > 0 ? (
            <span>
              Câu {currentIndex + 1}/{sentences.length}
            </span>
          ) : (
            <span>Chưa có câu</span>
          )}
        </div>
      </div>

      {current ? (
        <div className="p-4 mt-4 bg-white border rounded shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-gray-500">
                Chủ đề: <strong>{current.topic ?? topic}</strong>
              </div>
              <div className="text-sm text-gray-500">
                Thì: <strong>{current.tense ?? "-"}</strong>
              </div>
              <div className="text-sm text-gray-500">
                công thức: <strong>{current.formula ?? "-"}</strong>
              </div>
              <div className="text-sm text-gray-500">
                Độ khó: <strong>{current.difficulty ?? difficulty}</strong>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Progress:{" "}
              <strong>
                {currentIndex + 1}/{sentences.length}
              </strong>
            </div>
          </div>

          <div className="p-3 border rounded bg-gray-50">
            <div className="text-sm text-gray-600">
              Câu tiếng Việt (dịch sang tiếng Anh):
            </div>
            <div className="mt-2 text-lg font-medium">{current.sentence}</div>
          </div>

          <textarea
            className="w-full p-2 mt-4 border rounded"
            placeholder="Nhập bản dịch tiếng Anh của bạn..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={4}
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={checkSentence}
              disabled={checking}
              className="px-3 py-2 text-white bg-yellow-500 rounded"
            >
              {checking ? "Đang kiểm tra..." : "✅ Kiểm tra"}
            </button>

            <button
              onClick={() => setShowCorrect((s) => !s)}
              className={`px-3 py-2  rounded ${
                !checkResult ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200"
              } `}
              disabled={!checkResult}
            >
              {showCorrect ? "Ẩn đáp án" : "Hiện đáp án"}
            </button>

            <button
              onClick={nextSentence}
              disabled={!canNext}
              className={`ml-auto px-3 py-2 rounded transition ${
                canNext
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
            >
              Câu tiếp theo ⏭
            </button>
          </div>

          {/* Result area */}
          {checkResult && (
            <div className="p-3 mt-4 bg-white border rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderBadge(checkResult.rating)}
                  <div className="ml-2 text-sm text-gray-600">
                    Score:{" "}
                    <strong>
                      {typeof checkResult.score === "number"
                        ? checkResult.score
                        : "—"}
                    </strong>
                  </div>
                </div>
                {typeof checkResult.score === "number" &&
                  renderScoreBar(checkResult.score)}
              </div>

              <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                <strong>Nhận xét:</strong>
                <div className="mt-1">
                  {checkResult.feedback ?? "Không có feedback"}
                </div>
              </div>

              {/* Show correct answer */}
              {showCorrect && (
                <div className="mt-3">
                  <div className="text-sm text-gray-500">Bản dịch chuẩn:</div>
                  <div className="p-2 mt-1 border rounded bg-gray-50">
                    <strong>{checkResult.correctAnswer ?? "—"}</strong>
                  </div>

                  {/* Diff view */}
                  <div className="mt-2">
                    {renderDiffView(userInput, checkResult.correctAnswer)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 mt-4 text-center text-gray-500 bg-white border rounded">
          Nhấn "🎲 Sinh {batchSize} câu theo Topic" để bắt đầu.
        </div>
      )}
    </div>
  );
}
