
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Calendar, CheckSquare, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TeamMember, ProjectData, ProjectAnalysisResult, submitProject } from '@/services/projectService';
import { format } from 'date-fns';

export default function ProjectManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProjectAnalysisResult | null>(null);
  const [formError, setFormError] = useState('');
  
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: uuidv4(),
      name: '',
      yearsOfExperience: 0,
      role: 'Fullstack Engineer'
    };
    setTeamMembers([...teamMembers, newMember]);
  };
  
  const updateTeamMember = (id: string, field: keyof TeamMember, value: any) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };
  
  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };
  
  const validateForm = (): boolean => {
    // Check if there's at least one team member
    if (teamMembers.length === 0) {
      setFormError('Please add at least one team member');
      return false;
    }
    
    // Check if all team members have a name and valid years of experience
    for (const member of teamMembers) {
      if (!member.name.trim()) {
        setFormError('All team members must have a name');
        return false;
      }
      if (member.yearsOfExperience < 0) {
        setFormError('Years of experience cannot be negative');
        return false;
      }
    }
    
    // Check if project description is not empty
    if (!projectDescription.trim()) {
      setFormError('Please provide a project description');
      return false;
    }
    
    setFormError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const projectData: ProjectData = {
        teamMembers,
        projectDescription
      };
      
      const result = await submitProject(projectData);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error submitting project:', error);
      setFormError('Failed to analyze project. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setAnalysisResult(null);
    setTeamMembers([]);
    setProjectDescription('');
    setFormError('');
  };
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading
        title="Project Manager"
        description="Add your team members and project details to get AI-powered task assignments and recommendations."
        className="mb-8 text-center"
      />
      
      {!analysisResult ? (
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Add the members who will work on this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={member.id} className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-md bg-kage-gray-dark">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Name</label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                        placeholder="Team member name"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="w-full md:w-36">
                      <label className="text-sm font-medium mb-1 block">Experience (yrs)</label>
                      <Input
                        type="number"
                        min="0"
                        value={member.yearsOfExperience}
                        onChange={(e) => updateTeamMember(member.id, 'yearsOfExperience', parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Role</label>
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateTeamMember(member.id, 'role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AI Engineer">AI Engineer</SelectItem>
                          <SelectItem value="Fullstack Engineer">Fullstack Engineer</SelectItem>
                          <SelectItem value="Cloud Engineer">Cloud Engineer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTeamMember}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
                <CardDescription>Describe your project goals and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Provide details about your project, including objectives, technologies, timeline, and any specific requirements..."
                  className="min-h-32"
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                {formError && (
                  <div className="w-full p-3 border border-destructive bg-destructive/10 text-destructive rounded flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-kage-purple hover:bg-kage-purple-dark"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Analyzing Project...
                    </>
                  ) : (
                    'Submit Project for Analysis'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-6 w-6 mr-2 text-green-500" />
                Project Analysis Complete
              </CardTitle>
              <CardDescription>
                Based on your team composition and project description, KAGE has provided the following recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Task Assignments */}
              <div>
                <h3 className="text-xl font-medium mb-4 font-heading">Task Assignments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisResult.memberTasks.map((assignment, index) => {
                    const member = teamMembers.find(m => m.id === assignment.memberId) || { 
                      name: 'Unknown Member', 
                      role: 'Team Member' 
                    };
                    
                    return (
                      <Card key={index} className="bg-kage-gray-dark border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{member.name}</CardTitle>
                          <CardDescription>{member.role}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {assignment.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-start">
                                <span className="mr-2 text-kage-purple-light">•</span>
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              {/* Timeline */}
              <div>
                <h3 className="text-xl font-medium mb-4 font-heading">Project Timeline</h3>
                <Card className="bg-kage-gray-dark border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="text-lg font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-kage-purple-light" />
                          {formatDate(analysisResult.timeline.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="text-lg font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-kage-purple-light" />
                          {formatDate(analysisResult.timeline.endDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-sm font-medium">Milestones</p>
                      <ul className="space-y-2">
                        {analysisResult.timeline.milestones.map((milestone, index) => (
                          <li key={index} className="flex items-start p-3 border border-border rounded-md">
                            <Calendar className="h-4 w-4 mr-3 mt-0.5 text-kage-purple-light" />
                            <div>
                              <p className="font-medium">{milestone.description}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(milestone.date)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recommendations */}
              <div>
                <h3 className="text-xl font-medium mb-4 font-heading">KAGE's Recommendations</h3>
                <Card className="bg-kage-gray-dark border-border">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-kage-purple-light/20 text-kage-purple-light flex items-center justify-center mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={resetForm} className="w-full">
                Start New Project Analysis
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
