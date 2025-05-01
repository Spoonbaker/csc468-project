import { Article } from "../models/article.ts";
import { Feed } from "../models/feed.ts";

export const mockArticles: Article[] = [
  {
    id: 1,
    title: "Breakthrough in AI Medical Diagnostics",
    summary:
      "Recent studies show AI technology achieving 95% accuracy in early cancer detection, revolutionizing medical diagnosis procedures...",
    date: "2025-02-26",
    isUnread: true,
    isBookmarked: false,
    feedId: 1,
  },
  {
    id: 2,
    title: "The Future of Sustainable Urban Planning",
    summary:
      "Cities worldwide are adopting green building standards and integrating smart transportation systems for a sustainable future...",
    date: "2025-02-25",
    isUnread: true,
    isBookmarked: true,
    feedId: 3,
  },
  {
    id: 3,
    title: "Quantum Computing: The Next Generation",
    summary:
      "IBM's latest quantum processor breaks the 100-qubit barrier, opening new possibilities for complex computational problems...",
    date: "2025-02-24",
    isUnread: false,
    isBookmarked: false,
    feedId: 1,
  },
  {
    id: 4,
    title: "Deep Sea Discoveries: New Species Found",
    summary:
      "Scientists discover previously unknown species in the Mariana Trench, showcasing remarkable environmental adaptations...",
    date: "2025-02-23",
    isUnread: true,
    isBookmarked: false,
    feedId: 2,
  },
  {
    id: 5,
    title: "Space Tourism: The Private Space Age",
    summary:
      "With SpaceX and Blue Origin advancing commercial space projects, civilian space travel becomes increasingly accessible...",
    date: "2025-02-22",
    isUnread: false,
    isBookmarked: true,
    feedId: 2,
  },
  {
    id: 6,
    title: "Blockchain Revolution in Supply Chain",
    summary:
      "Major industries adopt blockchain technology for enhanced supply chain transparency and traceability...",
    date: "2025-02-21",
    isUnread: true,
    isBookmarked: false,
    feedId: 3,
  },
  {
    id: 7,
    title: "5G Networks Transform IoT Landscape",
    summary:
      "The widespread deployment of 5G networks is enabling new IoT applications and transforming smart city infrastructure...",
    date: "2025-02-20",
    isUnread: true,
    isBookmarked: false,
    feedId: 1,
  },
  {
    id: 8,
    title: "Advances in Renewable Energy Storage",
    summary:
      "Breakthrough in battery technology promises to solve renewable energy storage challenges and accelerate clean energy adoption...",
    date: "2025-02-19",
    isUnread: false,
    isBookmarked: true,
    feedId: 2,
  },
  {
    id: 9,
    title: "The Rise of Digital Currencies",
    summary:
      "Central banks worldwide are developing digital currencies, potentially reshaping the future of global finance...",
    date: "2025-02-18",
    isUnread: true,
    isBookmarked: false,
    feedId: 3,
  },
];

export const mockFeeds: Feed[] = [
  {
    id: 1,
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "technology",
    favicon:
      "https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32",
    articleCount: 156,
    unreadCount: 23,
    lastUpdated: "2025-02-26T14:30:00Z",
  },
  {
    id: 2,
    name: "NASA Science",
    url: "https://science.nasa.gov/feed/",
    category: "science",
    favicon: "https://www.google.com/s2/favicons?domain=science.nasa.gov",
    articleCount: 87,
    unreadCount: 12,
    lastUpdated: "2025-02-25T10:15:00Z",
  },
  {
    id: 3,
    name: "Harvard Business Review",
    url: "https://hbr.org/feed",
    category: "business",
    favicon: "https://hbr.org/resources/images/favicon.ico",
    articleCount: 203,
    unreadCount: 45,
    lastUpdated: "2025-02-26T08:45:00Z",
  },
  {
    id: 4,
    name: "Medical News Today",
    url: "https://www.medicalnewstoday.com/feed",
    category: "health",
    favicon: "https://www.google.com/s2/favicons?domain=medicalnewstoday.com",
    articleCount: 134,
    unreadCount: 18,
    lastUpdated: "2025-02-24T16:20:00Z",
  },
  {
    id: 5,
    name: "ESPN",
    url: "https://www.espn.com/espn/rss/news",
    category: "sports",
    favicon: "https://a.espncdn.com/favicon.ico",
    articleCount: 178,
    unreadCount: 31,
    lastUpdated: "2025-02-26T12:10:00Z",
  },

  {
    id: 6,
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "technology",
    favicon: "https://www.theverge.com/favicon.ico",
    articleCount: 89,
    unreadCount: 15,
    lastUpdated: "2025-02-26T17:00:00Z",
  },
  {
    id: 7,
    name: "National Geographic",
    url: "https://www.nationalgeographic.com/rss",
    category: "science",
    favicon: "https://www.nationalgeographic.com/favicon.ico",
    articleCount: 101,
    unreadCount: 20,
    lastUpdated: "2025-02-25T08:30:00Z",
  },
];
