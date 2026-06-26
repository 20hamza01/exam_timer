"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Phase = "setup" | "running" | "summary";
export type FinishReason = "completed" | "timeup" | null;

export interface ExamTimer {
  // --- state ---
  phase: Phase;
  numQuestions: number;
  totalMs: number;
  currentIndex: number; // 0-based index of the question being answered
  questionAllowanceMs: number; // fair-share budget snapshotted for current question
  perQuestionMs: number[]; // recorded time spent on each finished question
  isPaused: boolean;
  finishReason: FinishReason;
  usedMs: number; // total active time used (set when exam ends)

  // --- live display values (kept in state, updated by the tick) ---
  totalRemainingMs: number;
  questionRemainingMs: number;
  isOverBudget: boolean;
  questionsCompleted: number;

  // --- actions ---
  start: (numQuestions: number, totalMs: number) => void;
  next: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * Core exam-pacing logic.
 *
 * Pacing model: each question's countdown is recomputed when it starts as
 *   allowance = remainingTotalTime / remainingQuestions
 * so finishing early banks time for the rest, and going over shrinks the
 * allowance for the questions that follow.
 *
 * All timing is timestamp-based (Date.now() deltas) to avoid interval drift.
 * The timestamps live in refs (read only in effects/handlers, never during
 * render); the values shown on screen are mirrored into state by the tick.
 */
export function useExamTimer(): ExamTimer {
  const [phase, setPhase] = useState<Phase>("setup");
  const [numQuestions, setNumQuestions] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionAllowanceMs, setQuestionAllowanceMs] = useState(0);
  const [perQuestionMs, setPerQuestionMs] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [finishReason, setFinishReason] = useState<FinishReason>(null);
  const [usedMs, setUsedMs] = useState(0);

  const [totalRemainingMs, setTotalRemainingMs] = useState(0);
  const [questionRemainingMs, setQuestionRemainingMs] = useState(0);

  // Timestamp bookkeeping (refs so updates don't themselves trigger renders).
  const examStartRef = useRef(0); // Date.now() when the exam started
  const pausedAccumRef = useRef(0); // total ms spent paused
  const pauseStartRef = useRef<number | null>(null); // Date.now() of current pause
  const questionStartActiveRef = useRef(0); // activeElapsed when current question began
  const allowanceRef = useRef(0); // mirror of questionAllowanceMs for the tick

  /** Active (non-paused) milliseconds elapsed since the exam started. */
  const activeElapsed = useCallback((): number => {
    if (examStartRef.current === 0) return 0;
    const now = Date.now();
    const pausedNow =
      pauseStartRef.current !== null ? now - pauseStartRef.current : 0;
    return now - examStartRef.current - pausedAccumRef.current - pausedNow;
  }, []);

  /** Recompute the on-screen values from the timestamps. */
  const refresh = useCallback(() => {
    const elapsed = activeElapsed();
    setTotalRemainingMs(totalMs - elapsed);
    setQuestionRemainingMs(
      allowanceRef.current - (elapsed - questionStartActiveRef.current),
    );
  }, [activeElapsed, totalMs]);

  const finish = useCallback(
    (reason: Exclude<FinishReason, null>) => {
      const used = Math.min(activeElapsed(), totalMs);
      setUsedMs(used);
      setTotalRemainingMs(totalMs - used);
      setQuestionRemainingMs(0);
      setFinishReason(reason);
      setPhase("summary");
    },
    [activeElapsed, totalMs],
  );

  // Tick loop: refresh ~5x/sec while running, and auto-end when time runs out.
  useEffect(() => {
    if (phase !== "running" || isPaused) return;
    const id = setInterval(() => {
      if (totalMs - activeElapsed() <= 0) {
        finish("timeup");
      } else {
        refresh();
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, isPaused, totalMs, activeElapsed, refresh, finish]);

  const start = useCallback((n: number, duration: number) => {
    examStartRef.current = Date.now();
    pausedAccumRef.current = 0;
    pauseStartRef.current = null;
    questionStartActiveRef.current = 0;
    allowanceRef.current = duration / n;

    setNumQuestions(n);
    setTotalMs(duration);
    setCurrentIndex(0);
    setQuestionAllowanceMs(duration / n);
    setPerQuestionMs([]);
    setIsPaused(false);
    setFinishReason(null);
    setUsedMs(0);
    setTotalRemainingMs(duration);
    setQuestionRemainingMs(duration / n);
    setPhase("running");
  }, []);

  const next = useCallback(() => {
    const elapsed = activeElapsed();
    const spentOnQuestion = elapsed - questionStartActiveRef.current;
    setPerQuestionMs((prev) => [...prev, spentOnQuestion]);

    const isLast = currentIndex >= numQuestions - 1;
    if (isLast) {
      const used = Math.min(elapsed, totalMs);
      setUsedMs(used);
      setTotalRemainingMs(totalMs - used);
      setQuestionRemainingMs(0);
      setFinishReason("completed");
      setPhase("summary");
      return;
    }

    const nextIndex = currentIndex + 1;
    const remainingQuestions = numQuestions - nextIndex;
    const remainingTime = Math.max(0, totalMs - elapsed);
    const newAllowance = remainingTime / remainingQuestions;

    questionStartActiveRef.current = elapsed;
    allowanceRef.current = newAllowance;
    setCurrentIndex(nextIndex);
    setQuestionAllowanceMs(newAllowance);
    setTotalRemainingMs(totalMs - elapsed);
    setQuestionRemainingMs(newAllowance);
  }, [activeElapsed, currentIndex, numQuestions, totalMs]);

  const pause = useCallback(() => {
    if (phase !== "running" || isPaused) return;
    pauseStartRef.current = Date.now();
    setIsPaused(true);
  }, [phase, isPaused]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    if (pauseStartRef.current !== null) {
      pausedAccumRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
    setIsPaused(false);
  }, [isPaused]);

  const reset = useCallback(() => {
    examStartRef.current = 0;
    pausedAccumRef.current = 0;
    pauseStartRef.current = null;
    questionStartActiveRef.current = 0;
    allowanceRef.current = 0;

    setPhase("setup");
    setNumQuestions(0);
    setTotalMs(0);
    setCurrentIndex(0);
    setQuestionAllowanceMs(0);
    setPerQuestionMs([]);
    setIsPaused(false);
    setFinishReason(null);
    setUsedMs(0);
    setTotalRemainingMs(0);
    setQuestionRemainingMs(0);
  }, []);

  return {
    phase,
    numQuestions,
    totalMs,
    currentIndex,
    questionAllowanceMs,
    perQuestionMs,
    isPaused,
    finishReason,
    usedMs,

    totalRemainingMs,
    questionRemainingMs,
    isOverBudget: questionRemainingMs < 0,
    questionsCompleted: perQuestionMs.length,

    start,
    next,
    pause,
    resume,
    reset,
  };
}
