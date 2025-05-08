import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popup } from '@/components/ui/popup';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';

interface AIAssistPopupProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl: string;
  taskDescription: string;
}

export function AIAssistPopup({ isOpen, onClose, repoUrl, taskDescription }: AIAssistPopupProps) {
  const { sendRequest } = HttpHook();
  const [changes, setChanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);

  const handleGenerateChanges = async () => {
    setIsLoading(true);
    setChanges([]);
    setIsCommitted(false);

    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/ai/assist`,
        body: { repo_url: repoUrl, task_description: taskDescription },
      });
      setChanges(response.changes);
    } catch (error) {
      console.error('Error generating changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitChanges = async () => {
    setIsLoading(true);

    try {
      await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/ai/commit-changes`,
        body: { repo_url: repoUrl, changes },
      });
      setIsCommitted(true);
    } catch (error) {
      console.error('Error committing changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">AI Assist</h2>
      <div className="space-y-4">
        {!isCommitted ? (
          <>
            <p className="text-sm text-gray-600">Task: {taskDescription}</p>
            <Button onClick={handleGenerateChanges} disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Generate Changes'}
            </Button>
            {changes.length > 0 && (
              <div className="space-y-4">
                {changes.map((change, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <h3 className="font-bold">{change.file_path}</h3>
                    <pre className="bg-gray-100 p-2 rounded-md">
                      {change.content}
                    </pre>
                  </div>
                ))}
                <Button onClick={handleCommitChanges} disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Commit Changes'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-green-500 font-bold">Changes Committed Successfully!</h3>
          </div>
        )}
      </div>
    </Popup>
  );
}