/**
 * ========================================
 * LUMINA SPHERE - TYPE DEFINITIONS
 * ========================================
 * Definiciones de tipos completas para todo el proyecto.
 */

// ==========================================
// MOOD SYSTEM
// ==========================================

export type MoodTag =
  | 'dark-fantasy'
  | 'alchemy-philosophical'
  | 'cyberpunk'
  | 'ethereal-romance'
  | 'adventure-epic'
  | 'psychological-thriller'
  | 'historical-drama'
  | 'sci-fi-space-opera'
  | 'cozy-mystery'
  | 'urban-fantasy';

export interface MoodColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface MoodMusic {
  genres: string[];
  spotifySeeds: string[];
  examples: string[];
}

export interface MoodMovies {
  tmdbGenres: number[];
  keywords: string[];
  examples: string[];
}

export interface MoodBooks {
  subjects: string[];
  keywords: string[];
}

export interface MoodProfile {
  tag: MoodTag;
  name: string;
  description: string;
  colors: MoodColors;
  music: MoodMusic;
  movies: MoodMovies;
  books: MoodBooks;
  examples: string[];
}

// ==========================================
// BOOK TYPES
// ==========================================

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  blurDataUrl?: string;
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  isbn?: string;
  genres?: string[];
  subjects?: string[];
  mood: MoodTag;
  rating?: number;
  userRating?: number;
  readingProgress?: number;
  source: 'google-books' | 'open-library' | 'gutenberg' | 'manual';
  format?: 'epub' | 'pdf' | 'mobi';
  isPriority?: boolean;
  
  // External IDs
  googleBooksId?: string;
  openLibraryId?: string;
  gutenbergId?: string;
  
  // Metadata
  language?: string;
  publisher?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserBook extends Book {
  userId: string;
  status: 'want-to-read' | 'reading' | 'finished';
  currentPage: number;
  currentChapter: number;
  startedAt?: Date;
  finishedAt?: Date;
  
  // User preferences
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif';
  theme: 'light' | 'dark' | 'sepia';
  isFavorite: boolean;
}

// ==========================================
// READING SYSTEM
// ==========================================

export interface Chapter {
  id: string;
  title: string;
  content: string;
  number?: number;
}

export interface Note {
  id: string;
  userId: string;
  bookId: string;
  content: string;
  color: string;
  pageNumber: number;
  chapter?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  text: string;
  color: string;
  pageNumber: number;
  chapter?: number;
  createdAt: Date;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  pageNumber: number;
  chapter?: number;
  label?: string;
  createdAt: Date;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  pagesRead: number;
  averageWPM?: number;
}

// ==========================================
// RECOMMENDATIONS
// ==========================================

export interface MovieRecommendation {
  id: number;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  overview: string;
  releaseDate: string;
  rating: number;
  genres: string[];
  mood: MoodTag;
  matchScore: number;
}

export interface MusicRecommendation {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  previewUrl: string | null;
  spotifyUrl: string;
  duration: number;
  mood: MoodTag;
  matchScore: number;
}

export interface BookRecommendation {
  book: Book;
  matchScore: number;
  reason: string;
  basedOn: 'similarity' | 'mood' | 'genre' | 'author';
}

// ==========================================
// TRANSLATION
// ==========================================

export interface Translation {
  id: string;
  bookId: string;
  chapterHash: string;
  sourceLang: string;
  targetLang: string;
  originalText: string;
  translated: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface TranslationRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
  isChapter?: boolean;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLang: string;
  targetLang: string;
}

// ==========================================
// API RESPONSES
// ==========================================

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

export interface SearchBooksResponse {
  books: Book[];
  count: number;
  source: string;
}

export interface RecommendationsResponse {
  recommendations: (BookRecommendation | MovieRecommendation | MusicRecommendation)[];
  type: 'books' | 'movies' | 'music';
  basedOn?: string;
  mood?: MoodTag;
}

// ==========================================
// USER TYPES
// ==========================================

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  booksRead: number;
  currentStreak: number;
  totalHours: number;
  averageRating: number;
  favoriteGenres: string[];
  favoriteMoods: MoodTag[];
}

// ==========================================
// UI STATE TYPES
// ==========================================

export interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
}

export interface MusicPlayerState {
  isPlaying: boolean;
  currentTrack?: MusicRecommendation;
  queue: MusicRecommendation[];
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  progress: number;
}

export interface ReaderState {
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif';
  theme: 'light' | 'dark' | 'sepia';
  currentChapter: number;
  currentPage: number;
  showControls: boolean;
  showNotes: boolean;
}

export interface LibraryFilters {
  searchQuery: string;
  selectedMood: MoodTag | 'all';
  sortBy: 'recent' | 'title' | 'author' | 'rating' | 'progress';
  layout: 'grid' | 'list';
}

// ==========================================
// COMPONENT PROPS TYPES
// ==========================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'solid' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps extends BaseComponentProps {
  hover?: boolean;
  animate?: boolean;
}

export interface GlassPanelProps extends BaseComponentProps {
  variant?: 'default' | 'strong';
  hover?: boolean;
  animate?: boolean;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'mood';
  className?: string;
}

// ==========================================
// CACHE TYPES
// ==========================================

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

// ==========================================
// WORKER TYPES
// ==========================================

export interface WorkerMessage {
  type: 'parse' | 'progress' | 'parsed' | 'error';
  data?: any;
  progress?: number;
  error?: string;
}

export interface EPUBParserResult {
  chapters: Chapter[];
  metadata: {
    title: string;
    author: string;
    language?: string;
    publisher?: string;
  };
}

// ==========================================
// PINECONE TYPES
// ==========================================

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: {
    title: string;
    author: string;
    description?: string;
    genres: string[];
    mood: string;
    rating?: number;
  };
}

// ==========================================
// ANALYTICS TYPES
// ==========================================

export interface ReadingStats {
  totalBooks: number;
  booksRead: number;
  currentlyReading: number;
  totalPages: number;
  totalHours: number;
  averageRating: number;
  longestStreak: number;
  currentStreak: number;
  favoriteGenres: Array<{
    genre: string;
    count: number;
  }>;
  readingByMood: Array<{
    mood: MoodTag;
    count: number;
  }>;
}

export interface DashboardStats {
  booksRead: number;
  currentStreak: number;
  totalHours: number;
  averageRating: number;
}

// ==========================================
// FORM TYPES
// ==========================================

export interface SearchFormData {
  query: string;
  source: 'all' | 'google' | 'openlibrary';
}

export interface AddBookFormData {
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  description?: string;
  mood: MoodTag;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type VoidFunction = () => void;

// ==========================================
// EXPORT ALL
// ==========================================

export type {
  // Re-export common React types
  ReactNode,
  ReactElement,
  FC,
  ComponentProps,
  CSSProperties,
} from 'react';
