import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';
import { useLoading } from '@/hooks/useLoading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AIAssistPopup } from './AIAssistPopup';
import { Link, Search, WandSparkles } from 'lucide-react';

export function AIAssist() {
  const { projectId } = useParams();
  const { sendRequest } = HttpHook();
  const { loading, setLoading, LoadingIndicator } = useLoading();
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
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
          setTasks(data.tasks || []);
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

    // const fetchTasks = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await sendRequest({
    //       method: 'post',
    //       url: `${BACKEND_URL}/ai/repository-analysis`,
    //       body: { repo_url: repoUrl },
    //     });

    //     setTasks(response.analysis_result.tasks || []);
    //   } catch (error) {
    //     console.error('Error fetching tasks:', error);
    //     setError('Failed to fetch tasks. Please try again later.');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchProjectDetails();
    if (repoUrl) {
      // fetchTasks();
    }
  }, [projectId, repoUrl]);

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
      <h1 className="text-3xl font-extrabold text-center mb-6">AI Assist</h1>
      {repoUrl ? (
        <div>
          <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center bg-gray-700 text-gray-200 px-4 py-2 rounded-md shadow-md">
                        <Link className="h-5 w-5 mr-2 text-gray-200" />
                        <span className="text-sm font-bold">{repoUrl}</span>
                      </div>
                    </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    className="shadow-lg hover:shadow-xl transition-shadow relative cursor-pointer"
                    onClick={() => openAIAssistPopup(task.description)}
                  >
                    <CardHeader>
                      <p className="text-lg font-medium text-gray-300">{task.description}</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => openAIAssistPopup(task.description)}
                        className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                      >
                        <WandSparkles className="h-5 w-5" />
                        Assist
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No tasks available for this repository.</p>
          )}
        </div>
      ) : (
        <p className="text-red-500 text-center">{error || 'No repository linked to this project.'}</p>
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