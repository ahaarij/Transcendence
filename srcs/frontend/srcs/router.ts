import { HomePage, mountHomePage } from "./pages/home.js";
import { LoginPage, mountLoginPage } from "./pages/login.js";
import { RegisterPage, mountRegisterPage } from "./pages/register.js";
import { LockPage, mountLockPage } from "./pages/lock.js";
import { loadLanguage, currentLang } from "./lang.js";
import { SettingsPage, mountSettingsPage } from "./pages/settings.js";

type Route = {
  render: () => string;
  mount?: () => void;
};

const routes: Record<string, Route> =
{
	"/": { render: LockPage, mount: mountLockPage },
	"/home": { render: HomePage, mount: mountHomePage },
	"/login": { render: LoginPage, mount: mountLoginPage },
	"/register": { render: RegisterPage, mount: mountRegisterPage },
	"/lock": { render: LockPage, mount: mountLockPage },
	"/settings": { render: SettingsPage, mount: mountSettingsPage },
};

export function loadRoute()
{	
	let path = window.location.pathname;
	const app = document.getElementById("app");

	const hideButtonsOn = ["/lock", "/login", "/register", "/"];


	let isLoggedIn = 
	localStorage.getItem("isLoggedIn") === "true" ||
	sessionStorage.getItem("isLoggedIn") === "true";

	const protectedRoutes = ["/home", "/play", "/account", "/stats", "/friends"];

	if (!isLoggedIn && protectedRoutes.includes(path))
	{
		history.replaceState({}, "", "/");
		path = "/";
	}

	if (path === "/index.html") path = "/";

	if (path.endsWith("/") && path !== "/") path = path.slice(0, -1);

	const route = routes[path];

	if (!route)
	{
		app!.innerHTML = `<h1 class="p-6 text-2xl font-bold">404 — Page Not Found</h1>`;
		return;
	}

	const homeBtn = document.getElementById("homeBtn");
	const settingsBtn = document.getElementById("settingsBtn");

	if (hideButtonsOn.includes(path))
	{
		if (homeBtn) homeBtn.style.display = "none";
		if (settingsBtn) settingsBtn.style.display = "none";
	} 
	else 
	{
		if (homeBtn) homeBtn.style.display = "block";
		if (settingsBtn) settingsBtn.style.display = "block";
	}

	app!.style.opacity = "0";
	setTimeout(() => {
	app!.innerHTML = route.render();
	if (route.mount) route.mount();
		app!.style.opacity = "1";
	}, 150);
}

export function navigate(path: string)
{
	history.pushState({}, "", path);
	loadRoute();
}

export function initRouter()
{
	document.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;

		if (target.matches("[data-link]")) 
		{
			e.preventDefault();
			const href = target.getAttribute("href");
			if (href) navigate(href);
		}
	});
	const langBtn = document.getElementById("langSwitch");
	if (langBtn) 
	{
		langBtn.addEventListener("click", async () => {
	  	const next =
			currentLang === "en" ? "fr" :
			currentLang === "fr" ? "ar" : "en";

	  	await loadLanguage(next);

		const icon = document.getElementById("langIcon");
		const label = document.getElementById("langLabel");

		if (currentLang === "en")
		{
			icon!.textContent = "🇬🇧"; label!.textContent = "EN";
	  	}
	  	else if (currentLang === "fr")
		{
			icon!.textContent = "🇫🇷"; label!.textContent = "FR";
	  	}
		else
		{
			icon!.textContent = "🇦🇪"; label!.textContent = "AR";
		}
		window.dispatchEvent(new Event("languageChanged"));
	});
  }

	document.getElementById("homeBtn")?.addEventListener("click", () => {
	navigate("/home");
	});

	document.getElementById("settingsBtn")?.addEventListener("click", () => {
	navigate("/settings");
	});
	
 	window.addEventListener("languageChanged", loadRoute);		
	window.addEventListener("popstate", loadRoute);	

	loadRoute();
}