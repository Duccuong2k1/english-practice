import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'


export async function POST(req: Request) {
    try {
        const { sentence } = await req.json()
        if (!sentence) return NextResponse.json({ error: 'Missing sentence' }, { status: 400 })


        const prompt = `Please correct this English sentence and explain briefly in Vietnamese.\nSentence: "${sentence}"`;


        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 400,
        })


        const message = completion.choices?.[0]?.message?.content ?? 'No response'
        return NextResponse.json({ feedback: message })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message ?? 'Error' }, { status: 500 })
    }
}