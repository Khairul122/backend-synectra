export interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  images: string[];
  category: string | null;
  repoUrl: string | null;
  githubRepoId: number | null;
  createdAt: string;
  updatedAt: string;
}
