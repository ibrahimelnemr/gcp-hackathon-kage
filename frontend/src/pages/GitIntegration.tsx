import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';
import { Trash2, Link, Search, WandSparkles } from 'lucide-react';
import { useLoading } from '@/hooks/useLoading';
import { ToastProvider, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { motion } from 'framer-motion';

export default function GitIntegration() {
  const { sendRequest } = HttpHook();
  const { loading: pageLoading, setLoading: setPageLoading, LoadingIndicator } = useLoading();
  const [projects, setProjects] = useState([]);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setPageLoading(true);
    try {
      const data = await sendRequest({
        method: 'get',
        url: `${BACKEND_URL}/project/repos/`,
      });
      if (data) setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchRepos = async () => {
    setRepoLoading(true);
    try {
      const data = await sendRequest({
        method: 'get',
        url: `${BACKEND_URL}/github/repos/`,
      });
      if (data) setRepos(data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    } finally {
      setRepoLoading(false);
    }
  };

  const connectRepo = async (projectId: number, githubUrl: string) => {
    setPageLoading(true);
    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/project/${projectId}/link-repo/`,
        body: { github_url: githubUrl },
      });

      if (response) {
        setToast({ title: 'Success', description: 'Repository connected successfully!' });
        fetchProjects(); // Refresh projects
      }
    } catch (error) {
      console.error('Error connecting repository:', error);
      setToast({ title: 'Error', description: 'Failed to connect repository.' });
    } finally {
      setPageLoading(false);
    }
  };

  const unlinkRepo = async (projectId: number) => {
    setPageLoading(true);
    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/project/${projectId}/unlink-repo/`,
      });

      if (response) {
        setToast({ title: 'Success', description: 'Repository unlinked successfully!' });
        fetchProjects(); // Refresh projects
      }
    } catch (error) {
      console.error('Error unlinking repository:', error);
      setToast({ title: 'Error', description: 'Failed to unlink repository.' });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchRepos();
  }, []);

  if (pageLoading) {
    return <LoadingIndicator />;
  }

  return (
    <ToastProvider>
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Git Integration
        </motion.h1>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="p-4 border border-border rounded-md bg-card text-card-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h3 className="text-lg font-bold">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
              {project.repo_url ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-700 text-gray-200 px-4 py-2 rounded-md shadow-md">
                    <div className="flex items-center gap-2">
                      <Link className="h-5 w-5 text-blue-500" />
                      <span className="font-mono text-sm truncate">{project.repo_url}</span>
                    </div>
                    <button
                      onClick={() => unlinkRepo(project.id)}
                      disabled={pageLoading}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/projects/${project.id}/analyze`)}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                    >
                      <Search className="h-5 w-5" />
                      Analyze Repository
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => navigate(`/projects/${project.id}/ai-assist`)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                    >
                      <WandSparkles className="h-5 w-5" />
                      AI Assist
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {repoLoading ? (
                    <LoadingIndicator />
                  ) : (
                    <>
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
                        disabled={!selectedRepo || pageLoading}
                      >
                        {pageLoading ? 'Connecting...' : 'Connect Repository'}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {toast && (
          <Toast>
            <ToastTitle>{toast.title}</ToastTitle>
            <ToastDescription>{toast.description}</ToastDescription>
          </Toast>
        )}
      </div>
    </ToastProvider>
  );
}