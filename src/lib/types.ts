export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface Author {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

export interface News {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  cover_alt?: string;
  published_at: string;
  is_breaking?: boolean;
  is_featured?: boolean;
  is_editor_pick?: boolean;
  read_time_mins?: number;
  views?: number;
  likes?: number;
  author_id?: string;
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;

  author?: Author & { bio?: string };
  category?: Category;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface NewsFilters {
  sport?: string;
  category?: string;
  featured?: boolean;
  breaking?: boolean;
  author?: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
  bio?: string;
}

export interface Comment {
  id: string;
  content: string;
  content_id: string;
  content_type: string;
  user_id: string;
  parent_id?: string;
  is_pinned?: boolean;
  likes?: number;
  created_at: string;
  updated_at?: string;

  user?: Profile;
  replies?: Comment[];
}
