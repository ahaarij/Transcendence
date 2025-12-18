import { HomePage, mountHomePage, unmountHomePage } from "./pages/home";
import { LoginPage, mountLoginPage } from "./pages/login";
import { RegisterPage, mountRegisterPage } from "./pages/register";
import { LockPage, mountLockPage } from "./pages/lock";
import { loadLanguage, currentLang, t } from "./lang";
import { SettingsPage, mountSettingsPage, unmountSettingsPage } from "./pages/settings";
import { AccountPage, mountAccountPage } from "./pages/account";
import { PlayPage, mountPlayPage, unmountPlayPage } from "./pages/play";
import { StatsPage, mountStatsPage } from "./pages/stats";
import { ErrorPage } from "./pages/error";
import { meRequest } from "./api/auth";

type Route = {
  render: () => string;
  mount?: () => void;
  unmount?: () => void;
};

const routes: Record<string, Route> =
{
	"/": { render: LockPage, mount: mountLockPage },
	"/home": { render: HomePage, mount: mountHomePage, unmount: unmountHomePage },
	"/login": { render: LoginPage, mount: mountLoginPage },
	"/register": { render: RegisterPage, mount: mountRegisterPage },
	"/lock": { render: LockPage, mount: mountLockPage },
	"/settings": { render: SettingsPage, mount: mountSettingsPage, unmount: unmountSettingsPage },
	"/account": { render: AccountPage, mount: mountAccountPage },
	"/play": { render: PlayPage, mount: mountPlayPage, unmount: unmountPlayPage },
	"/stats": { render: StatsPage, mount: mountStatsPage },
};

let currentRoute: Route | null = null;

export async function loadRoute()
{	
	let path = window.location.pathname;
	const app = document.getElementById("app");

	const hideButtonsOn = ["/lock", "/login", "/register", "/"];


	let token = localStorage.getItem("token") || sessionStorage.getItem("token");

	let isLoggedIn = false;

	if (token) {
  	try {

    	const res = await meRequest();
    	isLoggedIn = !!res.user;
  	} 
  	catch 
	{
    	localStorage.removeItem("token");
    	sessionStorage.removeItem("token");
    	isLoggedIn = false;
  	}
}

	const protectedRoutes = ["/home", "/play", "/account", "/stats", "/settings"];

	if (!isLoggedIn && protectedRoutes.includes(path))
	{
		history.replaceState({}, "", "/");
		path = "/";
	}

	// If logged in and on lock/root page, redirect to home
	if (isLoggedIn && (path === "/" || path === "/lock"))
	{
		history.replaceState({}, "", "/home");
		path = "/home";
	}

	if (path === "/index.html") path = "/";

	if (path.endsWith("/") && path !== "/") path = path.slice(0, -1);

	const route = routes[path];

	if (!route)
	{
		app!.innerHTML = ErrorPage();
		return;
	}

    if (currentRoute && currentRoute.unmount) {
        currentRoute.unmount();
    }
    currentRoute = route;

	const navContainer = document.getElementById("nav-container");

	if (navContainer)
	{
		if (hideButtonsOn.includes(path))
		{
			navContainer.style.display = "none";
		} 
		else 
		{
			navContainer.style.display = "flex";
		}
	}

	app!.style.opacity = "0";
	setTimeout(() => {
	app!.innerHTML = route.render();
	if (route.mount) route.mount();
		app!.style.opacity = "1";
	}, 150);
}

export async function navigate(path: string)
{
	history.pushState({}, "", path);
	await loadRoute();
}

export function initRouter()
{
	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		const link = target.closest("[data-link]");

		if (link) 
		{
			e.preventDefault();
			const href = link.getAttribute("href");
			if (href) navigate(href);
		}
	});
	const langBtn = document.getElementById("langSwitch");
	if (langBtn) 
	{
		langBtn.style.display = "flex";
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
	
	window.addEventListener("languageChanged", () => {
		const icon = document.getElementById("langIcon");
		const label = document.getElementById("langLabel");
		if (!icon || !label) return;

		if (currentLang === "en") {
			icon.textContent = "🇬🇧"; label.textContent = "EN";
		} else if (currentLang === "fr") {
			icon.textContent = "🇫🇷"; label.textContent = "FR";
		} else {
			icon.textContent = "🇦🇪"; label.textContent = "AR";
		}
	});
	
 	window.addEventListener("languageChanged", loadRoute);		
	window.addEventListener("popstate", loadRoute);	

	loadRoute();
}