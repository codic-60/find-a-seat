# Campus Free Classroom Finder

## What I’ll build
- Replace the blank page with a focused black-and-purple classroom finder for SRM Tiruchirappalli.
- Show today’s live campus time, a natural-language search box, quick duration choices, and structured day/time controls.
- Parse requests such as “a room for me and my team for the next 2 hours” without inventing details.
- Return only rooms whose full requested time window is unoccupied, with clear “free until” information and source confidence.
- Include all ten Drive PDFs and treat lunch and tea breaks as searchable free time.
- Add a compact weekly room view so students can inspect availability before walking to another floor.

## Timetable handling
- Use the classroom venues and temporary rooms explicitly visible in the supplied PDFs.
- Model both timetable formats accurately: 2026–27 uses 09:00–16:50 periods; first-year 2024–25 sheets use slightly different times through 17:05.
- Treat the main venue as occupied for scheduled class cells and account for classes moved to explicitly named labs or training rooms.
- Mark the older first-year source clearly, since you chose to include it.
- Keep capacity and floor filtering unavailable until you provide the exact room-to-floor and seating-capacity list; no estimates will be shown.

## Interaction and design
- Use a dark near-black canvas, vivid purple actions, crisp white type, and restrained lavender accents.
- Make results fast to scan on phones: room number, status, available window, next class, and timetable source.
- Add example-query chips and useful empty/error states without unnecessary explanatory sections.
- Use subtle motion for result changes while respecting reduced-motion settings.

## Technical details
- Keep schedule data and deterministic availability calculations in dedicated client-safe modules.
- Interpret common phrases locally, including “now,” “next class,” durations, weekdays, and explicit times.
- Use Asia/Kolkata as the campus timezone and Monday–Friday timetable rules.
- Add route-specific page metadata and verify the core search flow at desktop and mobile widths.
