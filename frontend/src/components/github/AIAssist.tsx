import { Button } from '@/components/ui/button';

interface AIAssistProps {
  onBack: () => void;
}

export function AIAssist({ onBack }: AIAssistProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Assist</h1>
      <p className="text-muted-foreground mb-4">This is where AI assistance will be displayed.</p>
      <Button variant="secondary" onClick={onBack}>
        Back to Git Integration
      </Button>
    </div>
  );
}