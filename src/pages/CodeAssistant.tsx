import { useState } from 'react';
import { AlertTriangle, Check, ArrowRight, Code2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionHeading } from '@/components/ui/section-heading';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { analyzeCode, CodeAnalysisRequest, CodeAnalysisResult, Vulnerability } from '@/services/codeService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CodeAssistant() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter code to analyze');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const request: CodeAnalysisRequest = {
        code,
        language
      };
      
      const analysisResult = await analyzeCode(request);
      setResult(analysisResult);
    } catch (error) {
      console.error('Error analyzing code:', error);
      setError('Failed to analyze code. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSeverityColor = (severity: Vulnerability['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading
        title="Code Assistant"
        description="Submit your code for AI analysis to identify vulnerabilities and optimization opportunities."
        className="mb-8 text-center"
      />
      
      <div className="max-w-5xl mx-auto">
        {!result ? (
          <Card>
            <CardHeader>
              <CardTitle>Submit Code</CardTitle>
              <CardDescription>Paste your code below for KAGE to analyze</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Select Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                      <SelectItem value="swift">Swift</SelectItem>
                      <SelectItem value="kotlin">Kotlin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Code</label>
                  <div className="relative">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code here..."
                      className="min-h-80 w-full p-4 rounded-md border border-input bg-kage-gray-darker font-mono text-sm resize-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 border border-destructive bg-destructive/10 text-destructive rounded flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-kage-purple hover:bg-kage-purple-dark"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Analyzing Code...
                    </>
                  ) : (
                    <>
                      <Code2 className="mr-2 h-4 w-4" />
                      Analyze Code
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="h-6 w-6 mr-2 text-green-500" />
                  Analysis Complete
                </CardTitle>
                <CardDescription>
                  KAGE has analyzed your code and identified the following issues and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="vulnerabilities">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                    <TabsTrigger value="optimized">Optimized Code</TabsTrigger>
                    <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="vulnerabilities" className="py-4">
                    <h3 className="text-xl font-medium mb-4 font-heading">Identified Issues</h3>
                    
                    {result.vulnerabilities.length === 0 ? (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md flex items-center">
                        <Check className="h-5 w-5 mr-2 text-green-500" />
                        <span>No vulnerabilities detected in your code. Great job!</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {result.vulnerabilities.map((vulnerability, index) => (
                          <Card key={index} className="bg-kage-gray-dark">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center">
                                  <AlertTriangle className={`h-4 w-4 mr-2 ${getSeverityColor(vulnerability.severity)}`} />
                                  {vulnerability.description}
                                </CardTitle>
                                <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(vulnerability.severity)} bg-opacity-20 border border-current`}>
                                  {vulnerability.severity.toUpperCase()}
                                </span>
                              </div>
                              <CardDescription>Line {vulnerability.line}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{vulnerability.recommendation}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="optimized" className="py-4">
                    <h3 className="text-xl font-medium mb-4 font-heading">Optimized Code</h3>
                    <div className="p-4 bg-kage-gray-darker rounded-md font-mono text-sm overflow-auto max-h-96 whitespace-pre">
                      {result.optimizedCode}
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <h4 className="font-medium">Performance Improvements</h4>
                      <ul className="space-y-2">
                        {result.performanceImprovements.map((improvement, index) => (
                          <li key={index} className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-kage-purple-light" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metrics" className="py-4">
                    <h3 className="text-xl font-medium mb-4 font-heading">Quality Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(result.qualityMetrics).map(([key, value]) => (
                        <Card key={key} className="bg-kage-gray-dark">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground capitalize">{key}</p>
                              <div className="flex items-center justify-center my-2">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                  <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle 
                                      className="text-kage-gray stroke-current" 
                                      strokeWidth="8" 
                                      cx="50" 
                                      cy="50" 
                                      r="40" 
                                      fill="transparent" 
                                    />
                                    <circle 
                                      className="text-kage-purple stroke-current" 
                                      strokeWidth="8" 
                                      strokeLinecap="round" 
                                      cx="50" 
                                      cy="50" 
                                      r="40" 
                                      fill="transparent" 
                                      strokeDasharray={`${value * 2.51} 251`} 
                                      transform="rotate(-90 50 50)" 
                                    />
                                  </svg>
                                  <span className="absolute text-2xl font-bold">{value}</span>
                                </div>
                              </div>
                              <p className="text-sm">
                                {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : value >= 40 ? 'Average' : 'Needs Improvement'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setResult(null)} 
                  className="w-full"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze New Code
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
