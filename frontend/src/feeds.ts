import { mockFeeds } from './data/mock-data.ts';
import { createElement } from "./utils/dom-utils.ts";

// Feed variables
const addFeedModal = document.getElementById("addFeedModal") as HTMLElement;
const feedUrl = document.getElementById("feedUrl") as HTMLInputElement;
const feedName = document.getElementById("feedName") as HTMLInputElement;
const feedCategory = document.getElementById("feedCategory") as HTMLInputElement;


// Pagination variables
let currentPage = 1;
const itemsPerPage = 5;
const totalPages = Math.ceil(mockFeeds.length / itemsPerPage);

// Current feed to delete
let currentDeleteFeedId: number | null = null;

// Show loading indicator
function showLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator") as HTMLElement; 
  loadingIndicator.style.display = "flex";
}

// Hide loading indicator
function hideLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator") as HTMLElement;
  loadingIndicator.style.display = "none";
}

// Format date
function formatDate(dateString: string | number | Date) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Render feeds list (supports search functionality)
async function renderFeeds(query = "") {
  showLoading();
  const feedList = document.getElementById("feedList");

  try {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!feedList) return console.error("❌ feedList not found");

    // Filter feeds based on search query (search by name only)
    const filteredFeeds = mockFeeds.filter(feed =>
      feed.name.toLowerCase().includes(query.toLowerCase())
    );

    // Clear the feed list
    feedList.innerHTML = "";

    // Display message if no matching feeds are found
    if (filteredFeeds.length === 0) {
      feedList.innerHTML = `<p class="text-gray-500 p-4">No feeds found</p>`;
      return;
    }

    // Render matching feeds
    filteredFeeds.forEach(feed => {
      const feedContainer = createElement("div", "p-4 hover:bg-gray-50 border-b flex justify-between items-center");
  
      const contentContainer = createElement("div", "flex items-center gap-3");

      const icon = createElement("img", "w-8 h-8 rounded-full bg-gray-100");
      icon.src = feed.favicon;
      icon.alt = "";

      const detailsContainer = document.createElement("div");

      const nameHeading = createElement("h3", "font-medium text-gray-900", feed.name);

      const urlPara = createElement("p", "text-sm text-gray-500", feed.url);

      const statsContainer = createElement("div", "flex items-center gap-4 mt-2");

      const categorySpan = createElement("span", "text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600", feed.category);

      const articleCountSpan = createElement("span", "text-xs text-gray-500", `${feed.articleCount} articles`);

      const unreadCountSpan = createElement("span", "text-xs text-gray-500", `${feed.unreadCount} unread`);

      statsContainer.appendChild(categorySpan);
      statsContainer.appendChild(articleCountSpan);
      statsContainer.appendChild(unreadCountSpan);

      detailsContainer.appendChild(nameHeading);
      detailsContainer.appendChild(urlPara);
      detailsContainer.appendChild(statsContainer);

      contentContainer.appendChild(icon);
      contentContainer.appendChild(detailsContainer);

      // Buttons container
      const buttonContainer = createElement("div", "flex items-center gap-3");

      // FIX!
      // View articles button
      const articlesButton = document.createElement("button");
      articlesButton.className = "w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary";
      articlesButton.innerHTML = '<i class="ri-article-line text-xl"></i>';
      articlesButton.addEventListener("click", () => {
        showFeedArticles(feed.id);
      });

      // Delete button
      const deleteButton = document.createElement("button");
      deleteButton.className = "w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500";
      deleteButton.innerHTML = '<i class="ri-delete-bin-line text-xl"></i>';
      deleteButton.addEventListener("click", () => {
        showDeleteFeedModal(feed.id);
      });

      buttonContainer.appendChild(articlesButton);
      buttonContainer.appendChild(deleteButton);

      feedContainer.appendChild(contentContainer);
      feedContainer.appendChild(buttonContainer);
      feedList.appendChild(feedContainer);
    });

    // Update feed count
    const feedCount = document.getElementById("feedCount") as HTMLElement;
    feedCount.textContent = `${mockFeeds.length} feeds`;

    // Update pagination
    updatePagination();

    // Update statistics
    updateStatistics();
  } catch (error) {
    console.error("❌ Failed to load feeds:", error);
    const message = createElement("p", "text-red-500 p-4", "Failed to load feeds. Please try again later.");
    feedList?.appendChild(message);
  } finally {
    hideLoading();
  }
}

// Update pagination controls
function updatePagination() {
  const prevButton = document.getElementById("prevPageBtn") as HTMLButtonElement;
  const nextButton = document.getElementById("nextPageBtn") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLElement;

  prevButton!.disabled = currentPage === 1;
  nextButton!.disabled = currentPage === totalPages;
  pageInfo!.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Update statistics in right sidebar
function updateStatistics() {
  const unreadArticles = mockFeeds.reduce((sum, feed) => sum + feed.unreadCount, 0);
}

// Previous page
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderFeeds();
  }
}

// Next page
function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderFeeds();
  }
}

// Show add feed modal
function showAddFeedModal() {
  const addFeedModal = document.getElementById("addFeedModal") as HTMLElement;
  addFeedModal.style.display = "flex";
}

// Close add feed modal
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

// Add new feed
async function addFeed() {
  const url = feedUrl.value.trim();
  const name = feedName.value.trim();
  const category = feedCategory.value;

  if (!url) {
    showToast("Please enter a valid feed URL");
    return;
  }

  showLoading();

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create new feed object
    const newFeed = {
      id: mockFeeds.length + 1,
      name: name || url.replace(/^https?:\/\//, "").split("/")[0],
      url: url,
      category: category || "other",
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
      articleCount: 0,
      unreadCount: 0,
      lastUpdated: new Date().toISOString(),
    };

    // Add to mock feeds
    mockFeeds.push(newFeed);

    // Close modal
    closeAddFeedModal();

    // Show success message
    showToast("Feed added successfully");

    // Refresh feed list
    renderFeeds();
  } catch (error) {
    console.error("Add feed failed:", error);
    showToast("Failed to add feed. Please try again.");
  } finally {
    hideLoading();
  }
}

// Show delete feed modal
function showDeleteFeedModal(id : number | null) {
  currentDeleteFeedId = id;
  const deleteFeedModal = document.getElementById("deleteFeedModal") as HTMLElement;
  deleteFeedModal.style.display = "flex";
}

// Close delete feed modal (supports X button & Cancel button)
function closeDeleteFeedModal() {
  const modal = document.getElementById("deleteFeedModal");
  if (modal) {
    modal.style.display = "none";
  }
  currentDeleteFeedId = null;
}

// Attach event listeners to close buttons
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("closeDeleteModal")?.addEventListener("click", closeDeleteFeedModal);
  document.getElementById("cancelDelete")?.addEventListener("click", closeDeleteFeedModal);
});

// Confirm delete feed
async function confirmDeleteFeed() {
  if (currentDeleteFeedId === null) {
    closeDeleteFeedModal();
    return;
  }

  showLoading();

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find feed index
    const index = mockFeeds.findIndex((feed) => feed.id === currentDeleteFeedId);

    if (index !== -1) {
      // Remove feed
      mockFeeds.splice(index, 1);

      // Show success message
      showToast("Feed deleted successfully");

      // Refresh feed list
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

// Show feed articles
function showFeedArticles(id: number | null) {
  window.location.href = `index.html?feedId=${id}`;
}

// Show toast notification
function showToast(message: string | null) {
  const toast = document.getElementById("toast") as HTMLDivElement;
  toast.textContent = message;
  toast.classList.remove("translate-y-full");

  setTimeout(() => {
    toast.classList.add("translate-y-full");
  }, 3000);
}

// Event listeners
const prevPageBtn = document.getElementById("prevPageBtn") as HTMLButtonElement;
const nextPageBtn = document.getElementById("nextPageBtn") as HTMLButtonElement;
prevPageBtn.addEventListener("click", prevPage);
nextPageBtn.addEventListener("click", nextPage);

//search feeds
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      renderFeeds(target.value.toLowerCase());
    });
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderFeeds();
});