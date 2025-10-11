const GITHUB_API = "https://api.github.com";

/**
 * A generic helper for making authenticated requests to the GitHub API.
 * It expects a path relative to the repository's contents, e.g., "content/settings/general.json".
 */
export async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    throw new Error("Missing GitHub configuration in environment variables.");
  }

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API Error (${res.status}): ${text}`);
  }

  // Handle successful but empty responses (like from a DELETE request)
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null as T;
  }
  return res.json() as Promise<T>;
}
