// import { HomePage } from "./pages/home.js";
// import { LoginPage, mountLoginPage } from "./pages/login.js";
// import { RegisterPage } from "./pages/register.js";
// const routes: Record<string, () => string> =  {
//   "/": HomePage,
//   "/home": HomePage,
//   "/login": { render: LoginPage, mount: mountLoginPage },
//   "/register": RegisterPage,
// };
// export function loadRoute() {
//    let path = window.location.pathname;
// // handle index.html
// if (path === "/index.html") path = "/";
// // remove trailing slashes if any
// if (path.endsWith("/") && path !== "/") path = path.slice(0, -1);
//     const page = routes[path];
//     const app = document.getElementById("app");
//     if(!page)
//     {
//         app!.innerHTML = `<h1 class="p-6 text-2xl font-bold">404 — Page Not Found</h1>`;
//         return ;
//     }
//     app!.innerHTML = route.render();
//     // run mount if exists
//     if (route.mount) route.mount();
// }
// export function navigate(path: string)
// {
//     history.pushState({}, "", path);
//     loadRoute();
// }
// export function initRouter()
// {
//     document.addEventListener("click", (e) =>
//     {
//         const target = e.target as HTMLElement;
//         if (target.matches("[data-link]"))
//         {
//           e.preventDefault();
//           const href = target.getAttribute("href");
//           if (href) navigate(href);
//         }
//     });
//   window.addEventListener("popstate", loadRoute);
//   loadRoute();
// }
import { HomePage, mountHomePage } from "./pages/home.js";
import { LoginPage, mountLoginPage } from "./pages/login.js";
import { RegisterPage, mountRegisterPage } from "./pages/register.js";
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
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (target.matches("[data-link]")) {
            e.preventDefault();
            const href = target.getAttribute("href");
            if (href)
                navigate(href);
        }
    });
    window.addEventListener("popstate", loadRoute);
    loadRoute();
}
