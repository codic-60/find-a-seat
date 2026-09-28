export type DayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export type BusyWindow = { start: number; end: number };
export type RoomSchedule = {
  room: string;
  cohort: string;
  sourceYear: "2024–25" | "2026–27";
  schedule: Partial<Record<DayName, BusyWindow[]>>;
};

export const DAYS: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const allDays = (windows: BusyWindow[]): Partial<Record<DayName, BusyWindow[]>> =>
  Object.fromEntries(DAYS.map((day) => [day, windows]));

const currentMorning = [{ start: 540, end: 750 }];
const currentAfternoon = [{ start: 800, end: 1010 }];
const firstYearFull = [{ start: 540, end: 1025 }];

export const ROOM_SCHEDULES: RoomSchedule[] = [
  {
    room: "IST 602",
    cohort: "I ECE-A · II BME",
    sourceYear: "2024–25",
    schedule: allDays(firstYearFull),
  },
  {
    room: "IST 609",
    cohort: "I ECE-B / EEE",
    sourceYear: "2024–25",
    schedule: allDays(firstYearFull),
  },
  {
    room: "IST 502",
    cohort: "I ECE-DS",
    sourceYear: "2024–25",
    schedule: allDays(firstYearFull),
  },
  {
    room: "IST 702",
    cohort: "I Biotech-B / BME",
    sourceYear: "2024–25",
    schedule: allDays(firstYearFull),
  },
  {
    room: "IST 416",
    cohort: "II ECE-DS A",
    sourceYear: "2026–27",
    schedule: allDays(currentMorning),
  },
  {
    room: "IST 411",
    cohort: "II ECE-DS B",
    sourceYear: "2026–27",
    schedule: allDays(currentAfternoon),
  },
  {
    room: "IST 211",
    cohort: "III BME",
    sourceYear: "2026–27",
    schedule: allDays(currentAfternoon),
  },
  {
    room: "IST 518",
    cohort: "III ECE A & B",
    sourceYear: "2026–27",
    schedule: {
      Monday: [...currentMorning, ...currentAfternoon],
      Tuesday: [...currentMorning, ...currentAfternoon],
      Wednesday: [...currentMorning, ...currentAfternoon],
      Thursday: [...currentMorning, ...currentAfternoon],
      Friday: currentMorning,
    },
  },
  {
    room: "IST 519",
    cohort: "III ECE-DS",
    sourceYear: "2026–27",
    schedule: allDays(currentMorning),
  },
  {
    room: "IST 225",
    cohort: "IV ECE A",
    sourceYear: "2026–27",
    schedule: {
      Monday: [{ start: 540, end: 590 }, { start: 650, end: 750 }],
      Tuesday: currentMorning,
      Wednesday: [{ start: 540, end: 590 }, { start: 650, end: 750 }],
      Thursday: currentMorning,
      Friday: currentMorning,
    },
  },
  {
    room: "IST 227",
    cohort: "IV ECE B",
    sourceYear: "2026–27",
    schedule: allDays(currentMorning),
  },
];

export function formatMinutes(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(2026, 0, 1, hour, minute));
}

export function getNextBusy(windows: BusyWindow[], from: number) {
  return windows.find((window) => window.start >= from);
}

export function isFree(windows: BusyWindow[], start: number, end: number) {
  return !windows.some((window) => start < window.end && end > window.start);
}