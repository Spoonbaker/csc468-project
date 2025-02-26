// 引入样式
import "./assets/styles.css";

// 确保页面加载完成后执行
document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector("#app");

  // 渲染基本结构
  app.innerHTML = `
        <h1>Welcome to Aggre-Gator RSS</h1>
        <input type="text" id="searchInput" placeholder="Search articles..." />
        <div id="articleList"></div>
    `;

  // 假设有一个 RSS 文章列表（后续可以从 API 加载）
  const articles = [
    { id: 1, title: "AI Revolution in Healthcare", summary: "How AI is transforming the medical industry." },
    { id: 2, title: "Sustainable Energy Breakthrough", summary: "New technology improves solar panel efficiency." },
    { id: 3, title: "SpaceX’s Latest Mission", summary: "Exploring Mars with new spacecraft." }
  ];

  const articleList = document.getElementById("articleList");

  // 渲染文章列表
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

  // 初次渲染
  renderArticles();

  // 搜索功能
  document.getElementById("searchInput").addEventListener("input", (e) => {
    renderArticles(e.target.value);
  });
});
