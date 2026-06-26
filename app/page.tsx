"use client";

import { useExamTimer } from "./hooks/useExamTimer";
import SetupForm from "./components/SetupForm";
import TimerView from "./components/TimerView";
import SummaryView from "./components/SummaryView";

export default function Home() {
  const timer = useExamTimer();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-8">
      {timer.phase === "setup" && <SetupForm onStart={timer.start} />}
      {timer.phase === "running" && <TimerView timer={timer} />}
      {timer.phase === "summary" && <SummaryView timer={timer} />}
    </main>
  );
}
