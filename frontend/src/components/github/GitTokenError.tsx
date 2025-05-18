import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function GitTokenError() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle>GitHub Token Missing</AlertTitle>
      <AlertDescription>
        A GitHub Personal Access Token is required to proceed. Please navigate to the <b>Settings</b> page and add your token.
      </AlertDescription>
    </Alert>
  );
}