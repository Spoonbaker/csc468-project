// Ensure the script runs only after the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("articleList")) {
        loadArticles();
    }
    if (document.getElementById("articleContent")) {
        loadArticle();
    }
    if (document.getElementById("bookmarkList")) {
        loadBookmarks();
    }
    if (document.getElementById("subscriptionList")) {
        loadSubscriptions();
    }
});

// ==========================  Homepage (index.html) ==========================

const mockArticles = [
    { id: 1, title: "AI in Healthcare", summary: "AI is transforming medicine.", date: "2025-02-26", isUnread: true, isBookmarked: false },
    { id: 2, title: "Sustainable Energy", summary: "New advances in solar power.", date: "2025-02-25", isUnread: true, isBookmarked: true }
];

// Function to clear all child elements from a container
function clearElementContent(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// Load articles on the homepage
function loadArticles() {
    const articleList = document.getElementById("articleList");
    clearElementContent(articleList);

    mockArticles.forEach(article => {
        const articleCard = document.createElement("div");
        articleCard.classList.add("article-card");

        const title = document.createElement("h2");
        title.textContent = article.title;

        const summary = document.createElement("p");
        summary.textContent = article.summary;

        const readMoreButton = document.createElement("button");
        readMoreButton.textContent = "Read More";
        readMoreButton.addEventListener("click", () => {
            window.location.href = `article-detail.html?id=${article.id}`;
        });

        articleCard.appendChild(title);
        articleCard.appendChild(summary);
        articleCard.appendChild(readMoreButton);
        articleList.appendChild(articleCard);
    });
}

// ==========================  Article Detail Page (article-detail.html) ==========================

function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get("id");

    const article = mockArticles.find(a => a.id == articleId);
    if (!article) return;

    const articleContent = document.getElementById("articleContent");

    const title = document.createElement("h1");
    title.textContent = article.title;

    const date = document.createElement("p");
    date.textContent = `Published on: ${article.date}`;

    const content = document.createElement("p");
    content.textContent = article.summary;

    articleContent.appendChild(title);
    articleContent.appendChild(date);
    articleContent.appendChild(content);
}

// ==========================  Bookmarks Page (bookmarks.html) ==========================

function loadBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    const bookmarkList = document.getElementById("bookmarkList");
    clearElementContent(bookmarkList);

    bookmarks.forEach(article => {
        const articleCard = document.createElement("div");
        articleCard.classList.add("article-card");

        const title = document.createElement("h2");
        title.textContent = article.title;

        const summary = document.createElement("p");
        summary.textContent = article.summary;

        articleCard.appendChild(title);
        articleCard.appendChild(summary);
        bookmarkList.appendChild(articleCard);
    });
}

// ==========================  Subscription Management Page (feeds.html) ==========================

function loadSubscriptions() {
    const subscriptions = JSON.parse(localStorage.getItem("subscriptions")) || [];
    const subscriptionList = document.getElementById("subscriptionList");
    clearElementContent(subscriptionList);

    subscriptions.forEach(feed => {
        const feedItem = document.createElement("div");
        feedItem.classList.add("subscription-item");

        const feedTitle = document.createElement("h3");
        feedTitle.textContent = feed.title;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            removeSubscription(feed.url);
        });

        feedItem.appendChild(feedTitle);
        feedItem.appendChild(removeButton);
        subscriptionList.appendChild(feedItem);
    });
}

function removeSubscription(url) {
    let subscriptions = JSON.parse(localStorage.getItem("subscriptions")) || [];
    subscriptions = subscriptions.filter(feed => feed.url !== url);
    localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
    loadSubscriptions();
}
