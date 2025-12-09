import { initRouter } from "./router"

console.log("SPA Loaded");

window.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
  }

  initRouter();
});