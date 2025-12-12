import { t } from "../lang";

export const BASE_URL = "http://localhost:3000";

export async function apiRequest(url: string, options: any = {}) {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const headers: any = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(BASE_URL + url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || t("unknown_error"));
  }

  return res.json();
}