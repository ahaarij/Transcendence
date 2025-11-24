export let currentLang = "en";
let translations: Record<string, string> = {};

export async function loadLanguage(lang: string) {
  currentLang = lang;

  const response = await fetch(`/lang/${lang}.json`);
  translations = await response.json();

  // Re-render current page
  const event = new CustomEvent("languageChanged");
  window.dispatchEvent(event);
}

export function t(key: string): string {
  return translations[key] || key;
}

// load default language
loadLanguage(currentLang);