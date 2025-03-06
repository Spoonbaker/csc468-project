// @ts-nocheck
// I simply extracted this from the body of the page it was on. You will need to
// combine related functionality into modules, and fix the Typescript errors.

// Mock article data
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
  {
    id: 2,
    title: "The Future of Sustainable Urban Planning",
    summary:
      "Cities worldwide are adopting green building standards and integrating smart transportation systems for a sustainable future...",
    date: "2025-02-25",
    isUnread: true,
    isBookmarked: true,
  },
  {
    id: 3,
    title: "Quantum Computing: The Next Generation",
    summary:
      "IBM's latest quantum processor breaks the 100-qubit barrier, opening new possibilities for complex computational problems...",
    date: "2025-02-24",
    isUnread: false,
    isBookmarked: false,
  },
  {
    id: 4,
    title: "Deep Sea Discoveries: New Species Found",
    summary:
      "Scientists discover previously unknown species in the Mariana Trench, showcasing remarkable environmental adaptations...",
    date: "2025-02-23",
    isUnread: true,
    isBookmarked: false,
  },
  {
    id: 5,
    title: "Space Tourism: The Private Space Age",
    summary:
      "With SpaceX and Blue Origin advancing commercial space projects, civilian space travel becomes increasingly accessible...",
    date: "2025-02-22",
    isUnread: false,
    isBookmarked: true,
  },
  {
    id: 6,
    title: "Blockchain Revolution in Supply Chain",
    summary:
      "Major industries adopt blockchain technology for enhanced supply chain transparency and traceability...",
    date: "2025-02-21",
    isUnread: true,
    isBookmarked: false,
  },
  {
    id: 7,
    title: "5G Networks Transform IoT Landscape",
    summary:
      "The widespread deployment of 5G networks is enabling new IoT applications and transforming smart city infrastructure...",
    date: "2025-02-20",
    isUnread: true,
    isBookmarked: false,
  },
  {
    id: 8,
    title: "Advances in Renewable Energy Storage",
    summary:
      "Breakthrough in battery technology promises to solve renewable energy storage challenges and accelerate clean energy adoption...",
    date: "2025-02-19",
    isUnread: false,
    isBookmarked: true,
  },
  {
    id: 9,
    title: "The Rise of Digital Currencies",
    summary:
      "Central banks worldwide are developing digital currencies, potentially reshaping the future of global finance...",
    date: "2025-02-18",
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
  
  //document.getElementById("articleContent").innerHTML =
   // articleData.content || `<p>${articleData.summary}</p>`;

  // attempting to remove uses of .innerHTML
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
    
      // Title elem
      const titleElem = document.createElement('h4');
      titleElem.className = 'text-sm font-medium text-gray-900';
      titleElem.textContent = article.title;
    
      // Date elem
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
