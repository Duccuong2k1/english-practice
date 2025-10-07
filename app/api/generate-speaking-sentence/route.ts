// app/api/generate-speaking-sentence/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { topic, level } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Chưa cấu hình OPENAI_API_KEY trong .env.local" },
      { status: 400 }
    );
  }

  const prompt = `
Bạn là giáo viên tiếng Anh. Hãy tạo 1 câu tiếng Anh ngắn, rõ ràng để học viên luyện nói.
Yêu cầu:
- Chủ đề: ${topic}
- Mức độ: ${level} (beginner / intermediate / advanced)
- Độ dài: 1 câu (5–15 từ), dễ phát âm, không dùng từ quá khó
- Không dịch sang tiếng Việt, chỉ trả về câu tiếng Anh.
`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await resp.json();
    const sentence = data?.choices?.[0]?.message?.content?.trim();
    if (!sentence) throw new Error("Không sinh được câu");

    return NextResponse.json({ sentence });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
