import { initRouter } from "./router"
import { BackgroundParticles } from "./utils/BackgroundParticles";
import "./style.css";
import { t } from "./lang";

console.log("SPA Loaded");

function updateNavStrings() {
  const homeText = document.getElementById("homeText");
  if (homeText) homeText.innerText = t("home");
  const settingsText = document.getElementById("settingsText");
  if (settingsText) settingsText.innerText = t("settings");
}

window.addEventListener("languageChanged", updateNavStrings);

window.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    document.body.classList.add("light-mode");
  }

  updateNavStrings();
  new BackgroundParticles();
  initRouter();
});