"use client";
// Centralized fetch wrapper to attach auth token and handle 401 redirects safely.

const SIGNIN_PATH = "/signin";

let isRedirectingToSignin = false;

export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  } catch {
    // ignore storage errors
  }
}

function onSigninPage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.location.pathname === SIGNIN_PATH;
  } catch {
    return false;
  }
}

function safeRedirectToSignin() {
  if (typeof window === "undefined") return;
  if (onSigninPage()) return; // loop guard on the login page itself
  if (isRedirectingToSignin) return; // prevent multiple rapid redirects
  isRedirectingToSignin = true;
  try {
    // Hard navigation to reset app state and context
    window.location.replace(SIGNIN_PATH);
  } catch {
    // noop
  }
}

export type ApiFetchOptions = RequestInit & {
  // If true, do not auto-redirect on 401 (useful for login endpoint or public calls)
  skipAuthRedirect?: boolean;
};

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}): Promise<Response> {
  const { headers: initHeaders, skipAuthRedirect, ...rest } = init;

  // Build headers with auth token if not explicitly provided
  const headers = new Headers(initHeaders || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && rest.method && rest.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Authorization")) {
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...rest, headers });

  if (response.status === 401 && !skipAuthRedirect) {
    // Clear any persisted auth and redirect to signin (unless already there)
    clearAuthStorage();
    safeRedirectToSignin();
    // Reject to stop caller logic; attaching original response for optional inspection
    const unauthorizedError = new Error("Unauthorized");
    // Attach response for optional caller inspection via type assertion when needed
    (unauthorizedError as Error & { response?: Response }).response = response;
    throw unauthorizedError;
  }

  return response;
}
