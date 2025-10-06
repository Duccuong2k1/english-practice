import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'


export async function POST(req: Request) {
    try {
        // Expected JSON: { transcript: string, target: string }
        const { transcript, target } = await req.json()
        if (!transcript || !target) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })


        const prompt = `You are an English teacher. Compare the student's transcript to the target sentence.\nTarget: "${target}"\nStudent: "${transcript}"\nGive: 1) a short score 1-10; 2) bullet points of mistakes (word choice, grammar, pronunciation hints) in Vietnamese.`


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