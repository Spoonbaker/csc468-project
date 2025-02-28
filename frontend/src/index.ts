// @ts-nocheck
// I simply extracted this from the body of the page it was on. You will need to
// combine related functionality into modules, and fix the Typescript errors.

let currentUnreadPage = 1;
const unreadItemsPerPage = 5;
function updateNotificationBadge() {
  const unreadCount = mockArticles.filter((article) => article.isUnread).length;
  document.querySelector(".notification-badge").textContent = unreadCount;
}
function renderUnreadList() {
  const unreadList = document.getElementById("unreadList");
  const unreadArticles = mockArticles.filter((article) => article.isUnread);
  updateNotificationBadge();
  const totalUnreadPages = Math.ceil(unreadArticles.length / unreadItemsPerPage);
  const startIndex = (currentUnreadPage - 1) * unreadItemsPerPage;
  const endIndex = startIndex + unreadItemsPerPage;
  const currentUnreadArticles = unreadArticles.slice(startIndex, endIndex);
  unreadList.innerHTML = currentUnreadArticles
    .map(
      (article) => `
<div class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onclick="readArticle(${article.id})">
<div class="w-2 h-2 mt-2 rounded-full bg-primary"></div>
<div>
<h4 class="text-sm font-medium text-gray-900">${article.title}</h4>
<time class="text-xs text-gray-500">${article.date}</time>
</div>
</div>
`,
    )
    .join("");
  document.getElementById("unreadPageInfo").textContent =
    `${currentUnreadPage}/${totalUnreadPages}`;
  document.getElementById("unreadPrevBtn").disabled = currentUnreadPage === 1;
  document.getElementById("unreadNextBtn").disabled = currentUnreadPage === totalUnreadPages;
}
function prevUnreadPage() {
  if (currentUnreadPage > 1) {
    currentUnreadPage--;
    renderUnreadList();
  }
}
function nextUnreadPage() {
  const unreadArticles = mockArticles.filter((article) => article.isUnread);
  const totalUnreadPages = Math.ceil(unreadArticles.length / unreadItemsPerPage);
  if (currentUnreadPage < totalUnreadPages) {
    currentUnreadPage++;
    renderUnreadList();
  }
}
function readArticle(id) {
  const article = mockArticles.find((article) => article.id === id);
  if (article && article.isUnread) {
    article.isUnread = false;
    updateNotificationBadge();
    renderUnreadList();
    const searchInput = document.getElementById("searchInput");
    if (searchInput.value.trim()) {
      handleSearch(searchInput.value.toLowerCase());
    } else {
      renderArticles();
    }
  }
  window.location.href = `article-detail.html?id=${id}`;
}
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
];
let currentDeleteId = null;
let currentPage = 1;
const itemsPerPage = 6;
const totalPages = Math.ceil(mockArticles.length / itemsPerPage);
function updatePaginationButtons() {
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderArticles();
    updatePaginationButtons();
  }
}
function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderArticles();
    updatePaginationButtons();
  }
}
function showLoading() {
  document.getElementById("loadingIndicator").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingIndicator").style.display = "none";
}

// Debounce function implementation
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Search handler function
const handleSearch = debounce((searchTerm) => {
  if (!searchTerm.trim()) {
    renderArticles();
    return;
  }

  const filteredArticles = mockArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm),
  );

  renderFilteredArticles(filteredArticles);
}, 300);

// Article template function
function getArticleTemplate(article) {
  return `
  <article class="bg-white rounded-lg shadow-sm overflow-hidden ${article.isUnread ? "ring-1 ring-primary/10" : ""}">
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-lg ${article.isUnread ? "font-bold" : "font-medium"} text-gray-900">${article.title}</h2>
        <button onclick="showDeleteModal(${article.id})" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
      <p class="text-gray-600 mb-4 text-sm">${article.summary}</p>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button onclick="toggleBookmark(${article.id})" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary">
            <i class="ri-bookmark-${article.isBookmarked ? "fill" : "line"}"></i>
          </button>
          <button onclick="shareArticle(${article.id})" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary">
            <i class="ri-share-line"></i>
          </button>
        </div>
        <time class="text-sm text-gray-500">${article.date}</time>
      </div>
    </div>
    <div class="px-6 py-4 bg-gray-50 border-t">
      <button onclick="readArticle(${article.id})" class="w-full py-2 bg-primary text-white !rounded-button hover:bg-secondary">
        Read More
      </button>
    </div>
  </article>
`;
}

// Render filtered article list
function renderFilteredArticles(articles) {
  const articleList = document.getElementById("articleList");
  if (articles.length === 0) {
    articleList.innerHTML = `
    <div class="col-span-full text-center py-8">
      <i class="ri-search-line text-4xl text-gray-400 mb-2"></i>
      <p class="text-gray-500">No articles found</p>
    </div>
  `;
    return;
  }
  articleList.innerHTML = articles.map(getArticleTemplate).join("");
}

// Search input listener
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  if (searchTerm.trim() === "") {
    document.getElementById("articleList").classList.remove("searching");
  } else {
    document.getElementById("articleList").classList.add("searching");
  }
  handleSearch(searchTerm);
});

// Article list render function
async function renderArticles() {
  showLoading();

  try {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const articleList = document.getElementById("articleList");
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentArticles = mockArticles.slice(startIndex, endIndex);

    if (currentArticles.length === 0) {
      articleList.innerHTML = `
      <div class="col-span-full text-center py-8">
        <i class="ri-inbox-line text-4xl text-gray-400 mb-2"></i>
        <p class="text-gray-500">No articles available</p>
      </div>
    `;
      return;
    }

    articleList.innerHTML = currentArticles.map(getArticleTemplate).join("");
  } catch (error) {
    console.error("Render articles failed:", error);
    const articleList = document.getElementById("articleList");
    articleList.innerHTML = `
    <div class="col-span-full text-center py-8 text-red-500">
      <i class="ri-error-warning-line text-4xl mb-2"></i>
      <p>Failed to load articles. Please try again later.</p>
    </div>
  `;
  } finally {
    hideLoading();
  }
}
function showDeleteModal(id) {
  currentDeleteId = id;
  document.getElementById("deleteModal").style.display = "flex";
}
function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
  currentDeleteId = null;
}
function showLoginModal() {
  document.getElementById("loginModal").style.display = "flex";
}
function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}
function confirmDelete() {
  if (currentDeleteId !== null) {
    const index = mockArticles.findIndex((article) => article.id === currentDeleteId);
    if (index !== -1) {
      mockArticles.splice(index, 1);
      renderArticles();
    }
  }
  closeDeleteModal();
}
function toggleBookmark(id) {
  const article = mockArticles.find((article) => article.id === id);
  if (article) {
    article.isBookmarked = !article.isBookmarked;
    renderArticles();
    showToast(article.isBookmarked ? "Article bookmarked" : "Bookmark removed");
  }
}
function shareArticle(id) {
  const article = mockArticles.find((article) => article.id === id);
  if (article) {
    const shareUrl = `${window.location.origin}/article/${article.id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showToast("Link copied!");
      })
      .catch(() => {
        showToast("Failed to copy link");
      });
  }
}
function showToast(message) {
  // Create toast element if it doesn't exist
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className =
      "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg transform transition-transform duration-300 translate-y-full";
    document.body.appendChild(toast);
  }

  // Show toast with message
  toast.textContent = message;
  toast.classList.remove("translate-y-full");

  // Hide toast after 2 seconds
  setTimeout(() => {
    toast.classList.add("translate-y-full");
  }, 2000);
}
renderArticles();
renderUnreadList();
updatePaginationButtons();
updateNotificationBadge();
