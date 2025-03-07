// @ts-nocheck
// I simply extracted this from the body of the page it was on. You will need to
// combine related functionality into modules, and fix the Typescript errors.

// Mock feeds data
const mockFeeds = [
  {
    id: 1,
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "technology",
    favicon:
      "https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32",
    articleCount: 156,
    unreadCount: 23,
    lastUpdated: "2025-02-26T14:30:00Z",
  },
  {
    id: 2,
    name: "NASA Science",
    url: "https://science.nasa.gov/feed/",
    category: "science",
    favicon: "https://science.nasa.gov/wp-content/themes/science-2020/assets/img/favicon-32x32.png",
    articleCount: 87,
    unreadCount: 12,
    lastUpdated: "2025-02-25T10:15:00Z",
  },
  {
    id: 3,
    name: "Harvard Business Review",
    url: "https://hbr.org/feed",
    category: "business",
    favicon: "https://hbr.org/resources/images/favicon.ico",
    articleCount: 203,
    unreadCount: 45,
    lastUpdated: "2025-02-26T08:45:00Z",
  },
  {
    id: 4,
    name: "Medical News Today",
    url: "https://www.medicalnewstoday.com/feed",
    category: "health",
    favicon: "https://www.medicalnewstoday.com/favicon-32x32.png",
    articleCount: 134,
    unreadCount: 18,
    lastUpdated: "2025-02-24T16:20:00Z",
  },
  {
    id: 5,
    name: "ESPN",
    url: "https://www.espn.com/espn/rss/news",
    category: "sports",
    favicon: "https://a.espncdn.com/favicon.ico",
    articleCount: 178,
    unreadCount: 31,
    lastUpdated: "2025-02-26T12:10:00Z",
  },
];

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

// Render feeds list
async function renderFeeds() {
  showLoading();

  try {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const feedList = document.getElementById("feedList");
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFeeds = mockFeeds.slice(startIndex, endIndex);

    if (currentFeeds.length === 0) {
      feedList.innerHTML = `
      <div class="p-6 text-center">
        <i class="ri-rss-line text-4xl text-gray-400 mb-2"></i>
        <p class="text-gray-500">No feeds available</p>
      </div>
    `;
    } else {
      feedList.innerHTML = currentFeeds
        .map(
          (feed) => `
      <div class="p-4 hover:bg-gray-50">
        <div class="p-4 flex justify-between items-start">
          <div class="flex items-center gap-3">
            <img src="${feed.favicon}" alt="" class="w-8 h-8 rounded-full bg-gray-100">
            <div>
              <h3 class="font-medium text-gray-900">${feed.name}</h3>
              <p class="text-sm text-gray-500">${feed.url}</p>
              <div class="flex items-center gap-4 mt-2">
                <span class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">${feed.category}</span>
                <span class="text-xs text-gray-500">${feed.articleCount} articles</span>
                <span class="text-xs text-gray-500">${feed.unreadCount} unread</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button onclick="showFeedArticles(${feed.id})" 
              class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-100 rounded">
              <i class="ri-article-line text-xl"></i>
            </button>
            <button onclick="showDeleteFeedModal(${feed.id})" 
              class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded">
              <i class="ri-delete-bin-line text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    `,
        )
        .join("");
    }

    // Update feed count
    document.getElementById("feedCount").textContent = `${mockFeeds.length} feeds`;

    // Update pagination
    updatePagination();

    // Update statistics
    updateStatistics();
  } catch (error) {
    console.error("Render feeds failed:", error);
    const feedList = document.getElementById("feedList");
    feedList.innerHTML = `
    <div class="p-6 text-center text-red-500">
      <i class="ri-error-warning-line text-4xl mb-2"></i>
      <p>Failed to load feeds. Please try again later.</p>
    </div>
  `;
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

// Close delete feed modal
function closeDeleteFeedModal() {
  document.getElementById("deleteFeedModal").style.display = "none";
  currentDeleteFeedId = null;
}

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
  // In a real app, this would navigate to a feed-specific page
  // For now, we'll just show a toast
  const feed = mockFeeds.find((feed) => feed.id === id);
  if (feed) {
    showToast(`Viewing articles from ${feed.name}`);
  }
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

// Initialize
renderFeeds();
