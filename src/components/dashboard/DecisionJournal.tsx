import { useState, useEffect, useRef } from "react";
import { X, BookOpen, Plus, Trash2, Download } from "lucide-react";
import type { Decision } from "@/data/decisions";

interface JournalEntry {
  id: string;
  decisionId: string;
  text: string;
  createdAt: string;
  timestamp: number;
}

interface DecisionJournalProps {
  decision: Decision;
  onClose: () => void;
}

const STORAGE_KEY = "atlas-journal-entries";

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota errors
  }
}

function formatTs(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function DecisionJournal({ decision, onClose }: DecisionJournalProps) {
  const [allEntries, setAllEntries] = useState<JournalEntry[]>(loadEntries);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<"this" | "all">("this");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist on every change
  useEffect(() => {
    saveEntries(allEntries);
  }, [allEntries]);

  const entries = filter === "this"
    ? allEntries.filter((e) => e.decisionId === decision.id)
    : allEntries;

  // Sort newest first
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  function handleAdd() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const entry: JournalEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      decisionId: decision.id,
      text: trimmed,
      createdAt: formatTs(Date.now()),
      timestamp: Date.now(),
    };
    setAllEntries((prev) => [entry, ...prev]);
    setDraft("");
    textareaRef.current?.focus();
  }

  function handleDelete(id: string) {
    setAllEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleExport() {
    const exportEntries = filter === "this"
      ? allEntries.filter((e) => e.decisionId === decision.id)
      : allEntries;

    const lines = [
      "═".repeat(60),
      "  ATLAS DECISION JOURNAL",
      `  Exported: ${formatTs(Date.now())}`,
      `  Dilemma: ${filter === "this" ? decision.title : "All Dilemmas"}`,
      "═".repeat(60),
      "",
    ];
    const sorted = [...exportEntries].sort((a, b) => b.timestamp - a.timestamp);
    sorted.forEach((e) => {
      lines.push(`  [${e.createdAt}]`);
      lines.push(`  Dilemma: ${e.decisionId}`);
      lines.push(`  ${e.text}`);
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas-journal-${filter === "this" ? decision.id : "all"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden animate-float-up"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-primary" />
          <p className="font-mono text-xs tracking-widest uppercase text-primary">Decision Journal</p>
          {allEntries.length > 0 && (
            <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {allEntries.length} {allEntries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5">
            {(["this", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                  filter === f
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "this" ? "This Dilemma" : "All Dilemmas"}
              </button>
            ))}
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-secondary"
            >
              <Download size={10} />
              Export
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Dilemma context strip */}
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-lg px-4 py-2.5">
          <span className="text-base shrink-0">⚖</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold font-display text-primary truncate">{decision.title}</p>
            <p className="text-[10px] font-mono text-muted-foreground truncate">{decision.keyTension.slice(0, 80)}…</p>
          </div>
        </div>

        {/* Compose area */}
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
            }}
            placeholder={`Reflect on "${decision.title}"… (Cmd+Enter to save)`}
            rows={3}
            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 resize-none leading-relaxed transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground/40">
              {wordCount > 0 ? `${wordCount} word${wordCount !== 1 ? "s" : ""}` : "Start typing…"}
            </span>
            <button
              onClick={handleAdd}
              disabled={!draft.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all border disabled:opacity-40 disabled:cursor-not-allowed border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60"
            >
              <Plus size={11} />
              Add Reflection
            </button>
          </div>
        </div>

        {/* Entries list */}
        {sorted.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen size={28} className="text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm font-mono text-muted-foreground">
              {filter === "this" ? "No entries for this dilemma yet." : "No journal entries yet."}
            </p>
            <p className="text-xs font-mono text-muted-foreground/50 mt-1">
              Write your first reflection above.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {sorted.map((entry) => {
              // Find the decision title for "all" view
              const isCurrentDecision = entry.decisionId === decision.id;
              return (
                <div
                  key={entry.id}
                  className={`group relative border rounded-lg px-4 py-3 transition-colors ${
                    isCurrentDecision
                      ? "bg-primary/5 border-primary/20 hover:border-primary/35"
                      : "bg-muted/20 border-border/60 hover:border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {filter === "all" && !isCurrentDecision && (
                        <p className="text-[9px] font-mono text-muted-foreground/60 mb-1 truncate">
                          {entry.decisionId.replace(/-/g, " ")}
                        </p>
                      )}
                      <p className="text-sm text-foreground/90 leading-relaxed font-mono whitespace-pre-wrap break-words">
                        {entry.text}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-negative p-1 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground/40 mt-2">{entry.createdAt}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Export a hook that Index.tsx can use to get entry count for badge
export function useJournalCount(decisionId?: string): number {
  const [count, setCount] = useState(() => {
    const entries = loadEntries();
    return decisionId ? entries.filter((e) => e.decisionId === decisionId).length : entries.length;
  });

  useEffect(() => {
    function sync() {
      const entries = loadEntries();
      setCount(decisionId ? entries.filter((e) => e.decisionId === decisionId).length : entries.length);
    }
    // Sync on storage events (cross-tab) and when decisionId changes
    window.addEventListener("storage", sync);
    sync();
    return () => window.removeEventListener("storage", sync);
  }, [decisionId]);

  return count;
}
