import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  const [jsonChanges, setJsonChanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateChanges = async () => {
    setIsLoading(true);
    setJsonChanges([]);
    setIsCommitted(false);
    setError(null);

    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/ai/generate-json-changes`,
        body: { repo_url: repoUrl, task_description: taskDescription },
      });
      setJsonChanges(response.json_changes);
    } catch (error) {
      console.error('Error generating changes:', error);
      setError('Failed to generate changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitChanges = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/ai/apply-json-changes`,
        body: { repo_url: repoUrl, json_changes: JSON.stringify(jsonChanges) },
      });
      setIsCommitted(true);
    } catch (error) {
      console.error('Error committing changes:', error);
      setError('Failed to commit changes. Please try again.');
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
            {error && <p className="text-red-500">{error}</p>}
            {jsonChanges.length > 0 && (
              <>
                <div className="h-64 overflow-y-auto border rounded-md p-4 bg-gray-50">
                  {jsonChanges.map((change, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="font-bold">{change.file_path}</h3>
                      <pre className="bg-gray-100 p-2 rounded-md">
                        {change.content}
                      </pre>
                    </div>
                  ))}
                </div>
                <Button onClick={handleCommitChanges} disabled={isLoading} className="w-full">
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Commit Changes'}
                </Button>
              </>
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