import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
    const { topic, level } = await req.json();

    const prompt = `
You are an experienced English teacher.  
Generate a **completely new**, non-repeating list of vocabulary each time this prompt is called.  

Topic: ${topic}  
Level: ${level} (Beginner / Intermediate / Advanced)  
Number of pairs: 8  

Instructions:  
- Each vocabulary item should be a **natural and practical word or short phrase** related to the topic.  
- Include a **variety of parts of speech** (nouns, verbs, adjectives, phrases).  
- **Do not repeat** vocabulary from previous generations; make sure it's random and diverse.  
- Translate each English item into natural, concise Vietnamese.  
- Return **only valid JSON** in this exact format, with no explanation:

[
  {"en": "book", "vi": "quyển sách"},
  {"en": "to travel", "vi": "đi du lịch"}
]

No Markdown. No comments. No extra text.
No extra text, only valid JSON.
`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: "system", content: "You are a helpful English teacher." },
            { role: "user", content: prompt }],
            temperature: 0.8,
        });

        const content = completion.choices[0].message?.content?.trim() || "[]";
        const words = JSON.parse(content);

        return NextResponse.json({ words });
    } catch (e: any) {
        console.error("Error generate vocab:", e);
        return NextResponse.json({ words: [] });
    }
}
