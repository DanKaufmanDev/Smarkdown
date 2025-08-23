import { notes } from './types';

export interface AIService {
  generateSummary(content: string): Promise<string>;
  suggestTags(content: string, title: string): Promise<string[]>;
  improveContent(content: string): Promise<string>;
  generateSuggestions(content: string): Promise<Array<{title: string, content: string, position: string}>>;
  findRelatedNotes(currentNote: notes, otherNotes: notes[]): Promise<{id: string; score: number}[]>;
}

export class APIAIService implements AIService {
  async generateSummary(content: string): Promise<string> {
    if (!content.trim()) return '';
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.summary || '';
    } catch (error) {
      console.error('Summary generation failed:', error);
      return '';
    }
  }
  async suggestTags(content: string, title: string): Promise<string[]> {
    if (!content.trim() && !title.trim()) return [];
    try {
      const fullContent = title ? `${title}\n\n${content}` : content;
      const response = await fetch('/api/ai/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fullContent })
      });
      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.tags || [];
    } catch (error) {
      console.error('Tag suggestion failed:', error);
      return [];
    }
  }
  async improveContent(content: string): Promise<string> {
    if (!content.trim()) return content;
    try {
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.improved || content;
    } catch (error) {
      console.error('Content improvement failed:', error);
      return content; // Return original content if improvement fails
    }
  }
  async generateSuggestions(content: string): Promise<Array<{title: string, content: string, position: string}>> {
    if (!content.trim()) return [];
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }
  async findRelatedNotes(currentNote: notes, otherNotes: notes[]): Promise<{id: string; score: number}[]> {
    if (!currentNote?.content || !otherNotes.length) return [];
    try {
      const response = await fetch('/api/ai/relate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          current: currentNote.content,
          others: otherNotes
        })
      });
      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.related || [];
    } catch (error) {
      console.error('Related notes search failed:', error);
      return [];
    }
  }
}
export class MockAIService implements AIService {
  async generateSummary(content: string): Promise<string> {
    if (!content.trim()) return '';   
    const words = content.split(' ').slice(0, 20);
    return words.join(' ') + (content.split(' ').length > 20 ? '...' : '');
  }
  async suggestTags(content: string, title: string): Promise<string[]> {
    const mockTags = ['markdown', 'notes', 'documentation'];
    return mockTags.slice(0, Math.floor(Math.random() * 3) + 2);
  }
  async improveContent(content: string): Promise<string> {
    return content;
  }
  async generateSuggestions(content: string): Promise<Array<{title: string, content: string, position: string}>> {
    return [
      {
        title: "Add a summary section",
        content: "\n## Summary\n\nThis note covers important concepts that should be summarized here.",
        position: "end"
      },
      {
        title: "Include related resources",
        content: "\n## Related Resources\n\n- [Link 1](url1)\n- [Link 2](url2)",
        position: "end"
      }
    ];
  }
  async findRelatedNotes(currentNote: notes, otherNotes: notes[]): Promise<{id: string; score: number}[]> {
    return otherNotes.slice(0, 3).map(note => ({ id: note.id, score: Math.random() }));
  }
}
export function createAIService(): AIService {
  const aiUrl = process.env.NEXT_PUBLIC_AI_URL;
  const aiKey = process.env.NEXT_PUBLIC_AI_KEY; 
  if (aiUrl && aiKey) {
    return new APIAIService();
  } else {
    console.warn('No AI environment variables found. Using mock AI service.');
    return new MockAIService();
  }
} 