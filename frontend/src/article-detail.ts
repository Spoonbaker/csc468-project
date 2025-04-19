import { mockFeeds, mockArticles } from "./data/mock-data.ts";
import { Article } from "./models/article.ts";
import { createElement } from "./utils/dom-utils.ts";

let activeArticle: Article;

function getArticleIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get("id") || "") || 1;
}

function getFeedById(feedId: number | undefined) {
  return mockFeeds.find((feed) => feed.id === feedId);
}

function loadArticle() {
  const articleId = getArticleIdFromUrl();
  const articleData = mockArticles.find((a) => a.id === articleId);
  activeArticle = articleData!;
  const articleTitle = document.getElementById("articleTitle") as HTMLElement;

  document.title = `${articleData!.title} - Aggre-Gator RSS`;
  articleTitle.textContent = articleData!.title;

  const feed = getFeedById(articleData!.feedId);
  const sourceTitle = document.getElementById("sourceTitle") as HTMLElement;
  const sourceFavicon = document.getElementById("sourceFavicon") as HTMLImageElement;

  sourceTitle.textContent = feed?.name || "Unknown Feed";
  sourceFavicon.src = feed?.favicon || "https://example.com/favicon.ico";

  const articleDate = document.getElementById("articleDate") as HTMLElement;

  articleDate.textContent = articleData!.date;

  const articleContentElem = document.getElementById("articleContent");
  if (articleContentElem) {
    while (articleContentElem.firstChild) {
      articleContentElem.removeChild(articleContentElem.firstChild);
    }
    const articleSummary = createElement("p", "", articleData!.summary);
    articleContentElem.appendChild(articleSummary);
  }
  updateBookmarkButton();
}

function toggleBookmark() {
  activeArticle!.isBookmarked = !activeArticle!.isBookmarked;
  updateBookmarkButton();
  showToast(activeArticle!.isBookmarked ? "Article bookmarked" : "Bookmark removed");
  if (activeArticle.isBookmarked) {
    activeArticle.bookmarkedAt = new Date().toISOString();
  } else {
    activeArticle.bookmarkedAt = undefined;
  }
}

function updateBookmarkButton() {
  const btn = document.getElementById("bookmarkBtn");
  if (btn) {
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = activeArticle!.isBookmarked ? "ri-bookmark-fill" : "ri-bookmark-line";
    }
  }
}

function shareArticle() {
  const shareUrl = window.location.href;
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => showToast("Link copied!"))
    .catch(() => showToast("Failed to copy link"));
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

document.getElementById("bookmarkBtn")!.addEventListener("click", toggleBookmark);
document.getElementById("shareBtn")!.addEventListener("click", shareArticle);

function renderRelatedArticles() {
  const activeArticleId = getArticleIdFromUrl();
  activeArticle = mockArticles.find((a) => a.id === activeArticleId)!;

  let relatedArticles: Article[] = [];
  if (activeArticle && activeArticle.feedId) {
    relatedArticles = mockArticles
      .filter((a) => a.feedId === activeArticle.feedId && a.id !== activeArticle.id)
      .slice(0, 2);
  }

  const relatedArticlesList = document.getElementById("relatedArticles");
  if (relatedArticlesList) {
    while (relatedArticlesList.firstChild) {
      relatedArticlesList.removeChild(relatedArticlesList.firstChild);
    }

    relatedArticles.forEach((article) => {
      const articleDiv = createElement(
        "div",
        "flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer",
      );
      articleDiv.addEventListener("click", () => readArticle(article.id));

      const contentDiv = document.createElement("div");
      const titleElem = createElement("h4", "text-sm font-medium text-gray-900", article.title);
      const dateElem = createElement("time", "text-xs text-gray-500", article.date);

      contentDiv.appendChild(titleElem);
      contentDiv.appendChild(dateElem);
      articleDiv.appendChild(contentDiv);
      relatedArticlesList.appendChild(articleDiv);
    });
  }
}

function readArticle(id: number) {
  window.location.href = `article-detail.html?id=${id}`;
}

function initialize() {
  loadArticle();
  renderRelatedArticles();
}

initialize();
