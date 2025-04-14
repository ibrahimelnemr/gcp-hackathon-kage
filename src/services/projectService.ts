
import { apiRequest } from './api';

// Types for project management
export interface TeamMember {
  id: string;
  name: string;
  yearsOfExperience: number;
  role: 'AI Engineer' | 'Fullstack Engineer' | 'Cloud Engineer';
}

export interface ProjectData {
  teamMembers: TeamMember[];
  projectDescription: string;
}

export interface ProjectAnalysisResult {
  memberTasks: {
    memberId: string;
    tasks: string[];
  }[];
  timeline: {
    startDate: string;
    endDate: string;
    milestones: {
      date: string;
      description: string;
    }[];
  };
  recommendations: string[];
}

// Project management service functions
export async function submitProject(projectData: ProjectData): Promise<ProjectAnalysisResult> {
  try {
    // In a real app, this would make an actual API call
    // For now, we'll simulate a response after a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is mock data - in a real app this would come from the API
        resolve({
          memberTasks: projectData.teamMembers.map(member => ({
            memberId: member.id,
            tasks: [
              'Research and define architecture',
              'Implement core functionality',
              'Test and document system'
            ]
          })),
          timeline: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            milestones: [
              {
                date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Complete initial prototype'
              },
              {
                date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Finish core features'
              }
            ]
          },
          recommendations: [
            'Consider adding a DevOps specialist to the team',
            'Implement weekly code reviews to maintain quality',
            'Set up automated testing early in the development process'
          ]
        });
      }, 1500);
    });
  } catch (error) {
    console.error('Error submitting project:', error);
    throw error;
  }
}
