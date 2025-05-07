import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLoading } from '@/hooks/useLoading';
import HttpHook from '@/hooks/HttpHook';
import { BACKEND_URL } from '@/data/Data';
import { Code, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CodeOptimization() {
  const { sendRequest } = HttpHook();
  const { loading, setLoading, LoadingIndicator } = useLoading();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ code: string; explanation: string } | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter code to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await sendRequest({
        method: 'post',
        url: `${BACKEND_URL}/ai/optimize`,
        body: { code },
      });
      setResult(response);
    } catch (err) {
      console.error('Error analyzing code:', err);
      setError('Failed to analyze code. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setResult(null);
    setError('');
  };

  const extractCode = (codeBlock: string) => {
    // Remove the ```{language} and ``` wrapping the code
    const match = codeBlock.match(/```[\w-]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : codeBlock;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Code className="h-6 w-6 mr-2 text-kage-purple" />
        Code Optimization
      </h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingIndicator />
        </div>
      ) : result ? (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>Here are the recommendations for your code:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold">Optimized Code</h3>
                  <pre className="p-4 bg-gray-900 text-white rounded-md text-sm overflow-auto">
                    {extractCode(result.code)}
                  </pre>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Explanation</h3>
                  <div className="prose max-w-none">
                    <ReactMarkdown
                      children={result.explanation}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, children, ...props }) {
                          return inline ? (
                            <code className="bg-gray-200 text-red-600 px-1 py-0.5 rounded" {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-gray-900 text-white p-4 rounded-md overflow-auto" {...props}>
                              <code>{children}</code>
                            </pre>
                          );
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleReset}
              className="bg-kage-purple hover:bg-kage-purple-dark"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyze Again
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Analyze Your Code</CardTitle>
            <CardDescription>
              Enter your code below to get AI-powered recommendations for optimization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full min-h-[150px] bg-card text-card-foreground border border-border rounded-md p-2"
              />
              {error && (
                <div className="p-3 border border-destructive bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-kage-purple hover:bg-kage-purple-dark"
              >
                Analyze Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}