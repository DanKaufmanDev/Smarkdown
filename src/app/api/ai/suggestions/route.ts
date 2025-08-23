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
                contents: [{ parts: [{ text: `Based on this markdown content, suggest 2-3 specific additions or improvements that could be added to enhance the note. For each suggestion, provide:
1. A brief title/description
2. The actual markdown content to add
3. Where it should be inserted (beginning, middle, or end)

Return as JSON array: [{"title": "suggestion title", "content": "markdown content to add", "position": "beginning|middle|end"}]

Content: ${content}`}]}]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 
                    data?.candidate?.[0]?.content?.parts?.[0]?.text ?? '';
        
        let suggestions: Array<{title: string, content: string, position: string}> = [];
        try { 
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
            }
            
            suggestions = JSON.parse(cleanText); 
        } catch (e) { 
            console.error('Failed to parse suggestions JSON:', text);
            suggestions = [];
        }
        
        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Suggestions API error:', error);
        return NextResponse.json({ error: `Failed to generate suggestions: ${error}` }, { status: 500 });
    }
} 