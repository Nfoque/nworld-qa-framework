export interface GitHubRepo {
  fullName: string;
  description: string | null;
  private: boolean;
  language: string | null;
  updatedAt: string;
}

export interface GitHubValidationResult {
  tokenValid: boolean;
  user?: string;
  avatarUrl?: string;
  repos: GitHubRepo[];
}

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function validateGitHubToken(
  token: string,
): Promise<GitHubValidationResult> {
  const headers = ghHeaders(token);

  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) {
    return { tokenValid: false, repos: [] };
  }
  const userData = await userRes.json();

  const repos = await listAccessibleRepos(headers);

  return {
    tokenValid: true,
    user: userData.login,
    avatarUrl: userData.avatar_url,
    repos,
  };
}

const MAX_PAGES = 5;
const PER_PAGE = 100;

function toGitHubRepo(r: Record<string, unknown>): GitHubRepo {
  return {
    fullName: r.full_name as string,
    description: (r.description as string) ?? null,
    private: r.private as boolean,
    language: (r.language as string) ?? null,
    updatedAt: r.updated_at as string,
  };
}

async function fetchPaginated(
  url: string,
  headers: Record<string, string>,
  maxPages = MAX_PAGES,
): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const sep = url.includes("?") ? "&" : "?";
    const res = await fetch(
      `${url}${sep}per_page=${PER_PAGE}&page=${page}`,
      { headers },
    );
    if (!res.ok) break;
    const data = await res.json();
    if (data.length === 0) break;
    items.push(...data);
    if (data.length < PER_PAGE) break;
  }
  return items;
}

async function listAccessibleRepos(
  headers: Record<string, string>,
): Promise<GitHubRepo[]> {
  const seen = new Set<string>();
  const repos: GitHubRepo[] = [];

  function add(r: Record<string, unknown>) {
    const name = r.full_name as string;
    if (seen.has(name)) return;
    seen.add(name);
    repos.push(toGitHubRepo(r));
  }

  const userRepos = await fetchPaginated(
    "https://api.github.com/user/repos?sort=updated&affiliation=owner,collaborator,organization_member",
    headers,
  );
  for (const r of userRepos) add(r);

  const orgs = await fetchPaginated(
    "https://api.github.com/user/orgs",
    headers,
    2,
  );
  for (const org of orgs) {
    const orgLogin = org.login as string;
    const orgRepos = await fetchPaginated(
      `https://api.github.com/orgs/${orgLogin}/repos?sort=updated`,
      headers,
      3,
    );
    for (const r of orgRepos) add(r);
  }

  repos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return repos;
}
