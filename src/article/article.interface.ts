export interface Article {
  id: string; // uuid v4
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
