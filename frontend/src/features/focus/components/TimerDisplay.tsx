import React from "react";
import { Badge } from "@/components/ui/badge";
import type { FocusSession, FocusMode } from "../types/focus";
import { formatTimeSeconds } from "../hooks/useFocusTimer";
import { Target, CheckCircle2, Flame, PauseCircle, Play } from "lucide-react";

interface TimerDisplayProps {
  session: FocusSession | null | undefined;
  formattedTime: string;
  progressPercentage: number;
  isFinished: boolean;
  selectedMode: FocusMode;
  selectedDuration: number; // in seconds
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  session,
  formattedTime,
  progressPercentage,
  isFinished,
  selectedMode,
  selectedDuration,
}) => {
  const currentMode = session ? session.mode : selectedMode;
  const status = session ? session.status : "IDLE";

  // SVG Ring calculation constants
  const size = 300;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const getModeColor = (mode: FocusMode) => {
    switch (mode) {
      case "FOCUS":
        return "text-indigo-500 bg-indigo-500/10 border-indigo-500/30";
      case "SHORT_BREAK":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
      case "LONG_BREAK":
        return "text-amber-500 bg-amber-500/10 border-amber-500/30";
      case "CUSTOM":
        return "text-purple-500 bg-purple-500/10 border-purple-500/30";
    }
  };

  const getRingColor = (mode: FocusMode) => {
    switch (mode) {
      case "FOCUS":
        return "stroke-indigo-500";
      case "SHORT_BREAK":
        return "stroke-emerald-500";
      case "LONG_BREAK":
        return "stroke-amber-500";
      case "CUSTOM":
        return "stroke-purple-500";
    }
  };

  const getModeTitle = (mode: FocusMode) => {
    switch (mode) {
      case "FOCUS":
        return "FOCUS SESSION";
      case "SHORT_BREAK":
        return "SHORT BREAK";
      case "LONG_BREAK":
        return "LONG BREAK";
      case "CUSTOM":
        return "CUSTOM TIMER";
    }
  };

  // Helper to extract populated titles safely
  const taskTitle =
    typeof session?.taskId === "object" && session?.taskId
      ? session.taskId.title
      : null;
  const goalTitle =
    typeof session?.goalId === "object" && session?.goalId
      ? session.goalId.title
      : null;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      {/* Mode Badge */}
      <Badge
        variant="outline"
        className={`px-4 py-1 text-sm font-semibold tracking-wider uppercase border rounded-full ${getModeColor(
          currentMode
        )}`}
      >
        <Flame className="w-4 h-4 mr-1.5 inline-block" />
        {getModeTitle(currentMode)}
      </Badge>

      {/* Main Circular Timer Display */}
      <div className="relative flex items-center justify-center w-[300px] h-[300px]">
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-muted/30"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className={`transition-all duration-500 ease-out ${getRingColor(currentMode)}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2">
          {isFinished ? (
            <div className="flex flex-col items-center animate-fade-in space-y-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-1" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                Session Complete!
              </span>
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {formatTimeSeconds(session?.plannedDuration || selectedDuration)}
              </span>
              <span className="text-xs text-muted-foreground">Great work staying focused!</span>
            </div>
          ) : (
            <>
              {/* Dynamic Status Text */}
              <div className="flex items-center text-xs font-semibold uppercase tracking-widest text-muted-foreground space-x-1">
                {status === "RUNNING" && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1" />
                    <span>Running</span>
                  </>
                )}
                {status === "PAUSED" && (
                  <>
                    <PauseCircle className="w-3.5 h-3.5 text-amber-500 inline-block mr-1" />
                    <span className="text-amber-500">Paused</span>
                  </>
                )}
                {status === "IDLE" && (
                  <>
                    <Play className="w-3.5 h-3.5 text-muted-foreground inline-block mr-1" />
                    <span>Ready</span>
                  </>
                )}
              </div>

              {/* Formatted Countdown Display */}
              <h1 className="text-6xl font-black tracking-tighter text-foreground tabular-nums drop-shadow-sm">
                {session ? formattedTime : formatTimeSeconds(selectedDuration)}
              </h1>

              {/* Planned Target indicator */}
              <span className="text-xs font-medium text-muted-foreground/80 tracking-wide">
                target {formatTimeSeconds(session?.plannedDuration || selectedDuration)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Linked Task & Goal Context Chips */}
      {(taskTitle || goalTitle) && (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-2">
          {taskTitle && (
            <Badge variant="secondary" className="text-xs py-1 px-3 border border-border/50">
              <span className="font-normal text-muted-foreground mr-1">Task:</span>
              <span className="font-semibold text-foreground truncate max-w-[180px]">{taskTitle}</span>
            </Badge>
          )}
          {goalTitle && (
            <Badge variant="secondary" className="text-xs py-1 px-3 border border-border/50">
              <Target className="w-3 h-3 mr-1 text-indigo-500 inline-block" />
              <span className="font-normal text-muted-foreground mr-1">Goal:</span>
              <span className="font-semibold text-foreground truncate max-w-[180px]">{goalTitle}</span>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
