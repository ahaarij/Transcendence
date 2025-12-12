import { initRouter } from "./router"
import { BackgroundParticles } from "./utils/BackgroundParticles";

console.log("SPA Loaded");

window.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
  }

  new BackgroundParticles();
  initRouter();
});