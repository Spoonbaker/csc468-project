import { createElement } from "./utils/dom-utils.ts";
import { mockArticles } from "./data/mock-data.ts";
import { Article } from "./models/article.ts";

let currentPage = 1;
const itemsPerPage = 4;
let filteredBookmarks = mockArticles.filter((article) => article.isBookmarked);
let totalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);
let currentDeleteId: number | null = null;

function formatDate(dateString: string | number | Date): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelativeTime(dateString: string | number | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return formatDate(dateString);
  } else if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

function showLoading(): void {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "flex";
  }
}

function hideLoading(): void {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }
}

function showToast(message: string): void {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.remove("translate-y-full");

    setTimeout(() => {
      toast.classList.add("translate-y-full");
    }, 2000);
  }
}

async function renderBookmarks(): Promise<void> {
  showLoading();

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const bookmarksList = document.getElementById("bookmarksList");
    if (!bookmarksList) return;

    while (bookmarksList.firstChild) {
      bookmarksList.removeChild(bookmarksList.firstChild);
    }

    totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookmarks = filteredBookmarks.slice(startIndex, endIndex);

    if (currentBookmarks.length === 0) {
      renderEmptyState(bookmarksList);
    } else {
      renderBookmarkItems(bookmarksList, currentBookmarks);
    }

    updatePagination();
  } catch (error) {
    console.error("Render bookmarks failed:", error);
    renderErrorState();
  } finally {
    hideLoading();
  }
}

function renderEmptyState(container: HTMLElement): void {
  const noBookmarksContainer = createElement("div", "col-span-full text-center py-8");
  const noBookmarksIcon = createElement("i", "ri-bookmark-line text-4xl text-gray-400 mb-2");
  const noBookmarksText = createElement("p", "text-gray-500", "No bookmarked articles");

  noBookmarksContainer.appendChild(noBookmarksIcon);
  noBookmarksContainer.appendChild(noBookmarksText);
  container.appendChild(noBookmarksContainer);
}

function renderErrorState(): void {
  const bookmarksList = document.getElementById("bookmarksList");
  if (!bookmarksList) return;

  const errorContainer = createElement("div", "col-span-full text-center py-8 text-red-500");
  const errorIcon = createElement("i", "ri-error-warning-line text-4xl mb-2");
  const errorText = createElement("p", "", "Failed to load bookmarks. Please try again later.");

  errorContainer.appendChild(errorIcon);
  errorContainer.appendChild(errorText);
  bookmarksList.appendChild(errorContainer);
}

function renderBookmarkItems(container: HTMLElement, bookmarks: Article[]): void {
  bookmarks.forEach((bookmark) => {
    const bookmarkCard = createBookmarkCard(bookmark);
    container.appendChild(bookmarkCard);
  });
}

function createBookmarkCard(bookmark: Article): HTMLElement {
  const container = createElement("article", "bg-white rounded-lg shadow-sm overflow-hidden");
  container.dataset.articleId = bookmark.id.toString();

  const content = createElement("div", "p-6");

  const titleRow = createElement("div", "flex justify-between items-start mb-4");
  const title = createElement("h2", "text-lg font-medium text-gray-900");
  const titleLink = createElement("a", "hover:text-primary", bookmark.title);
  titleLink.href = `article-detail.html?id=${bookmark.id}`;

  title.appendChild(titleLink);
  titleRow.appendChild(title);

  const deleteBtn = createElement(
    "button",
    "delete-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500",
  );
  const deleteBtnIcon = createElement("i", "ri-delete-bin-line");

  deleteBtn.appendChild(deleteBtnIcon);
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showDeleteModal(bookmark.id);
  });

  titleRow.appendChild(deleteBtn);

  const summary = createElement("p", "text-gray-600 mb-4 text-sm", bookmark.summary);

  const detailsRow = createElement("div", "flex items-center justify-between");

  const sourceInfo = createElement("div", "flex items-center gap-2");
  const source = createElement("span", "text-sm text-gray-700", bookmark.source || "");
  sourceInfo.appendChild(source);

  const dateInfo = createElement("div", "flex flex-col items-end");
  const date = createElement("time", "text-sm text-gray-500", bookmark.date);
  const bookmarkedTime = createElement(
    "span",
    "text-xs text-gray-400",
    `Bookmarked ${formatRelativeTime(bookmark.bookmarkedAt || new Date())}`,
  );

  dateInfo.appendChild(date);
  dateInfo.appendChild(bookmarkedTime);

  detailsRow.appendChild(sourceInfo);
  detailsRow.appendChild(dateInfo);

  content.appendChild(titleRow);
  content.appendChild(summary);
  content.appendChild(detailsRow);

  const footer = createElement("div", "px-6 py-4 bg-gray-50 border-t");
  const readLink = createElement(
    "a",
    "block w-full py-2 bg-primary text-white text-center !rounded-button hover:bg-secondary",
    "Read Article",
  );
  readLink.href = `article-detail.html?id=${bookmark.id}`;

  footer.appendChild(readLink);

  container.appendChild(content);
  container.appendChild(footer);

  return container;
}

function updatePagination(): void {
  const prevButton = document.getElementById("prevPage") as HTMLButtonElement;
  const nextButton = document.getElementById("nextPage") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLElement;

  if (!prevButton || !nextButton || !pageInfo) return;

  prevButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function prevPage(): void {
  if (currentPage > 1) {
    currentPage--;
    renderBookmarks();
  }
}

function nextPage(): void {
  if (currentPage < totalPages) {
    currentPage++;
    renderBookmarks();
  }
}

function handleSearch(searchTerm: string): void {
  if (searchTerm.trim() === "") {
    filteredBookmarks = mockArticles.filter((article) => article.isBookmarked);
  } else {
    filteredBookmarks = mockArticles.filter(
      (article) =>
        article.isBookmarked &&
        (article.title.toLowerCase().includes(searchTerm) ||
          (article.source || "").toLowerCase().includes(searchTerm) ||
          article.summary.toLowerCase().includes(searchTerm)),
    );
  }
  currentPage = 1;
  renderBookmarks();
}

type SortOrder = "newest" | "oldest" | "title" | "source";

function sortBookmarks(order: SortOrder): void {
  switch (order) {
    case "newest":
      filteredBookmarks.sort(
        (a, b) => new Date(b.bookmarkedAt || 0).getTime() - new Date(a.bookmarkedAt || 0).getTime(),
      );
      break;
    case "oldest":
      filteredBookmarks.sort(
        (a, b) => new Date(a.bookmarkedAt || 0).getTime() - new Date(b.bookmarkedAt || 0).getTime(),
      );
      break;
    case "title":
      filteredBookmarks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "source":
      filteredBookmarks.sort((a, b) => (a.source || "").localeCompare(b.source || ""));
      break;
    default:
      filteredBookmarks.sort(
        (a, b) => new Date(b.bookmarkedAt || 0).getTime() - new Date(a.bookmarkedAt || 0).getTime(),
      );
  }
  currentPage = 1;
  renderBookmarks();
}

function showDeleteModal(id: number): void {
  currentDeleteId = id;
  const modal = document.getElementById("deleteModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }
}

function closeDeleteModal(): void {
  const modal = document.getElementById("deleteModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
    currentDeleteId = null;
  }
}

function confirmDelete(): void {
  if (currentDeleteId !== null) {
    const article = mockArticles.find((article) => article.id === currentDeleteId);
    if (article) {
      article.isBookmarked = false;
      filteredBookmarks = mockArticles.filter((article) => article.isBookmarked);
      renderBookmarks();
      showToast("Article removed from bookmarks");
    }
  }
  closeDeleteModal();
}

function initializeBookmarksPage(): void {
  const searchInput = document.getElementById("searchInput") as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const searchTerm = target.value.toLowerCase();
      const bookmarksList = document.getElementById("bookmarksList");

      if (bookmarksList) {
        if (searchTerm.trim() === "") {
          bookmarksList.classList.remove("searching");
        } else {
          bookmarksList.classList.add("searching");
        }
      }

      handleSearch(searchTerm);
    });
  }

  const sortOrder = document.getElementById("sortOrder") as HTMLSelectElement;
  if (sortOrder) {
    sortOrder.addEventListener("change", () => {
      sortBookmarks(sortOrder.value as SortOrder);
    });
  }

  document.getElementById("prevPage")?.addEventListener("click", prevPage);
  document.getElementById("nextPage")?.addEventListener("click", nextPage);

  document.getElementById("cancelDelete")?.addEventListener("click", closeDeleteModal);
  document.getElementById("confirmDelete")?.addEventListener("click", confirmDelete);
  document.getElementById("closeDelete")?.addEventListener("click", closeDeleteModal);

  renderBookmarks();
}

document.addEventListener("DOMContentLoaded", initializeBookmarksPage);
