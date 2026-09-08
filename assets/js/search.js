const form = document.querySelector(".search-form");
const input = document.querySelector("#search-input");
const status = document.querySelector(".search-status");
const list = document.querySelector(".search-results");

let pages = [];

function normalize(value) {
  return value.normalize("NFKC").toLocaleLowerCase();
}

function getSnippet(content, terms) {
  const lower = content.toLocaleLowerCase();
  const positions = terms
    .map(term => lower.indexOf(term))
    .filter(position => position >= 0);
  const match = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, match - 55);
  const end = Math.min(content.length, start + 180);

  return `${start ? "…" : ""}${content.slice(start, end)}${end < content.length ? "…" : ""}`;
}

function getScore(page, terms) {
  const title = normalize(page.title);
  const content = normalize(page.content);

  if (!terms.every(term => title.includes(term) || content.includes(term))) {
    return -1;
  }

  return terms.reduce((score, term) => {
    const titleScore = title.includes(term) ? 10 : 0;
    const contentScore = content.split(term).length - 1;
    return score + titleScore + contentScore;
  }, 0);
}

function showResults() {
  const query = input.value.trim();
  list.replaceChildren();

  if (!query) {
    status.textContent = `已收录 ${pages.length} 个页面，请输入关键词。`;
    return;
  }

  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const results = pages
    .map(page => ({ page, score: getScore(page, terms) }))
    .filter(result => result.score >= 0)
    .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title, "zh-CN"));

  status.textContent = results.length
    ? `找到 ${results.length} 个相关页面。`
    : "没有找到相关内容，请尝试更短或不同的关键词。";

  for (const { page } of results) {
    const article = document.createElement("article");
    const heading = document.createElement("h2");
    const link = document.createElement("a");
    const excerpt = document.createElement("p");

    article.className = "search-result";
    link.href = page.url;
    link.textContent = page.title;
    excerpt.textContent = getSnippet(page.content, terms);

    heading.append(link);
    article.append(heading, excerpt);
    list.append(article);
  }
}

function updateAddress() {
  const url = new URL(window.location.href);
  const query = input.value.trim();

  if (query) {
    url.searchParams.set("q", query);
  } else {
    url.searchParams.delete("q");
  }

  window.history.replaceState(null, "", url);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  updateAddress();
  showResults();
});

input.addEventListener("input", () => {
  updateAddress();
  showResults();
});

const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
input.value = initialQuery;

fetch("../assets/data/search.json")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    pages = data;
    showResults();
    input.focus();
  })
  .catch(() => {
    status.textContent = "搜索索引读取失败。请通过本地服务器或已部署的网站打开本页。";
  });
