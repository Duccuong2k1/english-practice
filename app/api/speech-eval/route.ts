// app/api/speech-eval/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { transcript, target } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "Chưa cấu hình OPENAI_API_KEY trong .env.local" },
            { status: 400 }
        );
    }

    const prompt = `
Câu chuẩn: "${target}"
Câu người dùng nói: "${transcript}"

Hãy:
1. Đánh giá độ chính xác phát âm, độ khớp với câu chuẩn.
2. Cho điểm từ 0–10 (10 là phát âm và nội dung chuẩn 100%)
3. Viết feedback ngắn bằng tiếng Việt, chỉ ra lỗi phát âm hoặc từ sai.

Trả về đúng JSON:
{
  "score": number,
  "feedback": string
}
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
                temperature: 0.3,
            }),
        });

        const data = await resp.json();
        const raw = data?.choices?.[0]?.message?.content;
        const parsed = JSON.parse(raw);

        return NextResponse.json(parsed);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Lỗi khi chấm điểm" }, { status: 500 });
    }
}
