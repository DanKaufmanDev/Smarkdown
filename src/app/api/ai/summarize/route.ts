import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {
        const { content } = await request.json();
        
        if (!process.env.NEXT_PUBLIC_AI_URL || !process.env.NEXT_PUBLIC_AI_KEY) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_AI_URL}?key=${process.env.NEXT_PUBLIC_AI_KEY}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Summarize this content into 3-5 bullet points\n\n${content}`}]}]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Summarize API: Response error text:', errorText);
            throw new Error(`AI API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 
                    data?.candidate?.[0]?.content?.parts?.[0]?.text ?? '';
        
        return NextResponse.json({ summary: text.trim() });
    } catch (error) {
        console.error('Summarize API error:', error);
        return NextResponse.json({ error: `Failed to generate summary: ${error}` }, { status: 500 });
    }
}