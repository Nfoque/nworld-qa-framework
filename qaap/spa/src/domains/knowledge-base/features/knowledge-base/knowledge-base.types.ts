export interface GitHubRepoResource {
  fullName: string;
  description: string | null;
  private: boolean;
  language: string | null;
  updatedAt: string;
}
