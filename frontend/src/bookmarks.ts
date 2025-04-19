import { createElement } from "./utils/dom-utils.ts";
import { mockArticles } from "./data/mock-data.ts";

// Pagination variables
let currentPage = 1;
const itemsPerPage = 4;
let filteredBookmarks = mockArticles.filter((article) => article.isBookmarked);
let totalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);
let currentDeleteId: number | null = null;

// Format date
function formatDate(dateString: string | number | Date) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format relative time
function formatRelativeTime(dateString: string | number | Date) {
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

// Show loading indicator
function showLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "flex";
  }
}

// Hide loading indicator
function hideLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }
}

// Render bookmarks
async function renderBookmarks() {
  showLoading();

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const bookmarksList = document.getElementById("bookmarksList");
    while (bookmarksList && bookmarksList.firstChild) {
      bookmarksList.removeChild(bookmarksList.firstChild);
    }
    totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookmarks = filteredBookmarks.slice(startIndex, endIndex);

    if (currentBookmarks.length === 0) {
      const noBookmarksContainer = createElement("div", "col-span-full text-center py-8");
      const noBookmarksIcon = createElement(
        "i",
        "ri-bookmark-line text-4xl text-gray-400 mb-2",
      ); /*as HTMLElement*/
      const noBookmarksText = createElement("p", "text-gray-500", "No bookmarked articles");

      noBookmarksContainer.appendChild(noBookmarksIcon);
      noBookmarksContainer.appendChild(noBookmarksText);
      bookmarksList?.appendChild(noBookmarksContainer);
    } else {
      currentBookmarks.forEach((bookmark) => {
        const bookmarksContainer = createElement(
          "article",
          "bg-white rounded-lg shadow-sm overflow-hidden",
        );
        bookmarksContainer.dataset.articleId = bookmark.id.toString();

        const contentContainer = createElement("div", "p-6");
        const titleContainer = createElement("div", "flex justify-between items-start mb-4");
        const title = createElement("h2", "text-lg font-medium text-gray-900");
        const titleLink = createElement("a", "hover:text-primary", bookmark.title);
        titleLink.href = `article-detail.html?id=${bookmark.id}`;

        title.appendChild(titleLink);
        titleContainer.appendChild(title);

        const deleteBtnIcon = createElement("i", "ri-delete-bin-line");
        const deleteBtn = createElement(
          "button",
          "delete-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500",
        );

        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          showDeleteModal(bookmark.id);
        });

        deleteBtn.appendChild(deleteBtnIcon);
        titleContainer.appendChild(deleteBtn);

        const articleSummary = createElement("p", "text-gray-600 mb-4 text-sm", bookmark.summary);
        const detailsContainer = createElement("div", "flex items-center justify-between");
        const sourceContainer = createElement("div", "flex items-center gap-2");
        const articleSource = createElement("span", "text-sm text-gray-700", bookmark.source);
        sourceContainer.appendChild(articleSource);
        const dateContainer = createElement("div", "flex flex-col items-end");
        const articleDate = createElement("time", "text-sm text-gray-500", bookmark.date);
        dateContainer.appendChild(articleDate);

        const bookmarkedAt = createElement(
          "span",
          "text-xs text-gray-400",
          `Bookmarked ${formatRelativeTime(bookmark.bookmarkedAt!)}`,
        );

        dateContainer.appendChild(bookmarkedAt);

        detailsContainer.appendChild(sourceContainer);
        detailsContainer.appendChild(dateContainer);

        const readArticleContainer = createElement("div", "px-6 py-4 bg-gray-50 border-t");
        const readArticleAnchor = createElement(
          "a",
          "block w-full py-2 bg-primary text-white text-center !rounded-button hover:bg-secondary",
          "Read Article",
        );
        readArticleAnchor.href = `article-detail.html?id=${bookmark.id}`;
        readArticleContainer.appendChild(readArticleAnchor);

        contentContainer.appendChild(titleContainer);
        contentContainer.appendChild(articleSummary);
        contentContainer.appendChild(detailsContainer);

        bookmarksContainer.appendChild(contentContainer);
        bookmarksContainer.appendChild(readArticleContainer);
        bookmarksList?.appendChild(bookmarksContainer);
      });
    }

    updatePagination();
  } catch (error) {
    console.error("Render bookmarks failed:", error);
    const bookmarksList = document.getElementById("bookmarksList");

    const bookmarksFailedContainer = createElement(
      "div",
      "col-span-full text-center py-8 text-red-500",
    );
    const bookmarksFailedIcon = createElement("i", "ri-error-warning-line text-4xl mb-2");
    const bookmarksFailedText = createElement(
      "p",
      "",
      "Failed to load bookmarks. Please try again later.",
    );
    bookmarksFailedContainer.appendChild(bookmarksFailedIcon);
    bookmarksFailedContainer.appendChild(bookmarksFailedText);
    bookmarksList?.appendChild(bookmarksFailedContainer);
  } finally {
    hideLoading();
  }
}

function updatePagination() {
  totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / itemsPerPage));
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
    renderBookmarks();
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderBookmarks();
  }
}

function handleSearch(searchTerm: string) {
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

function showDeleteModal(id: number) {
  currentDeleteId = id;
  const modal = document.getElementById("deleteModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
    currentDeleteId = null;
  }
}

function confirmDelete() {
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

function showToast(message: string | null) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.remove("translate-y-full");

    setTimeout(() => {
      toast.classList.add("translate-y-full");
    }, 2000);
  }
}

type SortOrder = "newest" | "oldest" | "title" | "source";
function sortBookmarks(order: SortOrder): void {
  switch (order) {
    case "newest":
      filteredBookmarks.sort(
        (a, b) => new Date(b.bookmarkedAt!).getTime() - new Date(a.bookmarkedAt!).getTime(),
      );
      break;
    case "oldest":
      filteredBookmarks.sort(
        (a, b) => new Date(a.bookmarkedAt!).getTime() - new Date(b.bookmarkedAt!).getTime(),
      );
      break;
    case "title":
      filteredBookmarks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "source":
      filteredBookmarks.sort((a, b) => a.source!.localeCompare(b.source!));
      break;
    default:
      filteredBookmarks.sort(
        (a, b) => new Date(b.bookmarkedAt!).getTime() - new Date(a.bookmarkedAt!).getTime(),
      );
  }
  currentPage = 1;
  renderBookmarks();
}

const searchInput = document.getElementById("searchInput") as HTMLElement;
searchInput.addEventListener("input", (e: Event) => {
  const target = e.target as HTMLInputElement;
  const searchTerm = target.value.toLowerCase();
  const bookmarksList = document.getElementById("bookmarksList") as HTMLElement;
  if (searchTerm.trim() === "") {
    bookmarksList.classList.remove("searching");
  } else {
    bookmarksList.classList.add("searching");
  }
  handleSearch(searchTerm);
});
const sortOrder = document.getElementById("sortOrder") as HTMLSelectElement;
sortOrder.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLSelectElement;
  sortBookmarks(target.value as SortOrder);
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      const articleCard = target.closest("[data-article-id]") as HTMLElement;

      if (articleCard) {
        const articleId = Number(articleCard.dataset.articleId);
        showDeleteModal(articleId);
      }
    });
  });

  document.getElementById("cancelDelete")?.addEventListener("click", closeDeleteModal);
  document.getElementById("confirmDelete")?.addEventListener("click", confirmDelete);
  document.getElementById("closeDelete")?.addEventListener("click", closeDeleteModal);

  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderBookmarks();
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderBookmarks();
    }
  });
});

renderBookmarks();
(window as any).prevPage = prevPage;
(window as any).nextPage = nextPage;
