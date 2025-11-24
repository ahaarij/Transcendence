var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HomePage, mountHomePage } from "./pages/home.js";
import { LoginPage, mountLoginPage } from "./pages/login.js";
import { RegisterPage, mountRegisterPage } from "./pages/register.js";
import { loadLanguage, currentLang } from "./lang.js";
const routes = {
    "/": { render: HomePage, mount: mountHomePage },
    "/home": { render: HomePage, mount: mountHomePage },
    "/login": { render: LoginPage, mount: mountLoginPage },
    "/register": { render: RegisterPage, mount: mountRegisterPage },
};
export function loadRoute() {
    let path = window.location.pathname;
    // Handle index.html
    if (path === "/index.html")
        path = "/";
    // Remove trailing slash
    if (path.endsWith("/") && path !== "/")
        path = path.slice(0, -1);
    const route = routes[path];
    const app = document.getElementById("app");
    if (!route) {
        app.innerHTML = `<h1 class="p-6 text-2xl font-bold">404 — Page Not Found</h1>`;
        return;
    }
    // Render page
    app.innerHTML = route.render();
    // Mount script
    if (route.mount)
        route.mount();
}
export function navigate(path) {
    history.pushState({}, "", path);
    loadRoute();
}
export function initRouter() {
    var _a, _b;
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (target.matches("[data-link]")) {
            e.preventDefault();
            const href = target.getAttribute("href");
            if (href)
                navigate(href);
        }
    });
    window.addEventListener("languageChanged", loadRoute);
    (_a = document.getElementById("langSwitch")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        const next = (currentLang === "en") ? "fr" :
            (currentLang === "fr") ? "ar" : "en";
        yield loadLanguage(next);
    }));
    (_b = document.getElementById("homeBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        navigate("/home");
    });
    window.addEventListener("popstate", loadRoute);
    loadRoute();
}
