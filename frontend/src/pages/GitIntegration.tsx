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
  const [checkingToken, setCheckingToken] = useState(true); 
  const [ghUsername, setGhUsername] = useState('');

  const checkToken = async () => {
    setCheckingToken(true);
    try {
      const response = await fetch(`${BACKEND_URL}/github/check-token/`);
      const data = await response.json();
      if (data.exists) {
        setTokenExists(true);
        setRepos(data.repos);
        setGhUsername(data.username); 
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
        <div className="p-6 border border-border rounded-md bg-card text-card-foreground">
          <h2 className="text-xl font-bold mb-2">GitHub Connected Successfully</h2>
          <p className="text-muted-foreground">
            You are connected as <span className="font-medium text-primary">{ghUsername}</span>.
          </p>
        </div>
      ) : (
        <div className="p-6 border border-border rounded-md bg-card text-card-foreground">
          <h2 className="text-xl font-bold mb-2">No GitHub Access Token Found</h2>
          <p className="text-muted-foreground">
            Please set a GitHub Personal Access Token in the <span className="font-medium text-primary">Settings</span> page.
          </p>
        </div>
      )}
    </div>
  );
}