import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useApp, type Screen } from "@/lib/store";

export function ScreenHeader({
  title,
  back,
  right,
}: {
  title: string;
  back?: Screen;
  right?: ReactNode;
}) {
  const setScreen = useApp((s) => s.setScreen);
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-lg">
      {back ? (
        <button
          onClick={() => setScreen(back)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : (
        <div className="h-10 w-10 shrink-0" />
      )}
      <h1 className="min-w-0 truncate text-center font-display text-lg">{title}</h1>
      <div className="shrink-0">{right ?? <div className="h-10 w-10" />}</div>
    </header>
  );
}
