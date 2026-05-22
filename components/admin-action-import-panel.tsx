import { Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AdminActionImportPanel({
  text,
  message,
  isImporting,
  onTextChange,
  onImport
}: {
  text: string;
  message: string;
  isImporting: boolean;
  onTextChange: (text: string) => void;
  onImport: () => void;
}) {
  return (
    <aside className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <FileText className="h-4 w-4 text-emerald-700" aria-hidden />
          Import from free text
        </div>
        <p className="text-sm text-slate-500">Paste policy notes to fill the draft fields.</p>
      </header>
      <label className="space-y-2 text-sm font-medium text-slate-700">
        Source text
        <Textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="The city council approved a $2M investment to convert all street lighting to LED by 2027..."
          className="min-h-56 bg-white"
        />
      </label>
      <div className="space-y-3">
        <Button type="button" variant="secondary" className="w-full" onClick={onImport} disabled={isImporting}>
          <Sparkles className="h-4 w-4" aria-hidden />
          {isImporting ? "Extracting..." : "Extract action"}
        </Button>
        {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      </div>
    </aside>
  );
}
