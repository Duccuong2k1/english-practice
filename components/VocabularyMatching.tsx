"use client";

import { useEffect, useState } from "react";

interface WordPair {
  en: string;
  vi: string;
}

interface Props {
  topic: string;
  level: string;
  onBack: () => void;
}

export default function VocabularyMatching({ topic, level, onBack }: Props) {
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [selectedVi, setSelectedVi] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [errorPair, setErrorPair] = useState<{ en: string; vi: string } | null>(
    null
  );

  // Gọi API sinh từ theo topic + level
  async function fetchWordPairs() {
    setLoading(true);
    setSelectedEn(null);
    setSelectedVi(null);
    setMatched(new Set());
    setErrorPair(null);

    try {
      const res = await fetch("/api/generate-vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });
      const data = await res.json();
      setWordPairs(data.words || []);
    } catch (err) {
      console.error("Lỗi load từ mới:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWordPairs();
  }, [topic, level]);

  function handleEnSelect(word: string) {
    setSelectedEn(word === selectedEn ? null : word);
  }

  function handleViSelect(word: string) {
    setSelectedVi(word === selectedVi ? null : word);
  }

  // Check ghép đúng
  useEffect(() => {
    if (selectedEn && selectedVi) {
      const pair = wordPairs.find(
        (p) => p.en === selectedEn && p.vi === selectedVi
      );
      if (pair) {
        const newSet = new Set(matched);
        newSet.add(pair.en);
        setMatched(newSet);
        setSelectedEn(null);
        setSelectedVi(null);
      } else {
        setErrorPair({ en: selectedEn, vi: selectedVi });
        setTimeout(() => setErrorPair(null), 800);
        setSelectedEn(null);
        setSelectedVi(null);
      }
    }
  }, [selectedEn, selectedVi]);

  const shuffledVi = [...wordPairs].sort(() => Math.random() - 0.5);

  return (
    <div className="max-w-2xl p-4 mx-auto bg-white border rounded">
      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-semibold">
          🧠 Học từ mới ({topic} - {level})
        </h2>
        <button
          onClick={onBack}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          ← Quay lại
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-gray-500">
          Đang sinh từ mới...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* English list */}
            <div>
              <h3 className="mb-2 font-semibold text-center">English</h3>
              {wordPairs.map((p) => (
                <div
                  key={p.en}
                  className={`p-2 mb-2 text-center rounded border cursor-pointer select-none transition ${
                    matched.has(p.en)
                      ? "bg-green-100 border-green-400"
                      : selectedEn === p.en
                      ? "bg-blue-100 border-blue-400"
                      : errorPair?.en === p.en
                      ? "bg-red-100 border-red-400"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => !matched.has(p.en) && handleEnSelect(p.en)}
                >
                  {p.en}
                </div>
              ))}
            </div>

            {/* Vietnamese list */}
            <div>
              <h3 className="mb-2 font-semibold text-center">Tiếng Việt</h3>
              {shuffledVi.map((p) => (
                <div
                  key={p.vi}
                  className={`p-2 mb-2 text-center rounded border cursor-pointer select-none transition ${
                    matched.has(p.en)
                      ? "bg-green-100 border-green-400"
                      : selectedVi === p.vi
                      ? "bg-blue-100 border-blue-400"
                      : errorPair?.vi === p.vi
                      ? "bg-red-100 border-red-400"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => !matched.has(p.en) && handleViSelect(p.vi)}
                >
                  {p.vi}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={fetchWordPairs}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              🔄 Làm mới từ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
