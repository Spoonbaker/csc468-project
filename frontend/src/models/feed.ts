export interface Feed {
    id: number;
    name: string;
    url: string;
    category: string;
    favicon: string;
    articleCount: number;
    unreadCount: number;
    lastUpdated: string;
  }