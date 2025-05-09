import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popup } from '@/components/ui/Popup';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle } from 'lucide-react';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';

interface AIAssistPopupProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl: string;
  taskDescription: string;
}

interface ProcessedChange {
  file_path: string;
  changes: {
    line_number: number;
    action: string;
    content: string;
  }[];
}

export function AIAssistPopup({ isOpen, onClose, repoUrl, taskDescription }: AIAssistPopupProps) {
  const { sendRequest } = HttpHook();
  const [rawJsonChanges, setRawJsonChanges] = useState<any[]>([]);
  const [jsonChanges, setJsonChanges] = useState<ProcessedChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to process raw JSON changes into a grouped format
  const processJsonChanges = (changes: any[]): ProcessedChange[] => {
    const groupedChanges: { [key: string]: ProcessedChange } = {};

    changes.forEach((change) => {
      const { file_path, line_number, action, content } = change;

      if (!groupedChanges[file_path]) {
        groupedChanges[file_path] = { file_path, changes: [] };
      }

      groupedChanges[file_path].changes.push({ line_number, action, content });
    });

    return Object.values(groupedChanges);
  };

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
      setRawJsonChanges(response.json_changes);
      const processedChanges = processJsonChanges(response.json_changes);
      setJsonChanges(processedChanges);
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
        body: { repo_url: repoUrl, json_changes: JSON.stringify(rawJsonChanges) },
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
    <Popup isOpen={isOpen} onClose={onClose} className="max-w-6xl w-full bg-gray-900 text-gray-100">
      <h2 className="text-3xl font-extrabold text-center mb-4">AI Assist</h2>
      <div className="space-y-4">
        {!isCommitted ? (
          <>
            <p className="text-base text-gray-400 text-center italic">{taskDescription}</p>
            <Button onClick={handleGenerateChanges} disabled={isLoading} className="w-full text-lg font-semibold">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Generate Changes'}
            </Button>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {isLoading && (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-kage-purple"></div>
              </div>
            )}
            {!isLoading && jsonChanges.length > 0 && (
              <div className="h-96 overflow-y-auto border rounded-md p-4 text-gray-200">
                {jsonChanges.map((file, fileIndex) => (
                  <div key={fileIndex} className="mb-6">
                    <h3 className="font-bold text-lg mb-2 text-gray-300"><code>{file.file_path}</code></h3>
                    <div className="space-y-1">
                      {file.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className={`text-sm font-mono ${
                            change.action === 'add'
                              ? 'text-green-400'
                              : change.action === 'remove'
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}
                        >
                          <code className="text-gray-500">[{change.line_number}]</code>{' '}
                          <code>{change.content}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && jsonChanges.length > 0 && (
              <Button onClick={handleCommitChanges} disabled={isLoading} className="w-full text-lg font-semibold">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-kage-purple"></div>
                ) : (
                  'Commit Changes'
                )}
              </Button>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-bold text-green-500">Commit Successful!</h3>
            <p className="text-gray-400">Your changes have been successfully committed to the repository.</p>
          </div>
        )}
      </div>
    </Popup>
  );
}