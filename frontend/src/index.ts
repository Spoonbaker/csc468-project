// @ts-nocheck
// I simply extracted this from the body of the page it was on. You will need to
// combine related functionality into modules, and fix the Typescript errors.

import { stat } from "node:fs/promises";

let currentUnreadPage = 1;
const unreadItemsPerPage = 5;
function updateNotificationBadge() {
  const unreadCount = mockArticles.filter((article) => article.isUnread).length;
  document.querySelector(".notification-badge").textContent = unreadCount;
}
function renderUnreadList() {
  const unreadList = document.getElementById("unreadList");
  const unreadArticles = mockArticles.filter((article) => article.isUnread);
  updateNotificationBadge();
  const totalUnreadPages = Math.ceil(unreadArticles.length / unreadItemsPerPage);
  const startIndex = (currentUnreadPage - 1) * unreadItemsPerPage;
  const endIndex = startIndex + unreadItemsPerPage;
  const currentUnreadArticles = unreadArticles.slice(startIndex, endIndex);

  while (unreadList.firstChild) {
    unreadList?.removeChild(unreadList.firstChild);
  }

  currentUnreadArticles.forEach(article => {
    const unreadArticleContainer = document.createElement('div');
    unreadArticleContainer.className = 'flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer';
    unreadArticleContainer.addEventListener('click', () => {
      readArticle(article.id);
    });

    const circle = document.createElement('div');
    circle.className = 'w-2 h-2 mt-2 rounded-full bg-primary';

    const detailsContainer = document.createElement('div');

    const unreadArticleTitle = document.createElement('h4');
    unreadArticleTitle.className = 'text-sm font-medium text-gray-900';
    unreadArticleTitle.textContent = article.title;

    const unreadArticleDate = document.createElement('time');
    unreadArticleDate.className = 'text-xs text-gray-500';
    unreadArticleDate.textContent = article.date;

    detailsContainer.appendChild(unreadArticleTitle);
    detailsContainer.appendChild(unreadArticleDate);

    unreadArticleContainer.appendChild(circle);
    unreadArticleContainer.appendChild(detailsContainer);

    unreadList?.appendChild(unreadArticleContainer);
  });

  document.getElementById("unreadPageInfo").textContent =
    `${currentUnreadPage}/${totalUnreadPages}`;
  document.getElementById("unreadPrevBtn").disabled = currentUnreadPage === 1;
  document.getElementById("unreadNextBtn").disabled = currentUnreadPage === totalUnreadPages;
}
function prevUnreadPage() {
  if (currentUnreadPage > 1) {
    currentUnreadPage--;
    renderUnreadList();
  }
}
function nextUnreadPage() {
  const unreadArticles = mockArticles.filter((article) => article.isUnread);
  const totalUnreadPages = Math.ceil(unreadArticles.length / unreadItemsPerPage);
  if (currentUnreadPage < totalUnreadPages) {
    currentUnreadPage++;
    renderUnreadList();
  }
}
function readArticle(id) {
  const article = mockArticles.find((article) => article.id === id);
  if (article && article.isUnread) {
    article.isUnread = false;
    updateNotificationBadge();
    renderUnreadList();
    const searchInput = document.getElementById("searchInput");
    if (searchInput.value.trim()) {
      handleSearch(searchInput.value.toLowerCase());
    } else {
      renderArticles();
    }
  }
  window.location.href = `article-detail.html?id=${id}`;
}
const mockArticles = [
  {
    id: 1,
    title: "Breakthrough in AI Medical Diagnostics",
    summary:
      "Recent studies show AI technology achieving 95% accuracy in early cancer detection, revolutionizing medical diagnosis procedures...",
    date: "2025-02-26",
    isUnread: true,
    isBookmarked: false,
  },
  {
    id: 2,
    title: "The Future of Sustainable Urban Planning",
    summary:
      "Cities worldwide are adopting green building standards and integrating smart transportation systems for a sustainable future...",
    date: "2025-02-25",
    isUnread: true,
    isBookmarked: false,
  },
  {
    id: 3,
    title: "Quantum Computing: The Next Generation",
    summary:
      "IBM's latest quantum processor breaks the 100-qubit barrier, opening new possibilities for complex computational problems...",
    date: "2025-02-24",
    isUnread: false,
    isBookmarked: true,
  },
  {
    id: 4,
    title: "Deep Sea Discoveries: New Species Found",
    summary:
      "Scientists discover previously unknown species in the Mariana Trench, showcasing remarkable environmental adaptations...",
    date: "2025-02-23",
    isUnread: true,
    isBookmarked: false,
  },
  {
    id: 5,
    title: "Space Tourism: The Private Space Age",
    summary:
      "With SpaceX and Blue Origin advancing commercial space projects, civilian space travel becomes increasingly accessible...",
    date: "2025-02-22",
    isUnread: false,
    isBookmarked: true,
  },
  {
    id: 6,
    title: "Blockchain Revolution in Supply Chain",
    summary:
      "Major industries adopt blockchain technology for enhanced supply chain transparency and traceability...",
    date: "2025-02-21",
    isUnread: true,
    isBookmarked: false,
  },
  {
    id: 7,
    title: "5G Networks Transform IoT Landscape",
    summary:
      "The widespread deployment of 5G networks is enabling new IoT applications and transforming smart city infrastructure...",
    date: "2025-02-20",
    isUnread: true,
    isBookmarked: false,
  },
  {
    id: 8,
    title: "Advances in Renewable Energy Storage",
    summary:
      "Breakthrough in battery technology promises to solve renewable energy storage challenges and accelerate clean energy adoption...",
    date: "2025-02-19",
    isUnread: false,
    isBookmarked: true,
  },
  {
    id: 9,
    title: "The Rise of Digital Currencies",
    summary:
      "Central banks worldwide are developing digital currencies, potentially reshaping the future of global finance...",
    date: "2025-02-18",
    isUnread: true,
    isBookmarked: false,
  },
];
let currentDeleteId = null;
let currentPage = 1;
const itemsPerPage = 6;
const totalPages = Math.ceil(mockArticles.length / itemsPerPage);
function updatePaginationButtons() {
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderArticles();
    updatePaginationButtons();
  }
}
function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderArticles();
    updatePaginationButtons();
  }
}
function showLoading() {
  document.getElementById("loadingIndicator").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingIndicator").style.display = "none";
}

// Debounce function implementation
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Search handler function
const handleSearch = debounce((searchTerm) => {
  if (!searchTerm.trim()) {
    renderArticles();
    return;
  }

  const filteredArticles = mockArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm),
  );

  renderFilteredArticles(filteredArticles);
}, 300);

// Render filtered article list
function renderFilteredArticles(articles) {
  const articleList = document.getElementById("articleList");

  while (articleList.firstChild) {
    articleList.removeChild(articleList.firstChild);
  }

  if (articles.length === 0) {
    const noArticlesFoundContainer = document.createElement('div');
    noArticlesFoundContainer.className = 'col-span-full text-center py-8';

    const searchIcon = document.createElement('i');
    searchIcon.className = 'ri-search-line text-4xl text-gray-400 mb-2';

    const noArticlesFoundMessage = document.createElement('p');
    noArticlesFoundMessage.className = 'text-gray-500';
    noArticlesFoundMessage.textContent = 'No articles found';

    noArticlesFoundContainer.appendChild(searchIcon);
    noArticlesFoundContainer.appendChild(noArticlesFoundMessage);
    articleList?.appendChild(noArticlesFoundContainer);

    return;
  }

  articles.forEach(article => {
    const articleCard = document.createElement('div');
    articleCard.className = `bg-white rounded-lg shadow-sm overflow-hidden ${article.isUnread ? "ring-1 ring-primary/10" : ""}`;

    const articleContainer = document.createElement('div');
    articleContainer.className = 'p-6';

    const titleDeleteButton = document.createElement('div');
    titleDeleteButton.className = 'flex justify-between items-start mb-4';

    const title = document.createElement('h2');
    title.className = `text-lg ${article.isUnread ? "font-bold" : "font-medium"} text-gray-900`;
    title.textContent = article.title;

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'ri-delete-bin-line';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', () => {
      showDeleteModal(article.id);
    });

    titleDeleteButton.appendChild(title);
    titleDeleteButton.appendChild(deleteButton);

    // Summary
    const summary = document.createElement('p');
    summary.className = 'text-gray-600 mb-4 text-sm';
    summary.textContent = article.summary;

    // Stats 
    const statsContainer = document.createElement('div');
    statsContainer.className = 'flex items-center justify-between';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex items-center gap-3';

    const bookmarkIcon = document.createElement('i');
    bookmarkIcon.className = `ri-bookmark-${article.isBookmarked ? "fill" : "line"}`;

    const shareIcon = document.createElement('i');
    shareIcon.className = 'ri-share-line';

    const bookmarkButton = document.createElement('button');
    bookmarkButton.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary';
    bookmarkButton.appendChild(bookmarkIcon);
    bookmarkButton.addEventListener('click', () => {
      toggleBookmark(article.id);
    });

    const shareButton = document.createElement('button');
    shareButton.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary';
    shareButton.appendChild(shareIcon);
    shareButton.addEventListener('click', () => {
      shareArticle(article.id);
    });

    const date = document.createElement('time');
    date.className = 'text-sm text-gray-500';
    date.textContent = article.date;

    buttonContainer.appendChild(bookmarkButton);
    buttonContainer.appendChild(shareButton);
    statsContainer.appendChild(buttonContainer)
    statsContainer.appendChild(date);

    const readMoreContainer = document.createElement('div');
    readMoreContainer.className = 'px-6 py-4 bg-gray-50 border-t';

    const readMoreButton = document.createElement('button');
    readMoreButton.className = 'w-full py-2 bg-primary text-white !rounded-button hover:bg-secondary';
    readMoreButton.textContent = 'Read More';
    readMoreButton.addEventListener('click', () => {
      readArticle(article.id);
    });

    readMoreContainer.appendChild(readMoreButton);

    articleContainer.appendChild(titleDeleteButton);
    articleContainer.appendChild(summary);
    articleContainer.appendChild(statsContainer);
    articleCard.appendChild(articleContainer);
    articleCard.appendChild(readMoreContainer);
    articleList?.appendChild(articleCard);
  });
}

// Search input listener
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  if (searchTerm.trim() === "") {
    document.getElementById("articleList").classList.remove("searching");
  } else {
    document.getElementById("articleList").classList.add("searching");
  }
  handleSearch(searchTerm);
});

// Article list render function
async function renderArticles() {
  showLoading();

  try {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const articleList = document.getElementById("articleList");

    while (articleList.firstChild) {
      articleList.removeChild(articleList.firstChild);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentArticles = mockArticles.slice(startIndex, endIndex);

    currentArticles.forEach(article => {
      const articleCard = document.createElement('div');
      articleCard.className = `bg-white rounded-lg shadow-sm overflow-hidden ${article.isUnread ? "ring-1 ring-primary/10" : ""}`;

      const articleContainer = document.createElement('div');
      articleContainer.className = 'p-6';

      const titleDeleteButton = document.createElement('div');
      titleDeleteButton.className = 'flex justify-between items-start mb-4';

      const title = document.createElement('h2');
      title.className = `text-lg ${article.isUnread ? "font-bold" : "font-medium"} text-gray-900`;
      title.textContent = article.title;

      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'ri-delete-bin-line';

      const deleteButton = document.createElement('button');
      deleteButton.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500';
      deleteButton.appendChild(deleteIcon);
      deleteButton.addEventListener('click', () => {
        showDeleteModal(article.id);
      });

      titleDeleteButton.appendChild(title);
      titleDeleteButton.appendChild(deleteButton);

      // Summary
      const summary = document.createElement('p');
      summary.className = 'text-gray-600 mb-4 text-sm';
      summary.textContent = article.summary;

      // Stats 
      const statsContainer = document.createElement('div');
      statsContainer.className = 'flex items-center justify-between';

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex items-center gap-3';

      const bookmarkIcon = document.createElement('i');
      bookmarkIcon.className = `ri-bookmark-${article.isBookmarked ? "fill" : "line"}`;

      const shareIcon = document.createElement('i');
      shareIcon.className = 'ri-share-line';

      const bookmarkButton = document.createElement('button');
      bookmarkButton.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary';
      bookmarkButton.appendChild(bookmarkIcon);
      bookmarkButton.addEventListener('click', () => {
        toggleBookmark(article.id);
      });

      const shareButton = document.createElement('button');
      shareButton.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary';
      shareButton.appendChild(shareIcon);
      shareButton.addEventListener('click', () => {
        shareArticle(article.id);
      });

      const date = document.createElement('time');
      date.className = 'text-sm text-gray-500';
      date.textContent = article.date;

      buttonContainer.appendChild(bookmarkButton);
      buttonContainer.appendChild(shareButton);
      statsContainer.appendChild(buttonContainer)
      statsContainer.appendChild(date);

      const readMoreContainer = document.createElement('div');
      readMoreContainer.className = 'px-6 py-4 bg-gray-50 border-t';

      const readMoreButton = document.createElement('button');
      readMoreButton.className = 'w-full py-2 bg-primary text-white !rounded-button hover:bg-secondary';
      readMoreButton.textContent = 'Read More';
      readMoreButton.addEventListener('click', () => {
        readArticle(article.id);
      });

      readMoreContainer.appendChild(readMoreButton);

      articleContainer.appendChild(titleDeleteButton);
      articleContainer.appendChild(summary);
      articleContainer.appendChild(statsContainer);
      articleCard.appendChild(articleContainer);
      articleCard.appendChild(readMoreContainer);
      articleList?.appendChild(articleCard);
    });

  } catch (error) {
    console.error("Render articles failed:", error);
    const articleList = document.getElementById("articleList");

    const renderArticlesFailedContainer = document.createElement('div');
    renderArticlesFailedContainer.className = 'col-span-full text-center py-8 text-red-500';

    const errorIcon = document.createElement('i');
    errorIcon.className = 'ri-error-warning-line text-4xl mb-2';

    const message = document.createElement('p');
    message.textContent = 'Failed to load articles. Please try again later.';

    renderArticlesFailedContainer.appendChild(errorIcon);
    renderArticlesFailedContainer.appendChild(message);
    articleList?.appendChild(renderArticlesFailedContainer);
  } finally {
    hideLoading();
  }
}

function showDeleteModal(id) {
  currentDeleteId = id;
  document.getElementById("deleteModal").style.display = "flex";
}
function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
  currentDeleteId = null;
}
function showLoginModal() {
  document.getElementById("loginModal")?.classList.add("show");
}

function closeLoginModal() {
  document.getElementById("loginModal")?.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("loginButton");
  const loginModal = document.getElementById("loginModal");
  const closeButton = document.getElementById("closeLogin");

  if (!loginButton || !loginModal || !closeButton) {
    console.error("❌ One or more login modal elements not found!");
    return;
  }

  function showLoginModal() {
    console.log("✅ Showing login modal");
    loginModal.classList.remove("hidden");
    loginModal.style.display = "flex";
  }

  function closeLoginModal() {
    console.log("✅ Closing login modal");
    loginModal.classList.add("hidden");
    loginModal.style.display = "none";
  }

  loginButton.addEventListener("click", showLoginModal);
  closeButton.addEventListener("click", closeLoginModal);
  document.getElementById("cancelDelete")?.addEventListener("click", closeDeleteModal);
  document.getElementById("closeDelete")?.addEventListener("click", closeDeleteModal);
});




function confirmDelete() {
  if (currentDeleteId !== null) {
    const index = mockArticles.findIndex((article) => article.id === currentDeleteId);
    if (index !== -1) {
      mockArticles.splice(index, 1);
      renderArticles();
    }
  }
  closeDeleteModal();
}
function toggleBookmark(id) {
  const article = mockArticles.find((article) => article.id === id);
  if (article) {
    article.isBookmarked = !article.isBookmarked;
    renderArticles();
    showToast(article.isBookmarked ? "Article bookmarked" : "Bookmark removed");
  }
}
function shareArticle(id) {
  const article = mockArticles.find((article) => article.id === id);
  if (article) {
    const shareUrl = `${window.location.origin}/article/${article.id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showToast("Link copied!");
      })
      .catch(() => {
        showToast("Failed to copy link");
      });
  }
}
function showToast(message) {
  // Create toast element if it doesn't exist
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className =
      "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg transform transition-transform duration-300 translate-y-full";
    document.body.appendChild(toast);
  }

  // Show toast with message
  toast.textContent = message;
  toast.classList.remove("translate-y-full");

  // Hide toast after 2 seconds
  setTimeout(() => {
    toast.classList.add("translate-y-full");
  }, 2000);
}
renderArticles();
renderUnreadList();
updatePaginationButtons();
updateNotificationBadge();
