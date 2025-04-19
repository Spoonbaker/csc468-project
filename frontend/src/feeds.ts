import { mockFeeds } from "./data/mock-data.ts";
import { createElement } from "./utils/dom-utils.ts";

// Feed variables
let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1;
let currentDeleteFeedId: number | null = null;

function showLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator") as HTMLElement;
  loadingIndicator.style.display = "flex";
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
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!feedList) return console.error("❌ feedList not found");

    const filteredFeeds = mockFeeds.filter((feed) =>
      feed.name.toLowerCase().includes(query.toLowerCase()),
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

    // Render matching feeds
    currentFeeds.forEach((feed) => {
      const feedContainer = createElement(
        "div",
        "p-4 hover:bg-gray-50 border-b flex justify-between items-center",
      );

      const contentContainer = createElement("div", "flex items-center gap-3");

      const icon = createElement("img", "w-8 h-8 rounded-full bg-gray-100");
      icon.src = feed.favicon;
      icon.alt = "";

      const detailsContainer = document.createElement("div");
      const nameHeading = createElement("h3", "font-medium text-gray-900", feed.name);
      const urlPara = createElement("p", "text-sm text-gray-500", feed.url);
      const statsContainer = createElement("div", "flex items-center gap-4 mt-2");
      const categorySpan = createElement(
        "span",
        "text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600",
        feed.category,
      );
      const articleCountSpan = createElement(
        "span",
        "text-xs text-gray-500",
        `${feed.articleCount} articles`,
      );
      const unreadCountSpan = createElement(
        "span",
        "text-xs text-gray-500",
        `${feed.unreadCount} unread`,
      );

      statsContainer.appendChild(categorySpan);
      statsContainer.appendChild(articleCountSpan);
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
    feedCount.textContent = `${mockFeeds.length} feeds`;

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

function showDeleteFeedModal(id: number | null) {
  console.log("🗑 Showing delete modal for feed id:", id);
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
  const name = feedName.value.trim();
  const category = feedCategory.value;

  if (!url || !/^https?:\/\//.test(url)) {
    showToast("Please enter a valid feed URL (e.g., https://example.com)");
    return;
  }

  showLoading();

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newFeed = {
      id: mockFeeds.length + 1,
      name: name || new URL(url).hostname,
      url: url,
      category: category || "other",
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
      articleCount: 0,
      unreadCount: 0,
      lastUpdated: new Date().toISOString(),
    };

    mockFeeds.push(newFeed);

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const index = mockFeeds.findIndex((feed) => feed.id === currentDeleteFeedId);

    if (index !== -1) {
      mockFeeds.splice(index, 1);
      showToast("Feed deleted successfully");
      renderFeeds();
    }
  } catch (error) {
    console.error("Delete feed failed:", error);
    showToast("Failed to delete feed. Please try again.");
  } finally {
    hideLoading();
    closeDeleteFeedModal();
  }
}

function showFeedArticles(id: number | null) {
  window.location.href = `index.html?feedId=${id}`;
}

function initializeApp() {
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
