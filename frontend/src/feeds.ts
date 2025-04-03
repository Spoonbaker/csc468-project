// @ts-nocheck
// Need to use proper type assertions or checks for all DOM queries before
// removing @ts-nocheck
// I simply extracted this from the body of the page it was on. You will need to
// combine related functionality into modules, and fix the Typescript errors.
import { mockFeeds } from './data/mock-data.ts';

// Pagination variables
let currentPage = 1;
const itemsPerPage = 5;
const totalPages = Math.ceil(mockFeeds.length / itemsPerPage);

// Current feed to delete
let currentDeleteFeedId = null;

// Show loading indicator
function showLoading() {
  document.getElementById("loadingIndicator").style.display = "flex";
}

// Hide loading indicator
function hideLoading() {
  document.getElementById("loadingIndicator").style.display = "none";
}

// Format date
function formatDate(dateString) {
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

  try {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const feedList = document.getElementById("feedList");
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
      const feedContainer = document.createElement("div");
      feedContainer.className = "p-4 hover:bg-gray-50 border-b flex justify-between items-center";

      const contentContainer = document.createElement("div");
      contentContainer.className = "flex items-center gap-3";

      const icon = document.createElement("img");
      icon.src = feed.favicon;
      icon.alt = "";
      icon.className = "w-8 h-8 rounded-full bg-gray-100";

      const detailsContainer = document.createElement("div");

      const nameHeading = document.createElement("h3");
      nameHeading.className = "font-medium text-gray-900";
      nameHeading.textContent = feed.name;

      const urlPara = document.createElement("p");
      urlPara.className = "text-sm text-gray-500";
      urlPara.textContent = feed.url;

      const statsContainer = document.createElement("div");
      statsContainer.className = "flex items-center gap-4 mt-2";

      const categorySpan = document.createElement("span");
      categorySpan.className = "text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600";
      categorySpan.textContent = feed.category;

      const articleCountSpan = document.createElement("span");
      articleCountSpan.className = "text-xs text-gray-500";
      articleCountSpan.textContent = `${feed.articleCount} articles`;

      const unreadCountSpan = document.createElement("span");
      unreadCountSpan.className = "text-xs text-gray-500";
      unreadCountSpan.textContent = `${feed.unreadCount} unread`;

      statsContainer.appendChild(categorySpan);
      statsContainer.appendChild(articleCountSpan);
      statsContainer.appendChild(unreadCountSpan);

      detailsContainer.appendChild(nameHeading);
      detailsContainer.appendChild(urlPara);
      detailsContainer.appendChild(statsContainer);

      contentContainer.appendChild(icon);
      contentContainer.appendChild(detailsContainer);

      // Buttons container
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "flex items-center gap-3";

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
    document.getElementById("feedCount").textContent = `${mockFeeds.length} feeds`;

    // Update pagination
    updatePagination();

    // Update statistics
    updateStatistics();
  } catch (error) {
    console.error("❌ Failed to load feeds:", error);
    feedList.innerHTML = `<p class="text-red-500 p-4">Failed to load feeds. Please try again later.</p>`;
  } finally {
    hideLoading();
  }
}

// Update pagination controls
function updatePagination() {
  const prevButton = document.getElementById("prevPageBtn");
  const nextButton = document.getElementById("nextPageBtn");
  const pageInfo = document.getElementById("pageInfo");

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
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
  document.getElementById("addFeedModal").style.display = "flex";
}

// Close add feed modal
function closeAddFeedModal() {
  document.getElementById("addFeedModal").style.display = "none";
  document.getElementById("feedUrl").value = "";
  document.getElementById("feedName").value = "";
  document.getElementById("feedCategory").value = "";
}

// Add new feed
async function addFeed() {
  const url = document.getElementById("feedUrl").value.trim();
  const name = document.getElementById("feedName").value.trim();
  const category = document.getElementById("feedCategory").value;

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
function showDeleteFeedModal(id) {
  currentDeleteFeedId = id;
  document.getElementById("deleteFeedModal").style.display = "flex";
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
function showFeedArticles(id) {
  window.location.href = `index.html?feedId=${id}`;
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("translate-y-full");

  setTimeout(() => {
    toast.classList.add("translate-y-full");
  }, 3000);
}

// Event listeners
document.getElementById("prevPageBtn").addEventListener("click", prevPage);
document.getElementById("nextPageBtn").addEventListener("click", nextPage);

//search feeds
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderFeeds(e.target.value.toLowerCase());
    });
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderFeeds();
});

