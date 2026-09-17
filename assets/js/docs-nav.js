const doc = document.querySelector("main.doc");

if (doc) {
  const headings = [...doc.querySelectorAll("h2, h3")];

  if (headings.length) {
    let layout = doc.parentElement.classList.contains("doc-layout")
      ? doc.parentElement
      : null;

    if (!layout) {
      layout = document.createElement("div");
      layout.className = "doc-layout";
      doc.before(layout);
      layout.append(doc);
    }

    let toc = layout.querySelector(".doc-toc");

    if (!toc) {
      toc = document.createElement("aside");
      toc.className = "doc-toc";
      toc.setAttribute("aria-label", "本页目录");

      const title = document.createElement("strong");
      title.textContent = "本页目录";

      const nav = document.createElement("nav");
      nav.className = "doc-toc-links";
      nav.setAttribute("aria-label", "跳转到本页章节");

      toc.append(title, nav);
      layout.prepend(toc);
    }

    const nav = toc.querySelector(".doc-toc-links");
    const usedIds = new Set([...document.querySelectorAll("[id]")].map(node => node.id));
    const links = [];

    headings.forEach((heading, index) => {
      if (!heading.id) {
        let id = "section-" + (index + 1);
        while (usedIds.has(id)) {
          id += "-next";
        }
        heading.id = id;
        usedIds.add(id);
      }

      const link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent.trim();
      link.className = heading.tagName === "H3" ? "toc-h3" : "toc-h2";
      link.addEventListener("click", () => {
        for (let parent = heading.parentElement; parent && parent !== doc; parent = parent.parentElement) {
          if (parent.tagName === "DETAILS") {
            parent.open = true;
          }
        }
        setActive(index);
      });

      nav.append(link);
      links.push(link);
    });

    function setActive(active) {
      links.forEach((link, index) => link.classList.toggle("is-on", index === active));
    }

    function updateActive() {
      let active = 0;
      headings.forEach((heading, index) => {
        if (heading.getClientRects().length && heading.getBoundingClientRect().top <= 170) {
          active = index;
        }
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        const lastVisible = headings.findLastIndex(heading => heading.getClientRects().length);
        active = Math.max(0, lastVisible);
      }
      setActive(active);
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("hashchange", () => {
      const active = links.findIndex(link => link.hash === window.location.hash);
      if (active >= 0) {
        setActive(active);
      }
    });
    updateActive();

    const initial = links.findIndex(link => link.hash === window.location.hash);
    if (initial >= 0) {
      links[initial].click();
    }
  }
}
