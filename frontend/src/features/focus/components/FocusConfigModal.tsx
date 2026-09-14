import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useGoals, useGoal } from "@/features/goals/hooks/useGoals";
import type { CreateFocusSessionInput, FocusMode } from "../types/focus";
import { Play, Clock, Target, CheckSquare, X, AlignLeft } from "lucide-react";

interface FocusConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (input: CreateFocusSessionInput) => void;
  isPending: boolean;
}

export const FocusConfigModal: React.FC<FocusConfigModalProps> = ({
  isOpen,
  onClose,
  onStart,
  isPending,
}) => {
  const [mode, setMode] = useState<FocusMode>("FOCUS");
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>("25");
  const [title, setTitle] = useState<string>("Focus Session");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { data: tasksData } = useTasks({ limit: 100 });
  const { data: goalsData } = useGoals({ limit: 100 });
  const { data: selectedGoalDetails } = useGoal(selectedGoalId);

  const tasks = tasksData?.tasks || [];
  const goals = goalsData?.goals || [];
  const milestones = selectedGoalDetails?.milestones || [];

  // Reset milestone if goal changes
  useEffect(() => {
    setSelectedMilestoneId("");
  }, [selectedGoalId]);

  // Adjust default duration when mode changes
  const handleModeChange = (newMode: FocusMode) => {
    setMode(newMode);
    if (newMode === "FOCUS") {
      setDurationMinutes(25);
      setCustomMinutesInput("25");
      setTitle("Focus Session");
    } else if (newMode === "SHORT_BREAK") {
      setDurationMinutes(5);
      setCustomMinutesInput("5");
      setTitle("Short Break");
    } else if (newMode === "LONG_BREAK") {
      setDurationMinutes(15);
      setCustomMinutesInput("15");
      setTitle("Long Break");
    } else {
      setTitle("Custom Focus");
    }
  };

  const handlePresetSelect = (mins: number) => {
    setDurationMinutes(mins);
    setCustomMinutesInput(mins.toString());
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomMinutesInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 1440) {
      setDurationMinutes(parsed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) return;

    onStart({
      mode,
      plannedDuration: Math.round(durationMinutes * 60),
      title: title.trim() || "Focus Session",
      taskId: selectedTaskId || null,
      goalId: selectedGoalId || null,
      milestoneId: selectedMilestoneId || null,
      notes: notes.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold">Configure Focus Session</h2>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Focus Mode
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button
                type="button"
                variant={mode === "FOCUS" ? "default" : "outline"}
                className={`w-full justify-start text-xs ${
                  mode === "FOCUS" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""
                }`}
                onClick={() => handleModeChange("FOCUS")}
              >
                Focus (25m)
              </Button>
              <Button
                type="button"
                variant={mode === "SHORT_BREAK" ? "default" : "outline"}
                className={`w-full justify-start text-xs ${
                  mode === "SHORT_BREAK" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                }`}
                onClick={() => handleModeChange("SHORT_BREAK")}
              >
                Short Break (5m)
              </Button>
              <Button
                type="button"
                variant={mode === "LONG_BREAK" ? "default" : "outline"}
                className={`w-full justify-start text-xs ${
                  mode === "LONG_BREAK" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
                }`}
                onClick={() => handleModeChange("LONG_BREAK")}
              >
                Long Break (15m)
              </Button>
              <Button
                type="button"
                variant={mode === "CUSTOM" ? "default" : "outline"}
                className={`w-full justify-start text-xs ${
                  mode === "CUSTOM" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""
                }`}
                onClick={() => handleModeChange("CUSTOM")}
              >
                Custom
              </Button>
            </div>
          </div>

          {/* Duration Presets & Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Planned Duration (Minutes)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[15, 25, 30, 45, 60].map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  size="sm"
                  variant={durationMinutes === mins ? "secondary" : "ghost"}
                  className={`text-xs border ${
                    durationMinutes === mins ? "border-primary font-bold" : "border-border"
                  }`}
                  onClick={() => handlePresetSelect(mins)}
                >
                  {mins} min
                </Button>
              ))}
              <div className="flex items-center space-x-1.5 ml-auto">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={customMinutesInput}
                  onChange={handleCustomDurationChange}
                  className="w-20 px-2.5 py-1 text-sm font-semibold border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="text-xs text-muted-foreground font-medium">min</span>
              </div>
            </div>
          </div>

          {/* Session Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete ORM Chapter"
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Optional Task Linking */}
          <div className="space-y-1.5">
            <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CheckSquare className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              Associate Task (Optional)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">-- No Task Linked --</option>
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title} ({task.status})
                </option>
              ))}
            </select>
          </div>

          {/* Optional Goal Linking */}
          <div className="space-y-1.5">
            <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Target className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              Associate Goal (Optional)
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">-- No Goal Linked --</option>
              {goals.map((goal) => (
                <option key={goal._id} value={goal._id}>
                  {goal.title} ({goal.progress}%)
                </option>
              ))}
            </select>
          </div>

          {/* Milestone Selection (if Goal is selected) */}
          {selectedGoalId && milestones.length > 0 && (
            <div className="space-y-1.5 pl-4 border-l-2 border-primary/40">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Milestone
              </label>
              <select
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">-- No Specific Milestone --</option>
                {milestones.map((ms) => (
                  <option key={ms._id} value={ms._id}>
                    {ms.title} {ms.status === "COMPLETED" ? "(Completed)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <AlignLeft className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What do you plan to achieve during this session?"
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6"
              disabled={isPending || durationMinutes <= 0}
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Start Focus Session
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
