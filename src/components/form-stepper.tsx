import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: Step[];
  current: number;
  onJump?: (i: number) => void;
}) {
  const progress = ((current + 1) / steps.length) * 100;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-[0.15em]">
          Step {current + 1} of {steps.length}
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="hidden gap-2 md:flex md:flex-wrap">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onJump?.(i)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : done
                      ? "border-primary/30 bg-primary-soft text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
                    active ? "bg-primary-foreground text-primary" : done ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {done ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : i + 1}
                </span>
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
