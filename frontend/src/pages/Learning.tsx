import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function Learning() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Learning Hub</h2>
        <p className="text-sm text-muted-foreground">
          Track courses, book reading lists, skill growth, and study notes.
        </p>
      </div>

      <Card className="min-h-[400px] flex items-center justify-center border-dashed">
        <div className="text-center p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Skill & Knowledge Base</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Course trackers, reading logs, and knowledge management tools will live here.
          </p>
        </div>
      </Card>
    </div>
  );
}
