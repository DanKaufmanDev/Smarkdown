import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { current, others } = await request.json();
        
        if (!process.env.NEXT_PUBLIC_AI_URL || !process.env.NEXT_PUBLIC_AI_KEY) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        const prompt = `Given a current note and a list of other notes, return the top 5 related by topic. Output ONLY a JSON array of objects with {id, score} where score is 0..1. Do not include any markdown formatting or code blocks.

CURRENT:
${current}

OTHERS:
${others.map((other: {id: string; content: string})=>`[${other.id}] ${other.content.slice(0,800)}`).join('\n')}

Return format: [{"id": "note_id", "score": 0.85}]`;
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_AI_URL}?key=${process.env.NEXT_PUBLIC_AI_KEY}`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: prompt }]}]
            }) 
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Relate API: Response data:', data);

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 
                    data?.candidate?.[0]?.content?.parts?.[0]?.text ?? '[]';

        console.log('Relate API: Extracted text:', text);

        let related: {id: string; score: number}[] = [];
        try { 
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
            }
            
            related = JSON.parse(cleanText); 
        } catch (e) {
            console.error('Failed to parse related notes JSON:', e);
            related = [];
        }
        
        return NextResponse.json({ related: related.slice(0,5) });
    } catch (error) {
        console.error('Relate API error:', error);
        return NextResponse.json({ error: `Failed to find related notes: ${error}` }, { status: 500 });
    }
}