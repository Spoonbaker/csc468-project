import { ApiClient, Article } from "./utils/api";
import { createElement } from "./utils/dom-utils";

let activeArticle: Article | null = null;

function getArticleIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function showLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "flex";
    loadingIndicator.style.pointerEvents = "none";
    const innerDiv = loadingIndicator.querySelector("div") as HTMLElement;
    if (innerDiv) {
      innerDiv.style.pointerEvents = "auto";
    }
  }
}

function hideLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) loadingIndicator.style.display = "none";
}

async function loadArticle() {
  const articleId = getArticleIdFromUrl();
  if (!articleId) {
    window.location.href = "index.html";
    return;
  }

  try {
    showLoading();
    
    activeArticle = await ApiClient.getArticle(articleId);
    
    if (activeArticle.isUnread) {
      activeArticle.isUnread = false;
      await ApiClient.setArticleReadStatus(articleId, true);
    }
    
    document.title = `${activeArticle.title} - Aggre-Gator RSS`;
    const articleTitle = document.getElementById("articleTitle");
    if (articleTitle) articleTitle.textContent = activeArticle.title || '';

    if (activeArticle.feedId) {
      const feed = await ApiClient.getFeedInfo(activeArticle.feedId);
      const sourceTitle = document.getElementById("sourceTitle");
      const sourceFavicon = document.getElementById("sourceFavicon") as HTMLImageElement;

      if (sourceTitle) sourceTitle.textContent = feed.title;
      if (sourceFavicon) {
        const domain = new URL(feed.link).hostname;
        sourceFavicon.src = `https://www.google.com/s2/favicons?domain=${domain}`;
      }
    }

    const articleDate = document.getElementById("articleDate");
    if (articleDate && activeArticle.pubDate) {
      articleDate.textContent = new Date(activeArticle.pubDate).toLocaleDateString();
    }

    const articleContentElem = document.getElementById("articleContent");
    if (articleContentElem) {
      while (articleContentElem.firstChild) {
        articleContentElem.removeChild(articleContentElem.firstChild);
      }
      
      if (activeArticle.content) {
        const contentDiv = createElement("div", "prose prose-sm max-w-none");
        contentDiv.innerHTML = activeArticle.content;
        articleContentElem.appendChild(contentDiv);
      } else if (activeArticle.description) {
        const summary = createElement("p", "", activeArticle.description || "");
        articleContentElem.appendChild(summary);
      }
    }

    updateBookmarkButton();

  } catch (error) {
    console.error("Failed to load article:", error);
    showToast("Failed to load article");
  } finally {
    hideLoading();
  }
}

async function toggleBookmark() {
  if (!activeArticle) return;

  try {
    const newState = !activeArticle.isBookmarked;
    activeArticle.isBookmarked = newState;
    if (newState) {
      activeArticle.bookmarkedAt = new Date().toISOString();
    } else {
      activeArticle.bookmarkedAt = undefined;
    }
    
    updateBookmarkButton();
    showToast(newState ? "Article bookmarked" : "Bookmark removed");

    await ApiClient.setArticleBookmark(activeArticle.id, newState);
  } catch (error) {
    activeArticle.isBookmarked = !activeArticle.isBookmarked;
    activeArticle.bookmarkedAt = undefined;
    updateBookmarkButton();
    console.error("Failed to update bookmark:", error);
    showToast("Failed to update bookmark");
  }
}

function updateBookmarkButton() {
  const btn = document.getElementById("bookmarkBtn");
  if (btn) {
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = activeArticle?.isBookmarked ? "ri-bookmark-fill" : "ri-bookmark-line";
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

async function renderRelatedArticles() {
  if (!activeArticle || !activeArticle.feedId) return;

  try {
    const articleIds = await ApiClient.getFeedArticles(activeArticle.feedId);
    const relatedIds = articleIds
      .filter(id => id !== activeArticle!.id)
      .slice(0, 2);
    
    if (relatedIds.length === 0) return;

    const relatedArticles = await ApiClient.getArticlesInfo(relatedIds);
    const relatedArticlesList = document.getElementById("relatedArticles");
    
    if (!relatedArticlesList) return;

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
      const dateElem = createElement(
        "time", 
        "text-xs text-gray-500", 
        new Date(article.pubDate || "").toLocaleDateString()
      );

      contentDiv.appendChild(titleElem);
      contentDiv.appendChild(dateElem);
      articleDiv.appendChild(contentDiv);
      relatedArticlesList.appendChild(articleDiv);
    });
  } catch (error) {
    console.error("Failed to load related articles:", error);
  }
}

function readArticle(id: string) {
  window.location.href = `article-detail.html?id=${id}`;
}

async function initialize() {
  if (!ApiClient.isAuthenticated()) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("bookmarkBtn")?.addEventListener("click", toggleBookmark);
  document.getElementById("shareBtn")?.addEventListener("click", shareArticle);

  await loadArticle();
  await renderRelatedArticles();
}

document.addEventListener("DOMContentLoaded", initialize);

