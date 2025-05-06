import { RepoDetails } from './RepoDetails';

interface Repo {
  name: string;
  url: string;
  description: string | null;
}

interface RepoListProps {
  repos: Repo[];
}

export function RepoList({ repos }: RepoListProps) {
  return (
    <div className="space-y-4">
      {repos.map((repo) => (
        <RepoDetails key={repo.name} repo={repo} />
      ))}
    </div>
  );
}