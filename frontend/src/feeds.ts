import { ApiClient } from "./utils/api";
import { createElement } from "./utils/dom-utils";

let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1;
let currentDeleteFeedId: string | null = null;

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

function showToast(message: string | null) {
  const toast = document.getElementById("toast") as HTMLDivElement;
  toast.textContent = message;
  toast.classList.remove("translate-y-full");

  setTimeout(() => {
    toast.classList.add("translate-y-full");
  }, 3000);
}

async function renderFeeds(query = "") {
  showLoading();
  const feedList = document.getElementById("feedList");

  try {
    if (!feedList) return console.error("❌ feedList not found");

    const feedIds = await ApiClient.getUserFeeds();
    const feeds = await ApiClient.getFeedsInfo(feedIds);
    
    const filteredFeeds = feeds.filter((feed) =>
      feed.title.toLowerCase().includes(query.toLowerCase())
    );

    totalPages = Math.max(1, Math.ceil(filteredFeeds.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFeeds = filteredFeeds.slice(startIndex, endIndex);

    while (feedList.firstChild) {
      feedList.removeChild(feedList.firstChild);
    }

    if (filteredFeeds.length === 0) {
      const noFeedsMessage = createElement("p", "text-gray-500 p-4", "No feeds found");
      feedList.appendChild(noFeedsMessage);
      return;
    }

    currentFeeds.forEach((feed) => {
      const feedContainer = createElement(
        "div",
        "p-4 hover:bg-gray-50 border-b flex justify-between items-center",
      );

      const contentContainer = createElement("div", "flex items-center gap-3");

      const icon = createElement("img", "w-8 h-8 rounded-full bg-gray-100");
      const domain = new URL(feed.link).hostname;
      icon.src = `https://www.google.com/s2/favicons?domain=${domain}`;
      icon.alt = "";

      const detailsContainer = document.createElement("div");
      const nameHeading = createElement("h3", "font-medium text-gray-900", feed.title);
      const urlPara = createElement("p", "text-sm text-gray-500", feed.link);
      const statsContainer = createElement("div", "flex items-center gap-4 mt-2");
      
      if (feed.category) {
        const categorySpan = createElement(
          "span",
          "text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600",
          feed.category
        );
        statsContainer.appendChild(categorySpan);
      }

      const unreadCountSpan = createElement(
        "span",
        "text-xs text-gray-500",
        `${feed.unreadCount || 0} unread`
      );
      statsContainer.appendChild(unreadCountSpan);

      detailsContainer.appendChild(nameHeading);
      detailsContainer.appendChild(urlPara);
      detailsContainer.appendChild(statsContainer);

      contentContainer.appendChild(icon);
      contentContainer.appendChild(detailsContainer);

      const buttonContainer = createElement("div", "flex items-center gap-3");

      const articlesButton = createElement(
        "button",
        "w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary",
      );
      const articlesIcon = createElement("i", "ri-article-line text-xl");
      articlesButton.appendChild(articlesIcon);

      articlesButton.addEventListener("click", () => {
        showFeedArticles(feed.id);
      });

      const deleteButton = createElement(
        "button",
        "w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500",
      );
      const deleteButtonIcon = createElement("i", "ri-delete-bin-line text-xl");
      deleteButton.appendChild(deleteButtonIcon);
      deleteButton.addEventListener("click", () => {
        showDeleteFeedModal(feed.id);
      });

      buttonContainer.appendChild(articlesButton);
      buttonContainer.appendChild(deleteButton);

      feedContainer.appendChild(contentContainer);
      feedContainer.appendChild(buttonContainer);
      feedList.appendChild(feedContainer);
    });

    const feedCount = document.getElementById("feedCount") as HTMLElement;
    feedCount.textContent = `${feeds.length} feeds`;

    updatePagination(totalPages);
  } catch (error) {
    console.error("❌ Failed to load feeds:", error);
    const message = createElement(
      "p",
      "text-red-500 p-4",
      "Failed to load feeds. Please try again later.",
    );
    feedList?.appendChild(message);
  } finally {
    hideLoading();
  }
}

function updatePagination(totalPages: number) {
  const prevButton = document.getElementById("prevPageBtn") as HTMLButtonElement;
  const nextButton = document.getElementById("nextPageBtn") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLElement;

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderFeeds();
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderFeeds();
  }
}

function showAddFeedModal() {
  const addFeedModal = document.getElementById("addFeedModal") as HTMLElement;
  addFeedModal.style.display = "flex";
}

function closeAddFeedModal() {
  const addFeedModal = document.getElementById("addFeedModal") as HTMLElement;
  const feedUrl = document.getElementById("feedUrl") as HTMLInputElement;
  const feedName = document.getElementById("feedName") as HTMLInputElement;
  const feedCategory = document.getElementById("feedCategory") as HTMLInputElement;

  addFeedModal.style.display = "none";
  feedUrl.value = "";
  feedName.value = "";
  feedCategory.value = "";
}

function showDeleteFeedModal(id: string) {
  currentDeleteFeedId = id;
  const deleteFeedModal = document.getElementById("deleteFeedModal") as HTMLElement;
  deleteFeedModal.style.display = "flex";
}

function closeDeleteFeedModal() {
  const modal = document.getElementById("deleteFeedModal");
  if (modal) {
    modal.style.display = "none";
  }
  currentDeleteFeedId = null;
}

async function addFeed() {
  const feedUrl = document.getElementById("feedUrl") as HTMLInputElement;
  const feedName = document.getElementById("feedName") as HTMLInputElement;
  const feedCategory = document.getElementById("feedCategory") as HTMLInputElement;

  const url = feedUrl.value.trim();

  if (!url || !/^https?:\/\//.test(url)) {
    showToast("Please enter a valid feed URL (e.g., https://example.com)");
    return;
  }

  showLoading();

  try {
    await ApiClient.addFeed(url);
    closeAddFeedModal();
    renderFeeds();
    showToast("Feed added successfully!");
  } catch (error) {
    console.error("❌ Add feed failed:", error);
    showToast("Failed to add feed. Please try again.");
  } finally {
    hideLoading();
  }
}

async function confirmDeleteFeed() {
  if (currentDeleteFeedId === null) {
    closeDeleteFeedModal();
    return;
  }

  showLoading();

  try {
    await ApiClient.deleteFeed(currentDeleteFeedId);
    showToast("Feed deleted successfully");
    renderFeeds();
  } catch (error) {
    console.error("Delete feed failed:", error);
    showToast("Failed to delete feed. Please try again.");
  } finally {
    hideLoading();
    closeDeleteFeedModal();
  }
}

function showFeedArticles(id: string) {
  window.location.href = `index.html?feedId=${id}`;
}

function initializeApp() {
  // Check authentication first
  if (!ApiClient.isAuthenticated()) {
    window.location.href = "index.html";
    return;
  }

  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const searchInput = document.getElementById("searchInput");

  prevPageBtn?.addEventListener("click", prevPage);
  nextPageBtn?.addEventListener("click", nextPage);

  searchInput?.addEventListener("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    renderFeeds(target.value.toLowerCase());
  });

  document.getElementById("addFeedBtn")?.addEventListener("click", showAddFeedModal);
  document.getElementById("closeAddFeedBtn")?.addEventListener("click", closeAddFeedModal);
  document.getElementById("confirmAddFeedBtn")?.addEventListener("click", addFeed);

  document.getElementById("closeDeleteModal")?.addEventListener("click", closeDeleteFeedModal);
  document.getElementById("cancelDelete")?.addEventListener("click", closeDeleteFeedModal);
  document.getElementById("confirmDeleteBtn")?.addEventListener("click", confirmDeleteFeed);

  renderFeeds();
}

document.addEventListener("DOMContentLoaded", initializeApp);
