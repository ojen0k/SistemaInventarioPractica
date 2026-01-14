export const TOKEN_KEY = "accessToken";
export const AUTH_EVENT_NAME = "auth-change";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

const API = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, init?: RequestInit) {
    if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definida.");

    const token = getToken();
    const headers = new Headers(init?.headers);

    if (!headers.get("Content-Type") && init?.body) {
        headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API}${path}`, {
        ...init,
        headers,
        cache: "no-store",
    });


    return res;
}
