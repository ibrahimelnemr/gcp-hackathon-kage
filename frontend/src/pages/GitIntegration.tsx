import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';
import { Trash2 } from 'lucide-react';

export default function GitIntegration() {
  const { sendRequest } = HttpHook();
  const [projects, setProjects] = useState([]);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        body: { github_url: githubUrl },
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

  const unlinkRepo = async (projectId: number) => {
    setLoading(true);
    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/project/${projectId}/unlink-repo/`,
      });

      if (response) {
        alert('Repository unlinked successfully!');
        fetchProjects(); // Refresh projects
      }
    } catch (error) {
      console.error('Error unlinking repository:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchRepos();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Git Integration</h1>
      <div className="space-y-8">
        {projects.map((project) => (
          <div key={project.id} className="p-4 border border-border rounded-md bg-card text-card-foreground">
            <h3 className="text-lg font-bold">{project.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            {project.repo_url ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-800 text-white rounded-md p-3 border border-gray-700">
                  <span className="font-mono text-sm truncate">{project.repo_url}</span>
                  <button
                    onClick={() => unlinkRepo(project.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/projects/${project.id}/analyze`)}
                  >
                    Analyze Repository
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => navigate(`/projects/${project.id}/ai-assist`)}
                  >
                    AI Assist
                  </Button>
                </div>
              </div>
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
                  disabled={!selectedRepo || loading}
                >
                  {loading ? 'Connecting...' : 'Connect Repository'}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}