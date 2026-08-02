const TMDB_BASE = 'https://api.themoviedb.org/3';

export const IMG_W185 = 'https://image.tmdb.org/t/p/w185';
export const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
export const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
  genre_ids?: number[];
}

export interface MovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  overview: string;
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface PagedResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
}

function apiKey(): string {
  return process.env.EXPO_PUBLIC_TMDB_KEY ?? '';
}

export function hasApiKey(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_TMDB_KEY);
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error('NO_API_KEY');
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('language', 'es-ES');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB_${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchTrending(): Promise<Movie[]> {
  const d = await get<PagedResponse<Movie>>('/trending/movie/week');
  return d.results;
}

export async function fetchPopular(): Promise<Movie[]> {
  const d = await get<PagedResponse<Movie>>('/movie/popular');
  return d.results;
}

export async function fetchTopRated(): Promise<Movie[]> {
  const d = await get<PagedResponse<Movie>>('/movie/top_rated');
  return d.results;
}

export async function fetchMarvel(): Promise<Movie[]> {
  const d = await get<PagedResponse<Movie>>('/discover/movie', {
    with_companies: '420',  // Marvel Studios
    sort_by: 'release_date.desc',
  });
  return d.results;
}

export async function fetchAction(): Promise<Movie[]> {
  const d = await get<PagedResponse<Movie>>('/discover/movie', {
    with_genres: '28',
    sort_by: 'popularity.desc',
  });
  return d.results;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const d = await get<PagedResponse<Movie>>('/search/movie', { query });
  return d.results;
}

export async function fetchMovieDetail(id: number): Promise<MovieDetail> {
  return get<MovieDetail>(`/movie/${id}`);
}

export async function fetchMovieCast(id: number): Promise<CastMember[]> {
  const d = await get<{ cast: CastMember[] }>(`/movie/${id}/credits`);
  return d.cast.slice(0, 12);
}

export function imgUrl(
  path: string | null,
  size: 'w185' | 'w500' | 'original' = 'w500',
): string {
  if (!path) return '';
  const base =
    size === 'w185' ? IMG_W185 : size === 'original' ? IMG_ORIGINAL : IMG_W500;
  return `${base}${path}`;
}
