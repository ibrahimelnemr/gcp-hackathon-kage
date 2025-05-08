import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';
import { useLoading } from '@/hooks/useLoading';

export function AIAssist() {
  const { projectId } = useParams();
  const { sendRequest } = HttpHook();
  const { loading, setLoading, LoadingIndicator } = useLoading();
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [gitDiff, setGitDiff] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const data = await sendRequest({
          method: 'get',
          url: `${BACKEND_URL}/project/${projectId}/details/`,
        });

        if (data.github_repo && data.github_repo.url) {
          setRepoUrl(data.github_repo.url);
        } else {
          setError('No repository linked to this project.');
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
        setError('Failed to fetch project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleGenerateGitDiff = async () => {
    if (!repoUrl || !taskDescription.trim()) {
      setError('Please provide a valid repository URL and task description.');
      return;
    }

    setLoading(true);
    setError(null);
    setGitDiff(null);

    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/ai/assist`,
        body: { repo_url: repoUrl, task_description: taskDescription },
      });
      setGitDiff(response.git_diff);
    } catch (error) {
      console.error('Error generating Git diff:', error);
      setError('Failed to generate Git diff. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Assist</h1>
      {repoUrl ? (
        <div>
          <p className="mb-4">Repository URL: {repoUrl}</p>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Enter task description..."
            className="w-full p-4 border rounded-md mb-4"
          />
          <Button onClick={handleGenerateGitDiff} className="mb-4">
            Generate Git Diff
          </Button>
          {error && <p className="text-red-500">{error}</p>}
          {gitDiff && (
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {gitDiff}
            </pre>
          )}
        </div>
      ) : (
        <p className="text-red-500">{error || 'No repository linked to this project.'}</p>
      )}
    </div>
  );
}