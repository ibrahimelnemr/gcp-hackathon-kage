import { v4 as uuidv4 } from 'uuid';

// export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080/';
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const SAMPLE_PROJECT_NAME = "AI Document Analyzer";

export const SAMPLE_PROJECT_DESCRIPTION =
  "Develop an AI agent that can extract text from a contract (word document) and compare it to a template. The AI agent must be able to compare the contract to the template and provide differences where the contract does not comply with the template and provide a proposal to the contract";

  export const SAMPLE_TEAM_MEMBERS = [
  {
    id: uuidv4(),
    name: "John Doe",
    level: "Analyst",
    department: "AI and Data",
  },
];
