# Interactive 3D Classroom Finder

## Build
- Add an interactive seven-floor 3D building view using React Three Fiber, preserving the existing black-and-purple visual system.
- Color rooms by live timetable status: green when free for the selected window, red when occupied, and muted when filtered out.
- Let students rotate/zoom the model, switch floors, and click a room to inspect it.
- Show a live second-by-second countdown to the selected room's next scheduled class.
- Add a local “Claim room” action and a “Call the Squad” button that opens WhatsApp with the exact room and free-until time pre-filled.
- Keep the existing timetable filters, deterministic availability rules, weekly view, and natural-language parsing.

## Technical details
- Use React Three Fiber with procedural building geometry; no external model or runtime asset dependency.
- Keep timetable facts in the existing deterministic room data module.
- Claims are device-local and do not imply exclusive booking; WhatsApp sharing uses a generated `wa.me` link.
- Keep the 3D scene client-only while retaining the rest of the page’s server rendering.

## Verification
- Check desktop and mobile layouts, room selection, floor switching, countdown updates, claim state, and the generated WhatsApp message.
- Confirm a clean build and no browser errors.
