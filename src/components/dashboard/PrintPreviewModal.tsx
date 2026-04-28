import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Printer, AlertTriangle, BookOpen } from "lucide-react";

interface PrintPreviewModalProps {
  journalCount: number;
  onClose: () => void;
  onConfirmPrint: () => void;
}

/**
 * Shows a scaled-down thumbnail of the current `.print-region` so the user can
 * sanity-check the print layout before triggering window.print().
 *
 * Also surfaces a warning if the journal section would be empty in the printout.
 */
export function PrintPreviewModal({ journalCount, onClose, onConfirmPrint }: PrintPreviewModalProps) {
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [thumbnailHtml, setThumbnailHtml] = useState<string>("");

  useEffect(() => {
    // Capture the current print-region HTML at modal open time
    const region = document.querySelector(".print-region");
    if (region) {
      setThumbnailHtml(region.outerHTML);
    }
  }, []);

  const journalEmpty = journalCount === 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-label="Print preview"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[640px] max-w-[92vw] max-h-[88vh] bg-card border border-border rounded-xl overflow-hidden flex flex-col"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Printer size={14} className="text-primary" />
            <p className="font-mono text-xs tracking-widest uppercase text-primary">Print Preview</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close print preview"
            className="text-muted-foreground hover:text-foreground p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {journalEmpty && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3"
            >
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-mono font-bold text-amber-500">
                  Journal section is empty
                </p>
                <p className="text-[11px] font-mono text-muted-foreground mt-1">
                  No reflections will be included in the printed report. Add entries from the
                  Journal panel (J) before printing if you want them attached.
                </p>
              </div>
            </div>
          )}

          {!journalEmpty && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <BookOpen size={12} className="text-primary" />
              <span>
                <span className="text-primary font-bold">{journalCount}</span> journal{" "}
                {journalCount === 1 ? "reflection" : "reflections"} will be included.
              </span>
            </div>
          )}

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Layout Thumbnail
            </p>
            <div className="rounded-lg border border-border bg-muted/20 overflow-hidden h-[360px] relative">
              {thumbnailHtml ? (
                <div
                  ref={thumbnailRef}
                  aria-hidden="true"
                  className="absolute top-0 left-0 origin-top-left pointer-events-none select-none"
                  style={{
                    transform: "scale(0.32)",
                    width: "calc(100% / 0.32)",
                    height: "calc(100% / 0.32)",
                  }}
                  dangerouslySetInnerHTML={{ __html: thumbnailHtml }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs font-mono text-muted-foreground">
                    No print region detected.
                  </p>
                </div>
              )}
            </div>
            <p className="text-[10px] font-mono text-muted-foreground/60 mt-2 italic">
              Browser print dialog applies the @media print stylesheet; final pagination may differ.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-[11px] font-mono text-muted-foreground hover:text-foreground border border-border hover:border-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono text-primary border border-primary/40 bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <Printer size={12} />
            Print Now
          </button>
        </div>
      </motion.div>
    </>
  );
}
