import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';
import { useLoading } from '@/hooks/useLoading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AIAssistPopup } from './AIAssistPopup';

export function RepositoryAnalysis() {
  const { projectId } = useParams();
  const { sendRequest } = HttpHook();
  const { loading, setLoading, LoadingIndicator } = useLoading();
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTaskDescription, setSelectedTaskDescription] = useState<string | null>(null);

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

  const handleAnalyzeRepository = async () => {
    if (!repoUrl) {
      setError('No repository linked to this project.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/ai/repository-analysis`,
        body: { repo_url: repoUrl },
      });
      setAnalysisResult(response.analysis_result);
    } catch (error) {
      console.error('Error analyzing repository:', error);
      setError('Failed to analyze repository. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openAIAssistPopup = (taskDescription: string) => {
    setSelectedTaskDescription(taskDescription);
    setIsPopupOpen(true);
  };

  const closeAIAssistPopup = () => {
    setIsPopupOpen(false);
    setSelectedTaskDescription(null);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Repository Analysis</h1>
      {repoUrl ? (
        <div>
          <p className="mb-4">Repository URL: {repoUrl}</p>
          <Button onClick={handleAnalyzeRepository} className="mb-4">
            Analyze Repository
          </Button>
          {error && <p className="text-red-500">{error}</p>}
          {analysisResult && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysisResult.tasks.map((task: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                          <CardTitle>Task {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4">{task.description}</p>
                          <Button
                            variant="outline"
                            onClick={() => openAIAssistPopup(task.description)}
                          >
                            Open AI Assist
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Refactors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysisResult.refactors.map((refactor: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="shadow-lg">
                        <CardHeader>
                          <CardTitle>Refactor {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>{refactor.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-500">{error || 'No repository linked to this project.'}</p>
      )}
      {isPopupOpen && (
        <AIAssistPopup
          isOpen={isPopupOpen}
          onClose={closeAIAssistPopup}
          repoUrl={repoUrl!}
          taskDescription={selectedTaskDescription!}
        />
      )}
    </div>
  );
}