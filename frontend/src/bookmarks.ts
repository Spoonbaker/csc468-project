// @ts-nocheck
// I simply extracted this from the body of the page it was on. You will need to
// combine related functionality into modules, and fix the Typescript errors.

// Mock bookmarked articles
const mockBookmarks = [
  {
    id: 1,
    title: "Breakthrough in AI Medical Diagnostics",
    summary:
      "Recent studies show AI technology achieving 95% accuracy in early cancer detection, revolutionizing medical diagnosis procedures...",
    date: "2025-02-26",
    source: "Medical Technology Today",
    sourceUrl: "https://medicaltechnology.com",
    bookmarkedAt: "2025-02-26T14:30:00Z",
  },
  {
    id: 4,
    title: "Quantum Computing Reaches New Milestone",
    summary:
      "Scientists have achieved quantum supremacy with a 1000-qubit processor, solving problems impossible for classical computers...",
    date: "2025-02-23",
    source: "Quantum Science Journal",
    sourceUrl: "https://quantumscience.org",
    bookmarkedAt: "2025-02-24T09:15:00Z",
  },
  {
    id: 5,
    title: "Sustainable Energy Breakthrough",
    summary:
      "New solar panel technology achieves 40% efficiency, potentially revolutionizing renewable energy adoption worldwide...",
    date: "2025-02-22",
    source: "Green Energy Report",
    sourceUrl: "https://greenenergy.com",
    bookmarkedAt: "2025-02-23T16:45:00Z",
  },
  {
    id: 8,
    title: "Advances in Renewable Energy Storage",
    summary:
      "Breakthrough in battery technology promises to solve renewable energy storage challenges and accelerate clean energy adoption...",
    date: "2025-02-19",
    source: "Clean Tech Review",
    sourceUrl: "https://cleantechreview.com",
    bookmarkedAt: "2025-02-20T11:20:00Z",
  },
  {
    id: 12,
    title: "Neural Interfaces Enable New Human-Computer Interaction",
    summary:
      "Non-invasive neural interfaces allow direct brain-to-computer communication, opening new possibilities for accessibility...",
    date: "2025-02-15",
    source: "Neural Tech Today",
    sourceUrl: "https://neuraltech.com",
    bookmarkedAt: "2025-02-18T08:30:00Z",
  },
  {
    id: 15,
    title: "Space Tourism Becomes Reality",
    summary:
      "Commercial space flights now available to civilians, marking a new era in space exploration and tourism...",
    date: "2025-02-10",
    source: "Space Frontier",
    sourceUrl: "https://spacefrontier.com",
    bookmarkedAt: "2025-02-12T19:45:00Z",
  },
];

// Pagination variables
let currentPage = 1;
const itemsPerPage = 4;
let filteredBookmarks = [...mockBookmarks];
let totalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);
let currentDeleteId = null;

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format relative time
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
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
  document.getElementById("loadingIndicator").style.display = "flex";
}

// Hide loading indicator
function hideLoading() {
  document.getElementById("loadingIndicator").style.display = "none";
}

// Article template
function getBookmarkTemplate(article) {
  return `
          <article class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="p-6">
                  <div class="flex justify-between items-start mb-4">
                      <h2 class="text-lg font-medium text-gray-900">
                          <a href="article-detail.html?id=${article.id}" class="hover:text-primary">${article.title}</a>
                      </h2>
                      <button onclick="showDeleteModal(${article.id})" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500">
                          <i class="ri-delete-bin-line"></i>
                      </button>
                  </div>
                  <p class="text-gray-600 mb-4 text-sm">${article.summary}</p>
                  <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                          <span class="text-sm text-gray-700">${article.source}</span>
                      </div>
                      <div class="flex flex-col items-end">
                          <time class="text-sm text-gray-500">${article.date}</time>
                          <span class="text-xs text-gray-400">Bookmarked ${formatRelativeTime(article.bookmarkedAt)}</span>
                      </div>
                  </div>
              </div>
              <div class="px-6 py-4 bg-gray-50 border-t">
                  <a href="article-detail.html?id=${article.id}" 
                     class="block w-full py-2 bg-primary text-white text-center !rounded-button hover:bg-secondary">
                      Read Article
                  </a>
              </div>
          </article>
      `;
}

// Render bookmarks
async function renderBookmarks() {
  showLoading();

  try {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const bookmarksList = document.getElementById("bookmarksList");
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookmarks = filteredBookmarks.slice(startIndex, endIndex);

    if (currentBookmarks.length === 0) {
      bookmarksList.innerHTML = `
                  <div class="col-span-full text-center py-8">
                      <i class="ri-bookmark-line text-4xl text-gray-400 mb-2"></i>
                      <p class="text-gray-500">No bookmarked articles found</p>
                  </div>
              `;
    } else {
      bookmarksList.innerHTML = currentBookmarks.map(getBookmarkTemplate).join("");
    }

    // Update pagination
    updatePagination();
  } catch (error) {
    console.error("Render bookmarks failed:", error);
    const bookmarksList = document.getElementById("bookmarksList");
    bookmarksList.innerHTML = `
              <div class="col-span-full text-center py-8 text-red-500">
                  <i class="ri-error-warning-line text-4xl mb-2"></i>
                  <p>Failed to load bookmarks. Please try again later.</p>
              </div>
          `;
  } finally {
    hideLoading();
  }
}

// Update pagination
function updatePagination() {
  totalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages || totalPages === 0;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
}

// Previous page
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderBookmarks();
  }
}

// Next page
function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderBookmarks();
  }
}

// Search bookmarks
function handleSearch(searchTerm) {
  if (searchTerm.trim() === "") {
    filteredBookmarks = [...mockBookmarks];
  } else {
    filteredBookmarks = mockBookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(searchTerm) ||
        bookmark.source.toLowerCase().includes(searchTerm) ||
        bookmark.summary.toLowerCase().includes(searchTerm),
    );
  }
  currentPage = 1;
  renderBookmarks();
}

// Show delete modal
function showDeleteModal(id) {
  currentDeleteId = id;
  document.getElementById("deleteModal").style.display = "flex";
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
  currentDeleteId = null;
}

// Confirm delete
function confirmDelete() {
  if (currentDeleteId !== null) {
    const index = mockBookmarks.findIndex((bookmark) => bookmark.id === currentDeleteId);
    if (index !== -1) {
      mockBookmarks.splice(index, 1);
      filteredBookmarks = [...mockBookmarks];
      showToast("Bookmark removed");
      renderBookmarks();
    }
  }
  closeDeleteModal();
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("translate-y-full");

  setTimeout(() => {
    toast.classList.add("translate-y-full");
  }, 2000);
}

// Sort bookmarks
function sortBookmarks(order) {
  switch (order) {
    case "newest":
      filteredBookmarks.sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt));
      break;
    case "oldest":
      filteredBookmarks.sort((a, b) => new Date(a.bookmarkedAt) - new Date(b.bookmarkedAt));
      break;
    case "title":
      filteredBookmarks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "source":
      filteredBookmarks.sort((a, b) => a.source.localeCompare(b.source));
      break;
    default:
      filteredBookmarks.sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt));
  }
  currentPage = 1;
  renderBookmarks();
}

// Event listeners
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  if (searchTerm.trim() === "") {
    document.getElementById("bookmarksList").classList.remove("searching");
  } else {
    document.getElementById("bookmarksList").classList.add("searching");
  }
  handleSearch(searchTerm);
});

document.getElementById("sortOrder").addEventListener("change", (e) => {
  sortBookmarks(e.target.value);
});

// Initialize
renderBookmarks();
