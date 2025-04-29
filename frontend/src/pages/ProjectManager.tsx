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
import { format } from 'date-fns';
import HttpHook from '@/hooks/HttpHook';
import { TaskBoard } from '@/components/project/TaskBoard';
import { BACKEND_URL, SAMPLE_PROJECT_NAME, SAMPLE_PROJECT_DESCRIPTION, SAMPLE_TEAM_MEMBERS } from '@/data/Data';

// Define the team member department options
const departmentOptions = [
  { value: 'Full Stack', label: 'Full Stack' },
  { value: 'AI and Data', label: 'AI and Data' },
  { value: 'Cloud', label: 'Cloud' }
];

export default function ProjectManager() {
  const [teamMembers, setTeamMembers] = useState<any[]>(SAMPLE_TEAM_MEMBERS);
  const [projectName, setProjectName] = useState(SAMPLE_PROJECT_NAME);
  const [projectDescription, setProjectDescription] = useState(SAMPLE_PROJECT_DESCRIPTION);
  const [formError, setFormError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const { sendRequest, loading, httpError } = HttpHook();

  
  
  
  const addTeamMember = () => {
    const newMember: any = {
      id: uuidv4(),
      name: '', // New field for the team member's name
      level: '',
      department: 'Fullstack'
    };
    setTeamMembers([...teamMembers, newMember]);
  };
  
  const updateTeamMember = (id: string, field: keyof any, value: any) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };
  
  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };
  
  const validateForm = (): boolean => {
    // Check if project has a name
    if (!projectName.trim()) {
      setFormError('Please provide a project name');
      return false;
    }
    
    // Check if there's at least one team member
    if (teamMembers.length === 0) {
      setFormError('Please add at least one team member');
      return false;
    }
    
    // Check if all team members have levels
    for (const member of teamMembers) {
      if (!member.level.trim()) {
        setFormError('All team members must have a level');
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

  async function submitProjectMock(projectData: any): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response data
    return {
      generated_plan: {
        tasks: [
          {
            task_id: 1,
            description: "Run Axe accessibility scan on the portal.",
            status: "to-do",
            employee_name: "John Doe"
          },
          {
            task_id: 2,
            description: "Review login flow for keyboard navigation issues.",
            status: "in-progress",
            employee_name: "Jane Smith"
          },
          {
            task_id: 3,
            description: "Review dashboard for screen reader compatibility.",
            status: "done",
            employee_name: "Alice Johnson"
          },
          {
            task_id: 4,
            description: "Identify color contrast issues across the portal.",
            status: "to-do",
            employee_name: "Frank Brown"
          }
        ]
      }
    };
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    // Create team roles object (level: department)
    const team_roles: Record<string, string> = {};
    teamMembers.forEach(member => {
      team_roles[member.level] = member.department;
    });
  
    // Prepare project data
    const projectData: any = {
      project_name: projectName,
      project_description: projectDescription,
      team_roles: teamMembers
    };
  
    // Log the form data to the console
    console.log('Form Data:', projectData);
  
    try {

      // Send request using fetch
      // const res = await fetch(BACKEND_URL, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: projectData
      // });
      
      // if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      // const data = await res.json(); 
      // console.log('Success:', data);

      // Send request using httphook
      const response = await sendRequest<any>({
        method: 'post', 
        url: `${BACKEND_URL}/ai/generate`,
        body: projectData
      });
      console.log("response from API called via HttpHook");
      console.log(response);
      
      // with MOCK DATA
      
      const result = await submitProjectMock(projectData);
      console.log("Mock response from API");
      console.log(result);

      // const data = {
      //   generated_plan: response
      // }
      // const data = response;

      // console.log("Data from API call to generate project: ");
      // console.log(data);
      
      if (response) {
        
        setAnalysisResult(response);
        
        console.log("Analysis Result:", analysisResult);
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      setFormError('Failed to analyze project. Please try again later.');
    }
  };
  
  const resetForm = () => {
    setAnalysisResult(null);
    setTeamMembers([]);
    setProjectName('');
    setProjectDescription('');
    setFormError('');
  };
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center"> {/* Added max-w-4xl and text-center */}
        <SectionHeading
          title="Project Manager"
          description="Add your team members and project details to get AI-powered task assignments and recommendations."
          className="mb-8"
        />
      </div>
      
      {!analysisResult ? (
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Enter the basic information about your project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block">Project Name</label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Add the members who will work on this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={member.id} className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-md bg-card">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Name</label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Level</label>
                      <Input
                        value={member.level}
                        onChange={(e) => updateTeamMember(member.id, 'level', e.target.value)}
                        placeholder="e.g. Senior Consultant, Analyst"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Department</label>
                      <Select
                        value={member.department}
                        onValueChange={(value) => updateTeamMember(member.id, 'department', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
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
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
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
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-6 w-6 mr-2 text-green-500" />
                Project Analysis Complete: {projectName}
              </CardTitle>
              <CardDescription>
                Based on your team composition and project description, KAGE has provided the following task assignments and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Task Board */}
              
              {analysisResult.generated_plan && (
                <TaskBoard 
                  tasks={analysisResult.generated_plan.tasks} 
                />
              )}
            
              
              {/* Display legacy format if new format is not available */}
              {!analysisResult.generated_plan && analysisResult.memberTasks && (
                <div>
                  <h3 className="text-xl font-medium mb-4 font-heading">Task Assignments (Legacy Format)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.memberTasks.map((assignment, index) => {
                      const teamMembers = [];
                      const member = teamMembers.find(m => m.id === assignment.memberId) || { 
                        title: 'Unknown Member', 
                        department: 'Team Member' 
                      };
                      
                      return (
                        <Card key={index} className="bg-card border-border">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{member.title}</CardTitle>
                            <CardDescription>{member.department}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {assignment.tasks.map((task: any, taskIndex: number) => (
                                <li key={taskIndex} className="flex items-start">
                                  <span className="mr-2 text-green-500">•</span>
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
              )}
              
              {/* Legacy Timeline */}
              {analysisResult.timeline && (
                <div>
                  <h3 className="text-xl font-medium mb-4 font-heading">Project Timeline</h3>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="text-lg font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-green-500" />
                            {formatDate(analysisResult.timeline.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="text-lg font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-green-500" />
                            {formatDate(analysisResult.timeline.endDate)}
                          </p>
                        </div>
                      </div>
                      
                      {analysisResult.timeline.milestones && analysisResult.timeline.milestones.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-sm font-medium">Milestones</p>
                          <ul className="space-y-2">
                            {analysisResult.timeline.milestones.map((milestone: any, index: number) => (
                              <li key={index} className="flex items-start p-3 border border-border rounded-md">
                                <Calendar className="h-4 w-4 mr-3 mt-0.5 text-green-500" />
                                <div>
                                  <p className="font-medium">{milestone.description}</p>
                                  <p className="text-sm text-muted-foreground">{formatDate(milestone.date)}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Legacy Recommendations */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium mb-4 font-heading">KAGE's Recommendations</h3>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <ul className="space-y-3">
                        {analysisResult.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="h-5 w-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
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
