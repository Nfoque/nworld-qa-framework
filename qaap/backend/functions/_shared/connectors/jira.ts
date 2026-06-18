import { validateUpstreamUrl } from "../url-safety.ts";

export interface JiraProject {
  key: string;
  name: string;
  avatarUrl: string | null;
  projectTypeKey: string;
}

export interface JiraValidationResult {
  valid: boolean;
  displayName?: string;
  email?: string;
  projects: JiraProject[];
  error?: string;
}

const JIRA_HOST_SUFFIXES = [".atlassian.net"];

function jiraHeaders(email: string, apiToken: string): Record<string, string> {
  return {
    Authorization: `Basic ${btoa(`${email}:${apiToken}`)}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function validateJiraCredentials(
  baseUrl: string,
  email: string,
  apiToken: string,
): Promise<JiraValidationResult> {
  const safe = validateUpstreamUrl(baseUrl, {
    allowedHostSuffixes: JIRA_HOST_SUFFIXES,
  });
  if (!safe.ok) {
    return { valid: false, projects: [], error: safe.reason };
  }

  const origin = safe.url.origin;
  const headers = jiraHeaders(email, apiToken);

  try {
    const userRes = await fetch(`${origin}/rest/api/3/myself`, { headers });
    if (!userRes.ok) {
      return {
        valid: false,
        projects: [],
        error: "Invalid credentials — check your email and API token.",
      };
    }
    const userData = await userRes.json();

    const projects = await listProjects(origin, headers);

    return {
      valid: true,
      displayName: userData.displayName ?? userData.emailAddress,
      email: userData.emailAddress,
      projects,
    };
  } catch {
    return { valid: false, projects: [] };
  }
}

const MAX_PROJECTS = 200;

async function listProjects(
  origin: string,
  headers: Record<string, string>,
): Promise<JiraProject[]> {
  const projects: JiraProject[] = [];
  let startAt = 0;
  const maxResults = 50;

  while (projects.length < MAX_PROJECTS) {
    const res = await fetch(
      `${origin}/rest/api/3/project/search?startAt=${startAt}&maxResults=${maxResults}&orderBy=name`,
      { headers },
    );
    if (!res.ok) break;

    const data = await res.json();
    const values = data.values ?? [];
    if (values.length === 0) break;

    for (const p of values) {
      projects.push({
        key: p.key as string,
        name: p.name as string,
        avatarUrl: (p.avatarUrls?.["24x24"] as string) ?? null,
        projectTypeKey: (p.projectTypeKey as string) ?? "software",
      });
    }

    if (data.isLast || values.length < maxResults) break;
    startAt += maxResults;
  }

  return projects;
}
