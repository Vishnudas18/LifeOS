import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">404</h1>
      <h2 className="text-xl font-semibold text-foreground mt-2">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}