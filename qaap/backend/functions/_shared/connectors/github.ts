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

async function listAccessibleRepos(
  headers: Record<string, string>,
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=${PER_PAGE}&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      { headers },
    );
    if (!res.ok) break;

    const data = await res.json();
    if (data.length === 0) break;

    for (const r of data) {
      repos.push({
        fullName: r.full_name,
        description: r.description,
        private: r.private,
        language: r.language,
        updatedAt: r.updated_at,
      });
    }

    if (data.length < PER_PAGE) break;
  }

  return repos;
}
