import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';

export const CALENDARS = {
  important: {
    label: 'Critical Manipulated',
    dot: 'bg-[#92681b]',
    chip: 'bg-[#92681b]/10 text-[#92681b] border border-[#92681b]/30 hover:bg-[#92681b]/20 shadow-xs',
  },
  work: {
    label: 'Authentic Verified',
    dot: 'bg-[#02755c]',
    chip: 'bg-[#02755c]/10 text-[#02755c] border border-[#02755c]/30 hover:bg-[#02755c]/20 shadow-xs',
  },
  meetings: {
    label: 'Video Temporal',
    dot: 'bg-[#6e78d5]',
    chip: 'bg-[#6e78d5]/10 text-[#6e78d5] border border-[#6e78d5]/30 hover:bg-[#6e78d5]/20 shadow-xs',
  },
  social: {
    label: 'Acoustic / Voice',
    dot: 'bg-[#6d6b6b]',
    chip: 'bg-[#ececef] text-[#1b1b1b] border border-[#e8e8e8] hover:bg-[#d9dcea] shadow-xs',
  },
  personal: {
    label: 'Compliance Review',
    dot: 'bg-[#a3a1a1]',
    chip: 'bg-[#ececef] text-[#71737a] border border-[#e8e8e8] hover:bg-[#d9dcea] shadow-xs',
  },
};

const TODAY = new Date();
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});
const shortMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
});
const longDayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}

function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseIsoDate(str) {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const m = minutes || '00';
  const ampm = h >= 12 ? 'pm' : 'am';
  const formattedH = h % 12 || 12;
  return `${formattedH}:${m}${ampm}`;
}

function formatWeekRange(start) {
  const weekStart = startOfWeek(start);
  const weekEnd = addDays(weekStart, 6);
  return `${shortMonthFormatter.format(weekStart)} ${weekStart.getDate()} – ${shortMonthFormatter.format(weekEnd)} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
}

const Calendar1 = ({
  className,
  events: initialEvents = [],
  onEventClick,
  onEventSave,
  onEventDelete,
}) => {
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState('month');
  const [anchor, setAnchor] = useState(new Date());
  const [draft, setDraft] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dropDate, setDropDate] = useState(null);

  // Sync initialEvents when passed in from parent API
  React.useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  const days = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(anchor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const start = startOfWeek(firstOfMonth);
    return Array.from({ length: 35 }, (_, i) => addDays(start, i));
  }, [anchor, view]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    for (const [date, dayEvents] of map.entries()) {
      dayEvents.sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
    }
    return map;
  }, [events]);

  const isEditing = Boolean(draft?.id);

  const hasTimeError = Boolean(
    draft?.start && draft?.end && draft.start >= draft.end,
  );

  const step = (direction) => {
    setAnchor((current) => {
      if (view === 'month') {
        return new Date(
          current.getFullYear(),
          current.getMonth() + direction,
          1,
        );
      }
      return addDays(current, direction * 7);
    });
  };

  const openNewEvent = (date) => {
    setDraft({
      title: '',
      description: '',
      date,
      start: '10:00',
      end: '11:00',
      calendar: 'work',
    });
  };

  const openEvent = (event) => {
    setDraft({
      id: event.id,
      analysisId: event.analysisId,
      title: event.title,
      description: event.description ?? '',
      date: event.date,
      start: event.start ?? '',
      end: event.end ?? '',
      calendar: event.calendar,
      trustScore: event.trustScore,
      predictedClass: event.predictedClass,
      riskLevel: event.riskLevel,
      fileHash: event.fileHash,
    });
    if (onEventClick) onEventClick(event);
  };

  const updateDraft = (patch) => {
    setDraft((current) => (current ? { ...current, ...patch } : null));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft || hasTimeError) return;
    const saved = {
      id: draft.id ?? String(Date.now()),
      title: draft.title.trim() || 'Untitled Audit',
      description: draft.description.trim(),
      date: draft.date,
      start: draft.start || undefined,
      end: draft.end || undefined,
      calendar: draft.calendar,
      analysisId: draft.analysisId,
      trustScore: draft.trustScore,
      predictedClass: draft.predictedClass,
      riskLevel: draft.riskLevel,
      fileHash: draft.fileHash,
    };
    setEvents((current) => {
      const idx = current.findIndex((item) => item.id === saved.id);
      if (idx === -1) return [...current, saved];
      const next = [...current];
      next[idx] = saved;
      return next;
    });
    if (onEventSave) onEventSave(saved);
    setDraft(null);
  };

  const handleDelete = () => {
    if (!draft?.id) return;
    if (onEventDelete) onEventDelete(draft.id);
    setEvents((current) => current.filter((item) => item.id !== draft.id));
    setDraft(null);
  };

  const handleDrop = (dragEvent, date) => {
    dragEvent.preventDefault();
    if (draggingId) {
      setEvents((current) =>
        current.map((item) =>
          item.id === draggingId ? { ...item, date } : item,
        ),
      );
    }
    setDraggingId(null);
    setDropDate(null);
  };

  return (
    <section
      className={cn(
        'flex h-auto min-h-[640px] max-h-[820px] w-full flex-col overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-xs text-[#1b1b1b]',
        className,
      )}
    >
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-[#e8e8e8] px-4 sm:px-6 bg-[#fbfbfb]">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-base sm:text-lg font-semibold font-display text-[#1b1b1b]">
            Forensic Audit Timeline •{' '}
            {view === 'month'
              ? monthFormatter.format(anchor)
              : formatWeekRange(anchor)}
          </h2>
          <div className="flex shrink-0 items-center gap-1 ml-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={view === 'month' ? 'Previous month' : 'Previous week'}
              onClick={() => step(-1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={view === 'month' ? 'Next month' : 'Next week'}
              onClick={() => step(1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <button
              onClick={() => setAnchor(new Date())}
              className="ml-1 px-2.5 py-1 text-xs font-mono-code font-medium rounded-[6px] border border-[#e8e8e8] bg-white hover:bg-[#ececef] text-[#1b1b1b] transition-colors shadow-xs"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar Category Legend and Mode Selector */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono-code">
            <span className="flex items-center gap-1 text-[#71737a]">
              <span className="w-2 h-2 rounded-full bg-[#92681b]" /> Manipulated
            </span>
            <span className="flex items-center gap-1 text-[#71737a]">
              <span className="w-2 h-2 rounded-full bg-[#02755c]" /> Authentic
            </span>
          </div>

          <div className="flex items-center p-1 rounded-[6px] bg-[#ececef] border border-[#e8e8e8] text-xs font-mono-code font-medium">
            {['month', 'week'].map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={view === mode}
                onClick={() => setView(mode)}
                className={cn(
                  'rounded-[4px] px-3 py-1 capitalize transition-all cursor-pointer',
                  view === mode
                    ? 'bg-white text-[#1b1b1b] font-medium shadow-xs'
                    : 'text-[#71737a] hover:text-[#1b1b1b]',
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="sticky top-0 z-10 grid min-w-[720px] grid-cols-7 border-b border-[#e8e8e8] bg-[#fbfbfb]">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="flex h-9 items-center justify-end border-r border-[#e8e8e8] px-3 text-xs font-mono-code font-medium uppercase tracking-wider text-[#71737a] last:border-r-0"
            >
              {weekday}
            </div>
          ))}
        </div>

        <div
          className="grid min-w-[720px] flex-1 grid-cols-7"
          style={{
            gridTemplateRows: `repeat(${days.length / 7}, minmax(${view === 'month' ? '6.8rem' : '18rem'}, 1fr))`,
          }}
        >
          {days.map((date) => {
            const iso = toIsoDate(date);
            const dayEvents = eventsByDay.get(iso) ?? [];
            const isOutside =
              view === 'month' && date.getMonth() !== anchor.getMonth();
            const isToday = iso === toIsoDate(TODAY);

            return (
              <div
                key={iso}
                onClick={(clickEvent) => {
                  if (clickEvent.target.closest('button')) return;
                  openNewEvent(iso);
                }}
                onDragOver={(dragEvent) => {
                  if (!draggingId) return;
                  dragEvent.preventDefault();
                  setDropDate(iso);
                }}
                onDrop={(dragEvent) => handleDrop(dragEvent, iso)}
                className={cn(
                  'group flex min-h-0 cursor-pointer flex-col gap-1 border-r border-b border-[#e8e8e8] px-2 pt-1.5 pb-2 transition-colors hover:bg-[#fbfbfb] [&:nth-child(7n)]:border-r-0',
                  isOutside && 'bg-[#fbfbfb]/50 text-[#71737a]/50',
                  dropDate === iso && 'bg-[#d9dcea]/20',
                )}
              >
                <div className="flex items-center justify-end gap-1.5 text-xs font-mono-code">
                  {date.getDate() === 1 ? (
                    <span className="font-semibold text-[#71737a]">
                      {shortMonthFormatter.format(date)}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full font-medium',
                      isOutside && 'text-[#71737a]/50',
                      isToday &&
                        'bg-[#6e78d5] font-semibold text-white shadow-xs',
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-0.5">
                  {dayEvents.map((event) => {
                    const calConfig = CALENDARS[event.calendar] || CALENDARS.work;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        draggable
                        onDragStart={(dragEvent) => {
                          dragEvent.dataTransfer.effectAllowed = 'move';
                          dragEvent.dataTransfer.setData('text/plain', event.id);
                          setDraggingId(event.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropDate(null);
                        }}
                        onClick={() => openEvent(event)}
                        title={`${event.title} (${event.start || 'All day'})`}
                        className={cn(
                          'flex h-6.5 w-full shrink-0 items-center gap-1.5 rounded-[4px] px-1.5 text-left text-[11px] font-medium transition-all',
                          calConfig.chip,
                          draggingId === event.id && 'opacity-40',
                        )}
                      >
                        <span
                          className={cn(
                            'h-3.5 w-1 shrink-0 rounded-full',
                            calConfig.dot,
                          )}
                        />
                        <span className="min-w-0 truncate font-mono-code text-[10.5px]">
                          {event.start ? (
                            <span className="mr-1 text-[#71737a] font-normal">
                              {formatTime(event.start)}
                            </span>
                          ) : null}
                          {event.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => openNewEvent(iso)}
                  className="mt-auto flex h-5 items-center justify-center gap-1 rounded text-[10px] font-mono-code text-[#71737a] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#6e78d5] hover:bg-[#d9dcea]/30"
                >
                  <Plus className="w-3 h-3" />
                  Audit
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Audit Detail & Scheduler Sheet */}
      <Sheet
        open={draft !== null}
        onOpenChange={(open) => !open && setDraft(null)}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? (
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#6e78d5]" />
                  Forensic Audit Record
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#6e78d5]" />
                  Schedule Forensic Audit
                </span>
              )}
            </SheetTitle>
            <SheetDescription>
              {draft
                ? longDayFormatter.format(parseIsoDate(draft.date))
                : 'Log or review a forensic verification event.'}
            </SheetDescription>
          </SheetHeader>

          {draft ? (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* If this is an existing audit report from database */}
              {draft.analysisId && (
                <div className="p-4 rounded-xl bg-[#fbfbfb] border border-[#e8e8e8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code text-[#71737a] font-medium uppercase">
                      Forensic Verdict
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-mono-code font-medium uppercase border',
                        draft.predictedClass === 'authentic'
                          ? 'bg-[#02755c]/10 text-[#02755c] border-[#02755c]/30'
                          : 'bg-[#92681b]/10 text-[#92681b] border-[#92681b]/30',
                      )}
                    >
                      {draft.predictedClass || 'ANALYZED'}
                    </span>
                  </div>

                  {draft.trustScore !== undefined && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display font-semibold text-[#1b1b1b]">
                        {draft.trustScore}
                        <span className="text-sm font-normal text-[#71737a]">/100</span>
                      </span>
                      <span className="text-xs text-[#71737a] font-mono-code">
                        Trust Score
                      </span>
                    </div>
                  )}

                  {draft.fileHash && (
                    <div className="text-[10px] font-mono-code text-[#71737a] truncate">
                      SHA256: {draft.fileHash}
                    </div>
                  )}

                  <Link
                    to={`/analysis/${draft.analysisId}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-[6px] bg-[#6e78d5] hover:bg-[#5d67c8] text-white font-medium text-xs transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Full Forensic Verification Report
                  </Link>
                </div>
              )}

              <form id="calendar1-event-form" onSubmit={handleSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="calendar1-title">Media / Audit Title</FieldLabel>
                    <Input
                      id="calendar1-title"
                      value={draft.title}
                      onChange={(event) =>
                        updateDraft({ title: event.target.value })
                      }
                      placeholder="e.g. biometric_cctv_frame.jpg"
                      required
                      autoFocus
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="calendar1-description">Forensic Notes & Findings</FieldLabel>
                    <Textarea
                      id="calendar1-description"
                      value={draft.description}
                      onChange={(event) =>
                        updateDraft({ description: event.target.value })
                      }
                      placeholder="Verified 2D FFT spectral peaks and CMOS sensor noise residuals..."
                      rows={3}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="calendar1-date">Audit Date</FieldLabel>
                    <Input
                      id="calendar1-date"
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        updateDraft({ date: event.target.value })
                      }
                      required
                    />
                  </Field>

                  <Field data-invalid={hasTimeError || undefined}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel htmlFor="calendar1-start">Starts</FieldLabel>
                        <Input
                          id="calendar1-start"
                          type="time"
                          value={draft.start}
                          onChange={(event) =>
                            updateDraft({ start: event.target.value })
                          }
                        />
                      </div>
                      <div>
                        <FieldLabel htmlFor="calendar1-end">Ends</FieldLabel>
                        <Input
                          id="calendar1-end"
                          type="time"
                          value={draft.end}
                          onChange={(event) =>
                            updateDraft({ end: event.target.value })
                          }
                        />
                      </div>
                    </div>
                    <FieldDescription>
                      {hasTimeError
                        ? 'End time must be after start time.'
                        : 'Optional scheduled timestamp window.'}
                    </FieldDescription>
                  </Field>

                  <div className="space-y-2 pt-1">
                    <span className="block text-xs font-semibold text-[#71737a] tracking-wide font-mono-code uppercase">
                      Classification
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(CALENDARS).map((id) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={draft.calendar === id}
                          onClick={() => updateDraft({ calendar: id })}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono-code transition-all cursor-pointer',
                            draft.calendar === id
                              ? 'border-[#6e78d5] bg-[#6e78d5] text-white font-medium shadow-xs'
                              : 'border-[#e8e8e8] bg-white text-[#71737a] hover:bg-[#ececef]',
                          )}
                        >
                          <span
                            className={cn(
                              'size-2 rounded-full',
                              CALENDARS[id].dot,
                            )}
                          />
                          {CALENDARS[id].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </div>
          ) : null}

          <SheetFooter className="flex-row justify-between gap-2 border-t border-[#e8e8e8]">
            {isEditing ? (
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDraft(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" form="calendar1-event-form">
                {isEditing ? 'Save Changes' : 'Schedule Audit'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export { Calendar1 };
export default Calendar1;
