// Import styles
import "./assets/styles.css";

// Ensure the page is fully loaded before executing
document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector("#app");

  // Render the basic structure
  app.innerHTML = `
        <h1>Welcome to Aggre-Gator RSS</h1>
        <input type="text" id="searchInput" placeholder="Search articles..." />
        <div id="articleList"></div>
    `;

  // Sample RSS article list (To be replaced with API data later)
  const articles = [
    { id: 1, title: "AI Revolution in Healthcare", summary: "How AI is transforming the medical industry." },
    { id: 2, title: "Sustainable Energy Breakthrough", summary: "New technology improves solar panel efficiency." },
    { id: 3, title: "SpaceX’s Latest Mission", summary: "Exploring Mars with new spacecraft." }
  ];

  const articleList = document.getElementById("articleList");

  // Render the article list
  function renderArticles(filter = "") {
    articleList.innerHTML = articles
      .filter(article => article.title.toLowerCase().includes(filter.toLowerCase()))
      .map(article => `
                <div class="article-card">
                    <h2>${article.title}</h2>
                    <p>${article.summary}</p>
                    <button onclick="window.location.href='article-detail.html?id=${article.id}'">Read More</button>
                </div>
            `).join("");
  }

  // Initial rendering
  renderArticles();

  // Search functionality
  document.getElementById("searchInput").addEventListener("input", (e) => {
    renderArticles(e.target.value);
  });
});
