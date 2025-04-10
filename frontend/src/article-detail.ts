// @ts-nocheck
import { mockFeeds, mockArticles } from './data/mock-data.ts';

// Fallback article (not sure this is necessary)
let article = {
  id: 1,
  title: "Breakthrough in AI Medical Diagnostics",
  content: `<p>Recent studies have shown remarkable progress in AI-powered medical diagnostics, with new systems achieving unprecedented accuracy rates in early disease detection.</p>
          <h2>Key Findings</h2>
          <p>The latest AI diagnostic systems have demonstrated:</p>
          <ul>
            <li>95% accuracy in early cancer detection</li>
            <li>Reduced false positive rates by 60%</li>
            <li>Processing time reduced to mere seconds</li>
          </ul>
          <p>This breakthrough represents a significant step forward in medical technology...</p>`,
  date: "2025-02-26",
  source: {
    title: "Medical Technology Today",
    favicon: "https://example.com/favicon.ico",
  },
  isBookmarked: false,
  feedId: 1,
};

// Get article ID from URL
function getArticleIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get("id")) || 1; // Default to ID 1
}

// Get feedName
function getFeedName(feedId) {
  const feed = mockFeeds.find(feed => feed.id === feedId);
  return feed ? feed.name : "Unknown Feed";
}

// Load article content
function loadArticle() {
  const articleId = getArticleIdFromUrl();
  const articleData = mockArticles.find((a) => a.id === articleId) || article;

  document.title = `${articleData.title} - Aggre-Gator RSS`;
  document.getElementById("articleTitle").textContent = articleData.title;

  const feedName = getFeedName(articleData.feedId);
  document.getElementById("sourceTitle").textContent = feedName;

  document.getElementById("sourceFavicon").src =
    articleData.source?.favicon || "https://example.com/favicon.ico";
  document.getElementById("articleDate").textContent = articleData.date;
  
  const articleContentElem = document.getElementById("articleContent");
  if (articleContentElem) {
    while(articleContentElem.firstChild) {
      articleContentElem.removeChild(articleContentElem.firstChild);
    }
    
    // Parse content
    const parser = new DOMParser();
    const htmlContent = articleData.content || `<p>${articleData.summary}</p>`;
    const parsed = parser.parseFromString(htmlContent, 'text/html');
    
    // Add parsed content to article elem
    const fragment = document.createDocumentFragment();
    Array.from(parsed.body.children).forEach(node => {
      fragment.appendChild(document.importNode(node, true));
    });

    articleContentElem.appendChild(fragment);
  }


  article = articleData; // Update current article object
  updateBookmarkButton();
}

// Toggle bookmark
function toggleBookmark() {
  article.isBookmarked = !article.isBookmarked;
  updateBookmarkButton();
  showToast(article.isBookmarked ? "Article bookmarked" : "Bookmark removed");
}

// Update bookmark button
function updateBookmarkButton() {
  const btn = document.getElementById("bookmarkBtn");
  if (btn) {
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = article.isBookmarked ? "ri-bookmark-fill" : "ri-bookmark-line";
    }
  }
}

// Share article
function shareArticle() {
  const shareUrl = window.location.href;
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      showToast("Link copied!");
    })
    .catch(() => {
      showToast("Failed to copy link");
    });
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("translate-y-full");
  setTimeout(() => {
    toast.classList.add("translate-y-full");
  }, 2000);
}

// Event listeners
document.getElementById("bookmarkBtn").addEventListener("click", toggleBookmark);
document.getElementById("shareBtn").addEventListener("click", shareArticle);

// Add related articles rendering
function renderRelatedArticles() {
  const currentArticleId = getArticleIdFromUrl();
  const currentArticle = mockArticles.find(a => a.id === currentArticleId);
  
  // Get articles from the same feed, excluding the current article
  let relatedArticles = [];
  
  if (currentArticle && currentArticle.feedId) {
    relatedArticles = mockArticles
      .filter(a => a.feedId === currentArticle.feedId && a.id !== currentArticle.id)
      .slice(0, 2);
  }
  
  const relatedArticlesList = document.getElementById("relatedArticles");
  if (relatedArticlesList) {
    while (relatedArticlesList.firstChild) {
      relatedArticlesList.removeChild(relatedArticlesList.firstChild);
    }
    
    // Create and append each related article
    relatedArticles.forEach(article => {
      // Create main container
      const articleDiv = document.createElement('div');
      articleDiv.className = 'flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer';
      
      // Event listener
      articleDiv.addEventListener('click', () => {
        readArticle(article.id);
      });
      
      const contentDiv = document.createElement('div');
      
      // Title element
      const titleElem = document.createElement('h4');
      titleElem.className = 'text-sm font-medium text-gray-900';
      titleElem.textContent = article.title;
      
      // Date element
      const dateElem = document.createElement('time');
      dateElem.className = 'text-xs text-gray-500';
      dateElem.textContent = article.date;
      
      // Build DOM structure
      contentDiv.appendChild(titleElem);
      contentDiv.appendChild(dateElem);
      articleDiv.appendChild(contentDiv);
      relatedArticlesList.appendChild(articleDiv);
    });
  }
} 

// Update initialize function
function initialize() {
  loadArticle();
  renderRelatedArticles();
}

// Call initialize instead of just loadArticle
initialize();

// Read article
function readArticle(id) {
  window.location.href = `article-detail.html?id=${id}`;
}
