import { ApiClient, Article, ApiError } from './utils/api.ts';
import { createElement } from './utils/dom-utils.ts';

let currentUnreadPage = 1;
let currentFeedId: string | null = null;
let currentDeleteId: string | null = null;
let currentPage = 1;
const itemsPerPage = 6;
const unreadItemsPerPage = 5;

async function updateNotificationBadge() {
    const feedIds = await ApiClient.getUserFeeds();
    const feeds = await ApiClient.getFeedsInfo(feedIds);
    const totalUnread = feeds.reduce((sum, feed) => sum + (feed.unreadCount || 0), 0);
    const notif = document.querySelector(".notification-badge") as HTMLElement;
    notif.textContent = totalUnread.toString();
}

async function renderUnreadList() {
    const unreadArticles = await ApiClient.getUnreadArticles();
    const unreadList = document.getElementById("unreadList");
    if (!unreadList) return;

    while (unreadList.firstChild) {
      unreadList.removeChild(unreadList.firstChild);
    }

    if (unreadArticles.length === 0) {
      const emptyState = createElement("div", "text-center p-4 text-gray-500", 
        "No unread articles");
      unreadList.appendChild(emptyState);
      
      updateUnreadCount(0);
      return;
    }

    const totalUnreadPages = Math.ceil(unreadArticles.length / unreadItemsPerPage);
    const startIndex = (currentUnreadPage - 1) * unreadItemsPerPage;
    const endIndex = startIndex + unreadItemsPerPage;
    const currentPageArticles = unreadArticles.slice(startIndex, endIndex);
    
    currentPageArticles.forEach((article) => {
      const container = createElement(
        "div",
        "flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer",
      );
      container.onclick = () => readArticle(article.id);

      const circle = createElement("div", "w-2 h-2 mt-2 rounded-full bg-primary");

      const textContainer = createElement("div", "");

      const title = createElement("h4", "text-sm font-medium text-gray-900", 
        article.title || "Untitled Article");

      const date = createElement("time", "text-xs text-gray-500", 
        new Date(article.pubDate || "").toLocaleDateString());

      textContainer.appendChild(title);
      textContainer.appendChild(date);
      container.appendChild(circle);
      container.appendChild(textContainer);

      unreadList.appendChild(container);
    });

    updateUnreadCount(unreadArticles.length);

    updateUnreadPagination(totalUnreadPages);
}

function updateUnreadCount(count: number) {
  const notif = document.getElementById("notificationCount");
  if (notif) notif.textContent = count.toString();
  
  const badgeNotif = document.querySelector(".notification-badge");
  if (badgeNotif) badgeNotif.textContent = count.toString();
}

function updateUnreadPagination(totalPages: number) {
  const prevBtn = document.getElementById("unreadPrevBtn") as HTMLButtonElement;
  const nextBtn = document.getElementById("unreadNextBtn") as HTMLButtonElement;
  const pageInfo = document.getElementById("unreadPageInfo") as HTMLElement;

  if (prevBtn) prevBtn.disabled = currentUnreadPage === 1;
  if (nextBtn) nextBtn.disabled = currentUnreadPage === totalPages;
  if (pageInfo) pageInfo.textContent = `${currentUnreadPage}/${totalPages}`;
}

function prevUnreadPage() {
  if (currentUnreadPage > 1) {
    currentUnreadPage--;
    renderUnreadList();
  }
}

function nextUnreadPage() {
  currentUnreadPage++;
  renderUnreadList();
}

async function readArticle(id: string) {
    await ApiClient.setArticleReadStatus(id, true);
    
    renderUnreadList();
    updateNotificationBadge();
    
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    if (searchInput?.value.trim()) {
      handleSearch(searchInput.value.toLowerCase());
    } else {
      loadAndDisplayArticles();
    }
    window.location.href = `article-detail.html?id=${id}`;
}

function updatePaginationButtons(totalPages: number) {
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
    const articleList = document.getElementById("articleList") as HTMLElement;
    setupArticleEvents(articleList);
  }
}

function nextPage() {
  currentPage++;
  loadAndDisplayArticles();
  const articleList = document.getElementById("articleList") as HTMLElement;
  setupArticleEvents(articleList);
}

function showLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator") as HTMLElement;
  loadingIndicator.style.display = "flex";
  loadingIndicator.style.pointerEvents = "none";
  const innerDiv = loadingIndicator.querySelector("div") as HTMLElement;
  if (innerDiv) {
    innerDiv.style.pointerEvents = "auto";
  }
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

const handleSearch = debounce(async (searchTerm: string) => {
  if (!searchTerm.trim()) {
    loadAndDisplayArticles();
    return;
  }
    const articleIds = await ApiClient.searchArticles(searchTerm, currentFeedId);
    const articles = await ApiClient.getArticlesInfo(articleIds);
    
    const articleList = document.getElementById("articleList");
    if (articleList) {
      renderArticles(articles, articleList);
      setupArticleEvents(articleList);
    }
}, 300);

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
  card.dataset.articleId = article.id.toString();

  const content = createElement("div", "p-6");

  const header = createElement("div", "flex justify-between items-start mb-4");
  const title = createElement(
    "h2",
    `text-lg ${article.isUnread ? "font-bold" : "font-medium"} text-gray-900`,
    article.title || "Untitled Article",
  );
  const deleteBtn = createElement(
    "button",
    "delete-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500",
  );
  const deleteIcon = createElement("i", "ri-delete-bin-line");
  deleteBtn.appendChild(deleteIcon);

  header.appendChild(title);
  header.appendChild(deleteBtn);

  const summary = createElement("p", "text-gray-600 mb-4 text-sm", article.description || "");

  const stats = createElement("div", "flex items-center justify-between");
  const btnContainer = createElement("div", "flex items-center gap-3");

  const bookmarkBtn = createElement(
    "button",
    "bookmark-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary",
  );
  const bookmarkIcon = createElement("i", `ri-bookmark-${article.isBookmarked ? "fill" : "line"}`);
  bookmarkBtn.appendChild(bookmarkIcon);

  const shareBtn = createElement(
    "button",
    "share-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary",
  );
  const shareIcon = createElement("i", "ri-share-line");
  shareBtn.appendChild(shareIcon);

  btnContainer.appendChild(bookmarkBtn);
  btnContainer.appendChild(shareBtn);

  const date = createElement("time", "text-sm text-gray-500", article.pubDate ? new Date(article.pubDate).toLocaleDateString() : "");

  stats.appendChild(btnContainer);
  stats.appendChild(date);

  const footer = createElement("div", "px-6 py-4 bg-gray-50 border-t");
  const readMoreBtn = createElement(
    "button",
    "read-more-btn w-full py-2 bg-primary text-white !rounded-button hover:bg-secondary",
    "Read More",
  );
  footer.appendChild(readMoreBtn);

  content.appendChild(header);
  content.appendChild(summary);
  content.appendChild(stats);
  card.appendChild(content);
  card.appendChild(footer);

  return card;
}

async function renderArticles(articles: Article[], container: HTMLElement) {
  showLoading();

  try {
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
    const grid = createElement("div", "grid gap-6");
    
    articles.forEach(article => {
      const card = createArticleCard(article);
      grid.appendChild(card);
    });
    
    fragment.appendChild(grid);
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

    const articleId = articleCard.dataset.articleId;
    if (!articleId) return;

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

async function loadAndDisplayArticles() {
  const articleList = document.getElementById("articleList");
  if (!articleList) return;

  showLoading();
  
  try {
    if (!ApiClient.isAuthenticated()) {
      while (articleList.firstChild) {
        articleList.removeChild(articleList.firstChild);
      }
      
      const emptyMessage = createElement("div", "col-span-full text-center py-8");
      const icon = createElement("i", "ri-login-box-line text-4xl text-gray-400 mb-2");
      const text = createElement("p", "text-gray-500", "Please log in to view articles");
      
      emptyMessage.appendChild(icon);
      emptyMessage.appendChild(text);
      articleList.appendChild(emptyMessage);
      
      updatePaginationButtons(1);
      hideLoading();
      return;
    }
    
    let articleIds: string[] = [];
    if (currentFeedId) {
      articleIds = await ApiClient.getFeedArticles(currentFeedId);
      updateFeedIndicator(currentFeedId);
    } else {
      const feedIds = await ApiClient.getUserFeeds();
      for (const feedId of feedIds) {
        const feedArticles = await ApiClient.getFeedArticles(feedId);
        articleIds = articleIds.concat(feedArticles);
      }
      hideFeedIndicator();
    }

    if (articleIds.length === 0) {
      while (articleList.firstChild) {
        articleList.removeChild(articleList.firstChild);
      }
      
      const emptyMessage = createElement("div", "col-span-full text-center py-8");
      const icon = createElement("i", "ri-search-line text-4xl text-gray-400 mb-2");
      const text = createElement("p", "text-gray-500", "No articles found");
      
      emptyMessage.appendChild(icon);
      emptyMessage.appendChild(text);
      articleList.appendChild(emptyMessage);
      
      updatePaginationButtons(1);
      hideLoading();
      return;
    }

    articleIds.sort((a, b) => b.localeCompare(a));

    const totalPages = Math.ceil(articleIds.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageIds = articleIds.slice(startIndex, endIndex);
    
    const articles = await ApiClient.getArticlesInfo(currentPageIds);
    await renderArticles(articles, articleList);
    updatePaginationButtons(totalPages);
  } catch (error) {
    console.error("Failed to load articles:", error);
    
    while (articleList.firstChild) {
      articleList.removeChild(articleList.firstChild);
    }
    
    const errorMessage = createElement("div", "col-span-full text-center py-8");
    const icon = createElement("i", "ri-error-warning-line text-4xl text-red-400 mb-2");
    const text = createElement("p", "text-red-500", "Failed to load articles. Please try again later.");
    
    errorMessage.appendChild(icon);
    errorMessage.appendChild(text);
    articleList.appendChild(errorMessage);
    
    updatePaginationButtons(1);
    showToast("Failed to load articles. Please try again.");
  } finally {
    hideLoading();
  }
}

function showDeleteModal(id: string | null) {
  currentDeleteId = id;
  const deleteModal = document.getElementById("deleteModal");
  if (deleteModal) {
    deleteModal.classList.remove('modal-hidden');
    deleteModal.classList.add('modal-visible');
  }
}

function closeDeleteModal() {
  const deleteModal = document.getElementById("deleteModal");
  if (deleteModal) {
    deleteModal.classList.remove('modal-visible');
    deleteModal.classList.add('modal-hidden');
  }
  currentDeleteId = null;
}

async function confirmDelete() {
  if (!currentDeleteId) {
    closeDeleteModal();
    return;
  }

  showLoading();
  try {
    await ApiClient.deleteArticle(currentDeleteId);
    showToast("Article deleted");
    loadAndDisplayArticles();
  } catch (error) {
    console.error("Delete failed:", error);
    showToast("Failed to delete article");
  } finally {
    hideLoading();
  }
}

async function toggleBookmark(id: string) {
  try {
    const articles = document.querySelectorAll(`.article-card[data-article-id="${id}"]`);
    const article = await ApiClient.getArticle(id);
    
    const newState = !article.isBookmarked;
    
    articles.forEach(articleElem => {
      const btn = articleElem.querySelector(".bookmark-btn");
      if (btn) {
        const icon = btn.querySelector("i");
        if (icon) {
          btn.classList.add("scale-110", "transition-transform", "duration-200");
          setTimeout(() => {
            btn.classList.remove("scale-110");
          }, 200);
          
          icon.className = `ri-bookmark-${newState ? "fill" : "line"}`;
        }
      }
    });
    
    showToast(newState ? "🔖 Saved to Bookmarks!" : "Removed from Bookmarks");
    
    await ApiClient.setArticleBookmark(id, newState);
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    showToast("Failed to update bookmark");
  }
}

function shareArticle(id: string) {
  const shareUrl = `${window.location.origin}/article-detail.html?id=${id}`;
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      showToast("Link copied!");
    })
    .catch(() => {
      showToast("Failed to copy link");
    });
}

function showToast(message: string) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className =
      "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg transform transition-transform duration-300 translate-y-full";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove("translate-y-full");

  setTimeout(() => {
    toast.classList.add("translate-y-full");
  }, 2000);
}

function updateFeedIndicator(feedId: string) {
  ApiClient.getFeedInfo(feedId).then(feed => {
    document.title = `${feed.title} - Aggre-Gator RSS`;
    const indicator = document.getElementById("currentFeedIndicator");
    if (indicator) {
      indicator.textContent = `Viewing: ${feed.title}`;
      indicator.style.display = "block";
    }
  });
}

function hideFeedIndicator() {
  document.title = "Aggre-Gator RSS";
  const indicator = document.getElementById("currentFeedIndicator");
  if (indicator) {
    indicator.style.display = "none";
  }
}

async function initializeAuth() {
  if (!ApiClient.isAuthenticated()) {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.classList.remove('modal-hidden');
      loginModal.classList.add('modal-visible');
    }
    return;
  }
  
  try {
    await Promise.all([
      updateNotificationBadge(),
      loadAndDisplayArticles(),
      renderUnreadList()
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.classList.remove('modal-hidden');
        loginModal.classList.add('modal-visible');
      }
    }
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  
  // Check for auth callback
  if (hashParams.get('auth-callback') !== null) {
    const token = urlParams.get('token');
    const expiresIn = urlParams.get('expires_in');
    if (token && expiresIn) {
      ApiClient.setToken(token, parseInt(expiresIn));
      window.history.replaceState({}, document.title, window.location.pathname);      await initializeAuth();
      return;
    }
  }
  
  const code = urlParams.get('code');
  if (code) {
    showLoading();
    try {
      await ApiClient.handleOAuthCallback(code);
      return;
    } catch (error) {
      console.error('OAuth callback failed:', error);
      showToast('Authentication failed. Please try again.');
      hideLoading();
    }
  }
  
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.classList.remove('modal-hidden');
        loginModal.classList.add('modal-visible');
      }
    });
  }

  const googleLoginBtn = document.getElementById('googleLoginBtn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
      window.location.href = '/api/v0/auth/google';
    });
  }

  const closeLoginBtn = document.getElementById('closeLogin');
  if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => {
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.classList.remove('modal-visible');
        loginModal.classList.add('modal-hidden');
      }
    });
  }

  const prevPageBtn = document.getElementById('prevPage');
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', prevPage);
  }

  const nextPageBtn = document.getElementById('nextPage');
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', nextPage);
  }

  const closeDeleteBtn = document.getElementById('closeDelete');
  if (closeDeleteBtn) {
    closeDeleteBtn.addEventListener('click', closeDeleteModal);
  }

  const confirmDeleteBtn = document.getElementById('confirmDelete');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', confirmDelete);
  }

  document.getElementById("unreadPrevBtn")?.addEventListener("click", prevUnreadPage);
  document.getElementById("unreadNextBtn")?.addEventListener("click", nextUnreadPage);
  
  currentFeedId = urlParams.get('feedId');
  initializeAuth();
  
  window.addEventListener("resize", renderUnreadList);
});