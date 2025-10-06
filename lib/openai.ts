import OpenAI from 'openai'


const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
    console.warn('OPENAI_API_KEY not set. AI calls will fail.')
}


export const openai = new OpenAI({ apiKey })