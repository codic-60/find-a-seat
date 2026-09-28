import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Building2, CalendarDays, Clock3, Info, MapPin, Search, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DAYS, formatMinutes, getNextBusy, isFree, ROOM_SCHEDULES, type DayName } from "@/lib/rooms";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roomly — Find a Free Classroom at SRM Trichy" },
      { name: "description", content: "Find an available SRM Tiruchirappalli classroom for your next study session." },
      { property: "og:title", content: "Roomly — SRM Trichy Classroom Finder" },
      { property: "og:description", content: "Check timetable-based classroom availability in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CAMPUS_OPEN = 540;
const CAMPUS_CLOSE = 1025;

function campusNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    day: read("weekday") as DayName,
    minutes: Number(read("hour")) * 60 + Number(read("minute")),
  };
}

function parseQuery(query: string, fallbackDay: DayName, fallbackStart: number, fallbackDuration: number) {
  const lowered = query.toLowerCase();
  const day = DAYS.find((item) => lowered.includes(item.toLowerCase())) ?? fallbackDay;
  const durationMatch = lowered.match(/(\d+(?:\.\d+)?)\s*(hour|hr|hours|hrs|minute|min|minutes|mins)/);
  const durationValue = durationMatch?.[1];
  const durationUnit = durationMatch?.[2];
  const duration = durationValue && durationUnit
    ? Math.round(Number(durationValue) * (durationUnit.startsWith("h") ? 60 : 1))
    : fallbackDuration;
  const timeMatch = lowered.match(/(?:at|from)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  let start = fallbackStart;
  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2] ?? 0);
    if (timeMatch[3] === "pm" && hour < 12) hour += 12;
    if (timeMatch[3] === "am" && hour === 12) hour = 0;
    start = hour * 60 + minute;
  }
  return { day, start, duration: Math.min(Math.max(duration, 30), 240) };
}

function toInputTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function Index() {
  const initial = campusNow();
  const validInitialDay = DAYS.includes(initial.day) ? initial.day : "Monday";
  const validInitialTime = Math.min(Math.max(initial.minutes, CAMPUS_OPEN), CAMPUS_CLOSE - 30);
  const [now, setNow] = useState(initial);
  const [query, setQuery] = useState("Find a quiet classroom for my team for the next 2 hours");
  const [day, setDay] = useState<DayName>(validInitialDay);
  const [start, setStart] = useState(validInitialTime);
  const [duration, setDuration] = useState(120);
  const [submitted, setSubmitted] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(campusNow()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const end = start + duration;
  const results = useMemo(() => ROOM_SCHEDULES.filter((room) => isFree(room.schedule[day] ?? [], start, end)), [day, start, end]);

  function runSearch(text = query) {
    const parsed = parseQuery(text, day, start, duration);
    setDay(parsed.day);
    setStart(parsed.start);
    setDuration(parsed.duration);
    setSubmitted(true);
    setSelectedRoom(null);
  }

  const currentLabel = `${now.day} · ${formatMinutes(now.minutes)} IST`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5 font-display text-lg font-bold" aria-label="Roomly home">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Building2 size={17} /></span>
            Roomly
          </a>
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" /><span className="relative inline-flex size-2 rounded-full bg-success" /></span>
            <span className="hidden sm:inline">Campus time</span> {currentLabel}
          </div>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden border-b border-border/70">
        <div className="grid-pattern absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="mb-8 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-primary"><Sparkles size={14} /> SRM Tiruchirappalli</div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Stop searching floors.<br /><span className="text-primary">Find a room now.</span></h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Tell Roomly when and for how long. It checks every supplied timetable before suggesting a classroom.</p>
          </div>

          <div className="search-shell max-w-4xl rounded-lg border border-border bg-card p-2 shadow-2xl shadow-primary/10">
            <div className="flex items-start gap-3 px-3 py-3 sm:items-center">
              <Search className="mt-1 shrink-0 text-primary sm:mt-0" size={20} />
              <textarea value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); runSearch(); } }} rows={2} className="min-h-12 flex-1 resize-none bg-transparent text-base leading-6 outline-none placeholder:text-muted-foreground sm:min-h-0 sm:py-2" aria-label="Describe the classroom you need" />
              <Button onClick={() => runSearch()} className="hidden sm:inline-flex">Find rooms <ArrowRight size={16} /></Button>
            </div>
            <Button onClick={() => runSearch()} className="w-full sm:hidden">Find rooms <ArrowRight size={16} /></Button>
          </div>

          <div className="mt-3 flex max-w-4xl flex-wrap gap-2">
            {["Free for 1 hour now", "Room after lunch for 90 minutes", "Friday at 3:10 pm for 2 hours"].map((example) => (
              <button key={example} onClick={() => { setQuery(example); runSearch(example); }} className="rounded-md border border-border bg-secondary/70 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">{example}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="mb-7 grid gap-3 sm:grid-cols-3">
          <label className="control-label"><span><CalendarDays size={15} /> Day</span><select value={day} onChange={(event) => { setDay(event.target.value as DayName); setSubmitted(true); }} className="control-input">{DAYS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="control-label"><span><Clock3 size={15} /> Start time</span><input type="time" min="09:00" max="17:05" step="300" value={toInputTime(start)} onChange={(event) => { const parts = event.target.value.split(":").map(Number); const hours = parts[0]; const minutes = parts[1]; if (hours === undefined || minutes === undefined) return; setStart(hours * 60 + minutes); setSubmitted(true); }} className="control-input" /></label>
          <label className="control-label"><span><Clock3 size={15} /> Duration</span><select value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setSubmitted(true); }} className="control-input"><option value={30}>30 minutes</option><option value={60}>1 hour</option><option value={90}>1.5 hours</option><option value={120}>2 hours</option><option value={180}>3 hours</option><option value={240}>4 hours</option></select></label>
        </div>

        <div className="mb-7 flex flex-wrap items-center gap-3 border-y border-border py-4">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Coming with room data</span>
          <button disabled className="inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"><MapPin size={14} /> Floor</button>
          <button disabled className="inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"><Users size={14} /> Capacity</button>
        </div>

        {end > CAMPUS_CLOSE ? (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-5 text-sm text-warning">This session ends after 5:05 PM, outside the supplied timetable hours. Choose an earlier start or shorter duration.</div>
        ) : submitted && (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-sm text-muted-foreground">{day} · {formatMinutes(start)}–{formatMinutes(end)}</p><h2 className="mt-1 font-display text-2xl font-bold">{results.length} room{results.length === 1 ? "" : "s"} available</h2></div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><Info size={14} /> Timetable-based availability</p>
            </div>
            {results.length ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {results.map((room, index) => {
                  const windows = room.schedule[day] ?? [];
                  const next = getNextBusy(windows, end);
                  return (
                    <article key={room.room} className="room-card group rounded-lg border border-border bg-card p-5" style={{ animationDelay: `${index * 45}ms` }}>
                      <div className="mb-6 flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">Classroom</p><h3 className="mt-1 font-display text-2xl font-bold">{room.room}</h3></div><span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">AVAILABLE</span></div>
                      <div className="space-y-3 border-t border-border pt-4 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Free window</span><span className="font-medium">until {next ? formatMinutes(next.start) : "day end"}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Timetable</span><span className="text-right font-medium">{room.cohort}</span></div></div>
                      <button onClick={() => setSelectedRoom(selectedRoom === room.room ? null : room.room)} className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-sm font-semibold text-primary">Weekly view <ArrowRight size={15} className={`transition-transform ${selectedRoom === room.room ? "rotate-90" : ""}`} /></button>
                      {selectedRoom === room.room && <div className="mt-4 grid grid-cols-5 gap-1" aria-label={`${room.room} weekly availability`}>{DAYS.map((item) => <div key={item} className="text-center"><span className="block text-[10px] text-muted-foreground">{item.slice(0, 2)}</span><span className={`mt-1 block h-8 rounded-sm ${isFree(room.schedule[item] ?? [], start, end) ? "bg-success/20" : "bg-muted"}`} /></div>)}</div>}
                      {room.sourceYear === "2024–25" && <p className="mt-4 text-xs text-warning">Older 2024–25 source included</p>}
                    </article>
                  );
                })}
              </div>
            ) : <div className="rounded-lg border border-border bg-card px-5 py-10 text-center"><h3 className="font-display text-xl font-bold">No full-window match</h3><p className="mt-2 text-sm text-muted-foreground">Try a shorter session or another start time.</p></div>}
          </>
        )}
      </section>
      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">Schedules sourced from the 10 timetables you supplied · Asia/Kolkata time</footer>
    </main>
  );
}
