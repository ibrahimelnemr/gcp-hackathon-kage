import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RepoList } from '@/components/github/RepoList';
import { BACKEND_URL } from '@/data/Data';
import { LoadingSpinner } from '@/components/ui/loading-spinner'; // Import the LoadingSpinner component

export default function GitIntegration() {
  const [tokenExists, setTokenExists] = useState(false);
  const [repos, setRepos] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true); // Track whether the token is being checked

  const checkToken = async () => {
    setCheckingToken(true); // Start checking
    try {
      const response = await fetch(`${BACKEND_URL}/project/github/check-token/`);
      const data = await response.json();
      if (data.exists) {
        setTokenExists(true);
        setRepos(data.repos);
      } else {
        setTokenExists(false);
      }
    } catch (error) {
      console.error('Error checking GitHub token:', error);
    } finally {
      setCheckingToken(false); // Stop checking
    }
  };

  const saveToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/github/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error('Failed to save token');
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
        <LoadingSpinner size="lg" className="mb-4" /> {/* Add the loading spinner */}
        <p className="text-muted-foreground">Checking for an existing GitHub Personal Access Token...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Git Integration</h1>
      {tokenExists ? (
        <RepoList repos={repos} />
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