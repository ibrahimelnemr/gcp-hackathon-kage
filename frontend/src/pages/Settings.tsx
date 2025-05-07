import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BACKEND_URL } from '@/data/Data';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import HttpHook from '@/hooks/HttpHook';

export default function Settings() {
  const [tokenExists, setTokenExists] = useState(false);
  const [ghUsername, setGhUsername] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const { sendRequest } = HttpHook();

  const checkToken = async () => {
    setCheckingToken(true);
    try {
      const data = await sendRequest({
        method: 'get',
        url: `${BACKEND_URL}/github/check-token/`,
      });
      if (data.exists) {
        setTokenExists(true);
        setGhUsername(data.username); // Assume the backend returns the GitHub username
      } else {
        setTokenExists(false);
      }
    } catch (error) {
      console.error('Error checking GitHub token:', error);
    } finally {
      setCheckingToken(false);
    }
  };

  const saveToken = async () => {
    setLoading(true);
    try {
      await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/github/token/`,
        body: { token },
      });
      await checkToken(); // Recheck token after saving
    } catch (error) {
      console.error('Error saving GitHub token:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  if (checkingToken) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-muted-foreground">Checking for an existing GitHub Personal Access Token...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      {tokenExists ? (
        <div className="p-6 border border-border rounded-md bg-card text-card-foreground">
          <h2 className="text-xl font-bold mb-2">GitHub Connected Successfully</h2>
          <p className="text-muted-foreground">You are connected as <span className="font-medium text-primary">{ghUsername}</span>.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">Please paste your GitHub Personal Access Token below:</p>
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your GitHub token"
            className="w-full"
          />
          <Button onClick={saveToken} disabled={loading || !token.trim()} className="w-full">
            {loading ? 'Saving...' : 'Submit'}
          </Button>
        </div>
      )}
    </div>
  );
}