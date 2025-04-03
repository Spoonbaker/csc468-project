// Need to use proper type assertions or checks for all DOM queries before
// removing @ts-nocheck
// I simply extracted this from the body of the page it was on. You will need to
// combine related functionality into modules, and fix the Typescript errors.

import { Article } from "./models/article";

let currentUnreadPage = 1;
const unreadItemsPerPage = 5;
let currentFeedId: number | null = null;
function updateNotificationBadge() {
  const unreadCount = mockArticles.filter((article) => article.isUnread).length;
  const notif = document.querySelector(".notification-badge") as HTMLElement;
  notif.textContent = unreadCount.toString();
}
function renderUnreadList() {
  const unreadList = document.getElementById("unreadList");
  const unreadArticles = mockArticles.filter((article) => article.isUnread);
  updateNotificationBadge();
  const totalUnreadPages = Math.ceil(unreadArticles.length / unreadItemsPerPage);
  const startIndex = (currentUnreadPage - 1) * unreadItemsPerPage;
  const endIndex = startIndex + unreadItemsPerPage;
  const currentUnreadArticles = unreadArticles.slice(startIndex, endIndex);
  if (unreadList) {
    while (unreadList.firstChild) {
      unreadList?.removeChild(unreadList.firstChild);
    }
  }

  currentUnreadArticles.forEach((article) => {
    const unreadArticleContainer = document.createElement("div");
    unreadArticleContainer.className =
      "flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer";
    unreadArticleContainer.addEventListener("click", () => {
      readArticle(article.id);
    });

    const circle = document.createElement("div");
    circle.className = "w-2 h-2 mt-2 rounded-full bg-primary";

    const detailsContainer = document.createElement("div");

    const unreadArticleTitle = document.createElement("h4");
    unreadArticleTitle.className = "text-sm font-medium text-gray-900";
    unreadArticleTitle.textContent = article.title;

    const unreadArticleDate = document.createElement("time");
    unreadArticleDate.className = "text-xs text-gray-500";
    unreadArticleDate.textContent = article.date;

    detailsContainer.appendChild(unreadArticleTitle);
    detailsContainer.appendChild(unreadArticleDate);

    unreadArticleContainer.appendChild(circle);
    unreadArticleContainer.appendChild(detailsContainer);

    unreadList?.appendChild(unreadArticleContainer);
  });

  const pageInfoElement = document.getElementById("unreadPageInfo") as HTMLElement;
  const prevBtn = document.getElementById("unreadPrevBtn") as HTMLButtonElement;
  const nextBtn = document.getElementById("unreadNextBtn") as HTMLButtonElement;

  if (pageInfoElement) {
    pageInfoElement.textContent = `${currentUnreadPage}/${totalUnreadPages}`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentUnreadPage === 1;
  }

  if (nextBtn) {
    nextBtn.disabled = currentUnreadPage === totalUnreadPages;
  }
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

function readArticle(id: number) {
  const article = mockArticles.find((article) => article.id === id);
  if (article && article.isUnread) {
    article.isUnread = false;
    updateNotificationBadge();
    renderUnreadList();
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    if (searchInput.value.trim()) {
      handleSearch(searchInput.value.toLowerCase());
    } else {
      loadAndDisplayArticles();
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
let currentDeleteId: number | null = null;
let currentPage = 1;
const itemsPerPage = 6;
const totalPages = Math.ceil(mockArticles.length / itemsPerPage);
function updatePaginationButtons() {
  const prevButton = document.getElementById("prevPage") as HTMLButtonElement;
  const nextButton = document.getElementById("nextPage") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLElement;
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadAndDisplayArticles();
  }
}
function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    loadAndDisplayArticles();
  }
}
function showLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator") as HTMLElement;
  loadingIndicator.style.display = "flex";
}

function hideLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator") as HTMLElement;
  loadingIndicator.style.display = "none";
}

// Debounce function implementation
function debounce(func: Function, wait: number) {
  let timeout: number | undefined;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as unknown as number;
  };
}

// Search handler function
const handleSearch = debounce((searchTerm: string) => {
  if (!searchTerm.trim()) {
    loadAndDisplayArticles();
    return;
  }

  // If feed selected, filter only that feed
  let articlesToSearch = mockArticles;
  if (currentFeedId !== null) {
    articlesToSearch = mockArticles.filter((article) => article.feedId === currentFeedId);
  }

  const filteredArticles = articlesToSearch.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm),
  );

  const articleList = document.getElementById("articleList") as HTMLElement;
  renderArticles(filteredArticles, articleList);
}, 300);

// Search input listener
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
searchInput.addEventListener("input", (e: Event) => {
  const target = e.target as HTMLInputElement;
  const searchTerm = target.value.toLowerCase();
  const articleList = document.getElementById("articleList") as HTMLElement;
  if (searchTerm.trim() === "") {
    articleList.classList.remove("searching");
  } else {
    articleList.classList.add("searching");
  }
  handleSearch(searchTerm);
});

function createElement<T extends HTMLElement>(
  tag: string,
  className: string = "",
  textContent: string = "",
): T {
  const element = document.createElement(tag) as T;
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

// Function to render individual article cards
function createArticleCard(article: Article): HTMLElement {
  const card = createElement(
    "div",
    `article-card bg-white rounded-lg shadow-sm overflow-hidden ${article.isUnread ? "ring-1 ring-primary/10" : ""}`,
  );
  card.dataset.articleId = article.id.toString(); // Fixed typo from articleID to articleId

  // Main container
  const content = createElement("div", "p-6");

  // Header container
  const header = createElement("div", "flex justify-between items-start mb-4");
  const title = createElement(
    "h2",
    `text-lg ${article.isUnread ? "font-bold" : "font-medium"} text-gray-900`,
    article.title,
  );
  const deleteBtn = createElement(
    "button",
    "delete-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500",
  );
  const deleteIcon = createElement("i", "ri-delete-bin-line");
  deleteBtn.appendChild(deleteIcon);

  header.appendChild(title);
  header.appendChild(deleteBtn);

  // Summary
  const summary = createElement("p", "text-gray-600 mb-4 text-sm", article.summary);

  // Stats
  const stats = createElement("div", "flex items-center justify-between");
  const btnContainer = createElement("div", "flex items-center gap-3");

  // Bookmark button
  const bookmarkBtn = createElement(
    "button",
    "bookmark-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary",
  );
  const bookmarkIcon = createElement("i", `ri-bookmark-${article.isBookmarked ? "fill" : "line"}`);
  bookmarkBtn.appendChild(bookmarkIcon);

  // Share button
  const shareBtn = createElement(
    "button",
    "share-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary",
  );
  const shareIcon = createElement("i", "ri-share-line");
  shareBtn.appendChild(shareIcon);

  btnContainer.appendChild(bookmarkBtn);
  btnContainer.appendChild(shareBtn);

  // Date
  const date = createElement("time", "text-sm text-gray-500", article.date);

  stats.appendChild(btnContainer);
  stats.appendChild(date);

  // Read more
  const footer = createElement("div", "px-6 py-4 bg-gray-50 border-t");
  const readMoreBtn = createElement(
    "button",
    "read-more-btn w-full py-2 bg-primary text-white !rounded-button hover:bg-secondary",
    "Read More",
  );
  footer.appendChild(readMoreBtn);

  // Assembly
  content.appendChild(header);
  content.appendChild(summary);
  content.appendChild(stats);
  card.appendChild(content);
  card.appendChild(footer);

  return card;
}

// Article list render function
async function renderArticles(articles: Article[], container: HTMLElement) {
  showLoading();

  try {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (articles.length === 0) {
      const emptyMessage = createElement("div", "col-span-full text-center py-8");
      const icon = createElement("i", "ri-search-line text-4xl text-gray-400 mb-2");
      const text = createElement("p", "text-gray-500", "No articles found");

      emptyMessage.appendChild(icon);
      emptyMessage.appendChild(text);
      container.appendChild(emptyMessage);
      return;
    }

    const fragment = document.createDocumentFragment();

    // Create article cards and add to fragment
    articles.forEach((article) => {
      const articleCard = createArticleCard(article);
      fragment.appendChild(articleCard);
    });

    container.appendChild(fragment);

    setupArticleEvents(container);
  } catch (error) {
    console.error("Render articles failed:", error);
    const renderArticlesFailedContainer = createElement(
      "div",
      "col-span-full text-center py-8 text-red-500",
    );
    const errorIcon = createElement("i", "ri-error-warning-line text-4xl mb-2");
    const message = createElement("p", "", "Failed to load articles. Please try again later.");

    renderArticlesFailedContainer.appendChild(errorIcon);
    renderArticlesFailedContainer.appendChild(message);
    container.appendChild(renderArticlesFailedContainer);
  } finally {
    hideLoading();
  }
}

function setupArticleEvents(container: HTMLElement) {
  container.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const articleCard = target.closest(".article-card") as HTMLElement;

    if (!articleCard) return;

    const articleId = Number(articleCard.dataset.articleId);

    if (target.closest(".delete-btn")) {
      e.stopPropagation();
      showDeleteModal(articleId);
    } else if (target.closest(".bookmark-btn")) {
      e.stopPropagation();
      toggleBookmark(articleId);
    } else if (target.closest(".share-btn")) {
      e.stopPropagation();
      shareArticle(articleId);
    } else if (
      target.closest(".read-more-btn") ||
      target === articleCard ||
      articleCard.contains(target)
    ) {
      readArticle(articleId);
    }
  });
}

function loadAndDisplayArticles() {
  let articlesToShow = mockArticles;
  if (currentFeedId !== null) {
    articlesToShow = mockArticles.filter((article) => article.feedId === currentFeedId);
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = articlesToShow.slice(startIndex, endIndex);

  const articleList = document.getElementById("articleList") as HTMLElement;

  renderArticles(paginatedArticles, articleList);

  updatePaginationButtons();
}

const deleteModal = document.getElementById("deleteModal") as HTMLElement;
function showDeleteModal(id: number | null) {
  currentDeleteId = id;
  deleteModal.style.display = "flex";
}
function closeDeleteModal() {
  deleteModal.style.display = "none";
  currentDeleteId = null;
}
function showLoginModal() {
  document.getElementById("loginModal")?.classList.add("show");
}

function closeLoginModal() {
  document.getElementById("loginModal")?.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  // Check URL for feed parameter
  const urlParams = new URLSearchParams(window.location.search);
  const feedIdParam = urlParams.get("feedId");
  if (feedIdParam) {
    currentFeedId = parseInt(feedIdParam, 10);
  }

  const loginButton = document.getElementById("loginButton") as HTMLButtonElement;
  const loginModal = document.getElementById("loginModal") as HTMLElement;
  const closeButton = document.getElementById("closeLogin") as HTMLButtonElement;

  if (!loginButton || !loginModal || !closeButton) {
    console.error("❌ One or more login modal elements not found!");
    return;
  }

  function showLoginModal() {
    console.log("✅ Showing login modal");
    loginModal.classList.remove("hidden");
    loginModal.style.display = "flex";
  }

  function closeLoginModal() {
    console.log("✅ Closing login modal");
    loginModal.classList.add("hidden");
    loginModal.style.display = "none";
  }

  loginButton.addEventListener("click", showLoginModal);
  closeButton.addEventListener("click", closeLoginModal);
  document.getElementById("cancelDelete")?.addEventListener("click", closeDeleteModal);
  document.getElementById("closeDelete")?.addEventListener("click", closeDeleteModal);
});

function confirmDelete() {
  if (currentDeleteId !== null) {
    const index = mockArticles.findIndex((article) => article.id === currentDeleteId);
    if (index !== -1) {
      mockArticles.splice(index, 1);
      loadAndDisplayArticles();
    }
  }
  closeDeleteModal();
}
function toggleBookmark(id: number) {
  const article = mockArticles.find((article) => article.id === id);
  if (article) {
    article.isBookmarked = !article.isBookmarked;
    loadAndDisplayArticles();
    showToast(article.isBookmarked ? "Article bookmarked" : "Bookmark removed");
  }
}
function shareArticle(id: number) {
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
function showToast(message: string | null) {
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

loadAndDisplayArticles();
renderUnreadList();
updateNotificationBadge();
