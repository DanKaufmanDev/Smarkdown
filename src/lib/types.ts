export type notes = {
    id: string;
    user_id: string;
    title?: string | 'untitled';
    content?: string | '';
    created_at: string;
    updated_at: string;
    summary?: string | null;
    tags: string[];
}