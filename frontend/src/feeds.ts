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

    while (feedList.firstChild) {
      feedList.removeChild(feedList.firstChild);
    }

    if (currentFeeds.length === 0) {
      const container = document.createElement('div');
      container.className = 'p-6 text-center';

      const icon = document.createElement('i');
      icon.className = 'ri-rss-line text-4xl text-gray-400 mb-2';

      const text = document.createElement('p');
      text.className = 'text-gray-500';
      text.textContent = 'No feeds available';

      container.appendChild(icon);
      container.appendChild(text);
      feedList.appendChild(container);
    } else {
      currentFeeds.forEach(feed => {
        const feedContainer = document.createElement('div');
        feedContainer.className = 'p-4 hover:bg-gray-50';

        const contentContainer = document.createElement('div');
        contentContainer.className = 'p-4 flex justify-between items-start';

        const leftContainer = document.createElement('div');
        leftContainer.className = 'flex items-center gap-3';

        const icon = document.createElement('img');
        icon.src = feed.favicon;
        icon.alt = '';
        icon.className = 'w-8 h-8 rounded-full bg-gray-100';

        const detailsContainer = document.createElement('div');

        const nameHeading = document.createElement('h3');
        nameHeading.className = 'font-medium text-gray-900';
        nameHeading.textContent = feed.name;

        const urlPara = document.createElement('p');
        urlPara.className = 'text-sm text-gray-500';
        urlPara.textContent = feed.url;

        const statsContainer = document.createElement('div');
        statsContainer.className = 'flex items-center gap-4 mt-2';

        const categorySpan = document.createElement('span');
        categorySpan.className = 'text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600';
        categorySpan.textContent = feed.category;

        const articleCountSpan = document.createElement('span');
        articleCountSpan.className = 'text-xs text-gray-500';
        articleCountSpan.textContent = `${feed.articleCount} articles`;

        const unreadCountSpan = document.createElement('span');
        unreadCountSpan.className = 'text-xs text-gray-500';
        unreadCountSpan.textContent = `${feed.unreadCount} unread`;

        statsContainer.appendChild(categorySpan);
        statsContainer.appendChild(articleCountSpan);
        statsContainer.appendChild(unreadCountSpan);

        detailsContainer.appendChild(nameHeading);
        detailsContainer.appendChild(urlPara);
        detailsContainer.appendChild(statsContainer);

        leftContainer.appendChild(icon);
        leftContainer.appendChild(detailsContainer);

        // Button Icons
        const articlesIcon = document.createElement('i');
        articlesIcon.className = 'ri-article-line text-xl';

        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'ri-delete-bin-line text-xl';

        // Buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex items-center gap-4';

        const articlesButton = document.createElement('button');
        articlesButton.className = 'w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-100 rounded';
        articlesButton.addEventListener('click', () => {
          showFeedArticles(feed.id);
        });
        articlesButton.appendChild(articlesIcon);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded';
        deleteButton.addEventListener('click', () => {
          showDeleteFeedModal(feed.id);
        });
        deleteButton.appendChild(deleteIcon);

        buttonContainer.appendChild(articlesButton);
        buttonContainer.appendChild(deleteButton);

        contentContainer.appendChild(leftContainer);
        contentContainer.appendChild(buttonContainer);
        feedContainer.appendChild(contentContainer);
        feedList.appendChild(feedContainer);
      });
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
    
    while (feedList.firstChild) {
      feedList.removeChild(feedList.firstChild);
    }

    const errorMsgContainer = document.createElement('div');
    errorMsgContainer.className = 'p-6 text-center text-red-500';

    const errorIcon = document.createElement('i');
    errorIcon.className = 'ri-error-warning-line text-4xl';

    const errorText = document.createElement('p');
    errorText.textContent = 'Failed to load feeds. Please try again later.';

    errorMsgContainer.appendChild(errorIcon);
    errorMsgContainer.appendChild(errorText);
    feedList.appendChild(errorMsgContainer);
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
