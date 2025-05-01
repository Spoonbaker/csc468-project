import { Article } from "./models/article.ts";
import { createElement } from "./utils/dom-utils.ts";
import { mockArticles } from "./data/mock-data.ts";
import { mockFeeds } from "./data/mock-data.ts";

let hardcodedUnreadArticles = [
  { id: 1, title: "Breakthrough in AI Medical Diagnostics", date: "2025-02-26" },
  { id: 2, title: "The Future of Sustainable Urban Planning", date: "2025-02-25" },
  { id: 3, title: "Quantum Computing: The Next Generation", date: "2025-02-24" },
  { id: 4, title: "Deep Sea Discoveries: New Species Found", date: "2025-02-23" },
  { id: 5, title: "Space Tourism: The Private Space Age", date: "2025-02-22" },
  { id: 6, title: "Blockchain Revolution in Supply Chain", date: "2025-02-21" },
];
let currentUnreadPage = 1;
// const unreadItemsPerPage = 5;
let currentFeedId: number | null = null;
function updateNotificationBadge() {
  const unreadCount = mockArticles.filter((article) => article.isUnread).length;
  const notif = document.querySelector(".notification-badge") as HTMLElement;
  notif.textContent = unreadCount.toString();
}

function renderUnreadList() {
  const unreadList = document.getElementById("unreadList");
  if (!unreadList) return;

  while (unreadList.firstChild) {
    unreadList.removeChild(unreadList.firstChild);
  }

  const hardcodedArticles = hardcodedUnreadArticles;

  const containerHeight = unreadList.clientHeight || 360;
  const estimatedItemHeight = 90;
  const itemsPerPage = Math.max(1, Math.floor(containerHeight / estimatedItemHeight));

  const totalUnreadPages = Math.ceil(hardcodedArticles.length / itemsPerPage);
  const startIndex = (currentUnreadPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageArticles = hardcodedArticles.slice(startIndex, endIndex);

  currentPageArticles.forEach((article) => {
    const container = createElement(
      "div",
      "flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer",
    );
    container.onclick = () => {
      // Remove from unread list
      hardcodedUnreadArticles = hardcodedUnreadArticles.filter((a) => a.id !== article.id);

      // Update unread UI
      renderUnreadList();

      // Navigate to article detail
      window.location.href = `article-detail.html?id=${article.id}`;
    };

    const circle = document.createElement("div");
    circle.className = "w-2 h-2 mt-2 rounded-full bg-primary";

    const textContainer = document.createElement("div");

    const title = document.createElement("h4");
    title.className = "text-sm font-medium text-gray-900";
    title.textContent = article.title;

    const date = document.createElement("time");
    date.className = "text-xs text-gray-500";
    date.textContent = article.date;

    textContainer.appendChild(title);
    textContainer.appendChild(date);
    container.appendChild(circle);
    container.appendChild(textContainer);

    unreadList.appendChild(container);
  });

  const notif = document.getElementById("notificationCount") as HTMLElement;
  if (notif) notif.textContent = hardcodedArticles.length.toString();

  const prevBtn = document.getElementById("unreadPrevBtn") as HTMLButtonElement;
  const nextBtn = document.getElementById("unreadNextBtn") as HTMLButtonElement;
  const pageInfo = document.getElementById("unreadPageInfo") as HTMLElement;

  if (prevBtn) prevBtn.disabled = currentUnreadPage === 1;
  if (nextBtn) nextBtn.disabled = currentUnreadPage === totalUnreadPages;
  if (pageInfo) pageInfo.textContent = `${currentUnreadPage}/${totalUnreadPages}`;
}

// function prevUnreadPage() {
//   if (currentUnreadPage > 1) {
//     currentUnreadPage--;
//     renderUnreadList();
//   }
// }

// function nextUnreadPage() {
//   const unreadArticles = mockArticles.filter((article) => article.isUnread);
//   const totalUnreadPages = Math.ceil(unreadArticles.length / unreadItemsPerPage);
//   if (currentUnreadPage < totalUnreadPages) {
//     currentUnreadPage++;
//     renderUnreadList();
//   }
// }

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

let currentDeleteId: number | null = null;
let currentPage = 1;
const itemsPerPage = 6;

function updatePaginationButtons(totalPagesForCurrentFilter?: number) {
  const prevButton = document.getElementById("prevPage") as HTMLButtonElement;
  const nextButton = document.getElementById("nextPage") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLElement;

  // Use provided total pages or calculate from all articles
  const effectiveTotalPages =
    totalPagesForCurrentFilter || Math.ceil(mockArticles.length / itemsPerPage);

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === effectiveTotalPages;
  pageInfo.textContent = `Page ${currentPage} of ${effectiveTotalPages}`;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadAndDisplayArticles();
    const articleList = document.getElementById("articleList") as HTMLElement;
    setupArticleEvents(articleList);
  }
}

function nextPage() {
  if (currentPage < Math.ceil(mockArticles.length / itemsPerPage)) {
    currentPage++;
    loadAndDisplayArticles();
    const articleList = document.getElementById("articleList") as HTMLElement;
    setupArticleEvents(articleList);
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
function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (...args: Args): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
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
  const urlParams = new URLSearchParams(window.location.search);
  const feedIdParam = urlParams.get("feedId");

  if (feedIdParam) {
    currentFeedId = parseInt(feedIdParam, 10);
  }

  let articlesToShow = mockArticles;
  if (currentFeedId !== null) {
    const feedsButton = document.getElementById("feedsButton")!;
    feedsButton.className =
      "flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white hover:bg-secondary";
    const homeButton = document.getElementById("homeButton")!;
    homeButton.className =
      "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100";
    articlesToShow = mockArticles.filter((article) => article.feedId === currentFeedId);

    const currentFeed = mockFeeds?.find((feed) => feed.id === currentFeedId);
    if (currentFeed) {
      document.title = `${currentFeed.name} - Aggre-Gator RSS`;

      const feedIndicator = document.getElementById("currentFeedIndicator");
      if (feedIndicator) {
        feedIndicator.textContent = `Viewing: ${currentFeed.name}`;
        feedIndicator.style.display = "block";
      }
    }
  } else {
    document.title = "Aggre-Gator RSS";

    const feedIndicator = document.getElementById("currentFeedIndicator");
    if (feedIndicator) {
      feedIndicator.style.display = "none";
    }
  }

  const totalPagesForCurrentFilter = Math.ceil(articlesToShow.length / itemsPerPage);
  if (currentPage > totalPagesForCurrentFilter) {
    currentPage = 1;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = articlesToShow.slice(startIndex, endIndex);

  const articleList = document.getElementById("articleList") as HTMLElement;
  renderArticles(paginatedArticles, articleList);

  updatePaginationButtons(totalPagesForCurrentFilter);
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
// function showLoginModal() {
//   document.getElementById("loginModal")?.classList.add("show");
// }

// function closeLoginModal() {
//   document.getElementById("loginModal")?.classList.remove("show");
// }

document.addEventListener("DOMContentLoaded", () => {
  // Read feedId from URL (used for filtering the main article list)
  const urlParams = new URLSearchParams(window.location.search);
  const feedIdParam = urlParams.get("feedId");
  if (feedIdParam) {
    currentFeedId = parseInt(feedIdParam, 10);
  }

  // Login modal setup
  const loginButton = document.getElementById("loginButton") as HTMLButtonElement;
  const loginModal = document.getElementById("loginModal") as HTMLElement;
  const closeButton = document.getElementById("closeLogin") as HTMLButtonElement;

  if (!loginButton || !loginModal || !closeButton) {
    console.error("❌ Login modal elements not found!");
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

  // Delete modal button events
  document.getElementById("cancelDelete")?.addEventListener("click", closeDeleteModal);
  document.getElementById("closeDelete")?.addEventListener("click", closeDeleteModal);
  document.getElementById("confirmDelete")?.addEventListener("click", confirmDelete);

  // Pagination for main article section
  document.getElementById("prevPage")?.addEventListener("click", prevPage);
  document.getElementById("nextPage")?.addEventListener("click", nextPage);

  // Pagination for unread articles (right panel)
  document.getElementById("unreadPrevBtn")?.addEventListener("click", () => {
    if (currentUnreadPage > 1) {
      currentUnreadPage--;
      renderUnreadList();
    }
  });

  document.getElementById("unreadNextBtn")?.addEventListener("click", () => {
    const unreadList = document.getElementById("unreadList");
    const containerHeight = unreadList?.clientHeight || 360;
    const estimatedItemHeight = 90;
    const itemsPerPage = Math.max(1, Math.floor(containerHeight / estimatedItemHeight));
    const maxPage = Math.ceil(6 / itemsPerPage); // 6 hardcoded articles for now

    if (currentUnreadPage < maxPage) {
      currentUnreadPage++;
      renderUnreadList();
    }
  });

  if (!document.getElementById("currentFeedIndicator")) {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      const feedIndicator = createElement(
        "div",
        "bg-primary/10 text-primary px-4 py-2 rounded-lg mb-4 hidden",
      );
      feedIndicator.id = "currentFeedIndicator";

      if (mainContent.firstChild) {
        mainContent.insertBefore(feedIndicator, mainContent.firstChild);
      } else {
        mainContent.appendChild(feedIndicator);
      }
    }
  }

  // Initial render of unread articles
  renderUnreadList();

  // Re-render unread list on window resize
  window.addEventListener("resize", renderUnreadList);

  // Initial article load
  loadAndDisplayArticles();
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
  console.log("🔖 Bookmark toggled for article:", id);

  const article = mockArticles.find((article) => article.id === id);
  if (article) {
    article.isBookmarked = !article.isBookmarked;

    const articleCard = document.querySelector(`[data-article-id="${id}"]`);
    const btn = articleCard?.querySelector(".bookmark-btn") as HTMLButtonElement;

    if (btn) {
      btn.classList.add("scale-110", "transition-transform", "duration-200");
      setTimeout(() => {
        btn.classList.remove("scale-110");
      }, 200);

      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = `ri-bookmark-${article.isBookmarked ? "fill" : "line"}`;
      }
    }

    showToast(article.isBookmarked ? "🔖 Saved to Bookmarks!" : "🗑️ Removed from Bookmarks");
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

window.addEventListener("resize", () => {
  renderUnreadList();
});

// Initial load has been moved to DOMContentLoaded event
// This prevents issues with elements not being in the DOM yet
updateNotificationBadge();
