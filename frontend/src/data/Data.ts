import { v4 as uuidv4 } from "uuid";

// export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080/';
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const SAMPLE_PROJECT_NAME = "AI-Powered Contract Management System";

export const SAMPLE_PROJECT_DESCRIPTION = `Develop a full-stack AI-powered e-commerce platform that allows users to browse, search, and purchase products seamlessly. The platform will include AI-powered predictive features to enhance user experience and optimize business operations. The frontend of the platform will be built using React, TypeScript, and TailwindCSS, ensuring a modern and responsive user interface. The backend will be developed with Python using Flask to provide a robust REST API for handling business logic and data processing. AI and machine learning capabilities will be implemented using Python libraries such as scikit-learn, TensorFlow, or PyTorch to deliver intelligent features.
  
  The platform will use PostgreSQL as the database to securely store product, user, and transaction data. It will be hosted on Google Cloud Platform (GCP), leveraging its AI services for scalability and performance. Authentication will be implemented using OAuth 2.0 with Google Sign-In to ensure secure and seamless user access. The deployment process will be managed using Docker and Kubernetes to enable efficient scaling and containerized environments.
  
  The platform will include several key features to enhance functionality and user experience. It will provide user authentication and role-based access control to ensure secure access. A comprehensive product catalog will allow users to browse, search, and filter products with ease. AI-powered product recommendations will be generated based on user behavior and purchase history, improving personalization. Predictive inventory management will optimize stock levels using machine learning, reducing overstock and stockouts. Real-time order tracking and notifications will keep users informed about their purchases. Secure payment gateway integration will ensure safe and reliable transactions. An admin dashboard will enable efficient management of products, orders, and users, while an analytics dashboard will provide insights into sales trends and customer behavior.
  
  The AI-powered features of the platform will include personalized product recommendations using collaborative filtering and content-based filtering techniques. Predictive analytics will forecast demand and optimize inventory management. Sentiment analysis on customer reviews will identify trends and help improve product offerings. Dynamic pricing optimization will adjust prices based on market trends and competitor analysis, maximizing revenue and customer satisfaction. This e-commerce platform is designed to provide a seamless shopping experience while leveraging AI to drive business growth and operational efficiency.`;

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
