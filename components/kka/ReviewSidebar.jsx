"use client";

import { useState } from "react";
import { CheckCircle2, Circle, MessageSquareText, Clock, UserCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function ReviewNote({ note, onToggleResolve, canResolve }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn(
      "rounded-lg border transition-all",
      note.isResolved
        ? "border-green-200 bg-green-50/50"
        : "border-slate-200 bg-white"
    )}>
      {/* Note Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canResolve) onToggleResolve?.(note.id);
          }}
          disabled={!canResolve}
          className={cn(
            "mt-0.5 shrink-0 transition-colors",
            canResolve ? "cursor-pointer hover:scale-110" : "cursor-default"
          )}
        >
          {note.isResolved
            ? <CheckCircle2 className="h-5 w-5 text-green-500" />
            : <Circle className="h-5 w-5 text-slate-400" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "text-sm font-semibold",
              note.isResolved ? "text-green-700 line-through opacity-70" : "text-slate-800"
            )}>
              {note.isResolved ? "Sudah diselesaikan" : "Catatan Reviu"}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 text-slate-400 transition-transform",
              open && "rotate-180"
            )} />
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <UserCircle2 className="h-3 w-3" />
              {note.reviewer?.fullName || "Reviewer"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(note.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit", month: "short", year: "numeric"
              })}
            </span>
          </div>
        </div>
      </button>

      {/* Note Content */}
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {note.note}
          </p>
          {!note.isResolved && canResolve && (
            <button
              onClick={() => onToggleResolve?.(note.id)}
              className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5
                text-xs font-semibold text-green-700 transition-all hover:bg-green-100"
            >
              ✓ Tandai Sudah Diselesaikan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewSidebar({ notes = [], kkaStatus, onToggleResolve, userRole }) {
  const canResolve   = userRole === "AUDITOR";
  const totalNotes   = notes.length;
  const resolvedCount = notes.filter((n) => n.isResolved).length;
  const pendingCount  = totalNotes - resolvedCount;

  return (
    <aside className="flex h-full flex-col">
      {/* Sidebar Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Catatan Reviu</h3>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Feedback dari Ketua Tim / Dalnis
        </p>

        {/* Progress bar */}
        {totalNotes > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{resolvedCount}/{totalNotes} diselesaikan</span>
              <span className={pendingCount > 0 ? "text-amber-600 font-medium" : "text-green-600 font-medium"}>
                {pendingCount > 0 ? `${pendingCount} pending` : "Semua selesai ✓"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full bg-green-500 transition-all"
                style={{ width: `${totalNotes ? (resolvedCount / totalNotes) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
            <MessageSquareText className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">Belum ada catatan reviu</p>
            <p className="text-xs mt-1">Catatan dari Ketua Tim / Dalnis akan muncul di sini</p>
          </div>
        ) : (
          notes.map((note) => (
            <ReviewNote
              key={note.id}
              note={note}
              canResolve={canResolve}
              onToggleResolve={onToggleResolve}
            />
          ))
        )}
      </div>

      {/* Status Info */}
      {(kkaStatus === "SUBMITTED" || kkaStatus === "APPROVED") && (
        <div className={cn(
          "border-t p-4 text-xs",
          kkaStatus === "APPROVED"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-blue-200 bg-blue-50 text-blue-700"
        )}>
          {kkaStatus === "APPROVED"
            ? "✓ KKA ini telah disetujui. Tidak ada perubahan yang diizinkan."
            : "ℹ KKA ini sedang dalam proses reviu. Tunggu feedback dari Ketua Tim."
          }
        </div>
      )}
    </aside>
  );
}
