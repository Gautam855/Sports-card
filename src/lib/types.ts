export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  sport_type?: string;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  sport_id: string;
}

export interface Team {
  id: string;
  name: string;
  short_name?: string;
  slug: string;
  logo_url?: string;
}

export interface Score {
  id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  current_minute?: number;
  status?: string;
}

export interface Match {
  id: string;
  slug: string;
  sport_id: string;
  league_id?: string;
  home_team_id: string;
  away_team_id: string;
  status: 'scheduled' | 'live' | 'half_time' | 'completed' | 'cancelled';
  scheduled_at: string;
  started_at?: string;
  venue?: string;
  is_featured?: boolean;
  
  // Joins
  sport?: Sport;
  league?: League;
  home_team?: Team;
  away_team?: Team;
  score?: Score;
}

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
  sport_id?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;

  // Joins
  author?: Author & { bio?: string };
  category?: Category;
  sport?: Sport;
}


export interface MatchFilters {
  sport?: string;
  league?: string;
  date?: string;
  status?: string | string[];
  featured?: boolean;
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

export interface Prediction {
  id: string;
  slug: string;
  title: string;
  match_id: string;
  content?: string;
  status?: string;
  win_probability_home: number;
  win_probability_away: number;
  win_probability_draw?: number;
  home_win_prob?: number;
  away_win_prob?: number;
  draw_prob?: number;
  predicted_score?: string;
  predicted_score_home?: number;
  predicted_score_away?: number;
  predicted_xi_home?: PredictedPlayer[];
  predicted_xi_away?: PredictedPlayer[];
  analysis?: string;
  views?: number;
  likes?: number;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;

  // Joins
  match?: Match & { pitch_report?: string; weather?: Record<string, any>; title?: string };
  author?: Author & { bio?: string };
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

  // Joins
  user?: Profile;
  replies?: Comment[];
}

export interface FantasyTip {
  id: string;
  slug: string;
  title: string;
  match_id: string;
  platform?: string;
  content?: string;
  status?: string;
  captain?: string;
  vice_captain?: string;
  top_picks?: string[];
  differentials?: string[];
  avoid_players?: string[];
  views: number;
  likes?: number;
  published_at: string;
  meta_title?: string;
  meta_description?: string;

  // Joins
  match?: Match;
  author?: Author;
}

export interface PredictedPlayer {
  name: string;
  position?: string;
  is_captain?: boolean;
  is_vc?: boolean;
  photo_url?: string;
}
