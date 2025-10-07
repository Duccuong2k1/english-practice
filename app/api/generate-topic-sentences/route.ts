import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { difficulty, topic, count = 10 } = await req.json()

        if (!difficulty || !topic) {
            return NextResponse.json(
                { error: 'Thiếu difficulty hoặc topic' },
                { status: 400 }
            )
        }

        const prompt = `
Bạn là trợ lý luyện viết tiếng Anh.
Hãy sinh ra ${count} câu TIẾNG VIỆT tương ứng với chủ đề "${topic}", 
trình độ ${difficulty} (CEFR), và ngẫu nhiên 1 trong các thì tiếng Anh sau cho mỗi câu:
- Hiện tại đơn
- Hiện tại tiếp diễn
- Quá khứ đơn
- Quá khứ tiếp diễn
- Tương lai đơn
- Hiện tại hoàn thành
- Quá khứ hoàn thành
- Tương lai gần

Quy tắc:
- Mỗi câu < 15 từ.
- Mỗi câu phải thực sự thuộc chủ đề "${topic}".
- Ngôn ngữ: Tiếng Việt
- Không thêm giải thích, không dịch, không markdown.

Trả về JSON hợp lệ dạng mảng:
[
  { "tense": "tên thì", formula: "công thức của thì" ,"difficulty": "${difficulty}", "topic": "${topic}", "sentence": "..." },
  ...
]
`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Bạn là trợ lý sinh câu tiếng Việt theo chủ đề học tiếng Anh. Luôn trả về JSON hợp lệ.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.9,
        })

        let content = response.choices?.[0]?.message?.content?.trim()

        if (!content) {
            return NextResponse.json({ error: 'Không nhận được phản hồi từ AI' }, { status: 500 })
        }

        // Loại bỏ trường hợp OpenAI trả về dạng ```json ... ```
        if (content.startsWith('```')) {
            content = content.replace(/```json|```/g, '').trim()
        }

        let data
        try {
            data = JSON.parse(content)
        } catch (e) {
            console.error('❌ JSON parse error:', e, 'Raw content:', content)
            return NextResponse.json(
                { error: 'Phản hồi không phải JSON hợp lệ', raw: content },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('❌ Lỗi generate topic sentences:', error)
        return NextResponse.json({ error: 'Lỗi generate câu theo topic' }, { status: 500 })
    }
}
