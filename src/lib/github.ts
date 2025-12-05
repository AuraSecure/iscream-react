const GITHUB_API = "https://api.github.com";

export class GitHubAPIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * A generic helper for making authenticated requests to the GitHub API.
 * It expects a path relative to the repository's contents, e.g., "content/settings/general.json".
 */
export async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  console.log("gh function received path:", path);
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    throw new Error("Missing GitHub configuration in environment variables.");
  }

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  console.log("Fetching GitHub URL:", url);

  const finalInit: RequestInit = { ...init, cache: "no-store" };

  finalInit.headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "I-Scream-Ice-Cream-CMS",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(init?.headers || {}),
  };

  // If the body is an object (and not already a string or other valid type), stringify it.
  // This is crucial for PUT/POST requests.
  if (finalInit.body && typeof finalInit.body === "object") {
    finalInit.body = JSON.stringify(finalInit.body);
    (finalInit.headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, finalInit);

    if (!res.ok) {
      const text = await res.text();
      throw new GitHubAPIError(`GitHub API Error (${res.status}): ${text}`, res.status);
    }

    // Handle successful but empty responses (like from a DELETE request)
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return null as T;
    }
    return res.json() as Promise<T>;
  } catch (error) {
    console.error("Fetch failed in gh function:", error);
    throw error;
  }
}
