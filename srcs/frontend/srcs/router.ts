import { HomePage, mountHomePage } from "./pages/home.js";
import { LoginPage, mountLoginPage } from "./pages/login.js";
import { RegisterPage, mountRegisterPage } from "./pages/register.js";
import { loadLanguage, currentLang } from "./lang.js";


type Route = {
  render: () => string;
  mount?: () => void;
};

const routes: Record<string, Route> = {
  "/": { render: HomePage, mount: mountHomePage },
  "/home": { render: HomePage, mount: mountHomePage },
  "/login": { render: LoginPage, mount: mountLoginPage },
  "/register": { render: RegisterPage, mount: mountRegisterPage },
};

export function loadRoute() {
  let path = window.location.pathname;

  // Handle index.html
  if (path === "/index.html") path = "/";

  // Remove trailing slash
  if (path.endsWith("/") && path !== "/") path = path.slice(0, -1);

  const route = routes[path];
  const app = document.getElementById("app");

  if (!route) {
    app!.innerHTML = `<h1 class="p-6 text-2xl font-bold">404 — Page Not Found</h1>`;
    return;
  }

  // Render page
  app!.innerHTML = route.render();

  // Mount script
  if (route.mount) route.mount();
}

export function navigate(path: string) {
  history.pushState({}, "", path);
  loadRoute();
}

export function initRouter() {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.matches("[data-link]")) {
      e.preventDefault();
      const href = target.getAttribute("href");
      if (href) navigate(href);
    }
  });
  window.addEventListener("languageChanged", loadRoute);

  document.getElementById("langSwitch")?.addEventListener("click", async () => {
    const next = (currentLang === "en") ? "fr" :
                 (currentLang === "fr") ? "ar" : "en";

    await loadLanguage(next);
  });

  document.getElementById("homeBtn")?.addEventListener("click", () => {
    navigate("/home");
  });
  window.addEventListener("popstate", loadRoute);

  loadRoute();
}