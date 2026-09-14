import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import type { FocusSession } from "../types/focus";

interface TimerControlsProps {
  session: FocusSession | null | undefined;
  isFinished: boolean;
  onOpenStartModal: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  session,
  isFinished,
  onOpenStartModal,
  onPause,
  onResume,
  onComplete,
  onCancel,
  isPending,
}) => {
  const status = session ? session.status : "IDLE";

  if (isFinished || status === "COMPLETED") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-semibold px-6"
          onClick={onComplete}
          disabled={isPending}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Session
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onOpenStartModal}
          disabled={isPending}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start Again
        </Button>
      </div>
    );
  }

  if (status === "RUNNING") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          variant="secondary"
          className="font-semibold px-6 shadow-sm border border-border"
          onClick={onPause}
          disabled={isPending}
        >
          <Pause className="w-5 h-5 mr-2 text-amber-500" />
          Pause
        </Button>

        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 shadow-md"
          onClick={onComplete}
          disabled={isPending}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
          onClick={onCancel}
          disabled={isPending}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    );
  }

  if (status === "PAUSED") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 shadow-md"
          onClick={onResume}
          disabled={isPending}
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Resume
        </Button>

        <Button
          size="lg"
          variant="secondary"
          className="font-semibold px-6"
          onClick={onComplete}
          disabled={isPending}
        >
          <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
          Complete
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={onCancel}
          disabled={isPending}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    );
  }

  // IDLE state controls
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-10 py-6 shadow-lg rounded-full"
        onClick={onOpenStartModal}
        disabled={isPending}
      >
        <Play className="w-6 h-6 mr-2.5 fill-current" />
        Start Focus Session
      </Button>
    </div>
  );
};
