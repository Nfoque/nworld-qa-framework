export interface GitHubTestResult {
  tokenValid: boolean;
  user?: string;
  repos: GitHubRepoResult[];
}

export interface GitHubRepoResult {
  name: string;
  accessible: boolean;
  description?: string | null;
  error?: string;
}

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function testGitHub(
  token: string,
  config: { owner: string; repositories: string[] },
): Promise<GitHubTestResult> {
  const headers = ghHeaders(token);

  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) {
    return { tokenValid: false, repos: [] };
  }
  const userData = await userRes.json();

  const repoNames = config.repositories.length > 0
    ? config.repositories
    : await listOwnerRepos(headers, config.owner);

  const repos = await Promise.all(
    repoNames.map(async (name): Promise<GitHubRepoResult> => {
      const res = await fetch(
        `https://api.github.com/repos/${config.owner}/${name}`,
        { headers },
      );
      if (res.ok) {
        const repoData = await res.json();
        return { name, accessible: true, description: repoData.description };
      }
      const body = await res.json().catch(() => ({}));
      return {
        name,
        accessible: false,
        error: body.message ?? `HTTP ${res.status}`,
      };
    }),
  );

  return { tokenValid: true, user: userData.login, repos };
}

async function listOwnerRepos(
  headers: Record<string, string>,
  owner: string,
): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/users/${owner}/repos?per_page=5&sort=updated`,
    { headers },
  );
  if (!res.ok) return [];
  const repos = await res.json();
  return repos.map((r: { name: string }) => r.name);
}
