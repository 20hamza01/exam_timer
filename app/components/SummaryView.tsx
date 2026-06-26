"use client";

import type { ExamTimer } from "../hooks/useExamTimer";
import { formatDuration } from "../lib/format";

interface SummaryViewProps {
  timer: ExamTimer;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="mt-1 text-lg font-semibold text-slate-100">{value}</span>
    </div>
  );
}

export default function SummaryView({ timer }: SummaryViewProps) {
  const { perQuestionMs, numQuestions, totalMs, usedMs, finishReason, reset } =
    timer;

  const completed = perQuestionMs.length;
  const average =
    completed > 0
      ? perQuestionMs.reduce((a, b) => a + b, 0) / completed
      : 0;
  const fastest = completed > 0 ? Math.min(...perQuestionMs) : 0;
  const slowest = completed > 0 ? Math.max(...perQuestionMs) : 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {finishReason === "timeup" ? "Time's up!" : "Exam complete"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {completed} of {numQuestions} questions answered
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Time used" value={formatDuration(usedMs)} />
        <Stat label="Allotted" value={formatDuration(totalMs)} />
        <Stat label="Avg / question" value={formatDuration(average)} />
        <Stat
          label="Remaining"
          value={formatDuration(Math.max(0, totalMs - usedMs))}
        />
        <Stat label="Fastest" value={formatDuration(fastest)} />
        <Stat label="Slowest" value={formatDuration(slowest)} />
      </div>

      <button
        onClick={reset}
        className="rounded-xl bg-sky-600 px-4 py-4 text-lg font-semibold text-white transition active:scale-[0.98] hover:bg-sky-500"
      >
        New exam
      </button>
    </div>
  );
}
