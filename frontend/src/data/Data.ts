import { v4 as uuidv4 } from 'uuid';

// export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080/';
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const SAMPLE_PROJECT_NAME = "AI-Powered Contract Management System";

export const SAMPLE_PROJECT_DESCRIPTION =
  `Develop a full-stack AI-powered contract management system that allows users to upload contracts (Word or PDF documents), extract key clauses using Natural Language Processing (NLP), and compare them against predefined templates. The system should highlight discrepancies, suggest corrections, and provide a user-friendly interface for review and approval. 

  The project will use React, TypeScript, and TailwindCSS for the frontend, while the backend will be built with Python using Django or Flask to provide a REST API. AI and NLP capabilities will be implemented using Python libraries such as Hugging Face Transformers and spaCy. PostgreSQL will be used as the database, and the application will be hosted on Google Cloud Platform (GCP), leveraging its AI services. Authentication will be implemented using OAuth 2.0 with Google Sign-In, and the deployment will be managed using Docker and Kubernetes.

  The system will include several key features. It will provide user authentication and role-based access control to ensure secure access. Users will be able to upload and store documents, which will then be processed using AI-powered clause extraction and comparison. The system will highlight discrepancies in the documents and suggest corrections. It will also allow task assignment and tracking for team members, enabling real-time collaboration and commenting on documents. Additionally, the system will feature a dashboard for analytics and reporting, providing insights into document processing and team performance.`;

export const SAMPLE_TEAM_MEMBERS = [
  {
    id: uuidv4(),
    name: "Alice Johnson",
    level: "Senior Consultant",
    department: "Full Stack",
  },
  {
    id: uuidv4(),
    name: "Bob Smith",
    level: "Analyst",
    department: "Full Stack",
  },
  {
    id: uuidv4(),
    name: "Charlie Brown",
    level: "Analyst",
    department: "AI and Data",
  },
  {
    id: uuidv4(),
    name: "Frank White",
    level: "Consultant",
    department: "Cloud",
  },
  {
    id: uuidv4(),
    name: "Grace Lee",
    level: "Senior Consultant",
    department: "AI and Data",
  },
];

export const SAMPLE_CODE = `
def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

def get_prime_factors(n):
    factors = []
    for i in range(2, n + 1):
        if n % i == 0 and is_prime(i):
            factors.append(i)
    return factors

def sum_unique_prime_factors(numbers):
    all_factors = []
    for num in numbers:
        factors = get_prime_factors(num)
        for f in factors:
            if f not in all_factors:
                all_factors.append(f)
    return sum(all_factors)
`;