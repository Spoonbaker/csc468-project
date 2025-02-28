// @ts-nocheck
// I simply extracted this from the body of the page it was on. You will need to
// combine related functionality into modules, and fix the Typescript errors.

// Mock article data
const article = {
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
};

// Add mockArticles data
const mockArticles = [
  {
    id: 1,
    title: "Breakthrough in AI Medical Diagnostics",
    summary:
      "Recent studies show AI technology achieving 95% accuracy in early cancer detection, revolutionizing medical diagnosis procedures...",
    date: "2025-02-26",
    isUnread: true,
    isBookmarked: false,
  },
  // ... 其他文章数据
];

// Get article ID from URL
function getArticleIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get("id")) || 1; // Default to ID 1
}

// Load article content
function loadArticle() {
  const articleId = getArticleIdFromUrl();
  const articleData = mockArticles.find((a) => a.id === articleId) || article;

  document.title = `${articleData.title} - Aggre-Gator RSS`;
  document.getElementById("articleTitle").textContent = articleData.title;
  document.getElementById("sourceTitle").textContent =
    articleData.source?.title || "Medical Technology Today";
  document.getElementById("sourceFavicon").src =
    articleData.source?.favicon || "https://example.com/favicon.ico";
  document.getElementById("articleDate").textContent = articleData.date;
  document.getElementById("articleContent").innerHTML =
    articleData.content || `<p>${articleData.summary}</p>`;

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
  const icon = btn.querySelector("i");
  icon.className = article.isBookmarked ? "ri-bookmark-fill" : "ri-bookmark-line";
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
  const relatedArticles = [
    {
      id: 2,
      title: "AI in Healthcare: A New Era",
      date: "2025-02-25",
    },
    {
      id: 3,
      title: "Machine Learning Revolutionizes Disease Detection",
      date: "2025-02-24",
    },
    // Add more related articles as needed
  ];

  const relatedArticlesList = document.getElementById("relatedArticles");
  relatedArticlesList.innerHTML = relatedArticles
    .map(
      (article) => `
          <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer" 
               onclick="readArticle(${article.id})">
              <div>
                  <h4 class="text-sm font-medium text-gray-900">${article.title}</h4>
                  <time class="text-xs text-gray-500">${article.date}</time>
              </div>
          </div>
      `,
    )
    .join("");
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
