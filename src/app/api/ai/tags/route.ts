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
                contents: [{ parts: [{ text: `Generate 3-5 relevant tags for this content. Return ONLY a JSON array of tag strings, no other text. Example: ["tag1", "tag2", "tag3"]\n\nContent: ${content}`}]}]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Tags API: Response error text:', errorText);
            throw new Error(`AI API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 
                    data?.candidate?.[0]?.content?.parts?.[0]?.text ?? '';
        
        let tags: string[] = [];
        try { 
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
            }
            
            tags = JSON.parse(cleanText); 
        } catch { 
            console.error('Failed to parse tags JSON:', text);
            const cleanedText = text.replace(/[\[\]"]/g, '').trim();
            tags = cleanedText.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
        }
        
        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Tags API error:', error);
        return NextResponse.json({ error: `Failed to generate tags: ${error}` }, { status: 500 });
    }
}