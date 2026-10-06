// 修改这里即可设置课程页的访问密码。这是前端访问提示，不是真正的加密。
const coursePassword = "261007";

const gate = document.querySelector(".gate");
const passwordInput = document.querySelector("#course-password");
const error = document.querySelector(".gate-error");
const content = document.querySelector("#course-content");

gate.addEventListener("submit", event => {
  event.preventDefault();

  if (passwordInput.value !== coursePassword) {
    error.hidden = false;
    passwordInput.setAttribute("aria-invalid", "true");
    passwordInput.focus();
    passwordInput.select();
    return;
  }

  gate.remove();
  content.replaceWith(content.content.cloneNode(true));

  const heading = document.querySelector(".doc-head h1");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });

  // 解锁后才生成正文目录，避免提前显示老师和课程名称。
  const nav = document.createElement("script");
  nav.src = "../../assets/js/docs-nav.js";
  document.body.append(nav);
});

passwordInput.addEventListener("input", () => {
  error.hidden = true;
  passwordInput.removeAttribute("aria-invalid");
});
