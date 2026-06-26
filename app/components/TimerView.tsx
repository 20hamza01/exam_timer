"use client";

import type { ExamTimer } from "../hooks/useExamTimer";
import { formatClock } from "../lib/format";

interface TimerViewProps {
  timer: ExamTimer;
}

export default function TimerView({ timer }: TimerViewProps) {
  const {
    currentIndex,
    numQuestions,
    questionRemainingMs,
    questionAllowanceMs,
    totalRemainingMs,
    isOverBudget,
    isPaused,
    questionsCompleted,
    next,
    pause,
    resume,
    reset,
  } = timer;

  // Color state for the per-question countdown.
  const warnThreshold = questionAllowanceMs * 0.25;
  let countdownColor = "text-emerald-400";
  if (isOverBudget) countdownColor = "text-rose-500";
  else if (questionRemainingMs <= warnThreshold) countdownColor = "text-amber-400";

  const progress = (questionsCompleted / numQuestions) * 100;
  const isLast = currentIndex >= numQuestions - 1;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between text-sm text-slate-400">
        <span className="font-medium text-slate-200">
          Question {currentIndex + 1}{" "}
          <span className="text-slate-500">/ {numQuestions}</span>
        </span>
        <span>
          Total left:{" "}
          <span className="font-semibold tabular-nums text-slate-200">
            {formatClock(totalRemainingMs)}
          </span>
        </span>
      </header>

      {/* Progress bar of completed questions */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Primary per-question countdown */}
      <div className="flex flex-col items-center gap-1 py-6">
        <span className="text-xs uppercase tracking-widest text-slate-500">
          {isOverBudget ? "Over budget" : "Time for this question"}
        </span>
        <span
          className={`font-mono text-7xl font-bold tabular-nums ${countdownColor}`}
        >
          {formatClock(questionRemainingMs)}
        </span>
        <span className="text-sm text-slate-500">
          budget {formatClock(questionAllowanceMs)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <button
          onClick={next}
          className="rounded-xl bg-sky-600 px-4 py-5 text-xl font-semibold text-white transition active:scale-[0.98] hover:bg-sky-500"
        >
          {isLast ? "Finish exam" : "Next question →"}
        </button>

        <div className="flex gap-3">
          <button
            onClick={isPaused ? resume : pause}
            className="flex-1 rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-200 transition active:scale-[0.98] hover:bg-slate-800"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={reset}
            className="flex-1 rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-400 transition active:scale-[0.98] hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      {isPaused && (
        <p className="text-center text-sm font-medium text-amber-400">
          Paused
        </p>
      )}
    </div>
  );
}
