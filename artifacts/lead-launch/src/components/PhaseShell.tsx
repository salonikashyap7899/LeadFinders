import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function PhaseShell({
  title,
  subtitle,
  children,
  onPrev,
  onNext,
  nextLabel = "Next →",
  nextDisabled = false,
  prevDisabled = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
}) {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "clamp(26px, 3.5vw, 38px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          color: "var(--ll-text)",
          margin: 0,
        }}>
          {title}
        </h1>
        <p style={{
          color: "var(--ll-muted)",
          marginTop: 10,
          fontSize: 14,
          maxWidth: 600,
          lineHeight: 1.7,
        }}>
          {subtitle}
        </p>
      </header>

      <div>{children}</div>

      {/* Bottom Nav Bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 232, right: 0, zIndex: 40,
        background: "rgba(7,8,15,0.92)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(124,58,237,0.12)",
        padding: "12px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={prevDisabled || !onPrev}
          style={{
            height: 40, paddingLeft: 16, paddingRight: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: onPrev && !prevDisabled ? "var(--ll-text)" : "#374151",
            fontWeight: 500,
          }}
        >
          <ChevronLeft style={{ height: 16, width: 16, marginRight: 4 }} />
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={nextDisabled || !onNext}
          style={{
            height: 40, paddingLeft: 24, paddingRight: 24, fontWeight: 600,
            background: nextDisabled || !onNext
              ? "rgba(124,58,237,0.2)"
              : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: nextDisabled || !onNext ? "#4b5563" : "white",
            border: "none",
            boxShadow: !nextDisabled && onNext ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
            transition: "all 0.15s",
          }}
        >
          {nextLabel}
          <ChevronRight style={{ height: 16, width: 16, marginLeft: 4 }} />
        </Button>
      </div>
    </div>
  );
}
