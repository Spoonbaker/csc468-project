export interface Article {
  id: number;
  title: string;
  summary: string;
  date: string;
  isUnread?: boolean;
  isBookmarked: boolean;
  feedId?: number;
  source?: string;
  sourceUrl?: string;
  bookmarkedAt?: string;
}
