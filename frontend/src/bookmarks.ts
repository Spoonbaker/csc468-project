// @ts-nocheck
// Need to use proper type assertions or checks for all DOM queries before
// removing @ts-nocheck
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
    id: 3,
    title: "Quantum Computing: The Next Generation",
    summary:
      "IBM's latest quantum processor breaks the 100-qubit barrier, opening new possibilities for complex computational problems...",
    date: "2025-02-24",
    source: "Quantum Science Journal",
    sourceUrl: "https://quantumscience.org",
    bookmarkedAt: "2025-02-24T09:15:00Z",
  },
  {
    id: 5,
    title: "Space Tourism: The Private Space Age",
    summary:
      "With SpaceX and Blue Origin advancing commercial space projects, civilian space travel becomes increasingly accessible...",
    date: "2025-02-22",
    source: "NASA Science",
    sourceUrl: "https://science.nasa.gov",
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
    id: 9,
    title: "The Rise of Digital Currencies",
    summary:
      "Central banks worldwide are developing digital currencies, potentially reshaping the future of global finance...",
    date: "2025-02-18",
    source: "Neural Tech Today",
    sourceUrl: "https://neuraltech.com",
    bookmarkedAt: "2025-02-18T08:30:00Z",
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
      const noBookmarksContainer = document.createElement('div') /*as HTMLDivElement*/;
      noBookmarksContainer.className = 'col-span-full text-center py-8';

      const noBookmarksIcon = document.createElement('i') /*as HTMLElement*/;
      noBookmarksIcon.className = 'ri-bookmark-line text-4xl text-gray-400 mb-2';

      const noBookmarksText = document.createElement('p') /*as HTMLParagraphElement*/;
      noBookmarksText.className = 'text-gray-500';
      noBookmarksText.textContent = "No bookmarked articles";

      noBookmarksContainer.appendChild(noBookmarksIcon);
      noBookmarksContainer.appendChild(noBookmarksText);
      bookmarksList?.appendChild(noBookmarksContainer);


    } else {
      currentBookmarks.forEach(bookmark => {
        const bookmarksContainer = document.createElement('article') /*as HTMLDivElement*/;
        bookmarksContainer.className = 'bg-white rounded-lg shadow-sm overflow-hidden';
        bookmarksContainer.dataset.articleId = bookmark.id.toString();

        const contentContainer = document.createElement('div') /*as HTMLDivElement*/;
        contentContainer.className = 'p-6';

        const titleContainer = document.createElement('div') /*as HTMLDivElement*/;
        titleContainer.className = 'flex justify-between items-start mb-4';

        const title = document.createElement('h2') /*as HTMLHeadingElement*/;
        title.className = 'text-lg font-medium text-gray-900';

        const titleLink = document.createElement('a')/* as HTMLAnchorElement*/;
        titleLink.href = `article-detail.html?id=${bookmark.id}`;
        titleLink.className = 'hover:text-primary';
        titleLink.textContent = bookmark.title;

        title.appendChild(titleLink);
        titleContainer.appendChild(title);

        const deleteBtnIcon = document.createElement('i') /*as HTMLElement*/;
        deleteBtnIcon.className = 'ri-delete-bin-line';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500';

        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          showDeleteModal(bookmark.id);
        });

        deleteBtn.appendChild(deleteBtnIcon);
        titleContainer.appendChild(deleteBtn);

        const articleSummary = document.createElement('p') /*as HTMLParagraphElement*/;
        articleSummary.className = 'text-gray-600 mb-4 text-sm';
        articleSummary.textContent = bookmark.summary;

        const detailsContainer = document.createElement('div') /*as HTMLDivElement*/;
        detailsContainer.className = 'flex items-center justify-between';

        const sourceContainer = document.createElement('div') /*as HTMLDivElement*/;
        sourceContainer.className = 'flex items-center gap-2';

        const articleSource = document.createElement('span') /*as HTMLSpanElement*/;
        articleSource.className = 'text-sm text-gray-700';
        articleSource.textContent = bookmark.source;

        sourceContainer.appendChild(articleSource);

        const dateContainer = document.createElement('div') /*as HTMLDivElement*/;
        dateContainer.className = 'flex flex-col items-end';

        const articleDate = document.createElement('time') /*as HTMLTimeElement*/;
        articleDate.className = 'text-sm text-gray-500'
        articleDate.textContent = bookmark.date;

        dateContainer.appendChild(articleDate);

        const bookmarkedAt = document.createElement('span')/* as HTMLSpanElement*/;
        bookmarkedAt.className = 'text-xs text-gray-400';
        bookmarkedAt.textContent = `Bookmarked ${formatRelativeTime(bookmark.bookmarkedAt)}`;

        dateContainer.appendChild(bookmarkedAt);

        detailsContainer.appendChild(sourceContainer);
        detailsContainer.appendChild(dateContainer);

        const readArticleContainer = document.createElement('div') /*as HTMLElement*/;
        readArticleContainer.className = 'px-6 py-4 bg-gray-50 border-t';

        const readArticleAnchor = document.createElement('a') /*as HTMLAnchorElement*/;
        readArticleAnchor.className = 'block w-full py-2 bg-primary text-white text-center !rounded-button hover:bg-secondary';
        readArticleAnchor.href = `article-detail.html?id=${bookmark.id}`;
        readArticleAnchor.textContent = "Read Article";

        readArticleContainer.appendChild(readArticleAnchor);

        contentContainer.appendChild(titleContainer);
        contentContainer.appendChild(articleSummary);
        contentContainer.appendChild(detailsContainer);

        bookmarksContainer.appendChild(contentContainer);
        bookmarksContainer.appendChild(readArticleContainer);
        bookmarksList?.appendChild(bookmarksContainer);
      });
    }

    // Update pagination
    updatePagination();
  } catch (error) {
    console.error("Render bookmarks failed:", error);
    const bookmarksList = document.getElementById("bookmarksList");

    const bookmarksFailedContainer = document.createElement('div') /*as HTMLDivElement*/;
    bookmarksFailedContainer.className = 'col-span-full text-center py-8 text-red-500';

    const bookmarksFailedIcon = document.createElement('i') /*as HTMLElement*/;
    bookmarksFailedIcon.className = 'ri-error-warning-line text-4xl mb-2';

    const bookmarksFailedText = document.createElement('p') /*as HTMLParagraphElement*/;
    bookmarksFailedText.textContent = "Failed to load bookmarks. Please try again later.";

    bookmarksFailedContainer.appendChild(bookmarksFailedIcon);
    bookmarksFailedContainer.appendChild(bookmarksFailedText);
    bookmarksList?.appendChild(bookmarksFailedContainer);
  } finally {
    hideLoading();
  }
}

// Update pagination
function updatePagination() {
  totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / itemsPerPage));
  const prevButton = document.getElementById("prevPage") as HTMLButtonElement;
  const nextButton = document.getElementById("nextPage") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLElement;

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
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
  const modal = document.getElementById("deleteModal");
  modal?.classList.remove("hidden");
  modal.style.display = "flex";
}

// Close delete modal
function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  modal?.classList.add("hidden");
  modal.style.display = "none";
  currentDeleteId = null;
}


// Confirm delete
function confirmDelete() {
  if (currentDeleteId !== null) {
    // Remove the article from bookmarks
    const index = mockBookmarks.findIndex((article) => article.id === currentDeleteId);
    if (index !== -1) {
      mockBookmarks.splice(index, 1);
      filteredBookmarks = filteredBookmarks.filter((a) => a.id !== currentDeleteId);

      renderBookmarks(); // Refresh the bookmarks list
      showToast("Article removed from bookmarks");
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

// Ensure event listeners are added after DOM is fully loaded
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


// Initialize
renderBookmarks();
(window as any).prevPage = prevPage;
(window as any).nextPage = nextPage;
