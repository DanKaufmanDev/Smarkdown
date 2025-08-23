export default function AIActions({
    note, onUpdate,
  }: { note: { id:string; content:string; tags:string[] };
       onUpdate: (p: Partial<typeof note>)=>void }) {
  
    const call = async (path: string, body: any) => {
      const r = await fetch(`/api/ai/${path}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      return r.json();
    };
  
    return (
      <div className="mt-4 flex gap-2">
        <button
          className="border px-3 py-1 rounded"
          onClick={async () => {
            const { summary } = await call('summarize', { content: note.content });
            onUpdate({ summary });
          }}
        >Summarize</button>
  
        <button className="border px-3 py-1 rounded" onClick={async () => { const { tags } = await call('tags', { content: note.content });onUpdate({ tags });}}>Auto-tag</button>
  
        {/* For "Related notes", fetch others from Supabase and call /ai/relate */}
      </div>
    );
  }