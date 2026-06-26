"use client";

import { useState } from "react";

interface SetupFormProps {
  onStart: (numQuestions: number, totalMs: number) => void;
}

export default function SetupForm({ onStart }: SetupFormProps) {
  const [questions, setQuestions] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const numQuestions = parseInt(questions, 10);
  const h = parseInt(hours, 10) || 0;
  const m = parseInt(minutes, 10) || 0;
  const totalMs = (h * 60 + m) * 60 * 1000;

  const perQuestionSeconds =
    numQuestions > 0 && totalMs > 0
      ? Math.round(totalMs / numQuestions / 1000)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(numQuestions) || numQuestions < 1) {
      setError("Enter a valid number of questions (at least 1).");
      return;
    }
    if (totalMs <= 0) {
      setError("Enter a total exam duration greater than zero.");
      return;
    }
    setError(null);
    onStart(numQuestions, totalMs);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Exam Timer</h1>
        <p className="mt-2 text-sm text-slate-400">
          Pace yourself question by question.
        </p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-300">
          Number of questions
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          placeholder="e.g. 90"
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-lg outline-none focus:border-sky-500"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-slate-300">
          Total duration
        </legend>
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-lg outline-none focus:border-sky-500"
            />
            <span className="text-center text-xs text-slate-400">hours</span>
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="90"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-lg outline-none focus:border-sky-500"
            />
            <span className="text-center text-xs text-slate-400">minutes</span>
          </label>
        </div>
      </fieldset>

      {perQuestionSeconds !== null && (
        <p className="text-center text-sm text-slate-400">
          ≈{" "}
          <span className="font-semibold text-sky-400">
            {perQuestionSeconds}s
          </span>{" "}
          per question
        </p>
      )}

      {error && <p className="text-center text-sm text-rose-400">{error}</p>}

      <button
        type="submit"
        className="rounded-xl bg-sky-600 px-4 py-4 text-lg font-semibold text-white transition active:scale-[0.98] hover:bg-sky-500"
      >
        Start exam
      </button>
    </form>
  );
}
