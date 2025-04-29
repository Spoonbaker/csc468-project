const API_BASE = '/api/v0';

export interface Feed {
    id: string;
    title: string;
    link: string;
    description: string;
    category?: string;
    unreadCount?: number;
    lastUpdated?: string;
}

export interface Article {
    id: string;
    title?: string;
    description?: string;
    link?: string;
    pubDate?: string;
    content?: string;
    isUnread?: boolean;
    feedId?: string;
    isBookmarked?: boolean;
    bookmarkedAt?: string;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class ApiClient {
    private static token: string | null = null;
    private static tokenExpiry: number | null = null;

    static setToken(token: string, expiresIn?: number) {
        this.token = token;
        this.tokenExpiry = expiresIn ? Date.now() + (expiresIn * 1000) : null;
        localStorage.setItem('auth_token', token);
        if (expiresIn && this.tokenExpiry) {
            localStorage.setItem('token_expiry', this.tokenExpiry.toString());
        }
    }

    static getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('auth_token');
            const expiry = localStorage.getItem('token_expiry');
            this.tokenExpiry = expiry ? parseInt(expiry) : null;
        }
        
        const expiry = this.tokenExpiry as number | null;
        if (expiry !== null && Date.now() >= expiry) {
            this.clearToken();
            return null;
        }
        
        return this.token;
    }

    static clearToken() {
        this.token = null;
        this.tokenExpiry = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
    }

    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    static async handleOAuthCallback(code: string): Promise<void> {
        const currentPath = window.location.pathname;
        
        const response = await fetch(`${API_BASE}/auth/google/callback?code=${encodeURIComponent(code)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new ApiError('Failed to authenticate with Google', response.status);
        }

        const data = await response.json();
        this.setToken(data.token, data.expiresIn);
        window.location.href = currentPath;
    }

    static async addFeed(url: string): Promise<string> {
        try {
            new URL(url);
        } catch {
            throw new ApiError('Invalid URL format', 400);
        }

        const response = await this.fetchWithAuth('/user/feed', {
            method: 'PUT',
            body: JSON.stringify({ url }),
        });
        
        const data = await response.json();
        
        if (!data.feedId) {
            throw new ApiError('Invalid RSS feed or unable to parse feed', 400);
        }
        
        return data.feedId;
    }

    static async deleteFeed(feedId: string): Promise<void> {
        await this.fetchWithAuth(`/user/feed/${feedId}`, {
            method: 'DELETE',
        });
    }

    static async getUserFeeds(): Promise<string[]> {
        const response = await this.fetchWithAuth('/user/feed');
        return await response.json();
    }

    static async getFeedInfo(feedId: string): Promise<Feed> {
        const response = await this.fetchWithAuth(`/feed/${feedId}/info`);
        return await response.json();
    }

    static async getFeedArticles(feedId: string): Promise<string[]> {
        const response = await this.fetchWithAuth(`/feed/${feedId}`);
        return await response.json();
    }

    static async getArticle(articleId: string): Promise<Article> {
        const response = await this.fetchWithAuth(`/article/${articleId}`);
        return await response.json();
    }

    static async setArticleBookmark(articleId: string, isBookmarked: boolean): Promise<void> {
        await this.fetchWithAuth(`/article/${articleId}/bookmark`, {
            method: 'PUT',
            body: JSON.stringify({ isBookmarked }),
        });
    }

    static async setArticleReadStatus(articleId: string, isRead: boolean): Promise<void> {
        await this.fetchWithAuth(`/article/${articleId}/read`, {
            method: 'PUT',
            body: JSON.stringify({ isRead }),
        });
    }

    static async deleteArticle(articleId: string): Promise<void> {
        await this.fetchWithAuth(`/article/${articleId}`, {
            method: 'DELETE',
        });
    }

    static async searchArticles(query: string, feedId?: string | null): Promise<string[]> {
        const params = new URLSearchParams({ q: query });
        if (feedId) params.append('feedId', feedId);
        
        const response = await this.fetchWithAuth(`/search/articles?${params}`);
        return await response.json();
    }

    static async getUnreadArticles(): Promise<Article[]> {
        const response = await this.fetchWithAuth('/user/articles/unread');
        return await response.json();
    }

    static async getFeedsInfo(feedIds: string[]): Promise<Feed[]> {
        return Promise.all(feedIds.map(id => this.getFeedInfo(id)));
    }

    static async getArticlesInfo(articleIds: string[]): Promise<Article[]> {
        return Promise.all(articleIds.map(id => this.getArticle(id)));
    }

    private static async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorMessage = 'API Error';
            let errorDetails;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
                errorDetails = errorData;
            } catch {
                errorMessage = response.statusText;
            }

            if (response.status === 401) {
                this.clearToken();
            }

            throw new ApiError(errorMessage, response.status, errorDetails);
        }

        return response;
    }
}