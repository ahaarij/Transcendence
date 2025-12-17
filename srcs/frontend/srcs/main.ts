import { initRouter } from "./router"
import { BackgroundParticles } from "./utils/BackgroundParticles";
import "./style.css";

console.log("SPA Loaded");

window.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    document.body.classList.add("light-mode");
  }

  new BackgroundParticles();
  initRouter();
});