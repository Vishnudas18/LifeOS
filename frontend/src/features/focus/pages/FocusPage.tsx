import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useActiveFocusSession,
  useFocusSummary,
  useStartFocusSession,
  usePauseFocusSession,
  useResumeFocusSession,
  useCompleteFocusSession,
  useCancelFocusSession,
} from "../hooks/useFocus";
import { useFocusTimer } from "../hooks/useFocusTimer";
import { TimerDisplay } from "../components/TimerDisplay";
import { TimerControls } from "../components/TimerControls";
import { FocusConfigModal } from "../components/FocusConfigModal";
import { FocusStats } from "../components/FocusStats";
import { FocusHistoryList } from "../components/FocusHistoryList";
import type { FocusMode, CreateFocusSessionInput } from "../types/focus";
import { Timer, Flame, Coffee, Sparkles, AlertCircle } from "lucide-react";

export const FocusPage: React.FC = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<FocusMode>("FOCUS");
  const [selectedDuration, setSelectedDuration] = useState<number>(25 * 60); // 25 min default
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // TanStack Query server state
  const { data: activeSession, isLoading: isActiveLoading } = useActiveFocusSession();
  const { data: summary, isLoading: isSummaryLoading } = useFocusSummary();

  // Mutations
  const startMutation = useStartFocusSession();
  const pauseMutation = usePauseFocusSession();
  const resumeMutation = useResumeFocusSession();
  const completeMutation = useCompleteFocusSession();
  const cancelMutation = useCancelFocusSession();

  const isPending =
    startMutation.isPending ||
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending;

  // Second-by-second timestamp-accurate local timer state
  const { formattedTime, progressPercentage, isFinished } = useFocusTimer(activeSession);

  const handleStartQuickSession = (mode: FocusMode, minutes: number) => {
    setSelectedMode(mode);
    setSelectedDuration(minutes * 60);
    setErrorMessage(null);

    startMutation.mutate(
      {
        mode,
        plannedDuration: minutes * 60,
        title:
          mode === "FOCUS"
            ? "Focus Session"
            : mode === "SHORT_BREAK"
            ? "Short Break"
            : mode === "LONG_BREAK"
            ? "Long Break"
            : "Custom Focus",
      },
      {
        onError: (err) => {
          setErrorMessage(err.message || "Failed to start focus session");
        },
      }
    );
  };

  const handleStartCustomSession = (input: CreateFocusSessionInput) => {
    setErrorMessage(null);
    startMutation.mutate(input, {
      onSuccess: () => {
        setIsConfigModalOpen(false);
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to start focus session");
      },
    });
  };

  const handlePause = () => {
    if (!activeSession) return;
    setErrorMessage(null);
    pauseMutation.mutate(activeSession._id, {
      onError: (err) => setErrorMessage(err.message || "Failed to pause session"),
    });
  };

  const handleResume = () => {
    if (!activeSession) return;
    setErrorMessage(null);
    resumeMutation.mutate(activeSession._id, {
      onError: (err) => setErrorMessage(err.message || "Failed to resume session"),
    });
  };

  const handleComplete = () => {
    if (!activeSession) return;
    setErrorMessage(null);
    completeMutation.mutate(activeSession._id, {
      onError: (err) => setErrorMessage(err.message || "Failed to complete session"),
    });
  };

  const handleCancel = () => {
    if (!activeSession) return;
    setErrorMessage(null);
    cancelMutation.mutate(activeSession._id, {
      onError: (err) => setErrorMessage(err.message || "Failed to cancel session"),
    });
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Timer className="w-8 h-8 text-indigo-500" />
            Focus Workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Boost deep work productivity with timestamp-driven pomodoro tracking.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-destructive/20"
            onClick={() => setErrorMessage(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Workspace Card */}
      <Card className="p-6 sm:p-10 border border-border/60 bg-card shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Background Accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Preset Mode Tabs (Only when IDLE) */}
        {!activeSession && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 z-10">
            <Button
              size="sm"
              variant={selectedMode === "FOCUS" ? "default" : "outline"}
              className={`rounded-full text-xs font-semibold px-4 ${
                selectedMode === "FOCUS" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""
              }`}
              onClick={() => {
                if (selectedMode === "FOCUS") {
                  handleStartQuickSession("FOCUS", 25);
                } else {
                  setSelectedMode("FOCUS");
                  setSelectedDuration(25 * 60);
                }
              }}
            >
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              Focus (25m)
            </Button>
            <Button
              size="sm"
              variant={selectedMode === "SHORT_BREAK" ? "default" : "outline"}
              className={`rounded-full text-xs font-semibold px-4 ${
                selectedMode === "SHORT_BREAK" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => {
                if (selectedMode === "SHORT_BREAK") {
                  handleStartQuickSession("SHORT_BREAK", 5);
                } else {
                  setSelectedMode("SHORT_BREAK");
                  setSelectedDuration(5 * 60);
                }
              }}
            >
              <Coffee className="w-3.5 h-3.5 mr-1.5" />
              Short Break (5m)
            </Button>
            <Button
              size="sm"
              variant={selectedMode === "LONG_BREAK" ? "default" : "outline"}
              className={`rounded-full text-xs font-semibold px-4 ${
                selectedMode === "LONG_BREAK" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
              }`}
              onClick={() => {
                if (selectedMode === "LONG_BREAK") {
                  handleStartQuickSession("LONG_BREAK", 15);
                } else {
                  setSelectedMode("LONG_BREAK");
                  setSelectedDuration(15 * 60);
                }
              }}
            >
              <Coffee className="w-3.5 h-3.5 mr-1.5" />
              Long Break (15m)
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-xs font-semibold px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setIsConfigModalOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-500" />
              Custom / Link Task...
            </Button>
          </div>
        )}

        {/* Central Timer Display */}
        <div className="z-10 w-full flex flex-col items-center">
          <TimerDisplay
            session={activeSession}
            formattedTime={formattedTime}
            progressPercentage={progressPercentage}
            isFinished={isFinished}
            selectedMode={selectedMode}
            selectedDuration={selectedDuration}
          />

          {/* Interactive Controls */}
          <div className="mt-6">
            <TimerControls
              session={activeSession}
              isFinished={isFinished}
              onOpenStartModal={() => setIsConfigModalOpen(true)}
              onPause={handlePause}
              onResume={handleResume}
              onComplete={handleComplete}
              onCancel={handleCancel}
              isPending={isPending || isActiveLoading}
            />
          </div>
        </div>
      </Card>

      {/* Today's Focus KPI Stats */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Performance Today</h2>
        <FocusStats summary={summary} isLoading={isSummaryLoading} />
      </div>

      {/* Recent Focus Session History */}
      <div className="space-y-3">
        <FocusHistoryList />
      </div>

      {/* Session Configuration Dialog Modal */}
      <FocusConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onStart={handleStartCustomSession}
        isPending={isPending}
      />
    </div>
  );
};
