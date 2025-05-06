interface RepoDetailsProps {
  repo: {
    name: string;
    url: string;
    description: string | null;
  };
}

export function RepoDetails({ repo }: RepoDetailsProps) {
  return (
    <div className="p-4 border border-border rounded-md bg-card text-card-foreground">
      <h3 className="text-lg font-bold">
        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {repo.name}
        </a>
      </h3>
      <p className="text-sm text-muted-foreground">{repo.description || 'No description available.'}</p>
    </div>
  );
}