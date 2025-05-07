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

export const SAMPLE_CODE  = `
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