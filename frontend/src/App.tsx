import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Home from "./pages/Home";
import ProjectManager from "./pages/ProjectManager";
import CodeAssistant from "./pages/CodeAssistant";
import AiChat from "./pages/AiChat";
import NotFound from "./pages/NotFound";
import ProjectTaskBoard from './pages/ProjectTaskBoard';
import ProjectList from './pages/ProjectList';
import Project from './pages/Project';
import GitIntegration from "./pages/GitIntegration";
import Settings from './pages/Settings';
import { AIAssist } from '@/components/github/AIAssist';
import { RepositoryAnalysis } from '@/components/github/RepositoryAnalysis';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/project-manager" element={<ProjectManager />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:projectId" element={<Project />} />
            <Route path="/projects/:projectName" element={<ProjectTaskBoard />} />
            <Route path="/github" element={<GitIntegration />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/projects/:projectId/ai-assist" element={<AIAssist />} />
            <Route path="/projects/:projectId/analyze" element={<RepositoryAnalysis />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
