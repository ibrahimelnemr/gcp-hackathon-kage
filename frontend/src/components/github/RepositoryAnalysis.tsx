import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';
import { useLoading } from '@/hooks/useLoading';

export function RepositoryAnalysis() {
  const { projectId } = useParams();
  const { sendRequest } = HttpHook();
  const { loading, setLoading, LoadingIndicator } = useLoading();
  const [project, setProject] = useState(null);
  const [repo, setRepo] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const data = await sendRequest({
          method: 'get',
          url: `${BACKEND_URL}/project/${projectId}`,
        });
        setProject(data);
        setRepo(data.github_repo);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Repository Analysis</h1>
      {project && (
        <div>
          <h2 className="text-xl font-bold">{project.name}</h2>
          <p className="text-muted-foreground">{project.description}</p>
          {repo && (
            <div>
              <h3 className="text-lg font-bold mt-4">Repository Details</h3>
              <p className="text-muted-foreground">URL: {repo.github_url}</p>
            </div>
          )}
        </div>
      )}
      <Button variant="secondary" onClick={() => window.history.back()}>
        Back to Git Integration
      </Button>
    </div>
  );
}