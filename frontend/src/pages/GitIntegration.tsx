import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RepositoryAnalysis } from '@/components/github/RepositoryAnalysis';
import { AIAssist } from '@/components/github/AIAssist';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GitIntegration() {
  const { sendRequest, loading: httpLoading, httpError } = HttpHook();
  const [projects, setProjects] = useState([]);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [view, setView] = useState<'main' | 'analyze' | 'assist'>('main');
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await sendRequest({
        method: 'get',
        url: `${BACKEND_URL}/project/repos/`,
      });
      if (data) setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchRepos = async () => {
    try {
      const data = await sendRequest({
        method: 'get',
        url: `${BACKEND_URL}/github/repos/`,
      });
      if (data) setRepos(data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const connectRepo = async (projectId: number, githubUrl: string) => {
    setLoading(true);
    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/project/${projectId}/link-repo/`,
        body: { github_url: githubUrl }, // Send the GitHub URL
      });

      if (response) {
        alert('Repository connected successfully!');
        fetchProjects(); // Refresh projects
      }
    } catch (error) {
      console.error('Error connecting repository:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchRepos();
  }, []);

  if (view === 'analyze') {
    return <RepositoryAnalysis onBack={() => setView('main')} />;
  }

  if (view === 'assist') {
    return <AIAssist onBack={() => setView('main')} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Git Integration</h1>
      <div className="space-y-8">
        {projects.map((project) => (
          <div key={project.id} className="p-4 border border-border rounded-md bg-card text-card-foreground">
            <h3 className="text-lg font-bold">{project.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            {project.repo_url ? (
              <p className="text-sm text-green-500">Connected to: {project.repo_url}</p>
            ) : (
              <div className="space-y-4">
                <Select
                  value={selectedRepo || ''}
                  onValueChange={(value) => setSelectedRepo(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repos.map((repo) => (
                      <SelectItem key={repo.url} value={repo.url}>
                        {repo.name} ({repo.url})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => connectRepo(project.id, selectedRepo!)}
                  disabled={!selectedRepo || loading || httpLoading}
                >
                  {loading || httpLoading ? 'Connecting...' : 'Connect Repository'}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 flex space-x-4">
        <Button variant="secondary" onClick={() => setView('analyze')}>
          Analyze Repository
        </Button>
        <Button variant="default" onClick={() => setView('assist')}>
          AI Assist
        </Button>
      </div>
    </div>
  );
}