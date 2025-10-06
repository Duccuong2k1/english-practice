import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { viSentence, userAnswer } = await req.json()

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: '⚠️ Chưa cấu hình OPENAI_API_KEY — vui lòng thêm vào .env.local' },
                { status: 500 }
            )
        }

        if (!viSentence || !userAnswer) {
            return NextResponse.json(
                { error: 'Thiếu viSentence hoặc userAnswer' },
                { status: 400 }
            )
        }

        const prompt = `
Bạn là giáo viên tiếng Anh.
Câu gốc tiếng Việt: "${viSentence}"
Câu người học dịch sang tiếng Anh: "${userAnswer}"

Hãy thực hiện:
1. Viết lại bản dịch tiếng Anh chính xác nhất.
2. So sánh với bản người dùng.
3. Nêu lỗi sai cụ thể (từ vựng, ngữ pháp, cấu trúc).
4. Đánh giá mức độ chính xác:
   - "Đúng" nếu gần như hoàn hảo.
   - "Gần đúng" nếu có lỗi nhỏ không ảnh hưởng nghĩa.
   - "Sai" nếu sai ngữ pháp nặng hoặc dịch sai nghĩa.
5. Chấm điểm 0–10 dựa trên độ chính xác.
6. Viết feedback ngắn gọn bằng tiếng Việt.

Trả về JSON hợp lệ:
{
  "correctAnswer": "Bản dịch chuẩn",
  "rating": "Đúng | Gần đúng | Sai",
  "score": 0-10,
  "feedback": "Nhận xét ngắn gọn dễ hiểu"
}

Không trả về markdown, không thêm giải thích ngoài JSON.
    `

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Bạn là giáo viên chấm bài dịch tiếng Anh.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.2,
            }),
        })

        const data = await resp.json()

        if (!resp.ok) {
            console.error('❌ OpenAI API error:', data)
            return NextResponse.json(
                { error: `Lỗi OpenAI: ${data?.error?.message ?? 'Không rõ nguyên nhân'}` },
                { status: resp.status }
            )
        }

        let content = data?.choices?.[0]?.message?.content?.trim() ?? ''
        // Xử lý trường hợp GPT trả về ```json ... ```
        if (content.startsWith('```')) {
            content = content.replace(/```json|```/g, '').trim()
        }

        let parsed
        try {
            parsed = JSON.parse(content)
        } catch (e) {
            console.error('❌ JSON parse error:', e, 'Raw:', content)
            return NextResponse.json(
                { error: 'Phản hồi từ AI không phải JSON hợp lệ', raw: content },
                { status: 500 }
            )
        }

        return NextResponse.json(parsed)
    } catch (e) {
        console.error('❌ Server error:', e)
        return NextResponse.json({ error: 'Có lỗi xảy ra khi kiểm tra câu dịch' }, { status: 500 })
    }
}
