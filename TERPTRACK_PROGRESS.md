# TerpTrack Progress Log

Goal name: TerpTrack Definitive UMD Planner

This file tracks each implementation pass toward making TerpTrack a polished, individualized UMD degree, course-finding, GenEd, recommendation, automatic planning, class timing, and weekly scheduling app.

## Long-Term End Goals

- Real four-year schedules for every supported UMD major, progressing from freshman intro courses through senior 400-level work.
- Requirement-group correctness for every generated major, with complete core, supporting, upper-level, GenEd, elective, and credit-target tracking.
- Niche elective placement that is visible, individualized by interests, spread across exploration/build/senior phases, and backed by direct replacement actions.
- Live-course grounding: generated required courses must match PlanetTerp title/credit data and rendered previews must recover cleanly when any live source is slow.
- Posted-section scheduling: real class meetings, seats, waitlists, conflicts, timing preferences, registration readiness, Testudo handoff, calendar export, and advisor packet coverage.
- Individualization: onboarding, interests, preferred departments, career goals, prior credit, saved searches, recommendations, and smart class replacement should shape plans without hiding requirements.
- Accounts and collaboration: local-first profiles, Vercel/Supabase readiness, friend invites, shared plans, shared free time, meeting planning, and clear setup checks.
- Beautiful simple UI: mobile-first workflows, no accidental overflow, dense but readable operational screens, and consistent cache-verified assets.
- Release discipline: every pass updates this file, runs focused tests plus full release checks, runs random live PlanetTerp validation, keeps `README.md` untouched, commits, and pushes `main`.

## 2026-06-29 Pass 1

Focus: turn the existing degree tracker into a fuller scheduling app by adding live section times, weekly calendar planning, conflict detection, and persisted per-semester section choices.

Planned changes:
- Add a dedicated Schedule tab with semester/term controls.
- Fetch live UMD section meeting data from `api.umd.io` when a term has posted sections.
- Persist selected sections per semester and include them in exports, snapshots, and share links.
- Auto-pick non-conflicting sections using open seats and waitlist counts as basic heuristics.
- Show selected section/time summaries back on course rows.
- Verify the app locally in the browser after implementation.

Completed:
- Added the Schedule tab and weekly builder UI.
- Added UMD term inference from plan semesters, plus posted-term loading from `api.umd.io`.
- Added live section fetching with a short timeout so the UI falls back cleanly when the API stalls or a future term is not posted.
- Added persisted `selectedSections` and `schedulePrefs` state.
- Included schedule picks in import/export, share URLs, and snapshots.
- Cleared stale section picks when a major template replaces the schedule.
- Added auto-pick for available no-conflict sections, scored by open seats, waitlist, and real meeting times.
- Added conflict detection and weekly calendar rendering.
- Added selected section/time chips on course rows in the Plan view.
- Tightened mobile layout for the Schedule tab and topbar.

Verification:
- Ran `node --check` across every file in `js/`.
- Served the app locally at `http://localhost:5173`.
- Opened the app in the in-app browser and skipped onboarding for the test session.
- Confirmed Schedule tab loads Fall 2026 plan courses and 264 live sections from the UMD API.
- Confirmed auto-pick selected 4 of 5 schedule-ready first-semester courses with 0 conflicts; the remaining course had no posted section in the loaded data.
- Confirmed selected section times render back on Plan course rows.
- Checked a 390px-wide viewport: schedule cards stack, summary is two columns, the weekly board scrolls intentionally, and no unintended horizontal overflow remains.

Next pass candidates:
- Add drag/drop or ranked alternatives inside each course's section picker.
- Add class-location clustering and commute gap warnings.
- Let students pin "no classes before/after" preferences before auto-pick.
- Improve automatic multi-semester planning from remaining degree requirements, not just current template course lists.

## 2026-06-29 Pass 2

Focus: make the Schedule tab more individualized by letting students express time/day preferences and by surfacing schedule quality warnings beyond hard conflicts.

Planned changes:
- Add per-semester schedule preferences for earliest start, latest end, avoided weekdays, break time, and optimization style.
- Persist those preferences alongside the selected posted UMD term.
- Update auto-pick scoring so it favors sections that fit the student's preferences while still avoiding conflicts.
- Add schedule quality warnings for preference violations, tight building changes, and long idle gaps.
- Verify with JavaScript checks and browser interaction.

Completed:
- Added per-semester preference controls for start-after, end-before, minimum breaks, optimization mode, and avoided weekdays.
- Stored preferences in `schedulePrefs` alongside the posted UMD term without losing existing term persistence.
- Reworked section scoring so auto-pick uses open seats, waitlist, real meeting times, timing preferences, avoided days, and compact-day scoring.
- Added warning generation for preference violations, tight cross-course gaps, building changes with very short transitions, and long idle gaps.
- Added visible warning cards and per-section preference notes so students can see why a schedule is imperfect.
- Added responsive styling for the new preference controls and warning panel.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and opened the Schedule tab.
- Confirmed preference controls render with live UMD section data.
- Set start-after 10:00am, end-before 5:00pm, compact optimization, and Friday avoidance; cleared picks and auto-picked again.
- Confirmed auto-pick selected 4 of 5 first-semester courses with 0 hard conflicts, preserved the selected preference values, and surfaced 5 schedule warnings including unavoidable Friday meetings and tight class gaps.
- Confirmed section cards show per-section preference notes such as "Fits current preferences" and avoided-day warnings.
- Checked a 390px-wide viewport: preference controls stack to one column, summary stays readable, warnings render, and no unintended horizontal overflow remains.

Next pass candidates:
- Add lock/pin controls so a student can freeze one chosen section while auto-picking the rest.
- Add side-by-side alternative schedule generation.
- Add smarter automatic multi-semester degree planning from remaining requirements and GenEd gaps.
- Add walking-time estimates for common building pairs instead of generic tight-gap warnings.

## 2026-06-29 Pass 3

Focus: make section planning iterative by letting students pin must-have sections and generate multiple preference-aware alternatives around those pinned choices.

Planned changes:
- Add per-section pin controls that persist with the selected semester.
- Teach auto-pick to preserve pinned sections and fill only the remaining courses.
- Generate several alternate no-conflict schedules using different section candidates.
- Render alternatives with score, conflicts, warnings, open seats, and quick apply buttons.
- Verify pinned-section behavior and alternate apply flow in the browser.

Completed:
- Added pin/unpin controls to selected section cards.
- Stored pin state on the selected section payload so pins are preserved by existing local state, share, export, and snapshot flows.
- Reworked auto-pick to start from pinned sections and fill the remaining courses around them.
- Added alternate schedule generation with deduping, ranking by conflicts, warnings, score, and open seats.
- Rendered alternate schedule cards with picked count, conflicts, warnings, open seats, pinned count, section summary, and Apply buttons.
- Added apply flow for alternates that preserves pinned sections and updates the weekly calendar plus plan-row summaries.
- Added responsive styling for alternatives and pin controls.

Verification:
- Ran `node --check` across every file in `js/`.
- Opened `http://localhost:5173` in the in-app browser and loaded Schedule with live Fall 2026 UMD section data.
- Pinned CMSC 131 section 0202 and confirmed the card showed pinned state.
- Generated 4 alternate schedules; each preserved the pinned CMSC 131 section and showed metrics.
- Applied alternate schedule option 2 and confirmed CMSC 131 stayed pinned/selected while other section choices changed.
- Ran regular Auto-pick after pinning and confirmed CMSC 131 0202 remained selected with 0 hard conflicts.
- Checked a 390px-wide viewport with alternatives visible: alternatives stack to one column, pinned state remains visible, and no unintended horizontal overflow remains.

Next pass candidates:
- Add side-by-side full-week previews for each alternate schedule card.
- Add walking-time estimates for common building pairs instead of only tight-gap warnings.
- Add remaining-degree automatic planning that proposes which courses to place in future semesters from audit/GenEd gaps.
- Add recommendation ranking that blends prerequisites, GenEd gaps, GPA risk, seat availability, and schedule fit.

## 2026-06-29 Pass 4

Focus: make alternate schedule comparison more visual and make between-class transition warnings account for estimated walking time between common UMD buildings.

Planned changes:
- Add mini weekly previews to each alternate schedule card.
- Add rough walking-time estimates for common UMD building pairs used in section data.
- Replace generic tight-gap warnings with estimated building-change warnings when building data is available.
- Verify alternate previews and walking-aware warnings in the browser.

Completed:
- Added a campus building coordinate map for common rooms in live section data and a lightweight walking-time estimator.
- Updated transition warnings so known building changes compare the actual between-class gap against estimated walk time.
- Kept the generic tight-gap fallback for unknown buildings, online meetings, and TBA rooms.
- Added mini weekly previews to every alternate schedule card, using the same schedule color classes as the main calendar.
- Styled alternate previews as compact five-day calendars that fit inside desktop cards and mobile stacked cards.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and opened the Schedule tab with live Fall 2026 UMD section data.
- Confirmed walking-aware warnings render for HJP to IRB transitions: 10 minute gaps now show an estimated 17 minute walk.
- Generated 4 alternate schedules and confirmed every card rendered a mini weekly preview.
- Confirmed the alternate previews produced 51 visible mini schedule blocks across 4 cards and browser console errors remained at 0.
- Checked a 390px-wide viewport with alternatives visible: cards collapsed to one column, all 4 mini previews remained visible, and no unintended horizontal overflow appeared.

Next pass candidates:
- Add richer course recommendations from remaining degree requirements and GenEd gaps.
- Add seat/watchlist urgency and waitlist risk indicators to section cards.
- Add commuter/work constraints and preferred campus zones to schedule scoring.
- Add printable/shareable weekly schedule output for advisors and students.

## 2026-06-29 Pass 5

Focus: make the Recommendations panel act like a registration intelligence panel instead of a static checklist.

Planned changes:
- Replace the old recommendation buckets with ranked next-course picks.
- Blend prerequisite readiness, downstream unlocks, goal-course impact, GenEd gaps, GPA signals, live section availability, and schedule fit.
- Add direct actions from recommendations into Schedule and GenEd course search workflows.
- Fix any shared GenEd helper issues uncovered by using the recommendation engine on load.
- Verify desktop interaction, live hydration, and mobile layout in the browser.

Completed:
- Rebuilt `js/recommendations.js` around scored Smart next picks that rank available courses by plan impact.
- Hydrated the ranked picks with live UMD section counts, best open-seat signal, and conflict-aware schedule fit using the existing Schedule tab helpers.
- Added GenEd gap buttons that jump directly into GenEd browse/search for missing categories.
- Kept major requirement gap add-actions for auto-generated/custom major templates.
- Added compact recommendation row styling with ranks, score chips, badges, and readable reasons.
- Fixed `getGenEdNeed()` in `js/placeholder-search.js`, which referenced an undefined `d` instead of the found GenEd definition.
- Added query-versioned static asset references for `styles.css`, `js/recommendations.js`, and `js/placeholder-search.js` so updated local/static deployments do not keep stale planner logic.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser with versioned assets.
- Confirmed the Recommendations panel renders `Smart next picks` and `GenEd gaps` instead of the old static recommendation buckets.
- Confirmed 5 ranked picks render with score chips and live badges such as posted section counts, best open seats, average GPA, and downstream unlocks.
- Confirmed live hydration completed for Fall 2026 without leaving loading text or paused/error text.
- Confirmed the first recommendation's Schedule action switches to the Schedule tab, loads 264 posted sections, shows 5 section pickers, and preserves the current 0-conflict schedule summary.
- Checked a 390px-wide viewport: the recommendation cards fit within the main column, GenEd gap buttons remain usable, and no unintended horizontal overflow appeared.
- Browser console errors remained at 0 during desktop, action, and mobile checks.

Next pass candidates:
- Add seat/watchlist urgency and waitlist risk indicators directly to section cards and recommendations.
- Add commuter/work constraints and preferred campus zones to schedule scoring.
- Add printable/shareable weekly schedule output for advisors and students.
- Add automatic future-semester planning that proposes course moves from audit gaps, credit load, prerequisites, and term availability.

## 2026-06-29 Pass 6

Focus: make registration urgency visible by surfacing seat, waitlist, and closure risk wherever students compare schedule options.

Planned changes:
- Add a shared section seat-risk classifier for open seats, waitlists, closed sections, low-seat sections, and unknown seat data.
- Use seat risk in Schedule auto-pick scoring so closed and low-seat sections are less attractive.
- Show seat-risk badges and seat summaries on Schedule section cards.
- Show seat-risk signals in Smart next picks.
- Add seat-risk comparison to alternate schedule cards.
- Verify desktop, schedule action flow, alternatives, and mobile layout in the browser.

Completed:
- Added `sectionSeatRisk()`, shared seat-risk badge rendering, and section-seat overview helpers in `js/schedule.js`.
- Updated section scoring to include the shared seat-risk score, penalizing closed/waitlisted/low-seat sections and rewarding healthier availability.
- Added selected-section seat badges and per-course seat overview rows to Schedule section cards.
- Added seat-safe/seat-risk metrics to alternate schedule cards.
- Updated Smart next picks in `js/recommendations.js` to hydrate and rank with the same seat-risk classifier.
- Added compact shared styles for healthy, watch, risky, closed, and unknown seat states.
- Versioned `styles.css`, `js/schedule.js`, and `js/recommendations.js` in `index.html` for reliable local/static reloads.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser with versioned assets.
- Confirmed Smart next picks render 5 seat-risk badges, including healthy and watch states, with live posted-section data.
- Opened Schedule and confirmed 5 section cards render, selected cards show seat-risk badges, and seat overview rows appear for posted picked sections.
- Generated 4 alternate schedules and confirmed each card includes either `seat-safe` or an explicit seat-risk metric; one generated option showed `1 seat risk`.
- Checked a 390px-wide viewport: Smart next picks and Schedule cards retained risk badges and seat rows without unintended horizontal overflow.
- Browser console errors remained at 0 during recommendation, schedule, alternatives, and mobile checks.

Next pass candidates:
- Add commuter/work constraints and preferred campus zones to schedule scoring.
- Add printable/shareable weekly schedule output for advisors and students.
- Add automatic future-semester planning that proposes course moves from audit gaps, credit load, prerequisites, and term availability.
- Add term-availability hints for future-semester planning so courses are suggested in semesters when they are commonly offered.

## 2026-06-29 Pass 7

Focus: make multi-semester planning automatic enough to catch overloaded terms, prerequisite-order problems, and unresolved GenEd gaps before students reach registration.

Planned changes:
- Turn the static Action Timeline view into a dynamic future-semester planning advisor.
- Compute remaining credit loads, ready/locked course counts, overloaded/underloaded terms, prerequisite order issues, and GenEd gaps from the current plan.
- Suggest concrete course moves across semesters where the move is credit-safe and prerequisite-safe.
- Add one-click move application that updates the mutable schedule and clears stale section picks for moved courses.
- Preserve the existing critical registration timeline underneath the new advisor.
- Verify desktop rendering, move application, GenEd action routing, and mobile layout.

Completed:
- Added `timeline-plan-advisor` to the Timeline view.
- Rebuilt `js/timeline.js` with a planning analyzer for credit loads, prerequisite groups, future term readiness, downstream course dependency risk, and GenEd gaps.
- Added Recommended Moves with direct `Apply move` actions for overloaded/underloaded terms and prerequisite-order issues.
- Added GenEd gap actions that jump into Browse with the relevant GenEd filter selected.
- Added Future Load Map rows showing each future term's remaining credits plus ready/locked counts.
- Preserved the existing registration action timeline below the planning advisor.
- Wired active Timeline refresh into `render()` so plan/status changes keep the advisor current.
- Added responsive planner styles and versioned `styles.css`, `js/render.js`, and `js/timeline.js`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser with versioned assets and opened Action Timeline.
- Confirmed the advisor renders 4 planning stats, 8 future term rows, 3 recommended actions, and the original 5 timeline events.
- Confirmed it detected Fall 2028 as overloaded at 19 credits and suggested moving `GenEd HS-1` to Spring 2029.
- Applied the move: Fall 2028 dropped to 16 credits, Spring 2029 rose to 17 credits, overloaded terms dropped from 1 to 0, and the move action disappeared.
- Confirmed a GenEd action switches to Browse with `DVUP` selected and begins loading DVUP courses.
- Checked a 390px-wide viewport: advisor stats, actions, future load map, and timeline events render with no unintended horizontal overflow.
- Browser console errors remained at 0 during desktop, move action, GenEd action, and mobile checks.

Next pass candidates:
- Add commuter/work constraints and preferred campus zones to schedule scoring.
- Add printable/shareable weekly schedule output for advisors and students.
- Add term-availability hints for future-semester planning so courses are suggested in semesters when they are commonly offered.
- Replace the static Roadmap graph with a dynamic dependency graph generated from the active major and goal courses.

## 2026-06-29 Pass 8

Focus: let students protect real-life commitments such as work, commute, practice, care, or lab windows before auto-picking sections.

Planned changes:
- Add per-semester unavailable-time blocks to the Schedule tab.
- Persist blocked windows in schedule preferences.
- Penalize and warn on sections that overlap unavailable windows.
- Make auto-pick and alternate generation avoid blocked windows when viable alternatives exist.
- Render blocked windows on the weekly schedule and mini alternate previews.
- Verify add/remove flow, blocked-window warnings, auto-pick behavior, alternatives, and mobile layout.

Completed:
- Added an Unavailable Time editor to the Schedule tab with day, start time, end time, label, Add block, and removable block chips.
- Stored blocked windows as `blockedTimes` inside per-semester schedule preferences.
- Added helpers to convert blocked windows into schedule blocks and detect overlaps with real section meetings.
- Added blocked-window warnings to selected section quality notes.
- Updated schedule scoring and candidate generation so sections overlapping unavailable windows are heavily penalized and excluded from no-conflict pools when possible.
- Rendered unavailable blocks as dashed blue blocks on the weekly calendar.
- Added blocked-window visualization and `blocks clear` / block-conflict metrics to alternate schedule cards.
- Added responsive styling for the blocked-time editor and chips.
- Versioned `styles.css` and `js/schedule.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser with versioned Schedule assets.
- Added a temporary Monday 12:00pm-2:00pm `Work` block and confirmed it rendered as a chip and as a dashed weekly calendar block.
- Confirmed existing selected sections surfaced unavailable-time warnings for overlapping CMSC 131 and MATH 140 picks.
- Cleared picks and ran auto-pick; the Work block remained visible and blocked-window warnings dropped to 0 because auto-pick chose sections outside that window.
- Generated 4 alternate schedules and confirmed every card showed `blocks clear`, with 4 blocked mini-preview blocks rendered across the alternatives.
- Removed the temporary Work block and confirmed the Schedule editor returned to `No unavailable windows added.`
- Checked a 390px-wide viewport: the unavailable-time editor stacked to one column, 5 controls remained usable, section cards rendered, and no unintended horizontal overflow appeared.
- Browser console errors remained at 0 during add block, auto-pick, alternatives, remove block, and mobile checks.

Next pass candidates:
- Add preferred campus zones and commute-start/end location scoring.
- Add printable/shareable weekly schedule output for advisors and students.
- Add term-availability hints for future-semester planning so courses are suggested in semesters when they are commonly offered.
- Replace the static Roadmap graph with a dynamic dependency graph generated from the active major and goal courses.

## 2026-06-29 Pass 9

Focus: make section picking account for where a student starts, ends, and prefers to spend time on campus.

Planned changes:
- Add Campus Fit controls to the Schedule tab.
- Persist per-semester preferred campus area, first-class anchor, last-class anchor, and location priority.
- Reuse the existing building-coordinate model to score section locations.
- Warn when picked sections sit outside the preferred campus area.
- Add first-class and last-class commute-anchor warnings to schedule quality checks.
- Show campus-fit/location-alert metrics in alternate schedules.
- Verify preference persistence, auto-pick, alternatives, browser console, and mobile layout.

Completed:
- Added a Campus Fit preference panel with Preferred area, First class from, Last class near, and Location priority controls.
- Added campus zone definitions for North/STEM, Engineering + sciences, Central mall, McKeldin/Library, and South campus/arts.
- Added commute anchors for North residence halls, South residence halls, Stamp transit center, Mowatt/Regents garages, and College Park Metro shuttle.
- Extended schedule preferences with `campusZone`, `commuteStart`, `commuteEnd`, and `locationWeight`.
- Added location helpers for building-to-zone matching, section campus assessment, commute-anchor walking estimates, and candidate-level location reports.
- Updated section scoring to prefer sections in the selected campus area and penalize location mismatches according to priority.
- Added selected-section campus-fit rows that show either a positive fit or the preferred-area mismatch.
- Added first-class and last-class commute warnings to the schedule warnings list.
- Added location-alert / campus-fit metrics to alternate schedule cards.
- Added responsive styling for the Campus Fit panel and section location rows.
- Versioned `styles.css` and `js/schedule.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=9` and `js/schedule.js?v=4` loaded.
- Opened Schedule and confirmed the Campus Fit panel rendered with 4 controls and all expected preferred-area options.
- Selected Engineering + sciences, North residence halls, Stamp transit center, and Strong priority; confirmed the controls updated and selected-section location rows appeared.
- Confirmed schedule warnings included preferred-area mismatches such as CMSC 131 outside Engineering + sciences.
- Generated 4 alternate schedules and confirmed every alternate card showed a location metric; the generated cards reported 3, 5, 11, and 10 location alerts.
- Cleared picks and ran auto-pick under the same campus profile; it picked 4 of 5 available posted sections with 0 conflicts and rendered a mix of warning and positive campus-fit rows.
- Reloaded the app, reopened Schedule, and confirmed the Campus Fit values and selected sections persisted.
- Checked a 390px-wide viewport: Campus Fit stacked to one column, all 4 controls remained usable, 4 location rows rendered, and there was no document-wide horizontal overflow.
- Browser console errors remained at 0 during profile changes, alternatives, auto-pick, reload, and mobile checks.

Next pass candidates:
- Add printable/shareable weekly schedule output for advisors and students.
- Add term-availability hints for future-semester planning so courses are suggested in semesters when they are commonly offered.
- Replace the static Roadmap graph with a dynamic dependency graph generated from the active major and goal courses.
- Add a schedule quality explainer that shows why each auto-picked section won or lost.

## 2026-06-29 Pass 10

Focus: make the built weekly schedule easy to hand off to advisors, roommates, teammates, or family without exporting the entire planner.

Planned changes:
- Add a schedule-specific output panel to the Schedule tab.
- Generate a clean schedule preview with weekly blocks, section rows, preferences, unscheduled courses, and warnings.
- Provide actions for selecting a text summary, downloading a `.txt` summary, and printing the schedule.
- Add print-only styling that isolates the schedule output sheet.
- Verify output rendering, summary selection, text download, print button presence, current-page console state, and mobile layout.

Completed:
- Added `#schedule-output` to the Schedule view.
- Added a reusable schedule output builder in `js/schedule.js`.
- Generated a text summary with plan semester, posted term, picked count, conflicts, warnings, active preferences, picked sections, unscheduled courses, and schedule warnings.
- Added a print-sheet preview with a compact weekly block grid, course table, output metadata, preference summary, unscheduled list, and warning list.
- Added Select summary, Download `.txt`, and Print schedule actions.
- Made Select summary reveal and select a textarea containing the generated schedule summary instead of using blocking clipboard or prompt fallbacks.
- Added direct button listeners after output-panel render so regenerated buttons stay wired.
- Added print CSS for `body.print-schedule` so only the schedule output sheet prints.
- Added responsive output styles: mobile action rows stack, the weekly preview becomes one column, and the output table scrolls internally.
- Versioned `styles.css` and `js/schedule.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=11` and `js/schedule.js?v=12` loaded.
- Opened Schedule and confirmed the output panel rendered with 3 actions, 4 course rows, 5 week days, 13 weekly blocks, an unscheduled-course section, and current Campus Fit preferences.
- Used Select summary and confirmed the output textarea became visible, focused, and selected with an 1,803-character summary beginning with `Terp Track Schedule`.
- Used Download `.txt` and confirmed the action fired with the `Schedule summary downloaded.` toast.
- Confirmed the Print schedule button is present and wired without opening the print dialog during automated verification.
- Confirmed current-page browser console errors were 0 after the final fixed page load and output actions.
- Checked a 390px-wide viewport: output panel stayed within the document width, 3 action buttons remained usable, the weekly preview stacked to one column, the table used internal horizontal scroll, and document-wide overflow stayed at 0.

Next pass candidates:
- Add term-availability hints for future-semester planning so courses are suggested in semesters when they are commonly offered.
- Replace the static Roadmap graph with a dynamic dependency graph generated from the active major and goal courses.
- Add a schedule quality explainer that shows why each auto-picked section won or lost.
- Add advisor-facing PDF export once the schedule output sheet is stable enough for richer formatting.

## 2026-06-29 Pass 11

Focus: warn students when future courses are planned in terms where UMD section availability looks weak.

Planned changes:
- Add an async Term Availability panel to the Action Timeline advisor.
- Infer UMD term codes from planned semesters.
- Check a bounded set of upcoming UMD-coded courses against posted section data.
- Compare not-yet-posted terms against recent same-season offerings.
- Keep the initial Timeline render fast while availability checks load in the background.
- Verify loading state, completed rows, current-page console state, and mobile layout.

Completed:
- Added Timeline term-code helpers and UMD-code filtering.
- Added a bounded availability analyzer that checks up to 10 upcoming unsatisfied UMD-coded courses.
- Used `umdioFetchSemesters()` and `umdioFetchSections()` to compare exact posted terms and recent matching-season terms.
- Added availability levels: likely, watch, and risk.
- Added the Term Availability panel under the Automatic Planning Advisor.
- Added loading, empty, and completed states for availability checks.
- Added responsive styles for availability stats and rows.
- Versioned `styles.css` and `js/timeline.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=12` and `js/timeline.js?v=3` loaded.
- Opened Action Timeline and confirmed the planner advisor still rendered 2 recommended actions and 8 future load-map rows.
- Confirmed the Term Availability panel mounted immediately with `Checking posted UMD sections...`.
- Waited for async checks to finish; the panel reported `10 checked · 4 likely · 0 watch · 6 risk`.
- Confirmed sample rows included posted-section counts such as CMSC 131 with 22 posted Fall 2026 sections and ENGL 101 with 113 posted Fall 2026 sections.
- Confirmed risk rows render for courses with no posted sections or no recent matching-term sections.
- Confirmed current-page browser console errors were 0 after completed availability checks.
- Checked a 390px-wide viewport: availability rows stacked to one column, the panel header stacked cleanly, and document-wide overflow stayed at 0 aside from the existing tab strip.

Next pass candidates:
- Replace the static Roadmap graph with a dynamic dependency graph generated from the active major and goal courses.
- Add a schedule quality explainer that shows why each auto-picked section won or lost.
- Add advisor-facing PDF export once the schedule output sheet is stable enough for richer formatting.
- Add term-availability move suggestions that recommend a better season when a course is risky in its planned term.

## 2026-06-29 Pass 12

Focus: replace the hardcoded prerequisite roadmap with a graph generated from the student's actual plan.

Planned changes:
- Remove the static CMSC/CE-only roadmap.
- Build roadmap nodes from current planned UMD-coded courses, custom courses, prerequisite groups, missing prerequisites, course status, and goal flags.
- Generate prerequisite edges dynamically, including optional OR-group edges.
- Layer nodes automatically by prerequisite depth.
- Add summary stats, legend, default health details, and click-to-inspect course details.
- Verify graph rendering, node interaction, current-page console state, and mobile layout.

Completed:
- Replaced `js/roadmap.js` with a dynamic graph builder.
- Added graph nodes for planned courses and prerequisite placeholders not currently in the plan.
- Added edge classes for satisfied, blocked, and optional prerequisite paths.
- Added automatic layer layout with SVG rendering and keyboard-focusable nodes.
- Added Roadmap summary stats for nodes, dependency links, blocked planned courses, and missing prerequisites.
- Added a legend for complete, ready, locked, missing, and goal states.
- Added a default Roadmap Health detail panel with blocker summaries.
- Added node click/keyboard detail rendering with course title, semester, credits, status, readiness, prerequisites, and unlocked dependents.
- Removed outdated static Roadmap text from `index.html`.
- Added responsive Roadmap styles and versioned `styles.css` and `js/roadmap.js`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=13` and `js/roadmap.js?v=3` loaded.
- Opened Prereq Roadmap and confirmed the graph rendered 37 nodes and 32 dependency links from the active plan.
- Confirmed summary stats rendered 37 courses/prereqs, 32 links, 0 blocked planned courses, and 0 missing prerequisites for the current state.
- Confirmed legend entries rendered for Complete, Ready, Locked, Missing, and Goal.
- Clicked the generated CMSC 131 node and confirmed the detail panel updated with title, Fall 2026 placement, 4 credits, status, readiness, prereqs, and CMSC 132 unlock.
- Confirmed current-page browser console errors were 0 after graph render and node interaction.
- Checked a 390px-wide viewport: Roadmap summary collapsed to two columns, the graph scrolled inside its canvas, the detail panel remained visible, and document-wide overflow stayed at 0 aside from existing tab/canvas scroll.

Next pass candidates:
- Add a schedule quality explainer that shows why each auto-picked section won or lost.
- Add advisor-facing PDF export once the schedule output sheet is stable enough for richer formatting.
- Add term-availability move suggestions that recommend a better season when a course is risky in its planned term.
- Add Roadmap filters for blockers only, major courses, GenEds, and all planned courses.

## 2026-06-29 Pass 13

Focus: explain why a selected section is strong, risky, or beaten by another posted section.

Planned changes:
- Add per-section ranking and reason helpers to the Schedule tab.
- Show a picked section's rank among posted sections under current preferences.
- Show the top matching alternative when the picked section is not ranked first.
- Surface concise reason chips for seats, time preferences, unavailable blocks, and campus fit.
- Verify Schedule rendering, current-page console state, and mobile layout.

Completed:
- Added `sectionDecisionReasons()`, `sectionRankInfo()`, and `renderSectionDecision()` helpers in `js/schedule.js`.
- Used the existing `sectionScore()`, seat-risk classifier, preference notes, blocked-time checks, and campus-fit assessment to explain each picked section.
- Added a decision panel to each picked section card.
- Added reason chips with good, warning, and bad visual states.
- Added responsive styling so the rank/top-match row stacks on mobile.
- Versioned `styles.css` and `js/schedule.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=14` and `js/schedule.js?v=13` loaded.
- Opened Schedule and confirmed 4 picked section cards rendered 4 decision panels.
- Confirmed decision panels rendered 14 reason chips: 6 good and 8 warning in the current Campus Fit profile.
- Confirmed sample output included rank explanations such as `Ranked 2/22 by current preferences`, top-match alternatives, seat counts, avoided-day warnings, campus-fit warnings, and positive campus-fit chips.
- Confirmed current-page browser console errors were 0 after Schedule render.
- Checked a 390px-wide viewport: 4 decision panels remained visible, the explainer header stacked to one column, reason chips wrapped, and document-wide overflow stayed at 0 aside from existing intentional scroll surfaces.

Next pass candidates:
- Add advisor-facing PDF export once the schedule output sheet is stable enough for richer formatting.
- Add term-availability move suggestions that recommend a better season when a course is risky in its planned term.
- Add Roadmap filters for blockers only, major courses, GenEds, and all planned courses.
- Add direct "Apply better section" actions inside section explainers when the top-ranked section is conflict-safe.

## 2026-06-29 Pass 14

Focus: turn section explanations into safe, direct improvement actions.

Planned changes:
- Add an Apply top section action when a picked section is not the highest-ranked posted section.
- Only show the action when the top-ranked section is conflict-safe against other selected sections and unavailable-time blocks.
- Explain why the top-ranked section cannot be auto-applied when it would create a conflict.
- Wire the action into existing selected-section persistence and rerender flows.
- Verify safe apply behavior, conflict guards, current-page console state, and mobile layout.

Completed:
- Added `sectionSwapSafety()` to compare a proposed top section against other picked sections and blocked windows.
- Updated `renderSectionDecision()` to render `Apply top section` only when the top-ranked alternative is safe.
- Added conflict notices such as `Top section not auto-applied: conflicts with CMSC 131` when the top-ranked section would break the current schedule.
- Added `applyBestSectionFromDecision()` to update the selected section from the cached posted-section data, save state, rerender Schedule/Semesters, and confirm the change.
- Added styles for `.section-decision-action` and mobile alignment.
- Versioned `styles.css` and `js/schedule.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=15` and `js/schedule.js?v=14` loaded.
- Opened Schedule and confirmed 4 picked cards rendered 4 decision panels.
- Confirmed 1 safe `Apply top section` button appeared for CMSC 131 and 2 conflict notices appeared for unsafe top matches.
- Applied the CMSC 131 top section; CMSC 131 changed from `CMSC131-0204` to `CMSC131-0202`.
- Confirmed the schedule summary remained at 4/5 picked and 0 time conflicts after applying the top section.
- Confirmed the CMSC 131 decision panel updated to `Ranked 1/22 by current preferences` and the apply button disappeared.
- Confirmed current-page browser console errors were 0 after render, apply, and mobile checks.
- Checked a 390px-wide viewport: decision action rows aligned left, conflict notices stayed readable, 4 decision panels remained visible, and document-wide overflow stayed at 0 aside from existing intentional scroll surfaces.

Next pass candidates:
- Add advisor-facing PDF export once the schedule output sheet is stable enough for richer formatting.
- Add term-availability move suggestions that recommend a better season when a course is risky in its planned term.
- Add Roadmap filters for blockers only, major courses, GenEds, and all planned courses.
- Add an undo affordance after applying a better section.

## 2026-06-29 Pass 15

Focus: turn risky term-availability warnings into concrete better-season move suggestions when the plan has a viable later semester.

Planned changes:
- Extend the Timeline Term Availability analyzer to compare risky courses against later planned semesters.
- Score exact posted sections and recent same-season history for candidate destination semesters.
- Preserve prerequisite order and avoid extreme overloads when suggesting a move.
- Show a `Move there` action inside availability rows when a later term has stronger evidence.
- Keep live availability checks bounded and async.
- Verify live Timeline behavior, controlled suggestion rendering, current-page console state, and mobile layout.

Completed:
- Added `plannerAvailabilityScore()` to score exact posted availability and recent seasonal history.
- Added `plannerAvailabilityDestinationCandidates()` to find later destination semesters that satisfy prereq order and stay within a reasonable credit-load band.
- Added `plannerFindAvailabilityDestination()` to pick the strongest later term for warning/risk rows.
- Added move suggestion data to availability rows.
- Rendered better-season actions with `data-planner-move`, reusing the existing Timeline move handler.
- Added overload caveats such as `would make Spring 2027 19 cr` when a better season needs load balancing.
- Added responsive styles for `.planner-availability-action`.
- Versioned `styles.css` and `js/timeline.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=16` and `js/timeline.js?v=5` loaded.
- Opened Action Timeline and waited for async Term Availability checks to complete.
- Confirmed the live plan rendered 10 availability rows with 9 likely, 1 watch, 0 risk, and 0 move buttons because current UMD data did not expose a stronger safe destination for the remaining watch row.
- Confirmed current-page browser console errors were 0 after completed live availability checks.
- Ran a controlled local Timeline analyzer test with mocked UMD section availability: a Fall-risk `TEST 101` row found Spring 2027 as the better term, rendered `4 posted sections in Spring 2027`, and produced a `Move there` button with `data-planner-move`.
- Checked a 390px-wide viewport: the live availability grid stayed one column, 10 rows remained visible, and document-wide overflow stayed at 0 aside from the existing tab strip.

Next pass candidates:
- Add advisor-facing PDF export once the schedule output sheet is stable enough for richer formatting.
- Add Roadmap filters for blockers only, major courses, GenEds, and all planned courses.
- Add an undo affordance after applying a better section.
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.

## 2026-06-29 Pass 16

Focus: make the dynamic Roadmap easier to inspect by audience and planning problem.

Planned changes:
- Add Roadmap filter controls for all planned courses, blockers, major courses, and GenEds.
- Keep the graph summary and detail panel aligned with the active filter.
- Preserve useful prerequisite context where a filtered node depends on or unlocks another planned course.
- Render a clear empty state when a healthy plan has no blockers.
- Verify desktop interaction, node details, current-page console state, and mobile layout.

Completed:
- Added `ROADMAP_FILTERS`, filter state, and filtered graph derivation in `js/roadmap.js`.
- Recomputed blockers, missing prereqs, ready courses, completed courses, edges, and unlock counts for the active filtered graph.
- Added a Roadmap toolbar with `All planned`, `Blockers`, `Major`, and `GenEds` controls plus a shown/total counter.
- Updated Roadmap summary and default detail headings to use the active filter name.
- Added an empty-state renderer for filters with no matching courses.
- Added responsive toolbar and empty-state styling in `styles.css`.
- Versioned `styles.css` and `js/roadmap.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=17` and `js/roadmap.js?v=4` loaded.
- Opened Prereq Roadmap and confirmed 4 filter controls rendered with `All planned` active by default.
- Confirmed the default Roadmap view showed `37/37 shown`, 37 courses/prereqs, 32 dependency links, 0 blocked planned courses, and 0 missing prereqs.
- Clicked `Blockers` and confirmed the active state, `0/37 shown`, 0 courses, 0 links, and the `No courses match this Roadmap filter.` empty state.
- Clicked `Major` and confirmed the active state, `33/37 shown`, 33 courses/prereqs, 32 dependency links, and no blocker/missing warnings.
- Clicked `GenEds` and confirmed the active state, `8/37 shown`, 8 courses/prereqs, 1 dependency link, and no blocker/missing warnings.
- Returned to `All planned`, clicked the CMSC 131 Roadmap node, and confirmed the detail panel updated to `CMSC 131` with `Unlocks CMSC 132`.
- Confirmed current-page browser console errors were 0 for the Pass 16 URL.
- Checked a 390px-wide viewport: the toolbar counter moved to its own row, the summary rendered as two columns, the graph used internal horizontal scrolling, text was not clipped, and document-wide horizontal overflow stayed at 0.
- Reset the browser viewport to the default 1280px-wide size after mobile verification.

Next pass candidates:
- Add advisor-facing PDF export once the schedule output sheet is stable enough for richer formatting.
- Add an undo affordance after applying a better section.
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add Roadmap filter persistence or a search box when the graph grows beyond the current sample plan size.

## 2026-06-29 Pass 17

Focus: turn the Schedule output into an advisor-ready packet that can be printed to PDF or downloaded as a self-contained HTML file.

Planned changes:
- Preserve the existing schedule-only print/export workflow.
- Add an advisor packet that combines current-term section picks with full multi-semester plan context.
- Include plan totals, GPA/goal status, unscheduled current-term courses, warnings, preferences, and all semester course rows.
- Add a self-contained HTML download action for sending or archiving the advisor packet.
- Keep print CSS separate for schedule-only print vs advisor packet print.
- Verify browser rendering, export action, print CSS separation, current-page console state, and mobile layout.

Completed:
- Added schedule advisor helpers for filename generation, course type/status labels, plan statistics, review status, full-plan rendering, standalone packet CSS, and HTML document generation.
- Extended `buildScheduleOutput()` to return the schedule sheet plus advisor packet HTML, advisor text, self-contained advisor document, and advisor filename.
- Added `Download advisor packet` and `Print advisor PDF` actions to the Schedule output panel.
- Added `downloadScheduleAdvisorPacket()` and `printScheduleAdvisorPacket()` while preserving `Print schedule` as schedule-only.
- Rendered an `Advisor Packet` panel with review flags, stat tiles, current-term follow-up, warnings, preference context, and a `Full Semester Plan` section.
- Added responsive and print-specific styles for advisor stats, packet flags, semester cards, course rows, and print modes.
- Versioned `styles.css` and `js/schedule.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=18` and `js/schedule.js?v=15` loaded.
- Opened Schedule and confirmed live section loading completed with 264 sections loaded.
- Confirmed the Schedule output rendered 5 actions: `Select summary`, `Download .txt`, `Download advisor packet`, `Print schedule`, and `Print advisor PDF`.
- Confirmed the advisor packet rendered `Advisor Packet`, review flags `Needs section choices`, `Fall 2026`, and `Fall 2026`.
- Confirmed the packet showed 8 semester cards, 42 course rows, and `Full Semester Plan 134 planned credits across 8 terms`.
- Confirmed current plan stats in the packet: 0/125 earned credits, 134 planned credits, 4/5 current-term sections picked, 0 conflicts, 16 warnings, 0/3 goal courses, GPA not calculated, 42 GenEd credits in plan, and 1 unscheduled current-term course.
- Clicked `Download advisor packet` and confirmed the Schedule output recorded `advisor-download` and showed `Advisor packet downloaded.`
- Confirmed print CSS separates schedule-only and advisor modes: schedule print hides `.schedule-advisor-packet`, advisor print includes `.schedule-advisor-packet`, advisor block color printing, and a page break after the schedule sheet.
- Confirmed current-page browser console errors were 0 for the Pass 17 URL.
- Checked a 390px-wide viewport: advisor stats rendered as two columns, course rows stacked to one column, the section title stacked, all 8 semester cards remained visible, action buttons wrapped without clipping, document-wide horizontal overflow stayed at 0, and the schedule table kept its intentional internal horizontal scrolling.
- Reset the browser viewport to the default 1280px-wide size after mobile verification.

Next pass candidates:
- Add an undo affordance after applying a better section.
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add Roadmap filter persistence or a search box when the graph grows beyond the current sample plan size.
- Add advisor packet filters for only remaining courses, only GenEds, or only registration-blocking issues.

## 2026-06-30 Pass 18

Focus: make recommended Schedule section swaps reversible so students can safely accept TerpTrack suggestions.

Planned changes:
- Capture the previous picked section before `Apply top section` changes a course.
- Render an inline undo banner after a recommended section swap.
- Restore the exact previous section and pinned state when Undo is clicked.
- Clear stale undo state after unrelated schedule edits.
- Keep the undo affordance out of print/PDF output.
- Verify live apply, undo, restore, current-page console state, and mobile layout.

Completed:
- Added `scheduleUndoAction` state and helper functions for cloning sections, restoring selected sections, registering undo actions, rendering the undo banner, clearing undo, and executing undo.
- Added `#schedule-undo` below the live schedule status area.
- Updated `applyBestSectionFromDecision()` to capture the previous section, preserve previous pinned state, register the undo action, and name the restorable section in the confirmation toast.
- Cleared stale undo state when auto-picking, clearing selections, changing posted term, manually changing a section dropdown, or applying an alternate schedule.
- Added a scoped click handler for the undo banner.
- Styled `.schedule-undo-banner` with a compact action row and mobile stacked layout.
- Hid `.schedule-undo` from printed schedule/advisor packet output.
- Versioned `styles.css` and `js/schedule.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=19` and `js/schedule.js?v=16` loaded.
- Opened Schedule and confirmed the live section load completed with 264 sections loaded.
- Confirmed the saved plan initially had CMSC 131 on `CMSC131-0202` and no undo banner.
- Temporarily selected `CMSC131-0204` through the real section dropdown and confirmed one safe `Apply top section` button appeared for CMSC 131 back to `CMSC131-0202`.
- Clicked `Apply top section` and confirmed CMSC 131 changed to `CMSC131-0202`, the decision panel moved to `Ranked 1/22`, the apply button disappeared, and the undo banner rendered `Previous pick 0204 is ready to restore.`
- Clicked Undo and confirmed CMSC 131 restored to `CMSC131-0204`, the undo banner disappeared, and the `Apply top section` button returned.
- Re-applied `CMSC131-0202` and dismissed the undo banner so the saved plan ended in its original top-section state.
- Checked a 390px-wide viewport with the undo banner visible: the banner stacked to one column, actions aligned left, no text was clipped, and document-wide horizontal overflow stayed at 0.
- Reset the browser viewport to the default 1280px-wide size after mobile verification.
- Confirmed current-page browser console errors were 0 for the Pass 18 URL.

Next pass candidates:
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add Roadmap filter persistence or a search box when the graph grows beyond the current sample plan size.
- Add advisor packet filters for only remaining courses, only GenEds, or only registration-blocking issues.
- Add a compact change history panel for recent schedule moves, section swaps, and term moves.

## 2026-06-30 Pass 19

Focus: make the Roadmap usable for larger majors by adding persistent search and filter preferences.

Planned changes:
- Persist the active Roadmap filter and search query in saved state.
- Carry Roadmap preferences through JSON import/export, share links, and snapshots.
- Add a Roadmap search field that can find courses by code, title, term, status, category, note, or prerequisite text.
- Show matching nodes with connected prerequisite/unlock context instead of isolating a course.
- Highlight matching nodes and show match/context counts.
- Add clear-search behavior and a helpful no-results empty state.
- Verify filter/search persistence, no-results behavior, current-page console state, and mobile layout.

Completed:
- Added `roadmapPrefs` to state defaults and load migration.
- Included `roadmapPrefs` in JSON import, share payloads/shared-plan load, snapshot save, and snapshot restore.
- Added Roadmap preference sync/persistence helpers with debounced search saving.
- Added search token matching across code, normalized code, title, semester, status, kind, category, note, and prerequisite text.
- Added `roadmapSearchGraph()` to keep matching nodes plus one-hop connected prerequisites and unlocks.
- Added search match highlighting to Roadmap node styling.
- Added a Roadmap search input, clear button, and count text to the toolbar.
- Updated default Roadmap details to show search health and matching-node counts.
- Added mobile toolbar wrapping rules for Roadmap search, clear, and count controls.
- Versioned `styles.css`, `js/roadmap.js`, `js/state.js`, `js/io.js`, `js/share.js`, and `js/snapshots.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173` in the in-app browser and confirmed `styles.css?v=20`, `js/roadmap.js?v=5`, `js/state.js?v=2`, `js/io.js?v=2`, `js/share.js?v=2`, and `js/snapshots.js?v=2` loaded.
- Opened Roadmap and confirmed the default state remained `All planned`, empty search, 37/37 shown, 37 nodes, 32 dependency links, and no highlighted search matches.
- Searched `CMSC 351` and confirmed the toolbar showed `5/37 matches - 9 shown with context`, 9 nodes rendered, and 5 matching nodes highlighted.
- Confirmed search details rendered `All planned Search Health`, search stats, and the note that results include matching nodes plus connected prerequisites/unlocks.
- Switched to the `Major` filter with the same query and confirmed `5/33 matches - 9 shown with context`.
- Reloaded the app, reopened Roadmap, and confirmed both `Major` and `CMSC 351` persisted.
- Cleared search and confirmed the Roadmap returned to `33/37 shown in Major`, 33 nodes, no highlighted matches, and no clear button.
- Searched `zzzz-no-course` and confirmed the empty state `No Roadmap courses match "zzzz-no-course" inside Major.` plus 0 nodes and 0 matching nodes.
- Checked a 390px-wide viewport with `CMSC 351` search active: search input and count expanded to full width, clear/control order wrapped correctly, summary stayed two columns, graph used internal horizontal scrolling, no text was clipped, and document-wide horizontal overflow stayed at 0.
- Reset the browser viewport and Roadmap state to `All planned`, empty search, 37/37 shown before finishing.
- Confirmed current-page browser console errors were 0 for the Pass 19 URL.

Next pass candidates:
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add advisor packet filters for only remaining courses, only GenEds, or only registration-blocking issues.
- Add a compact change history panel for recent schedule moves, section swaps, and term moves.
- Add Roadmap jump-to-semester or selected-node centering for very large plans.

## 2026-06-30 Pass 20

Focus: add a Recent Changes audit trail so students can see the schedule and timeline edits they just made.

Planned changes:
- Store a compact recent-change history in saved state.
- Log meaningful entries for Timeline term moves, Schedule auto-picks, alternate applications, manual section picks, pin toggles, clears, best-section swaps, and undo restores.
- Render a Recent Changes panel on Action Timeline with clear-history behavior.
- Carry recent changes through JSON import/export, share links, and snapshots.
- Verify the panel on desktop and mobile, then restore/clear local test state.

Completed:
- Added `recentChanges` to state defaults and load migration with a 12-entry cap.
- Added `recordPlanChange()`, `recentPlanChanges()`, and `clearPlanChanges()` helpers.
- Added Timeline rendering for Recent Changes with typed icons, timestamps, empty state, and a scoped Clear button.
- Logged Timeline recommendation moves before saving moved custom or base-schedule courses.
- Logged Schedule manual section picks/clears, pin/unpin changes, auto-pick runs, alternate schedule applications, clear-picks actions, top-section swaps, and undo restores.
- Included `recentChanges` in shared-plan payloads, shared-plan loading, snapshot save/restore, and import migration; JSON export already serializes full state.
- Added compact Recent Changes styling with mobile header stacking.
- Versioned `styles.css`, `js/state.js`, `js/timeline.js`, `js/schedule.js`, `js/io.js`, `js/share.js`, and `js/snapshots.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173/?pass20=...` in the in-app browser and confirmed `styles.css?v=21`, `js/state.js?v=3`, `js/timeline.js?v=6`, `js/schedule.js?v=17`, `js/io.js?v=3`, `js/share.js?v=3`, and `js/snapshots.js?v=3` loaded.
- Opened Schedule and confirmed CMSC 131 started on `CMSC131-0202`.
- Changed CMSC 131 to `CMSC131-0204` through the real section dropdown and confirmed Action Timeline showed `Picked CMSC 131 0204` with detail `CMSC 131 changed from 0202 to 0204.`
- Restored CMSC 131 to `CMSC131-0202` through the real section dropdown and confirmed the newest Timeline row showed `Picked CMSC 131 0202` with the reverse detail.
- Checked a 390px-wide viewport with two history entries: the history panel stayed inside the viewport, the header stacked to a column, rows remained readable, and document-wide horizontal overflow stayed at 0.
- Clicked Clear and confirmed the panel returned to `No changes logged yet. Apply a move or schedule edit and it will appear here.`
- Reset the browser viewport to the default 1280px-wide size after mobile verification.
- Confirmed CMSC 131 ended restored to `CMSC131-0202`, history ended empty, and current-page browser console errors were 0 for the Pass 20 URL.

Next pass candidates:
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add advisor packet filters for only remaining courses, only GenEds, or only registration-blocking issues.
- Add Roadmap jump-to-semester or selected-node centering for very large plans.
- Add a visible schedule-change digest to advisor packets or exported schedule summaries.

## 2026-06-30 Pass 21

Focus: make advisor packets easier to review by adding persistent packet filters for full plan, remaining work, GenEds, and registration blockers.

Planned changes:
- Add a compact Advisor view control to Schedule Output.
- Filter the advisor packet plan while keeping the weekly schedule summary unchanged.
- Support All, Remaining, Gen-Eds, and Blockers views.
- Show course/credit counts for the active packet view.
- Persist the selected advisor view through reloads, imports, share links, and snapshots.
- Verify filter behavior, persistence, mobile layout, current-page console state, and local checks.

Completed:
- Added `scheduleAdvisorFilter` to state defaults and load migration.
- Included `scheduleAdvisorFilter` in import, share payload/load, snapshot save, and snapshot restore.
- Added advisor filter definitions and normalization helpers.
- Added an Advisor view segmented control above the advisor packet.
- Updated advisor packet generation to render the active view label, view note, shown-course counts, and shown-credit counts.
- Added filtered plan generation for:
  - All: every planned course.
  - Remaining: courses not passed or transferred.
  - Gen-Eds: courses counting toward General Education coverage.
  - Blockers: locked courses, current-term unscheduled courses, conflicts, schedule-warning courses, and failed repeats.
- Kept the downloaded advisor HTML aligned with the active filter.
- Updated the advisor text cache to use the active filter and matching heading.
- Styled the controls for desktop, mobile wrapping, print hiding, and standalone advisor packet notes.
- Versioned `styles.css`, `js/state.js`, `js/schedule.js`, `js/io.js`, `js/share.js`, and `js/snapshots.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173/?pass21=...` in the in-app browser and confirmed `styles.css?v=22`, `js/state.js?v=4`, `js/schedule.js?v=18`, `js/io.js?v=4`, `js/share.js?v=4`, and `js/snapshots.js?v=4` loaded.
- Opened Schedule and confirmed Advisor view controls rendered with All active by default, heading `Full Semester Plan`, and metrics `42/42 courses shown` and `134/134 credits shown`.
- Clicked Gen-Eds and confirmed heading `GenEd Plan`, note `Only courses counting toward General Education coverage.`, metrics `13/42 courses shown` and `42/134 credits shown`, and visible GenEd course codes such as MATH 140, ENGL 101, PHYS 161, and COMM 107.
- Clicked Blockers and confirmed heading `Registration Blockers`, metrics `27/42 courses shown` and `88/134 credits shown`, plus CHEM 135 `Needs Fall 2026 section`, locked prerequisite rows, and schedule-warning reasons.
- Reloaded the app and confirmed the Blockers advisor view persisted.
- Clicked Remaining and confirmed heading `Remaining Plan`, note `Courses not yet passed or transferred.`, and default-plan counts remained `42/42 courses shown`.
- Reset Advisor view to All before finishing.
- Checked a 390px-wide viewport: Advisor view controls stacked to a column, buttons fit two per row, packet stayed readable, and document-wide horizontal overflow stayed at 0.
- Reset the browser viewport to the default 1280px-wide size after mobile verification.
- Confirmed current-page browser console errors were 0 for the Pass 21 URL.

Next pass candidates:
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add Roadmap jump-to-semester or selected-node centering for very large plans.
- Add a visible schedule-change digest to advisor packets or exported schedule summaries.
- Add advisor-packet print presets for registrar/advisor vs student personal review.

## 2026-06-30 Pass 22

Focus: make the Roadmap easier to navigate in large plans by persisting selected nodes, centering them in the graph, and jumping back to the matching Plan row.

Planned changes:
- Persist the selected Roadmap node in `roadmapPrefs`.
- Render selected-node styling and accessible selected state in the SVG graph.
- Give selected-node details quick actions for Center, Show in Plan, and Clear.
- Make the SVG use its real graph width so large Roadmaps can scroll instead of compressing.
- Center selected nodes inside the horizontal graph scroller.
- Let Show in Plan reset Plan filters/search, switch to Plan, scroll to the course row, and briefly highlight it.
- Verify desktop selection, reload persistence, mobile centering, Plan jump behavior, neutral reset, and local checks.

Completed:
- Added `selectedCode` to Roadmap preference defaults and load migration.
- Added Roadmap selected-code synchronization and persistence through the existing `roadmapPrefs` share/import/snapshot paths.
- Added selected-node SVG state with `aria-pressed`, `.selected` styling, and a brief centering pulse.
- Updated Roadmap SVG sizing to use `--roadmap-width` with horizontal scrolling for larger graphs.
- Refactored Roadmap details into reusable HTML so selected details persist across rerenders.
- Added Center, Show in Plan, and Clear actions to selected-node details.
- Added `roadmapCenterNode()` to scroll the canvas until the selected node is visible and focused.
- Added `roadmapJumpToPlanCourse()` to reset Plan filters/search, switch tabs, scroll to the matching row, and apply a short landing highlight.
- Added mobile wrapping styles for detail actions and a Plan-row highlight style.
- Versioned `styles.css`, `js/state.js`, `js/roadmap.js`, `js/io.js`, `js/share.js`, and `js/snapshots.js` in `index.html`.

Verification:
- Ran `node --check` across every file in `js/`.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173/?pass22=...` in the in-app browser and confirmed `styles.css?v=23`, `js/state.js?v=5`, `js/roadmap.js?v=6`, `js/io.js?v=5`, `js/share.js?v=5`, and `js/snapshots.js?v=5` loaded.
- Opened Roadmap and confirmed the neutral state showed `37/37 shown`, 37 nodes, no selected node, and the default `All planned Health` panel.
- Selected `CMSC 351` and confirmed one selected node, `aria-pressed="true"`, selected rect class, focus on the node, and detail actions `Center`, `Show in Plan`, and `Clear`.
- Reloaded the app, reopened Roadmap, and confirmed `CMSC 351` remained selected with its detail panel and actions.
- Checked a 390px-wide viewport: the Roadmap canvas had internal horizontal overflow, `CMSC 351` started off-canvas, clicking Center scrolled the canvas to make it visible, detail actions wrapped, and document-wide horizontal overflow stayed at 0.
- Clicked Show in Plan and confirmed the app switched to Plan, Plan filter reset to All, search cleared, CMSC 351 row was scrolled into view, and the row received the temporary Roadmap highlight.
- Returned to Roadmap, clicked Clear, and confirmed selected count returned to 0, details returned to `All planned Health`, search stayed empty, and filter stayed `All planned`.
- Reset the browser viewport to the default 1280px-wide size after mobile verification.
- Confirmed current-page browser console errors were 0 for the Pass 22 URL.

Next pass candidates:
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add a visible schedule-change digest to advisor packets or exported schedule summaries.
- Add advisor-packet print presets for registrar/advisor vs student personal review.
- Add Roadmap term-jump controls for plans with many more than eight semesters.

## 2026-06-30 Pass 23

Focus: carry recent schedule edits into the student/advisor handoff surfaces instead of leaving them only on Action Timeline.

Planned changes:
- Add a compact Recent Changes digest to Schedule Output.
- Include the same digest in Advisor Packet HTML and standalone advisor downloads.
- Append recent edits to the downloadable/plain-text schedule summary.
- Style the digest for app, print, standalone advisor HTML, and mobile layouts.
- Verify with a reversible CMSC 131 section swap, then clear local test history.

Completed:
- Added shared schedule digest helpers for recent changes, type labels, timestamps, HTML rows, and plain-text rows.
- Rendered Recent Changes in the schedule print sheet when saved edits exist.
- Rendered Recent Changes in the Advisor Packet before the advisor view note so reviewers see the latest plan context.
- Included digest CSS in standalone advisor HTML so downloaded packets preserve the same layout.
- Appended `Recent plan changes:` to the `.txt` schedule summary when recent edits exist.
- Added responsive app styles for digest headers and rows, plus print border treatment.
- Versioned `styles.css` to `v=24` and `js/schedule.js` to `v=19` in `index.html`.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173/?pass23=...` in the in-app browser and confirmed `styles.css?v=24` and `js/schedule.js?v=19` loaded.
- Changed CMSC 131 from `CMSC131-0202` to `CMSC131-0204`, then restored it to `CMSC131-0202`.
- Confirmed Schedule Output rendered a Recent Changes digest with `Picked CMSC 131 0202` and `Picked CMSC 131 0204`.
- Confirmed Advisor Packet rendered the same two recent changes under `Advisor context`.
- Confirmed the hidden schedule summary text included `Recent plan changes:` and the two CMSC 131 change details before clearing history.
- Confirmed the advisor download source path builds `advisorDocument` from the same schedule/advisor fragments that rendered the digest; the in-app browser did not emit a native download event for the object-URL download.
- Checked a 390px-wide viewport with the digest visible: headers stacked, rows stayed inside the panel, and document-wide horizontal overflow stayed at 0.
- Cleared Recent Changes from Action Timeline and confirmed Schedule Output no longer showed digest blocks, the summary no longer contained `Recent plan changes:`, and CMSC 131 ended restored to `CMSC131-0202`.
- Verified Select summary still reveals, focuses, and selects the full schedule textarea after cleanup.
- Reset the browser viewport to the default layout after mobile verification.
- Confirmed current-page browser console errors were 0 for the Pass 23 URL.

Next pass candidates:
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add advisor-packet print presets for registrar/advisor vs student personal review.
- Add Roadmap term-jump controls for plans with many more than eight semesters.
- Add schedule output include/exclude toggles for warnings, recent changes, unscheduled courses, and preference notes.

## 2026-06-30 Pass 24

Focus: let students tailor Schedule Output and Advisor Packet handoffs by choosing which detail sections to include.

Planned changes:
- Persist schedule output content choices.
- Add compact Include checkboxes for Preferences, Warnings, Unscheduled, and Recent changes.
- Apply those choices to the rendered schedule sheet, advisor packet, `.txt` summary, and downloaded advisor HTML source.
- Carry the choices through JSON import/export, share links, and snapshots.
- Verify default output, all-options-off output, reload persistence, mobile layout, and cleanup.

Completed:
- Added `scheduleOutputOptions` to saved state defaults and migration.
- Included `scheduleOutputOptions` in import, share payload/load, snapshot save, and snapshot restore.
- Added schedule option normalization, getters, setters, and a reusable Include control.
- Updated Schedule Output text generation so Preferences, Schedule warnings, Unscheduled courses, and Recent plan changes are omitted when unchecked.
- Updated schedule print-sheet HTML to hide preference notes, warning lists, unscheduled lists, and recent-change digest based on the same options.
- Updated Advisor Packet HTML and advisor text so preference notes, warning/follow-up detail sections, warning-based blocker rows, unscheduled blocker rows, and recent-change digest follow the selected options.
- Styled the Include control for desktop, mobile wrapping, and print hiding.
- Versioned `styles.css` to `v=25`, `js/state.js` to `v=6`, `js/schedule.js` to `v=20`, `js/io.js` to `v=6`, `js/share.js` to `v=6`, and `js/snapshots.js` to `v=6`.

Verification:
- Ran `node --check` on `js/schedule.js`, `js/state.js`, `js/io.js`, `js/share.js`, and `js/snapshots.js`.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173/?pass24=...` in the in-app browser and confirmed all Pass 24 asset versions loaded.
- Opened Schedule and confirmed Include controls rendered with all four defaults checked and the schedule summary still included Preferences, Schedule warnings, and Unscheduled courses.
- Created a reversible CMSC 131 section change (`CMSC131-0202` to `CMSC131-0204` back to `CMSC131-0202`) and confirmed Recent changes appeared before testing that toggle.
- Unchecked all four Include options and confirmed schedule/advisor detail sections disappeared: no preference note, warning list, unscheduled/follow-up list, recent digest, or corresponding `.txt` summary sections.
- Reloaded the app and confirmed the unchecked options persisted and the output remained stripped.
- Rechecked all four options and confirmed preference, warning, unscheduled, and recent-change content returned.
- Checked a 390px-wide viewport: Include panel stacked, checkboxes wrapped two per row, and document-wide horizontal overflow stayed at 0.
- Cleared the temporary Recent Changes history from Action Timeline and confirmed Schedule Output no longer showed the recent digest while all Include defaults remained checked.
- Reset the browser viewport to desktop, confirmed CMSC 131 ended on `CMSC131-0202`, and confirmed current-page browser console errors were 0.

Next pass candidates:
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so move suggestions can be regression-tested without waiting for live UMD data to line up.
- Add advisor-packet print presets for registrar/advisor vs student personal review.
- Add Roadmap term-jump controls for plans with many more than eight semesters.
- Add schedule output saved presets for advisor, registrar, and personal review exports.

## 2026-06-30 Pass 25

Focus: turn Schedule Output configuration into one-click handoff presets for personal review, advisor meetings, and registrar-style documentation.

Planned changes:
- Add saved Schedule Output presets that coordinate Include toggles and Advisor view.
- Support Personal, Advisor, and Registrar modes.
- Detect Custom state when a student manually changes the Advisor view or Include choices.
- Persist the active preset through reloads, imports, share links, and snapshots.
- Verify preset behavior, custom detection, reload persistence, mobile layout, and cleanup.

Completed:
- Added `scheduleOutputPreset` to state defaults and load migration.
- Included `scheduleOutputPreset` in import, share payload/load, snapshot save, and snapshot restore.
- Added preset definitions:
  - Personal: All advisor view with preferences, warnings, unscheduled work, and recent changes included.
  - Advisor: Blockers advisor view with all details included.
  - Registrar: Remaining advisor view with warnings and unscheduled work included, but preference notes and recent edit history excluded.
- Added preset inference so manual Advisor view or Include changes switch the UI to Custom when the mix no longer matches a saved preset.
- Added a compact Preset segmented control above the Include controls in Schedule Output.
- Styled the preset control for desktop, mobile wrapping, and print hiding.
- Versioned `styles.css` to `v=26`, `js/state.js` to `v=7`, `js/schedule.js` to `v=21`, `js/io.js` to `v=7`, `js/share.js` to `v=7`, and `js/snapshots.js` to `v=7`.

Verification:
- Ran `node --check` on `js/schedule.js`, `js/state.js`, `js/io.js`, `js/share.js`, and `js/snapshots.js`.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173/?pass25=...` in the in-app browser and confirmed all Pass 25 asset versions loaded.
- Opened Schedule and confirmed Personal was active by default with Advisor view `All`, all Include options checked, and no Custom label.
- Created a reversible CMSC 131 section change (`CMSC131-0202` to `CMSC131-0204` back to `CMSC131-0202`) so recent-change preset behavior could be verified with real history.
- Clicked Advisor and confirmed it switched to Advisor view `Blockers`, heading `Registration Blockers`, all Include options checked, and warning/follow-up/recent-change sections visible.
- Clicked Registrar and confirmed it switched to Advisor view `Remaining`, heading `Remaining Plan`, Preferences and Recent changes unchecked, warning/follow-up sections visible, and preference/recent text hidden.
- Manually rechecked Preferences while Registrar was active and confirmed no saved preset stayed active, a Custom label appeared, and the mixed settings persisted through reload.
- Restored Personal and confirmed Advisor view returned to `All`, all Include options checked, recent-change content returned, and Custom disappeared.
- Checked a 390px-wide viewport: Preset panel stacked, three preset buttons fit in one row, Include controls still wrapped two per row, and document-wide horizontal overflow stayed at 0.
- Cleared the temporary Recent Changes history from Action Timeline and confirmed Schedule Output no longer showed the recent digest.
- Reset the browser viewport to desktop, confirmed CMSC 131 ended on `CMSC131-0202`, Personal preset remained active, Advisor view remained `All`, and current-page browser console errors were 0.

Next pass candidates:
- Start account/backend groundwork with a Supabase/Vercel-oriented plan: schema, auth states, saved plans, and local fallback strategy.
- Add auto-generated full four-year schedule generation from selected major, GenEd gaps, course prerequisites, interests, and target credit load.
- Add an optional interest/profile intake flow that informs recommendations, schedule generation, and elective picks.
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so auto-planning can be regression-tested without waiting for live UMD data to line up.

## 2026-06-30 Pass 26

Focus: add Supabase/Vercel account groundwork while keeping TerpTrack local-first and usable without cloud configuration.

Planned changes:
- Add an Account entry point with clear local, cloud-ready, and signed-in states.
- Detect Supabase config from Vercel env, runtime globals, or manual dev config.
- Keep the Supabase SDK lazy-loaded so the default local app does not depend on cloud services.
- Add magic-link auth hooks plus save/load hooks for a primary cloud plan.
- Provide the Supabase schema, RLS policies, Vercel config route, and environment template needed for deployment.
- Verify local fallback, modal validation, close behavior, and mobile layout.

Completed:
- Added an Account topbar button with a status dot and an Account modal.
- Rendered local/cloud/signed account modes, plan stats, cloud config details, manual dev config controls, disabled local-mode sign-in controls, and signed-in cloud plan actions.
- Added config discovery from `window.TERPTRACK_SUPABASE_URL`, `window.TERPTRACK_SUPABASE_ANON_KEY`, `/api/config`, and a local manual dev config fallback.
- Added lazy Supabase SDK loading only when a real config exists.
- Added magic-link sign-in, sign-out, profile upsert, primary plan save, and primary plan load hooks.
- Added `accountPrefs` state migration for plan name plus last cloud save/load timestamps.
- Added `api/config.js`, `vercel.json`, `.env.example`, `.gitignore`, and `supabase/schema.sql` with `profiles`, `plans`, RLS policies, and updated-at triggers.
- Versioned `styles.css` to `v=27`, `js/state.js` to `v=8`, `js/account.js` to `v=1`, `js/events.js` to `v=2`, and `js/main.js` to `v=2`.

Verification:
- Ran `node --check` on `js/account.js`, `js/state.js`, `js/events.js`, `js/main.js`, and `api/config.js`.
- Parsed `vercel.json` with Node.
- Ran `git diff --check`.
- Reloaded `http://localhost:5173/?pass26b=...` in the in-app browser and confirmed `styles.css?v=27`, `js/state.js?v=8`, `js/account.js?v=1`, `js/events.js?v=2`, and `js/main.js?v=2` loaded.
- Confirmed the Account button rendered with a local status dot and opened the Account modal.
- Confirmed local mode showed `Local`, `Local mode`, `Local only`, `Not configured`, four plan stats, disabled email/sign-in controls, and no Supabase SDK script.
- Clicked Save dev config with blank fields and confirmed the warning `URL and anon key are required.` without loading the Supabase SDK or leaving local mode.
- Confirmed the Account modal closes through the Close button and through Escape.
- Checked a 390px-wide viewport: the account modal stayed within the viewport, stats and config grids became one column, card headers stacked, buttons fit, and document-wide horizontal overflow stayed at 0.
- Reset the browser viewport to the default layout after mobile verification.
- Confirmed current-page browser console errors were 0 for the Pass 26 URL.

Next pass candidates:
- Add auto-generated full four-year schedule generation from selected major, GenEd gaps, course prerequisites, interests, and target credit load.
- Add an optional interest/profile intake flow that feeds recommendations, schedule generation, and elective picks.
- Wire a real Supabase project on Vercel and test magic-link sign-in plus cloud save/load end to end.
- Add a term-availability simulator/test fixture inside the app's dev diagnostics so auto-planning can be regression-tested without waiting for live UMD data to line up.

## 2026-06-30 Pass 27

Focus: upgrade auto-generated major schedules from sparse code-list layouts into full four-year draft plans.

Planned changes:
- Keep curated schedules untouched.
- Make non-curated major templates generate eight-semester drafts that include major requirements, missing GenEd placeholders, I-Series coverage, diversity coverage, and enough free-elective placeholders to meet the major target credits.
- Preserve prerequisite-aware placement for real courses while balancing generated placeholders across terms.
- Make generated placeholders uniquely keyed so status/progress does not bleed across repeated electives.
- Update onboarding/settings language so students understand generated plans are full editable drafts.
- Verify synthetic and real-template generation, browser asset loading, and user-facing copy.

Completed:
- Added deterministic GenEd requirement filling for FSAW, FSPW, FSOC, FSMA, FSAR, DSHS, DSHU, DSNS, DSNL, DSSP, DVUP, DVCC, and SCIS.
- Added generated GenEd placeholders that use existing `gened-*` categories so the GenEd matrix and placeholder search can understand and replace them.
- Added generated free-elective placeholders to fill each auto-generated plan up to the template's `totalCredits`.
- Preserved fetched `categories` and `gen_ed` metadata on generated course rows so real UMD course tags can satisfy GenEd requirements before placeholders are added.
- Added an internal known GenEd map for common courses already represented in TerpTrack's curated data, so offline/fallback generation does not over-add requirements when metadata is partial.
- Added soft 17-credit placement with an 18-credit hard cap for generated filler rows when a high-credit major cannot mathematically fit all 3-credit placeholders under 17 every term.
- Made the Settings major note update when the selected major changes.
- Updated settings/onboarding copy from sparse auto-generation language to full four-year draft language.
- Versioned `js/settings.js` to `v=2` and `js/import.js` to `v=2`.

Verification:
- Ran `node --check` on `js/import.js`, `js/settings.js`, and `js/majors.js`.
- Ran `git diff --check`.
- Ran an isolated VM generator test against a sparse synthetic course list and confirmed:
  - 8 semesters generated.
  - 122 planned credits.
  - Loads of `16, 15, 15, 16, 15, 15, 15, 15`.
  - Every GenEd/I-Series tag was represented.
  - GenEd placeholders and free-elective placeholders were generated with no duplicate course keys.
- Ran an isolated VM generator test using the real Aerospace Engineering template and confirmed:
  - 8 semesters generated.
  - 126 planned credits against a 124-credit target.
  - Loads of `15, 15, 18, 15, 18, 15, 15, 15`.
  - Every GenEd/I-Series tag was represented.
  - No duplicate course keys.
- Loaded `http://localhost:5174/?pass27iso=...` from a temporary isolated static server and confirmed `js/settings.js?v=2` and `js/import.js?v=2` loaded.
- Confirmed onboarding copy says auto-generated majors create full four-year drafts.
- Skipped onboarding on the isolated origin, opened Settings, and confirmed the Settings helper copy says generated plans are full four-year drafts with searchable GenEd/elective placeholders.
- Confirmed current-page browser console errors were 0 for the isolated Pass 27 URL.
- Stopped the temporary `localhost:5174` server after verification.

Next pass candidates:
- Add an optional student profile/interests intake and use it to choose free electives, GenEd replacement search defaults, and recommended upper electives.
- Add an in-app Auto Plan Review panel that explains generated placeholders, term loads, credit target, and GenEd coverage before a student applies a major.
- Add generated-plan regression fixtures for representative high-credit, low-credit, BA-language, and STEM majors.
- Wire a real Supabase project on Vercel and test magic-link sign-in plus cloud save/load end to end.

## 2026-06-30 Pass 28

Focus: add a reusable student profile so planning and recommendations can become individualized.

Planned changes:
- Add an optional profile step to onboarding.
- Add a profile section to Settings for interests, career/exploration goals, and preferred GenEd departments.
- Persist profile preferences across local state, imports, share links, snapshots, and cloud loads.
- Use profile preferences in auto-generated elective placeholders.
- Use profile preferences in Smart next-pick scoring and explanations.
- Verify profile normalization, generated elective personalization, recommendation matching, desktop UI, and mobile layout.

Completed:
- Added `profilePrefs` state with normalized `interests`, `careerGoal`, and `genEdDepts`.
- Added eight interest lanes: AI + data, Health + life science, Business + startups, Policy + society, Design + media, Climate + sustainability, Education + community, and Engineering + building.
- Added profile matching helpers that score courses by department, title/description keywords, preferred GenEd departments, and career-goal terms.
- Added personalized generated elective labels and notes, including preferred department hints and the student's career/exploration goal.
- Added profile-fit scoring, badges, and reasons to Smart next picks.
- Added a new optional onboarding profile step before year/transfer setup.
- Added a Settings Personalization Profile section with reusable interest chips plus career and GenEd department inputs.
- Carried `profilePrefs` through JSON import, share links, snapshots, and Supabase cloud-load normalization.
- Versioned `styles.css` to `v=28`, `js/state.js` to `v=9`, `js/settings.js` to `v=3`, `js/io.js` to `v=8`, `js/import.js` to `v=3`, `js/recommendations.js` to `v=11`, `js/onboarding.js` to `v=2`, `js/share.js` to `v=8`, `js/snapshots.js` to `v=8`, and `js/account.js` to `v=2`.

Verification:
- Ran `node --check` on `js/state.js`, `js/settings.js`, `js/onboarding.js`, `js/import.js`, `js/recommendations.js`, `js/share.js`, `js/snapshots.js`, `js/io.js`, and `js/account.js`.
- Ran `git diff --check`.
- Ran a focused VM behavior test confirming:
  - Invalid/duplicate interests are removed.
  - Preferred GenEd departments normalize to known departments.
  - Generated free electives become profile-labeled (`AI + data Elective 1` in the test case).
  - Generated free-elective notes include preferred departments and career goal.
  - `profileCourseMatch` boosts matching CMSC machine-learning and policy/society courses.
  - The generated test plan still reaches at least 120 credits.
- Loaded `http://127.0.0.1:5174/?pass28fresh=...` from a temporary isolated static server and confirmed all Pass 28 asset versions loaded.
- Confirmed the onboarding profile step appears after the first Next click and renders all eight interest chips.
- Skipped onboarding on the isolated origin, opened Settings, and confirmed the Personalization Profile section renders all eight chips, career goal input, and preferred GenEd department input.
- Confirmed current-page browser console errors were 0 for the Pass 28 isolated URL.
- Checked a 390px-wide viewport with Settings already open: profile chips collapse to one column, no chip text overflows, and document-wide horizontal overflow stays at 0.
- Reset the browser viewport to default and stopped the temporary `localhost:5174` server after verification.

Next pass candidates:
- Add an Auto Plan Review panel that explains generated placeholders, profile fit, term loads, credit target, GenEd coverage, and any 18-credit terms before a student applies a major.
- Use the profile to pre-filter GenEd placeholder search departments and Browse Courses defaults.
- Add generated-plan regression fixtures for representative high-credit, low-credit, BA-language, and STEM majors.
- Wire a real Supabase project on Vercel and test magic-link sign-in plus cloud save/load end to end.

## 2026-06-30 Pass 29

Focus: add a pre-apply Auto Plan Review panel for generated major templates.

Planned changes:
- Add a non-mutating generated-plan preview builder that uses the same auto-scheduler as major application.
- Show generated plan credits, term loads, GenEd/I-Series coverage, placeholder counts, live metadata coverage, profile fit, and heavy-term warnings in Settings before Apply.
- Keep curated majors readable with a simpler curated-plan summary.
- Let unsaved Settings profile edits immediately personalize generated elective preview rows.
- Remove stale Settings major-note update code that stripped the curated/generated badge after select changes.
- Verify generated-plan review data, live browser behavior, and static checks.

Completed:
- Added `buildAutoPlanPreview()` plus schedule-analysis helpers in `js/import.js`.
- Reused the same template-to-course-object path for preview and apply, including live `fetchCoursesBatch()` metadata when available and template-only fallback data when not.
- Passed profile preferences explicitly into generated free-elective creation so preview and applied schedules use the same personalization path.
- Added the Settings Auto Plan Review panel with generated/curated states, credit stats, term-load chips, GenEd chips, profile-fit copy, sample personalized elective rows, and warning text for 18-credit terms or missing live metadata.
- Added stale-result protection for async preview fetches when students change selected majors quickly.
- Added debounced preview refresh from Settings profile inputs so interests, career goal, and preferred departments affect the preview before saving or applying.
- Removed the older document-level `set-major` change handler in `js/events.js` because it overwrote the richer Settings note.
- Expanded the Settings modal width to fit review data cleanly.
- Added responsive CSS for the review panel and versioned `styles.css` to `v=29`, `js/settings.js` to `v=4`, `js/import.js` to `v=4`, and `js/events.js` to `v=3`.

Verification:
- Ran `node --check` on every file in `js/`.
- Ran `git diff --check`.
- Ran an isolated VM preview test for Aerospace Engineering and confirmed:
  - Generated review kind.
  - 8 terms.
  - 126/125 planned credits from template-only fallback.
  - Term loads of `15, 15, 18, 15, 18, 15, 15, 15`.
  - Every GenEd/I-Series bucket complete.
  - 12 GenEd placeholders.
  - 18-credit terms exposed for Fall 2027 and Fall 2028.
  - Profile labels include AI + data.
- Ran an isolated VM preview test for African American Studies and confirmed:
  - Generated review kind.
  - 121/120 planned credits.
  - Every GenEd/I-Series bucket complete.
  - 13 free electives.
  - Free-elective samples use the AI + data label and preferred department/career-goal notes.
- Loaded `http://127.0.0.1:5174/?pass29review2=...` from a temporary isolated static server and confirmed `styles.css?v=29`, `js/settings.js?v=4`, `js/import.js?v=4`, and `js/events.js?v=3` loaded.
- Opened Settings in the browser and confirmed the curated Computer Engineering review renders planned credits, terms, course count, and term-load chips with no horizontal overflow.
- Selected Aerospace Engineering in the browser and confirmed:
  - The Settings note retains the `✱ Auto-generated full 4-year draft` badge.
  - The generated review renders 127/125 planned credits using live metadata, 13/13 GenEd coverage, 11 placeholders, 24/30 live course records, and term loads.
  - No document-wide horizontal overflow.
- Entered unsaved profile values in Settings, selected African American Studies, and confirmed the generated preview shows AI + data elective labels, INST/PSYC/GVPT department hints, and the career goal before applying.
- Attempted a 390px in-app browser viewport check, but the browser viewport capability timed out twice and then timed out on read-only state checks after the failed override. Did not rely on that result; stopped the temporary static server.

Next pass candidates:
- Use the profile to pre-filter GenEd placeholder search departments and Browse Courses defaults.
- Add generated-plan regression fixtures for representative high-credit, low-credit, BA-language, and STEM majors.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Wire a real Supabase project on Vercel and test magic-link sign-in plus cloud save/load end to end.

## 2026-06-30 Pass 30

Focus: use the personalization profile to steer course discovery.

Planned changes:
- Make Browse Courses start from profile-preferred departments when a profile exists.
- Add visible Browse profile chips so students can quickly switch between preferred departments.
- Rank Browse results by profile fit while preserving existing department and GenEd filters.
- Add a profile-departments scope to GenEd placeholder replacement search.
- Boost/profile-label placeholder replacement candidates that match the student's interests, preferred departments, or career goal.
- Verify the behavior with focused VM checks and a browser asset-load check.

Completed:
- Added Browse profile helpers for preferred departments, summary text, default application, control syncing, profile hint rendering, and HTML escaping.
- Browse now defaults to the first preferred department on first visit when the student has profile departments and no manual Browse filter is active.
- Added `#br-profile-hints` with profile department chips and active-chip styling.
- Browse cards now sort by `profileCourseMatch()` before course code and show Profile fit tags/reasons when applicable.
- Placeholder search now has a `Profile departments` select option that fans GenEd queries across preferred departments and dedupes repeated rows.
- Generic GenEd placeholders now default to profile departments when available; writing/oral placeholders still default to ENGL/COMM.
- Placeholder replacement candidates now include profile scoring in their sort order and render Profile fit badges/reasons.
- Escaped dynamic Browse card and hint HTML while touching that render path.
- Versioned `styles.css` to `v=30`, `js/browse.js` to `v=2`, and `js/placeholder-search.js` to `v=3`.

Verification:
- Ran `node --check` on every file in `js/`.
- Ran `git diff --check`.
- Ran a focused VM behavior test confirming:
  - Profile departments normalize to `INST, PSYC, GVPT, CMSC, STAT, MATH...`.
  - Generic DSHS placeholders default to the profile-departments scope.
  - Writing placeholders still default to ENGL.
  - The placeholder department select includes `Profile departments` and labels `INST` as a profile department.
  - Profile-scoped GenEd search fans out across preferred departments and dedupes repeated rows.
  - Profile-matching placeholder candidates outrank neutral candidates.
  - Browse defaults to `INST` for the test profile.
- Ran a rendered Browse VM test confirming:
  - `renderBrowse()` selects `INST`.
  - The profile hint renders AI + data / Policy + society, preferred departments, and career goal.
  - Browse cards render a Profile fit badge for a matching course.
- Loaded `http://127.0.0.1:5174/?pass30profile=...` from a temporary isolated static server and confirmed `styles.css?v=30`, `js/browse.js?v=2`, and `js/placeholder-search.js?v=3` loaded and the `#br-profile-hints` mount exists.
- Browser click interactions in that in-app browser session did not open Settings despite no console errors, so profile UI interaction was not used as evidence this pass.
- Confirmed nothing remained listening on port 5174 after stopping the temporary server.

Next pass candidates:
- Add generated-plan regression fixtures for representative high-credit, low-credit, BA-language, and STEM majors.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Expand Browse to support multi-department profile search rather than only first-department default plus chips.
- Wire a real Supabase project on Vercel and test magic-link sign-in plus cloud save/load end to end.

## 2026-06-30 Pass 31

Focus: add repeatable generated-plan regression fixtures so automatic four-year planning can be protected across future changes.

Planned changes:
- Add a repo-native Node regression runner with no package-manager dependency.
- Load the app's browser scripts in a VM so tests exercise the real major templates and auto-scheduler.
- Cover representative high-credit engineering, low-requirement BA, language BA, and STEM generated plans.
- Assert invariant behavior: eight terms, target credits met, hard 18-credit cap, complete GenEd/I-Series coverage, unique generated placeholder codes, and profile-labeled free electives where applicable.
- Add a synthetic prerequisite-chain fixture to prove prerequisite ordering still works when the filler generator adds GenEds/free electives.
- Document the command in the README.

Completed:
- Added `scripts/test-generated-plans.js`.
- The runner loads `js/data.js`, `js/major-schedules.js`, `js/majors.js`, `js/state.js`, `js/api.js`, and `js/import.js` in a Node VM with browser-like localStorage/document stubs.
- Added generated major fixtures for:
  - `ENAE` high-credit engineering.
  - `BIOE` high-credit life science engineering.
  - `AAST` low-requirement BA.
  - `SPAN` BA language and culture.
  - `AOSC` STEM science.
  - `STAT` STEM data/math.
- Added fixture assertions for credit target, credit overage, max term load, complete GenEd coverage, metadata fallback behavior, requirement counts, generated GenEd placeholders, free electives, duplicate generated codes, and profile-labeled electives.
- Added a synthetic CMSC 131 -> 132 -> 216 -> 330 prerequisite-chain fixture.
- Documented local check commands in `README.md`.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six major fixtures plus the prerequisite-chain fixture.
- The generated-plan fixture output confirmed:
  - ENAE: `126/125`, loads `15,15,18,15,18,15,15,15`, GenEd `13/13`.
  - BIOE: `126/126`, loads `18,18,15,15,15,15,15,15`, GenEd `13/13`.
  - AAST: `121/120`, loads `15,15,15,15,15,15,16,15`, GenEd `13/13`.
  - SPAN: `121/120`, loads `15,15,15,15,15,16,15,15`, GenEd `13/13`.
  - AOSC: `120/120`, loads `15,15,15,15,15,15,15,15`, GenEd `13/13`.
  - STAT: `121/120`, loads `15,15,15,15,15,16,15,15`, GenEd `13/13`.
  - Synthetic prerequisite chain placed terms `0 -> 1 -> 2 -> 3`.
- Ran `node --check` on every file in `js/`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `git diff --check`.

Next pass candidates:
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Expand Browse to support multi-department profile search rather than only first-department default plus chips.
- Wire a real Supabase project on Vercel and test magic-link sign-in plus cloud save/load end to end.
- Start account/friends planning: schema for friend connections, shared plans, and privacy-safe read-only plan viewing.

## 2026-06-30 Pass 32

Focus: build the first real account/friends foundation for social planning and shared schedules.

Planned changes:
- Normalize account profile and friend-invite state across local storage, imports, and cloud payloads.
- Extend the account modal with a student profile, friend invites, local share links, and cloud-only friend plan actions.
- Add Supabase schema/RLS for profiles, friend requests, and accepted-friend shared plan reads.
- Reuse the existing read-only share payload importer for friend-shared cloud plans.
- Add regression coverage for account/friend state and shared-plan loading.

Completed:
- Added `defaultAccountPrefs()`, `normalizeAccountEmail()`, `normalizeAccountFriendInvite()`, and `normalizeAccountPrefs()` in `js/state.js`.
- Account prefs now include display name, friend invite draft fields, normalized invite rows, friend sync timestamps, and friend-plan publish/load timestamps.
- JSON imports now normalize incoming `accountPrefs` instead of blindly accepting malformed friend state.
- Extracted `applySharedPlanData()` in `js/share.js` so hash links and cloud friend plans use the same validation, confirmation, save, theme, settings, and render path.
- Expanded `js/account.js` with:
  - cloud/local student profile save.
  - display name, active major, and profile prefs written to `profiles`.
  - local friend invite creation for everyone.
  - cloud friend invite upsert for signed-in users.
  - friend request sync for sent/received rows.
  - accept/decline handling for received cloud requests.
  - accepted-friend plan publishing through `shared_plans`.
  - friend plan loading through the shared-plan importer.
  - account modal sections for Student profile, Friends & shared plans, Requests, and Friend plans.
- Added account/friend row styling with mobile stacking and no modal overflow at a 380px browser viewport.
- Extended `supabase/schema.sql` with profile fields, `friend_requests`, `shared_plans`, idempotent policy drops, friend request RLS, and accepted-friend read-only shared plan access.
- Documented Supabase setup in `README.md`.
- Versioned changed browser assets:
  - `styles.css?v=31`
  - `js/state.js?v=10`
  - `js/io.js?v=9`
  - `js/share.js?v=9`
  - `js/account.js?v=3`
- Extended `scripts/test-generated-plans.js` with an account/share fixture that checks account normalization and friend-plan import behavior.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, and the new account/share fixture.
- Account/share fixture confirmed:
  - friend invite email normalizes to `friend@umd.edu`.
  - invalid invite rows are dropped.
  - accepted received invite status/direction persists.
  - friend-plan import replaces course state with `MATH 140`.
  - selected section, profile prefs, roadmap filter, and advisor output preset persist.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass32friends=1` from a temporary static server and confirmed:
  - `styles.css?v=31`, `js/state.js?v=10`, `js/io.js?v=9`, `js/share.js?v=9`, and `js/account.js?v=3` loaded.
  - No console errors on load.
  - The account modal renders Cloud config, Student profile, Sign in, and Friends & shared plans sections.
  - Friend email/note inputs render.
  - Cloud-only friend buttons are disabled in local mode.
  - No account modal horizontal overflow at the browser's 380px viewport.
  - Adding a local invite renders one request row with `friend@umd.edu`, the note, pending/local status, and no console errors.

Next pass candidates:
- Add a friend/profile drawer for viewing accepted friends' names, majors, and last-published plan freshness.
- Add Supabase migration/deploy notes for Vercel env setup and test a real magic-link round trip.
- Add account/friend VM tests around cloud payload construction without requiring a live Supabase project.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Expand Browse to support multi-department profile search rather than only first-department default plus chips.

## 2026-06-30 Pass 33

Focus: enrich friend/account displays with profile context for accepted friends and shared plans.

Planned changes:
- Preserve friend user IDs from synced requests so account rows can join to profiles.
- Fetch readable friend profiles after request and shared-plan sync.
- Show display name and major where RLS allows it, while falling back to email/local labels in local mode.
- Update profile RLS so accepted friends can read each other's profile rows.
- Keep local-mode account rendering unchanged.

Completed:
- Added `userId` to normalized friend invite rows in `js/state.js`.
- Added a runtime `accountFriendProfiles` cache in `js/account.js`.
- Added `accountLoadProfilesForUsers()` to fetch readable `profiles` rows for synced friend request users and shared-plan owners.
- Added `accountProfileLabel()` fallback logic: display name + major, display name, email + major, email, or short owner id.
- Account profile saves now update the local profile cache immediately for signed-in users.
- Friend request sync now selects `recipient_id`, stores the opposite user's id where available, and loads profiles before rendering.
- Friend shared-plan loading now fetches owner profiles before rendering friend plan rows.
- Friend request rows and friend plan rows now prefer profile labels over raw emails/owner IDs.
- Updated Supabase profile select RLS from owner-only to owner-or-accepted-friend visibility.
- Versioned changed browser assets:
  - `js/state.js?v=11`
  - `js/account.js?v=4`
- Extended the account/share regression fixture to assert normalized invite `userId` persistence.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, and the account/share fixture.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass33profiles=1` from a temporary static server and confirmed:
  - `js/state.js?v=11` and `js/account.js?v=4` loaded.
  - No console errors on load or account modal open.
  - The account modal still renders Cloud config, Student profile, Sign in, and Friends & shared plans.
  - Local friend invite rows still render with email fallback.
  - Cloud-only friend buttons remain disabled in local mode.
  - No account modal horizontal overflow at the browser's 380px viewport.

Next pass candidates:
- Add cloud payload construction tests around profile save, friend invite payloads, and shared-plan publish payloads without a live Supabase project.
- Build a real friend/profile drawer once remote profile rows can be tested against a Supabase project.
- Add Vercel/Supabase environment setup notes and test magic-link sign-in on a real deployment.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve schedule timing intelligence: conflict explanations, compact-day preferences, and time-window scoring.

## 2026-06-30 Pass 34

Focus: make the Schedule tab explain whether a picked semester is actually livable, not merely conflict-free.

Planned changes:
- Add day-level schedule timing analysis for active days, idle time, tight transitions, longest day, and TBA sections.
- Convert timing analysis into a 0-100 fit score with plain-language insights.
- Surface the score in the Schedule tab and schedule/advisor exports.
- Use the timing score when ranking generated alternate schedules.
- Add regression coverage so compact schedules beat idle-heavy schedules and tight cross-campus moves are flagged.

Completed:
- Added `scheduleDurationLabel()`, `scheduleTimingDayReports()`, and `scheduleTimingFit()` in `js/schedule.js`.
- Timing fit now accounts for:
  - time conflicts.
  - tight breaks and estimated walk times.
  - total idle time.
  - long days.
  - compact-mode active-day count.
  - TBA meeting times.
- Added a `#schedule-fit` panel in the Schedule tab.
- The new Timing Fit panel shows:
  - score and label.
  - active days.
  - total idle time.
  - shortest break.
  - longest day.
  - up to five actionable insights.
- Alternate schedule candidate scoring now includes timing score adjustment.
- Alternate schedule cards now show `N/100 timing`.
- Schedule summary text exports now include timing score and timing notes.
- Printable schedule headers now include the timing score.
- Advisor packet metrics now include timing fit, while moving goal-course/GPA details into the metrics row.
- Added responsive styling for the timing panel and metric grid.
- Versioned changed browser assets:
  - `styles.css?v=32`
  - `js/schedule.js?v=22`
- Extended `scripts/test-generated-plans.js` to load `js/schedule.js`.
- Added the `SCHEDULE-TIMING` regression fixture.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the account/share fixture, and the new schedule timing fixture.
- Schedule timing fixture confirmed:
  - compact sample schedule scores `100`.
  - idle-heavy sample schedule scores `68`.
  - compact score is above idle score.
  - idle insight mentions idle time.
  - tight cross-campus transition is counted and explained.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass34timing=1` from a temporary static server and confirmed:
  - `styles.css?v=32` and `js/schedule.js?v=22` loaded.
  - `#schedule-fit` exists.
  - No console errors on load.
  - Opening Schedule renders the Timing Fit empty state with four metrics.
  - No document-wide horizontal overflow at the browser's 380px viewport.
- Auto-picked sections in the browser and confirmed:
  - Timing Fit renders a scored state with active days, idle time, shortest break, longest day, and specific insights.
  - Schedule summary showed `4/5` picked, `0` conflicts, warnings, and open seats.
  - No console errors after auto-pick.
- Generated alternatives in the browser and confirmed:
  - four alternate cards rendered.
  - alternate cards include timing metrics such as `50/100 timing`.
  - no console errors or horizontal overflow.
- Stopped the temporary static server.

Next pass candidates:
- Add a “why this alternate is better” comparison between the current picked schedule and each alternate.
- Add a schedule diagnostics export section with timing fit insights in the advisor packet body, not only the header metrics.
- Add real Supabase/Vercel setup instructions and validate a magic-link account round trip on deployment.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve Browse with multi-department profile search and richer personalized class recommendations.

## 2026-06-30 Pass 35

Focus: make alternate schedules explain why they are better than the current picks.

Planned changes:
- Compare each generated alternate schedule against the current selected schedule.
- Explain timing, warnings, idle time, active days, open seats, and campus-fit differences in plain language.
- Add the explanation to each alternate card without disrupting the compact calendar preview.
- Add regression coverage for the comparison helper.

Completed:
- Added `scheduleDeltaLabel()` and `scheduleAlternativeComparison()` in `js/schedule.js`.
- `generateScheduleAlternatives()` now evaluates the current picked schedule once and attaches it as each alternate's comparison baseline.
- Alternate schedule cards now include a `Why this option` block.
- Comparison lines can explain:
  - timing fit point changes.
  - conflict count changes.
  - warning count changes.
  - idle time saved/added.
  - fewer/more active days in compact mode.
  - open-seat changes.
  - campus-fit alert changes when location preferences are active.
- Added `.alt-why` styles for compact, readable card explanations.
- Versioned changed browser assets:
  - `styles.css?v=33`
  - `js/schedule.js?v=23`
- Extended the `SCHEDULE-TIMING` regression fixture to assert comparison deltas and explanation text.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the account/share fixture, and the schedule timing/comparison fixture.
- Schedule timing/comparison fixture confirmed:
  - compact schedule score remains above idle schedule score.
  - tight cross-campus transition remains detected.
  - comparison timing delta is positive (`+32` in the fixture).
  - comparison reports warning reduction and open-seat gain.
  - comparison text explains why the option is better.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass35altwhy=1` from a temporary static server and confirmed:
  - `styles.css?v=33` and `js/schedule.js?v=23` loaded.
  - no console errors on load.
  - Schedule tab opened successfully.
  - generated four alternate cards.
  - all four cards rendered `Why this option`.
  - first card explained timing improvement, warning reduction, idle time saved, and open-seat gain.
  - no horizontal overflow at the browser's 380px viewport.
- Stopped the temporary static server.

Next pass candidates:
- Add the current-vs-alternate comparison details to the advisor packet/export when an alternate is applied.
- Add a schedule diagnostics export section with timing fit insights in the advisor packet body, not only the header metrics.
- Add real Supabase/Vercel setup instructions and validate a magic-link account round trip on deployment.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve Browse with multi-department profile search and richer personalized class recommendations.

## 2026-06-30 Pass 36

Focus: make Browse search across the student's full profile department set instead of only the first preferred department.

Planned changes:
- Add an explicit "profile departments" Browse scope.
- Default personalized Browse to all profile departments when profile preferences exist.
- Fan out department and Gen-Ed discovery across the profile department set with course deduping.
- Add regression coverage for the personalized Browse scope.

Completed:
- Added `BROWSE_PROFILE_DEPTS_VALUE` and profile-scope helpers in `js/browse.js`.
- `applyBrowseProfileDefaults()` now starts personalized Browse in the all-profile-departments mode.
- The profile hint row now includes an `All profile departments` chip alongside individual department chips.
- The Browse department dropdown now includes a `Profile departments` option.
- Browse loading, empty states, and cache keys now understand profile department scope.
- `browseListCoursesForCurrentScope()` now fans out:
  - all Gen-Ed searches across profile departments.
  - specific Gen-Ed searches across profile departments.
  - department course searches across profile departments.
- Added `browseMergeCourseRows()` so shared courses are deduped across department results.
- Versioned changed browser asset:
  - `js/browse.js?v=3`
- Extended `scripts/test-generated-plans.js` to load `js/browse.js`.
- Added the `BROWSE-PROFILE` regression fixture.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the account/share fixture, the schedule timing/comparison fixture, and the new Browse profile fixture.
- Browse profile fixture confirmed:
  - profile defaults select `__PROFILE_DEPTS__`.
  - profile scope includes `INST`, `PSYC`, and `GVPT`.
  - Gen-Ed searches fan out across profile departments.
  - department searches fan out across profile departments.
  - shared courses dedupe to one row.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass36browse=1` from a temporary static server and confirmed:
  - `js/browse.js?v=3` loaded.
  - Browse tab opened successfully.
  - the department dropdown contains `Profile departments`.
  - the no-profile empty state explains how to start with profile departments.
  - no console errors on load or Browse open.
  - no horizontal overflow at the browser's 380px viewport.
- Stopped the temporary static server.

Next pass candidates:
- Add the current-vs-alternate comparison details to the advisor packet/export when an alternate is applied.
- Add a schedule diagnostics export section with timing fit insights in the advisor packet body, not only the header metrics.
- Add real Supabase/Vercel setup instructions and validate a magic-link account round trip on deployment.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve Browse with saved profile searches and richer personalized class recommendations.

## 2026-06-30 Pass 37

Focus: make advisor packets explain schedule timing problems, not just show a numeric timing score.

Planned changes:
- Add a reusable timing diagnostics model for advisor/export surfaces.
- Render timing metrics, timing notes, and advisor follow-up items inside the advisor packet body.
- Include the same diagnostic lines in the advisor text builder.
- Add regression coverage so the advisor packet keeps the diagnostics.

Completed:
- Added `scheduleTimingDiagnostics()` in `js/schedule.js`.
- Added `scheduleAdvisorTimingDiagnosticsHtml()` for advisor packet rendering.
- Added `scheduleAdvisorTimingDiagnosticsText()` for advisor text output.
- Advisor packets now include a `Timing Diagnostics` section with:
  - active days.
  - idle time.
  - shortest break.
  - longest day.
  - tight moves.
  - TBA picks.
  - timing notes from the schedule fit analysis.
  - advisor follow-up items for review-worthy schedules.
- Standalone advisor packet downloads now include matching diagnostics CSS.
- Added responsive and print styles for the diagnostics section in `styles.css`.
- Versioned changed browser assets:
  - `styles.css?v=34`
  - `js/schedule.js?v=24`
- Extended the `SCHEDULE-TIMING` regression fixture to assert advisor diagnostics HTML and text.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the account/share fixture, the schedule timing/comparison fixture, and the Browse profile fixture.
- Schedule timing fixture now also confirmed:
  - advisor diagnostics HTML includes `Timing Diagnostics`.
  - advisor diagnostics HTML includes metrics and `Advisor follow-up`.
  - advisor diagnostics HTML explains idle-time review.
  - advisor diagnostics text includes timing follow-up lines.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass37diagnostics=seeded` from a temporary static server with a seeded browser fixture and confirmed:
  - `styles.css?v=34` and `js/schedule.js?v=24` loaded.
  - Schedule tab opened successfully.
  - advisor packet rendered.
  - `Timing Diagnostics` rendered in the advisor packet.
  - metrics rendered for active days, idle time, shortest break, longest day, tight moves, and TBA picks.
  - timing notes explained the idle gap and longest day.
  - advisor follow-up suggested a tighter section combination and longest-day review.
  - no console errors.
  - no horizontal overflow at the browser's 380px viewport.
- Reset the browser viewport and stopped the temporary static server.

Next pass candidates:
- Add the current-vs-alternate comparison details to the advisor packet/export when an alternate is applied.
- Add real Supabase/Vercel setup instructions and validate a magic-link account round trip on deployment.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve Browse with saved profile searches and richer personalized class recommendations.
- Add a term-by-term registration checklist that connects remaining GenEds, prerequisites, and section timing risks.

## 2026-06-30 Pass 38

Focus: preserve alternate-schedule comparison details after a student applies an alternate, so advisor packets still explain why that choice was made.

Planned changes:
- Let recent plan changes carry short highlight bullets.
- Save the current-vs-alternate comparison lines when an alternate schedule is applied.
- Render those highlights in schedule/advisor recent-change exports.
- Add regression coverage for applied alternate highlights.

Completed:
- Extended `recordPlanChange()` in `js/state.js` to persist bounded `highlights` arrays.
- Added `scheduleChangeHighlights()` in `js/schedule.js`.
- Recent-change digest HTML now renders highlight bullets.
- Recent-change text exports now include highlight bullets.
- Applying an alternate schedule now records:
  - timing fit score.
  - conflict and warning counts.
  - current-vs-alternate comparison lines.
  - applied section list.
- Added `.schedule-change-highlights` styling in the app and standalone advisor packet CSS.
- Versioned changed browser assets:
  - `styles.css?v=35`
  - `js/state.js?v=12`
  - `js/schedule.js?v=25`
- Extended the `SCHEDULE-TIMING` regression fixture to assert applied alternate comparison highlights in HTML and text exports.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the account/share fixture, the schedule timing/comparison/advisor fixture, and the Browse profile fixture.
- Schedule timing fixture now also confirmed:
  - applied alternate changes retain comparison highlights.
  - advisor change digest renders highlight bullets.
  - advisor change digest includes timing/open-seat comparison details.
  - recent-change text includes timing/open-seat comparison details.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass38altchange=seeded` from a temporary static server with a seeded browser fixture and confirmed:
  - `styles.css?v=35`, `js/state.js?v=12`, and `js/schedule.js?v=25` loaded.
  - Schedule tab opened successfully.
  - advisor/schedule change digest rendered.
  - applied alternate highlights rendered as bullets.
  - text export contains the comparison highlights.
  - no console errors.
  - no horizontal overflow at the browser's 380px viewport.
- Reset the browser viewport, removed the temporary seed page, and stopped the temporary static server.

Next pass candidates:
- Add real Supabase/Vercel setup instructions and validate a magic-link account round trip on deployment.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve Browse with saved profile searches and richer personalized class recommendations.
- Add a term-by-term registration checklist that connects remaining GenEds, prerequisites, and section timing risks.
- Add exportable advisor questions generated from blockers, schedule timing risks, and unmet GenEds.

## 2026-06-30 Pass 39

Focus: make cloud account setup self-diagnosing so Supabase/Vercel deployment is easier to verify before real students rely on it.

Planned changes:
- Add in-app cloud setup readiness checks to the Account modal.
- Validate config source, Supabase URL/key shape, client initialization, schema, and magic-link redirect expectations.
- Expand README setup instructions into a concrete Supabase/Vercel runbook.
- Add regression coverage for the readiness model.

Completed:
- Added `accountConfigQuality()` in `js/account.js`.
- Added `accountCloudSetupChecks()` to produce structured setup checks for:
  - deployment config.
  - Supabase credentials.
  - client connection.
  - database schema.
  - magic-link redirect.
- Added `accountCloudSetupHtml()` and rendered it inside the Account modal's Cloud config card.
- The Account modal now shows a compact `Cloud setup` checklist with ready/check/missing states.
- Added responsive styles for the setup checklist in `styles.css`.
- Expanded `README.md` with Supabase SQL, Auth redirect, Vercel env var, magic-link, cloud save/load, and friend-plan round-trip steps.
- Versioned changed browser assets:
  - `styles.css?v=36`
  - `js/account.js?v=5`
- Extended `scripts/test-generated-plans.js` to load `js/account.js`.
- Added the `ACCOUNT-CLOUD-SETUP` regression fixture.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the account/share fixture, the new account setup fixture, the schedule timing/comparison/advisor fixture, and the Browse profile fixture.
- Account setup fixture confirmed:
  - missing config marks all setup checks missing.
  - manual config warns for deployment while allowing an initialized client.
  - Vercel config marks deployment, credential shape, and client connection ready.
  - readiness HTML includes the Vercel config explanation.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass39account=1` from a temporary static server and confirmed:
  - `styles.css?v=36` and `js/account.js?v=5` loaded.
  - Account modal opened successfully.
  - Cloud setup checklist rendered five checks.
  - no-config state showed all checks missing and disabled magic-link sign-in.
  - no console errors.
  - no horizontal overflow at the browser's 380px viewport.
- Reset the browser viewport and stopped the temporary static server.

Next pass candidates:
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve Browse with saved profile searches and richer personalized class recommendations.
- Add a term-by-term registration checklist that connects remaining GenEds, prerequisites, and section timing risks.
- Add exportable advisor questions generated from blockers, schedule timing risks, and unmet GenEds.

## 2026-06-30 Pass 40

Focus: turn Timeline advisor signals into a registration checklist students can act on before registration and advisor meetings.

Planned changes:
- Add a next-term checklist model from credit load, prerequisites, GenEd gaps, and picked-section timing.
- Render the checklist in Timeline between planner stats and recommended moves.
- Add export/select checklist text for advisor prep.
- Add regression coverage for the new checklist flow.

Completed:
- Added `plannerRegistrationSelectedItems()`, `plannerChecklistItem()`, `plannerRegistrationChecklist()`, `plannerChecklistCard()`, `plannerRegistrationChecklistText()`, and `plannerChecklistHtml()` in `js/timeline.js`.
- Timeline now renders a `Registration Checklist` with numbered action cards before recommended moves.
- Checklist cards can flag underload, overload, prerequisite order, picked-section timing fit, missing sections, and GenEd gaps.
- Added `Open Schedule` and `Find GenEd` actions from checklist items.
- Added a `Select checklist` textarea export path for copying advisor-ready checklist text.
- Added responsive checklist styling in `styles.css`.
- Versioned changed browser assets:
  - `styles.css?v=37`
  - `js/timeline.js?v=7`
- Extended `scripts/test-generated-plans.js` to load `js/timeline.js`.
- Added the `PLANNER-CHECKLIST` regression fixture.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the account/share fixture, the account setup fixture, the schedule timing/comparison/advisor fixture, the new planner checklist fixture, and the Browse profile fixture.
- Planner checklist fixture confirmed:
  - credit-load guidance appears.
  - prerequisite issues are surfaced.
  - picked-section timing fit is included.
  - GenEd gaps include `Find GenEd` actions.
  - export text starts with `Registration checklist` and includes course context.
  - checklist HTML includes schedule and GenEd action hooks.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded `http://127.0.0.1:5174/?pass40checklist=1` from a temporary static server and confirmed:
  - `styles.css?v=37` and `js/timeline.js?v=7` loaded.
  - Timeline opened successfully.
  - `Registration Checklist` rendered.
  - checklist cards rendered with `Open Schedule` and GenEd actions.
  - `Select checklist` exposed copyable export text.
  - no console errors.
  - no horizontal overflow at the browser's 380px viewport.
- Reset the browser viewport and stopped the temporary static server.

Next pass candidates:
- Add exportable advisor questions generated from blockers, schedule timing risks, and unmet GenEds.
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve Browse with saved profile searches and richer personalized class recommendations.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 41

Focus: turn Timeline risks into advisor-ready questions students can copy before registration meetings.

Planned changes:
- Generate advisor questions from the same credit-load, prerequisite, section-timing, and GenEd signals used by the registration checklist.
- Render the questions next to Timeline planning guidance.
- Add a selectable text export for advisor prep.
- Add regression coverage and a mobile browser smoke test.

Completed:
- Added `plannerAdvisorQuestion()`, `plannerAdvisorQuestions()`, `plannerAdvisorQuestionCard()`, `plannerAdvisorQuestionsText()`, and `plannerAdvisorQuestionsHtml()` in `js/timeline.js`.
- Timeline now renders an `Advisor Questions` panel after `Registration Checklist`.
- Generated questions cover:
  - next-term underload/overload confirmation.
  - prerequisite order and override questions.
  - picked-section timing realism.
  - missing section strategy.
  - GenEd course-selection questions.
  - official audit confirmation when no risk is found.
- Added `Select questions` with hidden textarea export text.
- Added `Open Schedule` and `Find GenEd` action hooks inside question cards.
- Added responsive `planner-questions` styling in `styles.css`.
- Versioned changed browser assets:
  - `styles.css?v=38`
  - `js/timeline.js?v=8`
- Added the `PLANNER-QUESTIONS` regression fixture.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the account/share fixture, the account setup fixture, the schedule timing/comparison/advisor fixture, the planner checklist fixture, the new planner questions fixture, and the Browse profile fixture.
- Planner questions fixture confirmed:
  - credit-load advisor question appears.
  - `CMSC 216` prerequisite advisor question appears.
  - picked-section timing question appears.
  - GenEd advisor question appears.
  - warning/danger levels are preserved.
  - export text starts with `Advisor questions` and includes course context.
  - question HTML includes select, Schedule, and GenEd action hooks.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded a seeded `http://127.0.0.1:5174/?pass41questions=1` state from a temporary static server and confirmed:
  - `styles.css?v=38` and `js/timeline.js?v=8` loaded.
  - Timeline opened successfully.
  - `Advisor Questions` rendered with warning, danger, and info cards.
  - question cards included underload, prerequisite, timing, and GenEd questions.
  - `Select questions` exposed copyable export text containing `Advisor questions`, `CMSC 216`, and timing context.
  - `Open Schedule` routed to `pass41-browser-fall` in the Schedule tab.
  - no browser console warnings/errors.
  - no horizontal overflow at the browser's 380px viewport.
- Reset the browser viewport, removed the temporary seed page, and stopped the temporary static server.

Next pass candidates:
- Add a generated-plan diagnostics screen for comparing live-metadata vs template-only plans.
- Improve Browse with saved profile searches and richer personalized class recommendations.
- Add a first-run interactive profile flow that creates a personalized four-year plan from major, interests, AP/transfer credits, and target graduation date.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 42

Focus: make generated major plans explain their source quality before a student applies them.

Planned changes:
- Add generated-plan diagnostics comparing live metadata with template-only fallback data.
- Surface load balance, GenEd placeholder coverage, placeholder replacement work, and profile personalization in Settings.
- Add regression coverage for diagnostics.
- Browser-check the Settings modal on mobile.

Completed:
- Extended `autoPlanAnalyzeSchedule()` in `js/import.js` with `placeholderSamples`.
- Extended `buildAutoPlanPreview()` metadata coverage with:
  - `coveragePct`.
  - `liveCodes`.
  - `missingCodes`.
- Added `autoPlanDiagnostic()`, `autoPlanDiagnostics()`, `autoPlanDiagnosticsHtml()`, and `autoPlanSourceSamplesHtml()` in `js/settings.js`.
- Settings Auto Plan Review now shows a diagnostics grid for:
  - live metadata complete vs mixed metadata vs template-only preview.
  - load balance / heavy terms.
  - GenEd placeholder coverage.
  - placeholder replacement credits.
  - personalized vs neutral elective placeholders.
- Added source sample rows for live metadata, template fallback, and placeholders to replace.
- Added responsive diagnostic styling in `styles.css`.
- Made the Settings button binding more robust by exposing Settings entry points on `window`, binding the topbar Settings button from `js/settings.js`, and guarding the duplicate binding in `js/events.js`.
- Fixed a mobile topbar hit-target bug where right-justified horizontally scrolling action buttons could overlap the brand and miss clicks.
- Versioned changed browser assets:
  - `styles.css?v=40`
  - `js/settings.js?v=6`
  - `js/import.js?v=5`
  - `js/events.js?v=5`
- Added the `AUTO-PLAN-DIAGNOSTICS` regression fixture.

Verification:
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the new auto-plan diagnostics fixture, the account/share fixture, the account setup fixture, the schedule timing/comparison/advisor fixture, the planner checklist fixture, the planner questions fixture, and the Browse profile fixture.
- Auto-plan diagnostics fixture confirmed:
  - template-only preview reports `0%` live coverage.
  - template-only preview lists fallback codes.
  - diagnostics include `Template-only preview` and `Replacement work`.
  - source samples include `Template fallback` and `Placeholders to replace`.
  - mixed preview counts `3/15` live records.
  - mixed preview shows partial coverage percent.
  - mixed diagnostics include `Mixed metadata sources`.
  - mixed source samples compare `Live metadata` with `Template fallback`.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `git diff --check`.
- Loaded a seeded `http://127.0.0.1:5174/?pass42diagnostics=1` state from a temporary static server and confirmed:
  - `styles.css?v=40`, `js/settings.js?v=6`, `js/import.js?v=5`, and `js/events.js?v=5` loaded.
  - mobile topbar Settings hit target lands on the Settings icon instead of the brand.
  - Settings modal opens from the topbar at the browser's 380px viewport.
  - generated STAT Auto Plan Review renders `auto-plan-review generated`.
  - diagnostics render five cards: live metadata complete, load balance, GenEd placeholders covered, replacement work, and personalized electives.
  - source samples render live metadata and placeholder replacement rows.
  - no browser console warnings/errors.
  - no horizontal overflow at the browser's 380px viewport.
- Reset the browser viewport, removed the temporary seed page, and stopped the temporary static server.

Next pass candidates:
- Improve Browse with saved profile searches and richer personalized class recommendations.
- Add a first-run interactive profile flow that creates a personalized four-year plan from major, interests, AP/transfer credits, and target graduation date.
- Add diagnostics actions that jump directly from placeholder source samples to Browse replacement searches.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 43

Focus: make Browse reusable for students who repeatedly search the same departments, GenEd gaps, and profile-aligned topics.

Planned changes:
- Add saved Browse search presets for department, profile-department, GenEd, and keyword filters.
- Persist saved searches across local state, imports, snapshots, share links, and cloud restores.
- Surface GenEd gap matches directly on Browse course cards.
- Add regression coverage and browser-check desktop/mobile layout.

Completed:
- Added normalized `browseSavedSearches` state with a 12-search limit.
- Added `Save search`, saved-search chips, apply, active-state, and remove behavior in Browse.
- Saved search chips preserve:
  - department filters.
  - profile-department mode.
  - GenEd filters including all-GenEd mode.
  - typed keyword filters.
- Added Browse result prioritization for courses that satisfy current GenEd gaps.
- Added `Fills gap` course-card tags for matching GenEd requirements.
- Persisted saved Browse searches through:
  - local state load.
  - JSON import/export.
  - snapshots.
  - share links.
  - cloud plan restore.
- Added responsive chip-strip styling with stable mobile hit targets and ellipsis for long saved searches.
- Versioned changed browser assets:
  - `styles.css?v=41`
  - `js/state.js?v=13`
  - `js/io.js?v=10`
  - `js/browse.js?v=4`
  - `js/share.js?v=10`
  - `js/snapshots.js?v=9`
  - `js/account.js?v=6`
- Extended generated-plan regression coverage:
  - shared plans normalize and retain valid saved Browse searches.
  - invalid saved Browse searches are dropped.
  - Browse can save, apply, and delete a profile-department + GenEd + keyword preset.

Verification:
- Ran `node --check` on the touched JavaScript files and `scripts/test-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the auto-plan diagnostics fixture, the account/share fixture with saved Browse search persistence, the account setup fixture, the schedule timing fixture, the planner checklist fixture, the planner questions fixture, and the Browse profile saved-search fixture.
- Reused the existing static server at `http://127.0.0.1:5173/`.
- Loaded a temporary same-origin browser seed page, then removed it before commit.
- Browser desktop check confirmed:
  - `styles.css?v=41`, `js/state.js?v=13`, and `js/browse.js?v=4` loaded.
  - Browse opened without horizontal overflow.
  - saving `CMSC · systems` created one active saved-search chip and one remove button.
  - changing filters away and clicking the chip restored `CMSC` and `systems`.
  - the saved chip persisted after reload.
  - removing the chip hid the saved-search strip.
- Browser mobile check at a 390px viewport confirmed:
  - toolbar wraps inside the viewport.
  - a long saved search chip plus remove button fit in the saved-search strip.
  - no horizontal overflow.
  - no browser console errors.
- Reset the browser viewport after QA.

Next pass candidates:
- Add first-run profile onboarding that builds an individualized plan from major, interests, AP/transfer credits, target graduation date, and time constraints.
- Add diagnostics actions that jump from placeholder source samples directly to Browse saved replacement searches.
- Add Browse result sections for "best for your plan", "fills missing GenEd", and "available in your next term".
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 44

Focus: make first-run setup produce a more individualized plan instead of only applying a default major template.

Planned changes:
- Add target graduation and credit-load controls to onboarding.
- Add default schedule preferences during onboarding.
- Show a personalized setup preview before Finish.
- Apply chosen start year, profile, transfer credit, timeline, and schedule preferences to the created plan.
- Add regression coverage and browser QA.

Completed:
- Expanded onboarding from 5 to 6 steps with:
  - major and start year.
  - interests, career goal, and preferred GenEd departments.
  - current year, target graduation term/year, and max credits per term.
  - schedule defaults for earliest start, latest end, minimum breaks, optimization mode, and avoided weekdays.
  - AP/IB/transfer code import.
  - a fast preview before Finish.
- Added onboarding helpers for:
  - target semester-count calculation.
  - schedule preference normalization.
  - schedule preference application across plan semesters.
  - preview summary rendering.
- Reused the existing Auto Plan Review UI inside onboarding so setup previews show term loads, GenEd coverage, diagnostics, and profile fit.
- Generated-major previews now honor onboarding `startYear`, `numSemesters`, `creditCap`, and profile preferences.
- Curated major previews now relabel their term loads when onboarding chooses a later start year.
- Applying curated, fixed, or generated major templates now derives the hero year range from the chosen start/term count instead of keeping stale template text.
- Onboarding Finish now stops on major-apply failure instead of closing with a partially configured plan.
- Added responsive onboarding styles for two-column controls, weekday preference chips, and the preview panel.
- Versioned changed browser assets:
  - `styles.css?v=42`
  - `js/import.js?v=8`
  - `js/onboarding.js?v=3`
- Added the `ONBOARDING-PERSONALIZED` regression fixture.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the auto-plan diagnostics fixture, the account/share fixture, the account setup fixture, the schedule timing fixture, the planner checklist fixture, the planner questions fixture, the Browse profile saved-search fixture, and the new personalized onboarding fixture.
- Onboarding fixture confirmed:
  - Fall-to-Spring standard timeline creates 8 terms.
  - Fall target graduation creates a 7-term fast path.
  - schedule preferences normalize and drop invalid duplicate avoided days.
  - generated preview honors start year, term count, credit cap, and profile preferences.
  - curated preview and applied curated schedule relabel to `Fall 2028`.
  - applied schedule preferences persist with inferred UMD term `202808`.
  - hero eyebrow reflects `2028–2032`.
- Attempted in-app browser QA against `http://127.0.0.1:5173/`, but the selected in-app browser repeatedly timed out during local navigation after reconnecting and following the browser troubleshooting path.
- Used Chrome fallback with the existing local server at `http://127.0.0.1:5173/` and confirmed:
  - `styles.css?v=42`, `js/import.js?v=8`, and `js/onboarding.js?v=3` loaded.
  - first-run onboarding opened at the major step with six progress dots.
  - setup preview used the selected `Fall 2028` start and did not show stale `Fall 2026` labels.
  - preview showed `Fall 2028 to Spring 2032`, 8 terms, 16-credit cap, and schedule defaults after 10:00 / before 17:00 / 30 min breaks / avoid Friday / compact.
  - Finish closed onboarding and created a plan starting at `Fall 2028`.
  - hero eyebrow changed to `UMD · Computer Engineering · 2028–2032`.
  - Schedule tab inherited start-after `10:00`, end-before `17:00`, `30` minute breaks, `compact` mode, and avoid-Friday.
  - no horizontal overflow and no Chrome console errors.
- Removed the temporary seed page and finalized the Chrome tab.

Next pass candidates:
- Add diagnostics actions that jump from placeholder source samples directly to Browse saved replacement searches.
- Add Browse result sections for "best for your plan", "fills missing GenEd", and "available in your next term".
- Add a post-onboarding checklist that asks for AP/IB score details and maps common scores to UMD course credit.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 45

Focus: make generated-plan diagnostics actionable by jumping from placeholder source samples into saved Browse replacement searches.

Planned changes:
- Add replacement buttons to Auto Plan Review placeholder source samples.
- Infer Browse department and GenEd filters from each placeholder.
- Save the opened replacement search so students can come back after reviewing options.
- Keep onboarding previews focused by hiding jump-away actions there.
- Add regression coverage and Chrome QA.

Completed:
- Added `browseOpenSearch` and `browseUpsertSavedSearch` so Browse can be opened programmatically with a saved search preset.
- Added placeholder-to-Browse config helpers that infer:
  - specific GenEd tags such as DSHU, SCIS, and FSAW.
  - profile-department mode when the profile is active.
  - all-GenEd browsing for non-profile placeholder searches.
- Added compact `Find ...` buttons to generated-plan placeholder source samples.
- Clicking a placeholder action now:
  - closes Settings.
  - switches to Browse.
  - applies the inferred department and GenEd filters.
  - saves the replacement search with a `Replace ...` label.
- Disabled placeholder Browse actions inside onboarding preview cards so first-run setup stays in the guided flow.
- Added wrapping styles for source-sample actions so diagnostics remain compact.
- Versioned changed browser assets:
  - `styles.css?v=43`
  - `js/settings.js?v=7`
  - `js/onboarding.js?v=4`
  - `js/browse.js?v=5`
- Extended the auto-plan diagnostics regression fixture to cover placeholder action rendering, profile-department inference, GenEd filter inference, Browse switching, and saved replacement-search creation.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the auto-plan diagnostics fixture with replacement actions, the account/share fixture, the account setup fixture, the schedule timing fixture, the planner checklist fixture, the planner questions fixture, the Browse profile saved-search fixture, and the personalized onboarding fixture.
- Ran `git diff --check`.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=43`, `js/settings.js?v=7`, `js/onboarding.js?v=4`, and `js/browse.js?v=5` loaded.
  - STAT generated Auto Plan Review showed placeholder source samples plus four replacement buttons.
  - clicking the `Find SCIS` action closed Settings and opened Browse.
  - Browse selected `__PROFILE_DEPTS__` and `SCIS`.
  - the saved replacement search chip rendered with a `Replace GenEd SCIS` label.
  - the saved chip survived reload.
  - applying the saved chip after reload restored `__PROFILE_DEPTS__` plus `SCIS`.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add Browse result sections for "best for your plan", "fills missing GenEd", and "available in your next term".
- Add a post-onboarding checklist that asks for AP/IB score details and maps common scores to UMD course credit.
- Add drag-and-drop or one-click replacement from Browse result cards into placeholder slots.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 46

Focus: make Browse results easier to act on by grouping live catalog rows into personalized highlights.

Planned changes:
- Add Browse sections for best plan fits, GenEd gap fillers, and next-term availability.
- Reuse existing profile, GenEd gap, planned-course, GPA, and schedule-term signals.
- Hydrate posted-section availability without making Browse feel blocked.
- Add regression coverage and Chrome QA.

Completed:
- Added Browse row decoration helpers that score catalog rows by:
  - already in plan status.
  - missing GenEd tags.
  - profile interest, career-goal, and preferred-department matches.
  - cached GPA signals.
  - posted-section availability and open-seat counts.
- Added `Browse highlights` above the full catalog grid with:
  - `Best for your plan`.
  - `Fills missing GenEds`.
  - `Available in <term>`.
- Added compact card rendering shared by highlight sections and the full result grid.
- Added next-term context detection from the schedule planner so Browse availability matches the term TerpTrack would schedule next.
- Added bounded section hydration for the top ranked candidates only:
  - shows a checking state while top candidates are being evaluated.
  - promotes rows with posted sections and open seats into the availability section.
  - shows a clear no-posted-sections state instead of continuously walking down the full result list.
- Kept the full result grid below highlights, sorted by plan fit.
- Added responsive styles so highlight columns collapse cleanly on narrow screens.
- Versioned changed browser assets:
  - `styles.css?v=44`
  - `js/browse.js?v=7`
- Added the `BROWSE-SECTIONS` regression fixture for best-fit ranking, GenEd-gap grouping, availability grouping, posted/open-seat badges, and in-plan tagging.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the auto-plan diagnostics fixture with replacement actions, the account/share fixture, the account setup fixture, the schedule timing fixture, the planner checklist fixture, the planner questions fixture, the Browse profile saved-search fixture, the new Browse sections fixture, and the personalized onboarding fixture.
- Ran `git diff --check`.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=44` and `js/browse.js?v=7` loaded.
  - Browse opened with profile departments selected from profile preferences.
  - live profile-department results rendered `Browse highlights`.
  - the highlight titles were `Best for your plan`, `Fills missing GenEds`, and `Available in Fall 2026`.
  - posted-section badges appeared, including examples like `3 posted · 80 open`, `1 posted · 52 open`, and `10 posted · 11 open`.
  - profile-fit and GenEd-gap tags appeared in both highlights and full results.
  - full results still rendered 200 result cards below the highlight sections.
  - the bounded availability fix stopped the indefinite checking loop after top candidates were evaluated.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add one-click replacement from Browse result cards into a selected placeholder slot.
- Add a post-onboarding checklist that asks for AP/IB score details and maps common scores to UMD course credit.
- Add a richer "why this course" drawer that explains profile, GenEd, prereq, and section-availability scoring.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 47

Focus: let students replace a selected placeholder directly from Browse result cards.

Planned changes:
- Add a Browse handoff from the placeholder replacement modal.
- Preserve the selected placeholder target while Browse is open.
- Show replacement context in Browse.
- Add one-click replacement actions on Browse course cards.
- Add regression coverage and Chrome QA.

Completed:
- Added an `Open in Browse` action to the placeholder replacement modal.
- Added `placeholderBrowseConfig` so placeholder searches map into Browse filters:
  - profile departments become Browse profile-department mode.
  - a single selected GenEd tag stays selected.
  - multi-tag placeholders fall back to all GenEds.
  - replacement searches are saved with a `Replace ...` label.
- Added a Browse replacement banner showing the active placeholder, semester slot, and inferred GenEd tags.
- Added `Replace <placeholder>` buttons to Browse cards whenever a placeholder target is active.
- Kept `Add separately` available so students can still add a course without overwriting the placeholder.
- Reused the existing `replacePlaceholderWithCourse` path, including duplicate prevention, GenEd category assignment, saved state, rendering, and target cleanup.
- Added a `Clear target` action in Browse.
- Added responsive styling for the replacement banner and multi-button Browse card actions.
- Versioned changed browser assets:
  - `styles.css?v=45`
  - `js/browse.js?v=8`
  - `js/placeholder-search.js?v=4`
- Added the `BROWSE-PLACEHOLDER-REPLACE` regression fixture covering:
  - placeholder-to-Browse config.
  - saved replacement search creation.
  - target preservation after the modal closes.
  - replacement banner rendering.
  - Browse card replacement actions.
  - actual schedule mutation from a placeholder to a real UMD course.
  - target cleanup after replacement.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the auto-plan diagnostics fixture with replacement actions, the account/share fixture, the account setup fixture, the schedule timing fixture, the planner checklist fixture, the planner questions fixture, the Browse profile saved-search fixture, the Browse sections fixture, the new Browse replacement fixture, and the personalized onboarding fixture.
- Ran `git diff --check`.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=45`, `js/browse.js?v=8`, and `js/placeholder-search.js?v=4` loaded.
  - a seeded `GenEd DSHS` placeholder opened the replacement modal.
  - the modal inferred DSHS and profile departments.
  - `Open in Browse` closed the modal and opened Browse.
  - Browse selected `__PROFILE_DEPTS__` and `DSHS`.
  - a saved replacement search chip appeared with `Replace GenEd DSHS`.
  - Browse showed the replacement banner for `GenEd DSHS`.
  - result cards showed `Replace GenEd DSHS` plus `Add separately`.
  - filtering to `CCJS225` produced one direct full-result replacement button.
  - clicking it replaced the placeholder with `CCJS 225`.
  - the replacement banner cleared, the placeholder row disappeared, and the plan row showed `CCJS 225` with a replacement note and GenEd tags.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add a richer "why this course" drawer that explains profile, GenEd, prereq, and section-availability scoring.
- Add a post-onboarding checklist that asks for AP/IB score details and maps common scores to UMD course credit.
- Add direct placeholder-slot selection from Browse when no placeholder is active.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 48

Focus: explain why Browse recommends each course instead of only ranking cards.

Planned changes:
- Add a per-card Browse explanation panel.
- Explain ranking score contributions from profile fit, GenEd gaps, posted sections, plan status, and GPA.
- Surface prerequisite context from catalog metadata when available.
- Keep the explanation usable in highlights, full results, and replacement-mode cards.
- Add regression coverage and Chrome QA.

Completed:
- Added a `Why` action to every Browse course card.
- Added inline explanation panels with:
  - total rank score.
  - score contribution breakdown.
  - GenEd gap or GenEd coverage context.
  - profile-fit labels and neutral profile states.
  - next-term posted-section/open-seat detail.
  - prerequisite text/code extraction with a clear metadata-fetch fallback.
  - GPA signal wording when a GPA value is available.
- Scoped the open-panel state by card context, so a course appearing in multiple highlight sections and full results only expands the clicked card instance.
- Kept the existing replacement actions intact, with `Why` available beside `Replace`, `Add separately`, and `Add to plan`.
- Added compact panel styling that works inside highlight cards and full Browse cards without introducing horizontal overflow.
- Versioned changed browser assets:
  - `styles.css?v=46`
  - `js/browse.js?v=9`
- Added the `BROWSE-WHY` regression fixture covering:
  - explanation item generation.
  - score header rendering.
  - GenEd gap, profile, section, prereq, and GPA reasons.
  - prerequisite course-code extraction.
  - open/close toggle behavior.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the auto-plan diagnostics fixture with replacement actions, the account/share fixture, the account setup fixture, the schedule timing fixture, the planner checklist fixture, the planner questions fixture, the Browse profile saved-search fixture, the Browse sections fixture, the new Browse explanation fixture, the Browse replacement fixture, and the personalized onboarding fixture.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=46` and `js/browse.js?v=9` loaded.
  - Browse opened with profile departments from profile preferences.
  - live Browse rendered 557 profile-department matches, 212 visible cards, and three highlight sections.
  - every visible Browse card had a `Why` action.
  - expanding the top `INST 466` card showed ranking, GenEd gap, profile fit, posted sections/open seats, and prerequisite context.
  - the duplicate-course state fix left exactly one expanded panel for the clicked card instance.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add a post-onboarding checklist that asks for AP/IB score details and maps common scores to UMD course credit.
- Add direct placeholder-slot selection from Browse when no placeholder is active.
- Add a side-by-side schedule impact preview before adding/replacing a Browse course.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 49

Focus: let students choose a planned placeholder slot directly from Browse cards.

Planned changes:
- Detect compatible placeholder slots from the active plan while Browse results are rendered.
- Add an inline Browse card picker for matching GenEd placeholders and open elective slots.
- Reuse the existing placeholder replacement mutation path.
- Keep `Why` explanations and slot selection from stacking on the same card.
- Add regression coverage and Chrome QA.

Completed:
- Added Browse helpers to identify replaceable placeholders in the current plan:
  - GenEd placeholders from category/tags/title/note.
  - free elective placeholders as lower-priority fallback slots.
  - exact semester/course-index keys for direct Browse selections.
- Added `Choose slot` actions to Browse cards whenever a course can replace a compatible planned placeholder and no replacement target is already active.
- Added an inline slot picker showing:
  - the placeholder code.
  - semester name.
  - match reason such as `DSHS match` or `Open elective slot`.
  - placeholder title.
- Added direct `browseReplaceIntoSlot` flow that sets the same replacement target data as the placeholder modal, then calls the existing replacement path.
- Updated placeholder replacement to respect a Browse-provided slot index when replacing, while stripping internal slot metadata from the saved course.
- Made expanded slot panels and `Why` panels mutually exclusive.
- Added compact styles for the inline slot picker inside highlight and full-result cards.
- Versioned changed browser assets:
  - `styles.css?v=47`
  - `js/browse.js?v=10`
  - `js/placeholder-search.js?v=5`
- Added the `BROWSE-SLOT-SELECT` regression fixture covering:
  - matching GenEd placeholder ranking above elective fallback.
  - closed/open slot picker rendering.
  - slot panel contents and match labels.
  - `Why` panel closing the slot picker.
  - direct replacement into the selected placeholder.
  - nonselected placeholders and elective fallbacks staying untouched.
  - target cleanup after replacement.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the auto-plan diagnostics fixture with replacement actions, the account/share fixture, the account setup fixture, the schedule timing fixture, the planner checklist fixture, the planner questions fixture, the Browse profile saved-search fixture, the Browse sections fixture, the Browse explanation fixture, the Browse replacement fixture, the new Browse slot selection fixture, and the personalized onboarding fixture.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=47`, `js/browse.js?v=10`, and `js/placeholder-search.js?v=5` loaded.
  - a seeded plan with `GenEd DSHS` plus `Free Elective #1` opened Browse successfully.
  - filtering to `GVPT200` rendered `GVPT 200` cards with `Choose slot`.
  - the full-result slot picker opened with `GenEd DSHS` first and `Free Elective #1` as fallback.
  - the slot picker showed `DSHS match` and no horizontal overflow.
  - choosing `GenEd DSHS` replaced it with `GVPT 200`.
  - the free elective remained in the plan.
  - the slot picker closed after replacement.
  - no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add a side-by-side schedule impact preview before adding/replacing a Browse course.
- Add a post-onboarding checklist that asks for AP/IB score details and maps common scores to UMD course credit.
- Add elective-slot recommendations that distinguish free electives, major electives, technical electives, and supporting courses.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 50

Focus: preview schedule impact before adding or replacing a Browse course.

Planned changes:
- Add a compact Browse card preview panel for schedule impact.
- Show term load, GenEd effect, duplicate risk, prereq readiness, and posted-section status.
- Prefer the best matching placeholder slot when one exists; otherwise preview the next add-to-plan term.
- Keep Preview, Choose slot, and Why panels mutually exclusive.
- Add regression coverage and Chrome QA.

Completed:
- Added `Preview` actions to actionable Browse cards.
- Added Browse impact helpers that compute:
  - best preview context: active replacement target, matching placeholder slot, or add-to-plan term.
  - current and projected semester credits.
  - duplicate status against existing planned catalog courses.
  - GenEd gap/coverage impact.
  - prerequisite readiness from catalog prerequisite text when available.
  - posted section/open-seat status from already hydrated availability.
- Added an inline `Schedule impact` panel with level-coded rows for ok/info/warn signals.
- Made Preview mutually exclusive with `Choose slot` and `Why`, so a card never stacks multiple expanded panels.
- Kept the preview read-only: it does not fetch, add, or replace anything.
- Versioned changed browser assets:
  - `styles.css?v=48`
  - `js/browse.js?v=11`
- Added the `BROWSE-IMPACT` regression fixture covering:
  - best-slot preview mode.
  - stable replacement credit load.
  - duplicate check.
  - GenEd gap impact.
  - prerequisite group parsing and missing-prereq messaging.
  - posted-section/open-seat messaging.
  - closed/open panel rendering.
  - panel exclusivity with slot picker and Why.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all six generated-plan fixtures, the prerequisite-chain fixture, the auto-plan diagnostics fixture with replacement actions, the account/share fixture, the account setup fixture, the schedule timing fixture, the planner checklist fixture, the planner questions fixture, the Browse profile saved-search fixture, the Browse sections fixture, the Browse explanation fixture, the new Browse impact preview fixture, the Browse replacement fixture, the Browse slot selection fixture, and the personalized onboarding fixture.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=48`, `js/browse.js?v=11`, and `js/placeholder-search.js?v=5` loaded.
  - a seeded plan with `GenEd DSHS`, `ENGL 101`, and a passed `STAT 100` opened Browse successfully.
  - filtering to `GVPT200` rendered `GVPT 200` with `Add to plan`, `Choose slot`, `Preview`, and `Why`.
  - Preview opened as `Best slot preview`.
  - Preview showed term load `6 -> 6 credits`, the DSHS slot replacement context, GenEd impact, duplicate check, prereq metadata fallback, and `10 posted sections with 11 open seats`.
  - opening `Choose slot` closed Preview.
  - opening `Why` closed the slot picker.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add elective-slot recommendations that distinguish free electives, major electives, technical electives, and supporting courses.
- Add a post-onboarding checklist that asks for AP/IB score details and maps common scores to UMD course credit.
- Add an impact preview variant that estimates prerequisite-chain additions before opening the resolver modal.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 51

Focus: make Browse placeholder slot recommendations type-aware for major, technical, language, support, GenEd, and free-elective slots.

Planned changes:
- Classify placeholder slots beyond broad GenEd/free-elective matching.
- Respect department and course-level hints such as `GVPT 3xx` and `ENME 4xx Tech Elective`.
- Keep open free electives as a lower-priority fallback.
- Render the slot type in the Choose slot panel.
- Add regression coverage for typed slot ranking.

Completed:
- Added Browse slot parsing helpers for:
  - catalog course code department/number/level.
  - placeholder search text across code, title, note, category, kind, and categories.
  - required department hints from slot code/title text.
  - required level hints from `1xx`, `2xx`, `3xx`, `4xx`, and upper-division text.
  - slot kind labels for GenEd, free elective, language sequence, technical elective, major elective, supporting course, and generic placeholder.
- Expanded placeholder detection so non-catalog elective, language, 3xx/4xx, and generated placeholders appear in the slot picker.
- Updated slot matching:
  - GenEd placeholders still require exact GenEd tag overlap and stay highest confidence.
  - language sequence slots only match language departments such as SPAN, FREN, CHIN, JAPN, etc.
  - major elective slots require department and level compatibility when the placeholder provides those hints.
  - technical elective slots require level compatibility and get a department bonus when applicable.
  - major-support slots honor required department hints.
  - free electives remain available as a low-confidence/profile-weighted fallback.
- Updated the Choose slot panel rows to include the slot type before the fit explanation.
- Versioned changed browser assets:
  - `js/browse.js?v=12`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all existing generated-plan fixtures plus the new `BROWSE-TYPED-SLOTS` fixture.
- The new regression fixture confirms:
  - `GVPT 356` ranks `GVPT 3xx Elective A` first.
  - the GVPT slot is typed as `major-elective`.
  - the panel explanation includes `GVPT upper elective`.
  - `Free Elective #1` remains as fallback.
  - a GVPT course does not match the foreign language slot.
  - `SPAN 101` ranks `Foreign Language 101` first.
  - a SPAN course does not match the GVPT upper-elective slot.
  - `PSYC 221` ranks `PSYC 2xx Support A` first.
  - the PSYC slot is typed as `major-support` and explains the department fit.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=48`, `js/browse.js?v=12`, and `js/placeholder-search.js?v=5` loaded.
  - a seeded plan with `GVPT 3xx Elective A`, `Foreign Language 101`, and `Free Elective #1` opened Browse successfully.
  - filtering to `GVPT356` rendered `GVPT 356` with `Choose slot`.
  - the Full results slot picker showed `GVPT 3xx Elective A` with `Major elective · GVPT upper elective`.
  - `Free Elective #1` stayed present as a fallback.
  - `Foreign Language 101` was excluded for the GVPT course.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add AP/IB and transfer-credit intake that maps common credits to UMD course equivalents before schedule generation.
- Add a degree-rule issue drawer that explains why each remaining placeholder exists and what course families can satisfy it.
- Add section-aware replacement flow that previews real meeting times before replacing a placeholder.
- Validate a real deployed magic-link account round trip once Supabase/Vercel credentials are available.

## 2026-06-30 Pass 52

Focus: upgrade onboarding prior-credit intake from raw course codes to a useful AP/IB/transfer-credit workflow.

Planned changes:
- Add common AP and IB prior-learning presets in the onboarding transfer step.
- Map selected presets to UMD course equivalents or GenEd prior-credit pseudo-courses.
- De-duplicate overlapping presets and manually typed course codes.
- Mark planned courses as transfer credit and add unplanned equivalents to the outside-plan transfer area.
- Keep the UI compact inside the existing onboarding modal.

Completed:
- Added 20 AP/IB prior-credit presets covering common direct equivalents such as:
  - AP Calculus AB/BC, AP Statistics, AP Computer Science A, AP English Language, AP Biology, AP Chemistry, AP Physics C Mechanics, AP Economics, AP U.S. Government, and AP Psychology.
  - IB Math HL, IB Economics HL, IB Biology HL, IB Chemistry HL, IB Physics HL, IB Psychology, and IB Philosophy.
- Added prior-credit helpers in onboarding for:
  - preset lookup.
  - display-code normalization.
  - AP/IB/manual-course de-duplication.
  - summary text generation.
  - applying prior credits after the selected major plan is generated.
- Added a compact onboarding preset grid with checkbox chips and a live summary.
- Added an FSAW pseudo-course path for AP English Language credit, since that credit is a GenEd prior-learning award rather than a stable ENGL 101 course-code replacement.
- Preserved raw transfer-code support and metadata lookup via `fetchCourseFull` for manually entered UMD course codes.
- Recorded a recent plan-change entry when onboarding applies prior credits.
- Versioned changed browser assets:
  - `styles.css?v=49`
  - `js/onboarding.js?v=5`

Verification:
- Checked UMD Registrar prior-learning/AP/IB chart pages while choosing conservative preset mappings.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all existing generated-plan fixtures plus the new `ONBOARDING-PRIOR-CREDIT` fixture.
- The new regression fixture confirms:
  - the preset list exposes a broad AP/IB set.
  - AP Calculus BC plus raw `MATH140` de-duplicates to one `MATH 140`.
  - AP Calculus BC includes `MATH 141`.
  - AP English Language creates `AP FSAW Credit` with `gened-fsaw`.
  - IB Economics HL creates both `ECON 200` and `ECON 201`.
  - raw `CMSC131` normalizes to `CMSC 131` and uses fetched metadata when available.
  - planned `MATH 140` is marked transfer without becoming a duplicate custom course.
  - unplanned equivalents become outside-plan transfer courses.
  - transfer statuses and recent-change recording are applied.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin reset page, then removed the reset page before commit.
- Chrome confirmed:
  - `styles.css?v=49` and `js/onboarding.js?v=5` loaded.
  - the clean first-run onboarding modal opened.
  - the transfer step rendered 20 AP/IB preset checkboxes.
  - selecting AP Calculus BC, AP English Language, IB Economics HL, and raw `CMSC131 MATH140` produced `6 courses · 20 credits · MATH 140, MATH 141, AP FSAW Credit, ECON 200, ECON 201, CMSC 131`.
  - the finish preview carried the same prior-credit summary.
  - finishing onboarding marked six rows as transfer.
  - planned `MATH 140`, `MATH 141`, and `CMSC 131` were marked transfer in-place.
  - `AP FSAW Credit`, `ECON 200`, and `ECON 201` appeared in the transfer/outside-plan area.
  - no horizontal overflow and no app-origin Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add a post-onboarding prior-credit editor in Settings so existing users can add AP/IB/transfer credit after first-run setup.
- Add a degree-rule issue drawer that explains why each remaining placeholder exists and what course families can satisfy it.
- Add section-aware replacement flow that previews real meeting times before replacing a placeholder.
- Add policy-source links or a dated equivalency notice inside the prior-credit editor once a broader official-source view exists.

## 2026-06-30 Pass 53

Focus: make AP/IB/transfer-credit intake available after onboarding through Settings.

Planned changes:
- Add a Settings prior-credit editor for existing users.
- Reuse the same AP/IB preset mappings and raw course-code parser from onboarding.
- Apply selected credits to the current plan immediately.
- Mark planned matches as transfer and add unplanned equivalents to Transfer / Outside Plan.
- Add regression and Chrome coverage for the post-onboarding flow.

Completed:
- Added an `AP / IB / Transfer Credit` section to Settings.
- Rendered the 20 existing AP/IB preset chips inside Settings with the same compact grid style used during onboarding.
- Added a live Settings prior-credit summary using the shared prior-credit resolver.
- Added an `Apply Prior Credits` action that:
  - validates a preset or raw code selection exists.
  - applies credits through the shared prior-credit helper.
  - records the recent plan change with `source: settings`.
  - saves state and re-renders the plan.
  - clears the Settings prior-credit form after success.
  - leaves the Settings modal open with a concise success/error status.
- Kept planned courses from duplicating as custom courses.
- Versioned changed browser assets:
  - `styles.css?v=50`
  - `js/settings.js?v=8`
  - `js/onboarding.js?v=6`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all existing generated-plan fixtures plus the new `SETTINGS-PRIOR-CREDIT` fixture.
- The new regression fixture confirms:
  - Settings renders AP/IB preset chips.
  - the live Settings summary counts de-duplicated preset plus raw credits.
  - applying from Settings marks planned `MATH 140` and `CMSC 131` as transfer.
  - applying from Settings adds unplanned equivalents such as `MATH 141` and `AP FSAW Credit` outside the plan.
  - Settings avoids duplicating already-planned courses as custom courses.
  - the recent-change source is `settings`.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=50`, `js/settings.js?v=8`, and `js/onboarding.js?v=6` loaded.
  - Settings opened for an existing-user seeded plan.
  - the Settings prior-credit editor rendered 20 preset checkboxes.
  - selecting AP Calculus BC, AP English Language, IB Economics HL, and raw `CMSC131 MATH140` produced `6 courses · 20 credits · MATH 140, MATH 141, AP FSAW Credit, ECON 200, ECON 201, CMSC 131`.
  - applying credits reported `Applied 6 prior-credit courses · 4 added outside plan.`
  - the form cleared after success.
  - `MATH 140` and `CMSC 131` were marked transfer in-place.
  - `AP FSAW Credit` and `ECON 200` rendered in Transfer / Outside Plan.
  - no horizontal overflow and no app-origin Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add a degree-rule issue drawer that explains why each remaining placeholder exists and what course families can satisfy it.
- Add section-aware replacement flow that previews real meeting times before replacing a placeholder.
- Add policy-source links or a dated equivalency notice inside the prior-credit editor once a broader official-source view exists.
- Add undo for bulk prior-credit applications through recent changes.

## 2026-06-30 Pass 54

Focus: add a degree-rule issue drawer that explains unresolved placeholders and requirement gaps with direct replacement actions.

Planned changes:
- Add a full-width Degree Issues card inside Degree Audit.
- Detect open GenEd gaps and planned placeholder families.
- Explain why each issue remains and what course family can satisfy it.
- Add direct actions to open placeholder replacement or saved Browse searches.
- Add regression and Chrome coverage for the new audit workflow.

Completed:
- Added a `Degree Issues` audit card that spans the audit grid.
- Added audit issue helpers that detect:
  - missing GenEd requirements, including composite Diversity coverage.
  - GenEd placeholders.
  - free elective placeholders.
  - typed major electives such as `GVPT 3xx`.
  - technical, language, and support-course placeholders through the existing Browse slot classifier when available.
- Added expandable issue drawers with:
  - issue type, status, and short summary.
  - `Why it remains` explanation.
  - `What can satisfy it` explanation.
  - tag chips for GenEd-driven slots.
  - primary `Choose Replacement` / `Find Courses` action.
  - secondary `Open Browse` action.
- Reused existing replacement/search flows:
  - placeholder issues call `openPlaceholderSearch(courseCode, semId)`.
  - GenEd gaps and Browse actions call `browseOpenSearch(..., save: true)`.
  - profile department filtering is used when student profile preferences are available.
- Added responsive audit issue styling with stacked mobile drawers and fixed action sizing.
- Versioned changed browser assets:
  - `styles.css?v=51`
  - `js/audit.js?v=1`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures plus the new `AUDIT-ISSUES` fixture.
- The new regression fixture confirms:
  - audit issues include GenEd gaps and placeholder rows.
  - GenEd placeholders explain matching GenEd tags.
  - typed major electives expose department and level requirements.
  - free electives explain personalized elective handling.
  - the expanded drawer renders explanatory copy and actions.
  - the primary placeholder action opens the exact slot replacement flow.
  - the Browse handoff switches to Browse, preserves the GenEd filter, uses profile departments, and saves an audit-labeled search.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=51` and `js/audit.js?v=1` loaded.
  - seeded plan rendered `GenEd DSHU`, `GVPT 3xx Elective A`, and `Free Elective #1`.
  - Degree Audit rendered a full-width `Degree Issues` card with `16 open items`, `3 placeholders`, and `13 GenEd gaps`.
  - the `GenEd DSHU` drawer expanded with `Why it remains`, `What can satisfy it`, `Choose Replacement`, and `Open Browse`.
  - `Choose Replacement` opened the placeholder modal for `Replace GenEd DSHU` with `DSHU` selected.
  - `Open Browse` switched to Browse with department `__PROFILE_DEPTS__`, GenEd `DSHU`, and saved search `Audit: replace GenEd DSHU`.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add section-aware replacement flow that previews real meeting times before replacing a placeholder.
- Add policy-source links or a dated equivalency notice inside the prior-credit editor once a broader official-source view exists.
- Add undo for bulk prior-credit applications through recent changes.
- Add a compact advisor-export summary of open audit issues.

## 2026-06-30 Pass 55

Focus: add section-aware meeting-time previews before replacing a placeholder course.

Planned changes:
- Add a `Preview times` action to placeholder replacement results.
- Use the placeholder's target semester and selected UMD term for section lookup.
- Compare candidate sections against already picked sections in that semester.
- Show meeting times, open seats, timing fit, conflicts, and term-load change before replacement.
- Add deterministic regression and Chrome coverage.

Completed:
- Added per-result section preview state inside the placeholder replacement modal.
- Added placeholder schedule-context helpers that resolve:
  - target placeholder semester.
  - selected UMD term and term label.
  - current and post-replacement semester credits.
  - current picked sections excluding the placeholder being replaced.
- Added section preview helpers that:
  - fetch posted sections with `umdioFetchSections(course, term)`.
  - rank non-conflicting sections ahead of conflicting options.
  - reuse existing Schedule timing and conflict helpers.
  - show open seats, waitlist status, meeting summary, timing score, and conflicts with picked sections.
  - handle loading, no-term, lookup-error, and no-posted-section states.
- Added `Preview times` / `Hide times` buttons beside `Use this course` in each placeholder search result.
- Added compact preview panel styles for posted section options.
- Versioned changed browser assets:
  - `styles.css?v=52`
  - `js/placeholder-search.js?v=6`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures plus the new `PLACEHOLDER-SECTIONS` fixture.
- The new regression fixture confirms:
  - preview uses the target placeholder semester and term `202608`.
  - replacement keeps term load stable at `6 -> 6` credits.
  - already picked sections are included in conflict checks.
  - the non-conflicting section ranks first.
  - open seats and timed meetings are exposed.
  - conflicts with a picked `ENGL 101` section are flagged.
  - preview, loading, and no-posted-section HTML states render.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page that backed up and restored both app state and the umd.io cache, then removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=52` and `js/placeholder-search.js?v=6` loaded.
  - seeded plan rendered `GenEd DSHS` and a picked `ENGL 101` section.
  - opening `GenEd DSHS` displayed a cached `GVPT 200` replacement result with `Preview times`.
  - `Preview times` expanded to show `Pass 55 Fall 2026 · Fall 2026 · 6 -> 6 credits`.
  - the non-conflicting `0201 · TuTh 2:00pm-3:15pm · TYD 2101` section ranked first with `18 open`, `Excellent timing (100/100)`, and `No conflicts with picked sections`.
  - the conflicting `0101 · M 10:30am-11:45am · TYD 1101` section showed `Conflicts with ENGL 101`.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add policy-source links or a dated equivalency notice inside the prior-credit editor once a broader official-source view exists.
- Add undo for bulk prior-credit applications through recent changes.
- Add a compact advisor-export summary of open audit issues.
- Add one-click section pinning from the placeholder preview when a replacement is selected.

## 2026-06-30 Pass 56

Focus: let students replace a placeholder and keep the exact section they previewed.

Planned changes:
- Add a one-click action inside placeholder meeting previews for posted sections.
- Replace the placeholder with the chosen course while saving that specific section to the target semester.
- Pin the saved section so later auto-pick runs preserve the student's explicit time choice.
- Clear stale placeholder section picks and record the replacement in recent plan changes.
- Add deterministic regression and Chrome coverage.

Completed:
- Added preview-cache helpers to resolve a clicked posted section from the active placeholder preview.
- Added `Use + pin` buttons to each previewed section option:
  - non-conflicting options render as the primary action.
  - conflicting options remain available but visually secondary.
- Extended `replacePlaceholderWithCourse()` to accept an optional section selection.
- When a preview section is selected, replacement now:
  - swaps the placeholder course for the real UMD course.
  - clears any stale selected-section state under the placeholder code.
  - saves the selected posted section under the replacement course code.
  - pins the section for future auto-pick preservation.
  - records a `placeholder-section-replacement` recent-change entry.
- Added compact row styling for preview section actions.
- Versioned changed browser assets:
  - `styles.css?v=53`
  - `js/placeholder-search.js?v=7`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `PLACEHOLDER-SECTIONS` fixture confirms:
  - `0201` remains the first ranked non-conflicting section.
  - preview HTML renders `Use + pin`.
  - applying `GVPT200-0201` replaces `GenEd DSHS` with `GVPT 200`.
  - the selected section is persisted under `GVPT200`.
  - the selected section is pinned.
  - the selected section keeps term `202608`.
  - stale placeholder section state is cleared.
  - the modal target clears after replacement.
  - a `placeholder-section-replacement` recent-change entry is recorded.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=53` and `js/placeholder-search.js?v=7` loaded.
  - seeded plan rendered `GenEd DSHS` and a picked `ENGL 101`.
  - opening the placeholder showed the cached `GVPT 200` replacement result.
  - `Preview times` expanded to show `0201` first with `18 open`, `Excellent timing (100/100)`, and `No conflicts with picked sections`.
  - both previewed sections rendered `Use + pin`, with `0201` as the primary action.
  - clicking `Use + pin` for `0201` closed the modal and replaced the plan row with `GVPT 200`.
  - the Plan row showed `0201 · TuTh 2:00pm-3:15pm · TYD 2101`.
  - the Schedule tab showed `GVPT 200` as picked, pinned, ranked `1/2`, and carrying `18 open` seats.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add undo for placeholder replacements with pinned section picks.
- Add policy-source links or a dated equivalency notice inside the prior-credit editor once a broader official-source view exists.
- Add undo for bulk prior-credit applications through recent changes.
- Add a compact advisor-export summary of open audit issues.

## 2026-06-30 Pass 57

Focus: add undo for placeholder replacements that also changed a pinned section pick.

Planned changes:
- Preserve enough undo data when replacing a placeholder to restore the original slot.
- Include previous course status and selected-section state in the undo payload.
- Render an `Undo` action in Timeline Recent Changes for undoable placeholder replacements.
- Restore the original placeholder, remove the replacement section, and mark the original change as already undone.
- Add regression and Chrome coverage.

Completed:
- Extended `recordPlanChange()` to keep a bounded JSON-safe `undo` payload.
- Added placeholder replacement undo snapshots for:
  - the original placeholder course.
  - the exact active/custom semester or custom-course location.
  - previous course status under both original and replacement codes.
  - previous selected-section state under both original and replacement codes.
- Added Timeline undo helpers that:
  - find the replacement course by saved slot location with a same-semester fallback.
  - verify the current course still matches the replacement code before applying undo.
  - restore original course status and selected sections.
  - clear the replacement selected section unless one existed before the replacement.
  - mark the original change's undo payload with `appliedAt`.
  - record a new `placeholder-undo` change.
- Added `Undo` buttons to Recent Changes rows when the change has an unapplied placeholder-replacement undo payload.
- Added Recent Changes styling for action rows and explicit meta text.
- Versioned changed browser assets:
  - `styles.css?v=54`
  - `js/state.js?v=14`
  - `js/timeline.js?v=9`
  - `js/placeholder-search.js?v=8`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `PLACEHOLDER-SECTIONS` fixture confirms:
  - the `GVPT200-0201` replacement still saves and pins the section.
  - the recent change includes a `placeholder-replacement` undo payload.
  - Recent Changes renders an `Undo` action.
  - `undoPlanChange()` restores `GenEd DSHS`.
  - the prior placeholder selected-section state is restored.
  - the replacement selected-section state is cleared.
  - a `placeholder-undo` change is recorded.
  - the original replacement change is marked as already undone.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=54`, `js/state.js?v=14`, `js/timeline.js?v=9`, and `js/placeholder-search.js?v=8` loaded.
  - seeded plan rendered `GenEd DSHS` and no `GVPT 200`.
  - placeholder preview ranked `0201` first with `18 open`, `Excellent timing (100/100)`, and `No conflicts with picked sections`.
  - `Use + pin` replaced the placeholder with `GVPT 200` and section `0201`.
  - Timeline Recent Changes rendered `Replaced GenEd DSHS with GVPT 200` plus an `Undo` button.
  - clicking `Undo` restored the visible `GenEd DSHS` row with the prior `OLD · time TBA` section chip.
  - Timeline recorded `Restored GenEd DSHS` and removed the old undo button.
  - Schedule no longer showed the `GVPT 200` pick after undo.
  - no horizontal overflow and no Chrome console warnings/errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add undo for bulk prior-credit applications through recent changes.
- Add policy-source links or a dated equivalency notice inside the prior-credit editor once a broader official-source view exists.
- Add a compact advisor-export summary of open audit issues.
- Add a student-facing conflict explanation when undo is unavailable because the replacement course changed afterward.

## 2026-06-30 Pass 58

Focus: add undo for bulk AP/IB/transfer prior-credit applications.

Planned changes:
- Preserve enough state when prior credits are applied to restore planned-course statuses.
- Track outside-plan prior-credit courses added by the apply operation so undo can remove them.
- Render a Timeline Recent Changes undo action for prior-credit applications.
- Record a separate restore event after undo and mark the original operation as already undone.
- Add deterministic regression and Chrome coverage.

Completed:
- Added prior-credit undo payloads to onboarding/settings application flow:
  - snapshots previous `state.courses` values for each applied code.
  - captures custom prior-credit courses added outside the active plan.
  - records the source that applied the credits.
- Extended Timeline undo handling so prior-credit applications can be undone from Recent Changes.
- Restored prior planned-course statuses during undo and removed outside-plan prior-credit rows that were created by the original application.
- Added a `prior-credit-undo` recent-change record and marked the original undo payload with `appliedAt`.
- Versioned changed browser assets:
  - `js/timeline.js?v=10`
  - `js/onboarding.js?v=7`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - applying AP Calculus BC, AP English Language, IB Economics HL, and typed raw codes applies 6 transfers.
  - 4 outside-plan prior-credit courses are added.
  - the recent change includes a `prior-credit` undo payload.
  - Recent Changes renders an `Undo` action.
  - `undoPlanChange()` restores planned-course statuses for `MATH 140` and `CMSC 131`.
  - outside-plan prior-credit courses are removed, leaving 0 custom rows.
  - a `prior-credit-undo` change is recorded.
  - the original change is marked as already undone.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `js/timeline.js?v=10` and `js/onboarding.js?v=7` loaded.
  - a clean seeded plan rendered `MATH 140` and `CMSC 131` with no transfer badges.
  - Settings rendered 20 prior-credit preset checkboxes.
  - selecting AP Calculus BC, AP English Language, IB Economics HL, and typed `CMSC131 MATH140` produced the summary `6 courses · 20 credits · MATH 140, MATH 141, AP FSAW Credit, ECON 200, ECON 201, CMSC 131`.
  - applying prior credits reported `Applied 6 prior-credit courses · 4 added outside plan`.
  - transfer badges and `AP FSAW Credit` were visible after apply.
  - Timeline Recent Changes rendered `Applied 6 prior-credit courses`, all 6 course codes, `4 added outside plan`, and an `Undo` button.
  - clicking `Undo` rendered `Undid 6 prior-credit courses` and `4 outside-plan courses removed`.
  - the old undo button disappeared and transfer badges were removed from the plan.
  - no horizontal overflow was present.
  - Chrome console output had only extension-origin noise; there were no app-origin warnings or errors.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add policy-source links or a dated equivalency notice inside the prior-credit editor.
- Add a compact advisor-export summary of open audit issues.
- Add student-facing conflict explanations when undo is unavailable because a course changed afterward.
- Broaden prior-credit equivalency coverage with official-source mappings.

## 2026-06-30 Pass 59

Focus: explain and block stale undo actions after students make later edits.

Planned changes:
- Detect when a placeholder-replacement undo is stale because the replacement course or section pick changed afterward.
- Detect when a prior-credit undo is stale because one of the applied transfer statuses changed afterward.
- Show the stale reason directly in Timeline Recent Changes instead of presenting an unsafe Undo button.
- Keep direct undo clicks guarded with the same reason.
- Add deterministic regression and Chrome coverage.

Completed:
- Added dynamic Timeline undo availability checks for:
  - placeholder replacements.
  - placeholder replacements with expected pinned section state.
  - bulk prior-credit applications.
- Added a stored expected replacement selected-section snapshot to placeholder replacement undo payloads.
- Added a stored applied course-state snapshot to prior-credit undo entries.
- Updated Recent Changes so stale undo rows show compact `Undo unavailable` text and hide the Undo button.
- Guarded direct `undoPlanChange()` calls so stale undo attempts return false and report the same reason through the existing toast path.
- Versioned changed browser assets:
  - `styles.css?v=55`
  - `js/timeline.js?v=11`
  - `js/onboarding.js?v=8`
  - `js/placeholder-search.js?v=9`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `PLACEHOLDER-SECTIONS` fixture confirms:
  - Recent Changes renders Undo while the replacement section still matches the expected pinned section.
  - changing the replacement section to a different section disables undo.
  - the stale row explains that the section pick changed after replacement.
  - the stale row hides the Undo button.
  - direct stale undo reports the same section-pick reason and returns false.
  - restoring the expected section allows the normal placeholder undo to complete.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - Recent Changes renders Undo while applied prior-credit statuses are untouched.
  - changing `MATH 140` from transfer to passed disables undo.
  - the stale row explains that `MATH 140` changed after credits were applied.
  - the stale row hides the Undo button.
  - direct stale undo reports the same edited-status reason and returns false.
  - restoring the expected transfer status allows the normal prior-credit undo to complete.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=55`, `js/timeline.js?v=11`, `js/onboarding.js?v=8`, and `js/placeholder-search.js?v=9` loaded.
  - a seeded stale placeholder replacement rendered `Undo unavailable: GVPT 200's section pick changed after this replacement.`
  - a seeded stale prior-credit application rendered `Undo unavailable: MATH 140 was changed after these credits were applied.`
  - both stale rows had zero Undo buttons.
  - the Timeline had no horizontal overflow.
  - the restored app page no longer showed the seeded QA state.
  - Chrome console warnings/errors were clean.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add policy-source links or a dated equivalency notice inside the prior-credit editor.
- Add a compact advisor-export summary of open audit issues.
- Add a safe stale-undo recovery affordance that jumps to the edited course or section.
- Broaden prior-credit equivalency coverage with official-source mappings.

## 2026-06-30 Pass 60

Focus: add compact degree-audit issue summaries to advisor schedule exports.

Planned changes:
- Reuse the Degree Audit issue model inside the advisor packet.
- Show the full open audit issue count while keeping the packet compact.
- Add an output option for including or hiding audit issues.
- Include the audit snapshot in visible advisor packets, downloaded advisor HTML, and advisor text.
- Add deterministic regression and Chrome coverage.

Completed:
- Added a new `Audit issues` schedule-output include option.
- Defaulted `auditIssues` to on for new, imported, shared, cloud-loaded, and snapshot-restored plans.
- Added advisor audit summary helpers that:
  - pull from `auditDegreeIssues()`.
  - count all open issues.
  - list the top 6 compact issues.
  - include issue level, title, summary, status, and satisfying requirement text.
- Added a `Degree Audit Snapshot` section to the advisor packet.
- Added an `Audit issues` stat card alongside credits, current-term picks, conflicts, and timing fit.
- Added audit snapshot text to advisor text output.
- Added standalone advisor-document CSS so downloaded HTML packets preserve the audit section.
- Versioned changed browser assets:
  - `styles.css?v=56`
  - `js/state.js?v=15`
  - `js/schedule.js?v=26`
  - `js/io.js?v=11`
  - `js/share.js?v=11`
  - `js/snapshots.js?v=10`
  - `js/account.js?v=7`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `AUDIT-ISSUES` fixture confirms:
  - advisor schedule output defaults `auditIssues` on.
  - advisor HTML includes `Degree Audit Snapshot`.
  - advisor HTML reports the full `16 open items` count while showing the top 6.
  - top issue titles appear in the advisor packet.
  - advisor text includes audit snapshot details and `Satisfies:` lines.
  - standalone downloaded advisor HTML includes audit CSS/markup.
  - turning `auditIssues` off removes the audit snapshot from advisor HTML.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=56`, `js/state.js?v=15`, `js/schedule.js?v=26`, `js/io.js?v=11`, `js/share.js?v=11`, `js/snapshots.js?v=10`, and `js/account.js?v=7` loaded.
  - Schedule Output rendered the new `Audit issues` include option checked by default.
  - Advisor Packet rendered `Degree Audit Snapshot`.
  - The audit snapshot showed `16 open items · 3 placeholders · 13 GenEd gaps · showing top 6`.
  - Six compact audit rows rendered.
  - Unchecking `Audit issues` hid the audit snapshot and changed the preset indicator to Custom.
  - There was no horizontal overflow.
  - The restored app page no longer showed the seeded QA state.
  - Chrome console warnings/errors were clean.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add policy-source links or a dated equivalency notice inside the prior-credit editor.
- Add a safe stale-undo recovery affordance that jumps to the edited course or section.
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add advisor packet quick links from audit issues into Browse or placeholder replacement.

## 2026-06-30 Pass 61

Focus: add official-source links and a dated verification notice to prior-credit planning.

Planned changes:
- Replace generic prior-credit caveats with a compact official-source notice.
- Reuse the same notice in onboarding and Settings so students see it wherever they apply AP, IB, or transfer credit.
- Include direct links to UMD's Registrar prior-learning page, transfer-course database page, and transfer equivalency search app.
- Add deterministic coverage for the notice and source links.

Completed:
- Added reusable prior-credit source constants and render helpers in `js/onboarding.js`.
- Added a dated `Official source check` notice that says presets are planning shortcuts, not transcript decisions, and notes that UMD credit depends on exam year, departmental approval, official score reports, duplicate-credit rules, and current Registrar charts.
- Set the source checked date to `June 30, 2026`.
- Rendered the notice in:
  - onboarding transfer-credit step.
  - Settings AP / IB / Transfer Credit editor.
- Added compact notice and wrapped source-link styling.
- Added regression assertions for onboarding and Settings source notice text and links.
- Versioned changed browser assets:
  - `styles.css?v=57`
  - `js/settings.js?v=9`
  - `js/onboarding.js?v=9`

Verification:
- Confirmed the official source URLs return HTTP 200:
  - `https://registrar.umd.edu/transfer-credit/prior-learning-credit`
  - `https://registrar.umd.edu/transfer-credit/transfer-course-database`
  - `https://app.transfercredit.umd.edu/`
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `ONBOARDING-PRIOR-CREDIT` fixture confirms:
  - source notice includes `Official source check`.
  - source notice includes `June 30, 2026`.
  - source notice links UMD Prior Learning Credit.
  - source notice links the Transfer Credit Database search app.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - source notice renders in the Settings prior-credit editor.
  - source notice includes Transfer Course Database, checked date, and search app links.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/`.
- Chrome confirmed in the Settings editor:
  - `styles.css?v=57`, `js/settings.js?v=9`, and `js/onboarding.js?v=9` loaded.
  - source notice rendered with `Official source check` and `June 30, 2026`.
  - all three official links rendered with `target="_blank"` and `rel="noopener noreferrer"`.
  - there was no horizontal overflow.
  - Chrome console warnings/errors were clean.
- Chrome confirmed through a temporary local onboarding fixture using production assets:
  - `styles.css?v=57` and `js/onboarding.js?v=9` loaded.
  - the onboarding transfer-step notice rendered under `AP / IB / transfer credits?`.
  - all three official links rendered with the expected attributes.
  - there was no horizontal overflow.
  - Chrome console warnings/errors were clean.
- Removed the temporary onboarding QA fixture before commit.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add source-level notes per prior-credit preset.
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add a safe stale-undo recovery affordance that jumps to the edited course or section.
- Add advisor packet quick links from audit issues into Browse or placeholder replacement.

## 2026-06-30 Pass 62

Focus: make stale Timeline undo rows actionable by jumping students to the edited course.

Planned changes:
- Keep stale undo protection in place when a later edit makes undo unsafe.
- Add a compact recovery action to stale rows that can still locate the edited course.
- Reuse Plan navigation and focus behavior so students land directly on the affected row.
- Cover both stale placeholder replacements and stale prior-credit undo entries.

Completed:
- Added Timeline helpers that:
  - identify edited prior-credit courses by comparing current state to the expected applied transfer state.
  - find a stale placeholder replacement's edited replacement course.
  - reset Plan filters/search before navigation.
  - switch to the Plan tab, scroll the affected course into view, and flash the existing plan-focus style.
- Recent Changes now renders `Show edited course` or `Show first edited course` for stale undo rows with a resolvable course target.
- Unsafe stale rows still hide the `Undo` button and keep the explanatory `Undo unavailable` reason.
- Added small recovery-action styling.
- Versioned changed browser assets:
  - `styles.css?v=58`
  - `js/timeline.js?v=12`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `PLACEHOLDER-SECTIONS` fixture confirms:
  - a stale section-pick undo still hides the Undo button.
  - the stale row renders a recovery jump.
  - the recovery target resolves to `GVPT 200`.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - a stale prior-credit undo still hides the Undo button.
  - the stale row renders a recovery jump.
  - the recovery target resolves to `MATH 140`.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=58` and `js/timeline.js?v=12` loaded.
  - a seeded stale prior-credit row rendered `Undo unavailable: MATH 140 was changed after these credits were applied.`
  - the stale row had zero Undo buttons and one `Show edited course` button.
  - clicking `Show edited course` switched to the Plan tab.
  - the Plan search/filter state reset to All with an empty search box.
  - `MATH 140` was visible and received the plan-focus highlight.
  - there was no horizontal overflow.
  - Chrome console warnings/errors were clean.
  - the restored app page no longer showed the seeded QA state.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add source-level notes per prior-credit preset.
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add advisor packet quick links from audit issues into Browse or placeholder replacement.
- Add Schedule tab quick jump from Timeline stale section-pick rows to the affected term.

## 2026-06-30 Pass 63

Focus: add Schedule-term recovery jumps for stale section-pick undo rows.

Planned changes:
- Keep the existing Plan recovery action for stale undo rows.
- Add a Schedule-specific recovery action only when stale undo is caused by a changed section pick.
- Land the student on the affected Schedule term and highlight the edited course's section row.
- Keep prior-credit stale rows Plan-only.

Completed:
- Added Timeline schedule recovery target detection for placeholder replacements whose expected replacement section no longer matches the current selected section.
- Recent Changes now renders `Show schedule term` next to `Show edited course` for stale section-pick undo rows.
- Added a click handler that:
  - switches to the Schedule tab.
  - selects the affected semester.
  - waits for the async section list to render.
  - scrolls the edited course row into view.
  - flashes the row with a Schedule-specific focus style.
- Prior-credit stale undo rows continue to show only the Plan recovery action.
- Versioned changed browser assets:
  - `styles.css?v=59`
  - `js/timeline.js?v=13`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `PLACEHOLDER-SECTIONS` fixture confirms:
  - stale section-pick undo rows still hide the unsafe Undo button.
  - stale section-pick undo rows render `Show edited course`.
  - stale section-pick undo rows render `Show schedule term`.
  - the schedule recovery target resolves to `PASS55` and `GVPT 200`.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - stale prior-credit undo rows still hide Undo.
  - stale prior-credit undo rows render `Show edited course`.
  - stale prior-credit undo rows do not render a section Schedule jump.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page with deterministic cached section data, then restored the backed-up local app state and section cache and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=59` and `js/timeline.js?v=13` loaded.
  - a seeded stale section-pick row rendered `Undo unavailable: GVPT 200's section pick changed after this replacement.`
  - the stale row had zero Undo buttons, one `Show edited course` button, and one `Show schedule term` button.
  - clicking `Show schedule term` switched to the Schedule tab.
  - the Schedule semester selector landed on `PASS63`.
  - the Schedule term stayed on `202608`.
  - the `GVPT 200` section row was visible, highlighted, and still selected `GVPT200-0999`.
  - there was no horizontal overflow.
  - Chrome console warnings/errors were clean.
  - the restored app page no longer showed the seeded QA state.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add source-level notes per prior-credit preset.
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add advisor packet quick links from audit issues into Browse or placeholder replacement.
- Add richer Timeline recovery for moved or removed replacement courses.

## 2026-06-30 Pass 64

Focus: add original-term recovery for moved or removed placeholder replacements.

Planned changes:
- Keep `Show edited course` for moved replacements when the replacement course still exists elsewhere in the plan.
- Add a recovery action for cases where the replacement course no longer exists in its original slot.
- Let students jump back to the original affected Plan term even when the replacement was moved or deleted.
- Keep section-specific Schedule recovery reserved for section-pick staleness.

Completed:
- Added Timeline original-term target detection for placeholder replacement undo entries whose replacement course is no longer in the expected slot.
- Recent Changes now renders `Show original term` for stale moved/removed replacement rows.
- Added a Plan-semester jump helper that:
  - resets Plan filters/search.
  - switches to the Plan tab.
  - scrolls to the original semester card.
  - flashes the term with a new focus style.
- Moved replacements can now show both `Show edited course` and `Show original term`.
- Removed replacements show `Show original term` without an edited-course jump.
- Versioned changed browser assets:
  - `styles.css?v=60`
  - `js/timeline.js?v=14`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `PLACEHOLDER-SECTIONS` fixture confirms:
  - moved replacements disable unsafe undo with the moved/removed reason.
  - moved replacements still render `Show edited course`.
  - moved replacements render `Show original term`.
  - moved replacement targets resolve to `GVPT 200` and the original `PASS55` term.
  - removed replacements disable unsafe undo with the moved/removed reason.
  - removed replacements do not render `Show edited course`.
  - removed replacements still render `Show original term` for the original `PASS55` term.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=60` and `js/timeline.js?v=14` loaded.
  - a seeded moved-replacement row rendered `Undo unavailable: the replacement course was moved or removed.`
  - the stale row had zero Undo buttons, one `Show edited course` button, and one `Show original term` button.
  - no `Show schedule term` button appeared for the moved replacement.
  - clicking `Show original term` switched to the Plan tab.
  - the Plan search/filter state reset to All with an empty search box.
  - the original term card was visible and received the term-focus highlight.
  - there was no horizontal overflow.
  - Chrome console warnings/errors were clean.
  - the restored app page no longer showed the seeded QA state.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add source-level notes per prior-credit preset.
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add advisor packet quick links from audit issues into Browse or placeholder replacement.
- Add actionable Timeline recovery for prior-credit rows whose courses were removed from the plan.

## 2026-06-30 Pass 65

Focus: add actionable Timeline recovery for prior-credit rows whose courses were removed from the plan.

Planned changes:
- Keep visible edited-course jumps for stale prior-credit rows when the affected course still appears in Plan.
- Add a Settings recovery action when a stale prior-credit undo entry points at a course with no visible Plan row.
- Open the AP / IB / Transfer Credit editor directly from Timeline and make the target obvious.
- Keep prior-credit recovery separate from placeholder term and Schedule recovery actions.

Completed:
- Added prior-credit recovery target detection for stale undo rows whose changed course is no longer visible in the Plan.
- Recent Changes now renders `Review prior credits` for those rows instead of a missing edited-course jump.
- Added a Timeline click path that:
  - opens Settings.
  - scrolls to the AP / IB / Transfer Credit section.
  - focuses the other-course-code textarea.
  - briefly highlights the prior-credit editor with a Settings-specific focus style.
- Added a stable Settings section anchor for the prior-credit editor.
- Versioned changed browser assets:
  - `styles.css?v=61`
  - `js/timeline.js?v=15`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - removed prior-credit courses disable unsafe undo.
  - removed prior-credit courses explain the stale undo with the changed course code.
  - removed prior-credit courses hide the unsafe Undo button.
  - removed prior-credit courses do not render a missing `Show edited course` Plan jump.
  - removed prior-credit courses render `Review prior credits`.
  - visible edited prior-credit courses still render `Show edited course` and do not show Settings recovery.
  - stale prior-credit rows still do not render section Schedule jumps.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=61` and `js/timeline.js?v=15` loaded.
  - a seeded stale prior-credit row rendered `Undo unavailable: AP FSAW Credit was changed after these credits were applied.`
  - the stale row had zero Undo buttons, zero `Show edited course` buttons, zero Schedule/term recovery buttons, and one `Review prior credits` button.
  - clicking `Review prior credits` opened Settings.
  - the AP / IB / Transfer Credit section received the focus highlight.
  - keyboard focus landed on `#set-prior-codes`.
  - the prior-credit source note rendered.
  - the prior-credit editor and textarea were visible in the viewport.
  - there was no horizontal overflow.
  - Chrome app-origin console warnings/errors were clean; unrelated extension warnings were ignored.
  - the restored app page no longer showed the seeded QA state.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Add source-level notes per prior-credit preset.
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add advisor packet quick links from audit issues into Browse or placeholder replacement.
- Add Timeline recovery for stale prior-credit rows with multiple changed courses split between Plan-visible and removed items.

## 2026-06-30 Pass 66

Focus: add source-level notes per AP / IB prior-credit preset.

Planned changes:
- Make each prior-credit preset visibly carry its chart source context instead of relying only on the generic source note.
- Keep onboarding and Settings prior-credit chips consistent through shared rendering.
- Add direct AP and IB chart links to the official source panel.
- Preserve compact chip layout without horizontal overflow.

Completed:
- Added prior-credit source metadata for AP and IB presets:
  - AP presets show `AP chart 2023-2026`, UMD course count, and an exam-year verification note.
  - IB presets show `IB chart 2023-2026`, UMD course count, and an exam-date verification note.
- Added direct UMD Registrar PDF links for:
  - `AP Chart 2023-2026`
  - `IB Chart 2023-2026`
- Added a shared prior-credit chip renderer used by both first-run onboarding and Settings.
- Styled the new per-chip source line as compact metadata.
- Versioned changed browser assets:
  - `styles.css?v=62`
  - `js/settings.js?v=10`
  - `js/onboarding.js?v=10`

Verification:
- Checked UMD Registrar prior-learning-credit source context before changing the UI. The app still tells students presets are planning shortcuts and that official score reports, exam year/date, duplicate-credit rules, department review, and Registrar charts matter.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `ONBOARDING-PRIOR-CREDIT` fixture confirms:
  - every preset exposes chart source metadata.
  - AP presets name the AP chart, course count, and exam-year caveat.
  - IB presets name the IB chart and exam-date caveat.
  - preset chips render the new source line.
  - the official source note links the AP and IB chart sources.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - Settings prior-credit chips render the same per-preset source notes.
  - the Settings source notice includes AP and IB chart links.
  - prior-credit apply, stale undo, recovery, and undo behavior still pass.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=62`, `js/settings.js?v=10`, and `js/onboarding.js?v=10` loaded.
  - first-run onboarding opened on the seeded state.
  - using the real `Next` controls reached the transfer step.
  - onboarding showed 20 prior-credit chips and 20 per-chip source lines.
  - AP Calc BC showed `AP chart 2023-2026 · 2 UMD courses · verify by exam year`.
  - IB Economics HL showed `IB chart 2023-2026 · 2 UMD courses · verify by exam date`.
  - onboarding source links included UMD Prior Learning Credit, AP Chart 2023-2026, IB Chart 2023-2026, Transfer Course Database, and Search transfer equivalencies.
  - Settings showed the same 20 source-tagged prior-credit chips and source links.
  - there was no horizontal overflow in onboarding, Settings, or the page.
  - Chrome app-origin console warnings/errors were clean.
  - the restored app page no longer showed the seeded onboarding state.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add advisor packet quick links from audit issues into Browse or placeholder replacement.
- Add Timeline recovery for stale prior-credit rows with multiple changed courses split between Plan-visible and removed items.
- Add a source/verification drawer for a selected prior-credit preset.

## 2026-06-30 Pass 67

Focus: add advisor packet quick links from audit issues into Browse or placeholder replacement.

Planned changes:
- Keep the existing Audit drawer actions as the source of truth.
- Carry each audit issue's next action into the Schedule advisor packet.
- Show the Browse target used for GenEd gaps and placeholders.
- Make in-app advisor packet rows clickable without breaking downloaded/printed packets.

Completed:
- Extended Schedule's advisor audit issue projection to include:
  - action type.
  - course/semester target for placeholder replacement.
  - sanitized Browse target details.
  - human-readable next-action text.
- Advisor Packet audit rows now show:
  - `Next action`.
  - `Browse target`.
  - a primary quick-link button.
  - an `Open Browse` quick-link button.
- In-app advisor packet buttons now call the same Audit actions used by the Degree Audit drawer:
  - placeholder issues open the placeholder replacement modal.
  - GenEd gap and Browse actions open Browse with the saved audit search.
- Downloaded/printed advisor packets include the same action and Browse-target text plus styled quick-link labels.
- Versioned changed browser assets:
  - `styles.css?v=63`
  - `js/schedule.js?v=27`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `AUDIT-ISSUES` fixture confirms:
  - placeholder issues carry replacement quick-link text such as `Replace GenEd DSHU in Pass 54 Fall`.
  - GenEd gap issues carry Browse target context such as `Profile departments · DSHU`.
  - advisor HTML includes `Next action`, `Browse target`, and `data-schedule-audit-*` quick-link buttons.
  - advisor text export includes `Next action:` and `Browse target:` lines.
  - standalone advisor documents include the audit quick-link CSS/markup.
  - existing Audit drawer primary and Browse handoffs still work.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=63` and `js/schedule.js?v=27` loaded.
  - a seeded plan with GenEd gaps and placeholders opened without the welcome panel.
  - the Schedule Advisor Packet rendered the Degree Audit Snapshot.
  - the top six audit rows each showed a `Next action`, `Browse target`, primary quick-link button, and `Open Browse` button.
  - the packet showed Browse targets such as `Profile departments · DSHS`.
  - clicking the first in-app advisor packet quick link switched to Browse.
  - Browse landed on profile departments with the DSHS GenEd filter.
  - Browse saved an audit-labeled search.
  - there was no horizontal overflow.
  - Chrome app-origin console warnings/errors were clean.
  - the restored app page no longer showed the seeded audit state or saved audit search.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add Timeline recovery for stale prior-credit rows with multiple changed courses split between Plan-visible and removed items.
- Add a source/verification drawer for a selected prior-credit preset.
- Add advisor-packet deep links from downloaded HTML back into the live app when opened from the same origin.

## 2026-06-30 Pass 68

Focus: add Timeline recovery for stale prior-credit rows with multiple changed courses split between Plan-visible and removed items.

Planned changes:
- Keep unsafe prior-credit undo blocked whenever any applied credit no longer matches the recorded transfer state.
- Split changed prior-credit entries into visible Plan courses and removed/outside-plan credits.
- Offer a Plan jump for the visible changed course and a Settings recovery for removed prior credits on the same Timeline row.
- Keep removed-only and visible-only stale prior-credit behavior unchanged.

Completed:
- Added `plannerPriorCreditChangeGroups(change)` to classify changed prior-credit entries as:
  - visible in the current Plan.
  - missing from the current Plan and therefore recoverable through prior-credit review.
- Updated prior-credit Timeline recovery labels:
  - mixed visible/removed rows now show `Show Plan edit`.
  - mixed removed-credit rows now show `Review removed credit` or `Review N removed credits`.
  - removed-only rows still show `Review prior credits`.
  - visible-only rows still show `Show edited course` or `Show first edited course`.
- Prior-credit Settings recovery now carries the missing changed course codes in its target data.
- Extended the generated-plan prior-credit editor regression to simulate:
  - `MATH 140` still visible in Plan but changed from transfer to passed with grade A.
  - `AP FSAW Credit` removed from course state and outside-plan custom courses.
  - the same stale Timeline row exposing both Plan and Settings recovery actions.
- Versioned changed browser assets:
  - `js/timeline.js?v=16`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - mixed stale prior-credit rows disable unsafe undo.
  - the unavailable reason lists both `MATH 140` and `AP FSAW Credit`.
  - no `data-change-undo` button is rendered.
  - `Show Plan edit` targets visible `MATH 140`.
  - `Review removed credit` targets missing `AP FSAW Credit`.
  - removed-only and visible-only stale prior-credit recovery behavior remains covered.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - the seeded app loaded at `/?pass68-mixed-prior-credit=1`.
  - `styles.css?v=63` and `js/timeline.js?v=16` loaded.
  - the Timeline row showed `Undo unavailable: MATH 140, AP FSAW Credit were changed after these credits were applied.`
  - the Timeline row showed zero undo buttons.
  - the Timeline row showed one `Show Plan edit` recovery button.
  - the Timeline row showed one `Review removed credit` recovery button.
  - schedule-term and original-term recovery buttons were absent for this prior-credit row.
  - clicking `Show Plan edit` switched to Plan, reset filters/search, and focused visible `MATH 140`.
  - clicking `Review removed credit` opened Settings, focused `#set-prior-codes`, highlighted the prior-credit section, and showed the official-source note.
  - there was no horizontal overflow in Timeline, Plan recovery, or Settings recovery.
  - the restore URL returned to `/?pass68-restored=1` and the seeded Timeline text was absent afterward.
  - Chrome app-origin console warnings/errors were clean.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add a source/verification drawer for a selected prior-credit preset.
- Add advisor-packet deep links from downloaded HTML back into the live app when opened from the same origin.
- Add Timeline recovery for stale prior-credit rows with multiple removed prior-credit entries and pluralized Settings labels.

## 2026-06-30 Pass 69

Focus: add a source/verification drawer for selected prior-credit presets in onboarding and Settings.

Planned changes:
- Let students inspect AP/IB preset equivalencies before selecting them.
- Reuse the existing prior-credit preset metadata instead of duplicating mappings.
- Show source-specific official links so AP presets do not show IB chart links and IB presets do not show AP chart links.
- Keep the drawer available both during first-run onboarding and later from Settings.

Completed:
- Added shared prior-credit verification helpers in `js/onboarding.js`:
  - category labels for GenEd and major-support credit.
  - source-specific official link filtering.
  - equivalent-course detail rendering.
  - open/close helpers for a reusable inline drawer.
  - grid binding for `Details` actions.
- Every AP/IB preset chip now includes a compact `Details` action alongside the checkbox.
- Added prior-credit detail regions to:
  - first-run onboarding transfer-credit step.
  - Settings AP / IB / Transfer Credit section.
- The drawer shows:
  - preset name and detail.
  - checked source and checked date.
  - UMD equivalent course rows with credit counts and requirement tags.
  - a verification caveat for exam year/date, duplicate-credit rules, score reports, and transfer records.
  - AP-only or IB-only official chart links plus UMD prior-learning and transfer database links.
- Settings reuses the shared onboarding drawer binding instead of maintaining a separate implementation.
- Styled the drawer, details buttons, course rows, source links, and mobile single-column layout.
- Versioned changed browser assets:
  - `styles.css?v=64`
  - `js/settings.js?v=11`
  - `js/onboarding.js?v=11`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `ONBOARDING-PRIOR-CREDIT` fixture confirms:
  - preset chips expose `data-prior-detail` `Details` actions.
  - AP Calc BC detail HTML renders the drawer, `MATH 141`, verification caveats, AP Chart 2023-2026, and the June 30, 2026 checked date.
  - AP detail links include the AP chart and exclude the IB chart.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - Settings prior-credit chips expose details actions.
  - opening AP Calc BC details in the Settings panel renders the selected source and equivalents.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed in first-run onboarding:
  - `styles.css?v=64`, `js/settings.js?v=11`, and `js/onboarding.js?v=11` loaded.
  - the transfer-credit step showed 20 prior-credit chips.
  - clicking `Details` for AP Calc BC opened the verification drawer.
  - the drawer showed AP Calc BC, `MATH 141`, AP Chart 2023-2026, and source links excluding IB Chart 2023-2026.
  - clicking `Details` did not select the AP Calc BC checkbox.
  - there was no page or onboarding-modal horizontal overflow.
- Chrome confirmed in Settings:
  - clicking `Details` for IB Economics HL opened the reused Settings drawer.
  - the drawer showed `ECON 200`, `ECON 201`, IB Chart 2023-2026, and source links excluding AP Chart 2023-2026.
  - clicking `Details` did not select the IB Economics checkbox.
  - the drawer close button hid and cleared the Settings detail region.
  - there was no page, Settings-modal, or prior-credit-section horizontal overflow.
  - the restore URL returned to `/?pass69-restored=1` and seeded drawer text was absent afterward.
  - Chrome app-origin console warnings/errors were clean.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add advisor-packet deep links from downloaded HTML back into the live app when opened from the same origin.
- Add Timeline recovery for stale prior-credit rows with multiple removed prior-credit entries and pluralized Settings labels.
- Add a transfer/prior-credit review checklist that compares selected credits against a student's chosen start year.

## 2026-06-30 Pass 70

Focus: add live-app deep links from downloaded advisor packets back into TerpTrack actions.

Planned changes:
- Keep the existing in-app advisor packet quick links working without changing their behavior.
- Make the same quick links usable from downloaded standalone advisor packet HTML.
- Route downloaded packet links back into the live app with enough context to reopen Browse or placeholder replacement.
- Preserve the existing `#plan=` share-link import path.

Completed:
- Converted advisor packet audit action controls from inert standalone buttons into styled anchors.
- Added shared advisor deep-link helpers in `js/schedule.js`:
  - hash generation for `primary` and `browse` actions.
  - live app base URL generation from the current origin and path.
  - hash parsing for `#advisor-action=...&issue=...`.
  - startup/hashchange handling that resolves the current audit issue and opens the same live action as the packet button.
  - hash cleanup after successful routing.
- In-app packet action listeners still intercept clicks and call:
  - `scheduleOpenAdvisorAuditPrimary`.
  - `scheduleOpenAdvisorAuditBrowse`.
- `js/main.js` now processes advisor-action hashes on first load unless the hash is a `#plan=` shared-plan import.
- First-run onboarding is suppressed when an advisor-action hash is successfully handled.
- Standalone advisor packet CSS now styles action anchors as buttons.
- Versioned changed browser assets:
  - `styles.css?v=65`
  - `js/schedule.js?v=28`
  - `js/main.js?v=3`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `AUDIT-ISSUES` fixture confirms:
  - advisor packet HTML includes live-app `#advisor-action=primary` and `#advisor-action=browse` hrefs.
  - standalone advisor packet HTML includes the same hrefs and quick-link CSS/markup.
  - primary advisor hashes are recognized and reopen placeholder replacement.
  - Browse advisor hashes are recognized and reopen the saved audit Browse target.
  - existing direct Audit drawer primary and Browse handoffs still work.
- Used Chrome with the existing local server at `http://127.0.0.1:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=65`, `js/schedule.js?v=28`, and `js/main.js?v=3` loaded.
  - the seeded Schedule Advisor Packet rendered a Degree Audit Snapshot.
  - rendered packet audit links included absolute app URLs such as `http://127.0.0.1:5173/#advisor-action=browse&issue=gened-DSHU`.
  - clicking the in-app DSHU Browse link was intercepted, switched to Browse, selected profile departments and DSHU, saved the audit search, and left `location.hash` empty.
  - loading the app with `#advisor-action=primary&issue=slot-PASS54-0-GENEDDSHU` opened the placeholder replacement modal for `GenEd DSHU`, cleared the hash, and did not open onboarding.
  - loading the app with `#advisor-action=browse&issue=gened-DSHU` opened Browse with profile departments and DSHU, saved the audit search, cleared the hash, and did not open onboarding.
  - there was no horizontal page overflow in packet, primary-hash, browse-hash, or restored states.
  - the restore URL returned to `/?pass70-restored=1` and the seeded advisor-link state was absent afterward.
  - Chrome app-origin console warnings/errors were clean.
- Finalized the Chrome tab after QA.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add Timeline recovery for stale prior-credit rows with multiple removed prior-credit entries and pluralized Settings labels.
- Add a transfer/prior-credit review checklist that compares selected credits against a student's chosen start year.
- Add an advisor packet import/open banner that explains when live deep links require the same browser profile state.

## 2026-06-30 Pass 71

Focus: add a transfer/prior-credit review checklist that compares selected credits against a student's chosen start year.

Planned changes:
- Reuse the existing prior-credit resolver for both onboarding and Settings.
- Infer the plan start year from onboarding controls, active schedule, or plan settings.
- Warn when selected AP/IB presets cite the 2023-2026 chart window but the plan start year falls outside that range.
- Remind students to verify score reports, manual transfer equivalencies, plan placement, GenEd coverage, and duplicate-credit restrictions.
- Keep the checklist compact enough for first-run onboarding and later Settings edits.

Completed:
- Added shared prior-credit review helpers in `js/onboarding.js`:
  - start-year inference from active schedule and settings.
  - AP/IB source detection.
  - manual typed-course counting.
  - GenEd tag extraction.
  - planned-vs-outside-plan placement detection.
  - checklist item generation and HTML rendering.
- First-run onboarding now refreshes the checklist when the transfer step opens, prior-credit selections change, typed course codes change, or timeline year controls change.
- Settings now renders the same checklist below the prior-credit summary whenever credits are selected.
- The checklist covers:
  - `Chart year check`.
  - `Official score report`.
  - `Manual course lookup`.
  - `Plan placement`.
  - `Requirement coverage`.
  - `Duplicate-credit review`.
- Added responsive checklist styles and singular/plural placement copy.
- Versioned changed browser assets:
  - `styles.css?v=66`
  - `js/settings.js?v=12`
  - `js/onboarding.js?v=13`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `ONBOARDING-PRIOR-CREDIT` fixture confirms:
  - the review checklist renders chart-year checks.
  - Fall 2026 copy tells students to compare AP exam year or IB exam date against the 2023-2026 chart.
  - Fall 2028 copy warns students to verify the current Registrar chart.
  - manual entries mention the Transfer Course Database.
  - plan placement distinguishes matching planned credits from outside-plan credits.
  - duplicate-credit review is always included when credits are selected.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - Settings renders the review checklist when credits are selected.
  - Settings infers Fall 2026 from the active plan.
  - placement and manual lookup checks render in the Settings path.
- Used Chrome with the existing local server at `http://localhost:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed in first-run onboarding:
  - `styles.css?v=66`, `js/settings.js?v=12`, and `js/onboarding.js?v=13` loaded.
  - selecting AP Calc BC and typing `CMSC131` rendered a visible 6-item `Prior Credit Review`.
  - the checklist showed Fall 2028, the current Registrar chart warning, manual Transfer Course Database lookup, plan placement, and duplicate-credit review.
  - there was no horizontal page overflow.
- Chrome confirmed in Settings:
  - opening Settings from a seeded Fall 2026 plan rendered the review after selecting IB Economics HL and typing `CMSC131`.
  - the checklist showed Fall 2026, `IB transcript or score report`, manual lookup, singular plan-match copy, two outside-plan credits, and duplicate-credit review.
  - there was no horizontal page overflow.
- Finalized the Chrome tab after restoring the original local app state.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add Timeline recovery for stale prior-credit rows with multiple removed prior-credit entries and pluralized Settings labels.
- Add an advisor packet import/open banner that explains when live deep links require the same browser profile state.
- Add per-major requirement-source citations to generated schedules.

## 2026-06-30 Pass 72

Focus: make Timeline recovery clearer when several prior-credit entries were removed after applying credits.

Planned changes:
- Improve the stale prior-credit Timeline button labels so removed-credit recovery is explicit and pluralized.
- Show the removed prior-credit codes inside Settings after a Timeline recovery click.
- Clear stale recovery guidance when Settings is opened normally.
- Keep the recovery note compact and distinct from the prior-credit checklist.

Completed:
- Updated `plannerChangePriorCreditTarget()` so all missing prior-credit cases use:
  - `Review removed credit` for one missing entry.
  - `Review N removed credits` for multiple missing entries.
- Added shared Timeline helpers for Settings recovery guidance:
  - `plannerPriorCreditRecoveryHtml(codes)`.
  - `plannerRenderPriorCreditRecovery(codes)`.
- `plannerOpenPriorCreditReview()` now opens Settings and renders a note listing the removed prior-credit codes before focusing the AP / IB / Transfer Credit section.
- Added `#set-prior-recovery-note` to the Settings prior-credit section.
- Normal Settings prior-credit rendering clears any old recovery note so stale context does not linger.
- Styled the recovery note as a compact amber review callout.
- Versioned changed browser assets:
  - `styles.css?v=67`
  - `js/timeline.js?v=17`
  - `js/settings.js?v=13`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - one removed prior-credit entry renders `Review removed credit`.
  - three removed entries render `Review 3 removed credits`.
  - the target carries all removed codes.
  - the Settings recovery note pluralizes `3 removed prior-credit entries need review`.
  - the note lists `AP FSAW Credit, ECON 200, ECON 201` and points students back to AP/IB presets or exact UMD course codes after checking official sources.
  - the Timeline recovery path opens Settings and restores the note after Settings clears normal prior-credit state.
- Used Chrome with the existing local server at `http://localhost:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=67`, `js/timeline.js?v=17`, and `js/settings.js?v=13` loaded.
  - the seeded Timeline Recent Changes row showed `Undo unavailable: AP FSAW Credit, ECON 200, ECON 201 were changed...`.
  - the row rendered a single `Review 3 removed credits` recovery button.
  - clicking the recovery button opened Settings.
  - the Settings prior-credit section was on screen and showed `3 removed prior-credit entries need review`.
  - the note listed `AP FSAW Credit, ECON 200, ECON 201` and included official-source guidance.
  - there was no horizontal page overflow in Timeline or Settings recovery states.
- Finalized the Chrome tab after restoring the original local app state.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add an advisor packet import/open banner that explains when live deep links require the same browser profile state.
- Add per-major requirement-source citations to generated schedules.
- Add a course-equivalency conflict detector for overlapping AP, IB, transfer, and UMD course attempts.

## 2026-06-30 Pass 73

Focus: explain when advisor-packet live links require the same browser profile and local plan state.

Planned changes:
- Add a clear note to advisor packets when live audit-action links are present.
- Include the same guidance in downloaded standalone advisor-packet HTML.
- Include the same guidance in plain-text advisor packet output.
- Keep packets without audit-action links free of irrelevant live-link copy.

Completed:
- Added shared schedule helpers in `js/schedule.js`:
  - `scheduleAdvisorLiveLinkNoticeHtml()`.
  - `scheduleAdvisorLiveLinkNoticeText()`.
- Advisor packets now show a `Live TerpTrack links` note when exported audit issues include action links.
- The note explains:
  - action links reopen the exact plan in TerpTrack.
  - links depend on the same browser profile/local plan state.
  - if the packet is opened on another device or profile, the matching plan should be opened/imported there first.
  - advisors can fall back to the visible `Next action` and `Browse target` text manually.
- Downloaded standalone advisor packet CSS includes the same note styling.
- Plain-text advisor packets include the same live-link guidance.
- Versioned changed browser assets:
  - `styles.css?v=68`
  - `js/schedule.js?v=29`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `AUDIT-ISSUES` fixture confirms:
  - rendered advisor HTML includes the live-link note.
  - the note names the same browser profile/local plan state requirement.
  - the note tells users to open/import the matching plan or use the Next action and Browse target text manually.
  - advisor text output includes the same guidance.
  - standalone advisor packet HTML includes `schedule-advisor-live-note` CSS/markup and the same guidance.
  - the note hides when audit actions are turned off.
- Used Chrome with the existing local server at `http://localhost:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed:
  - `styles.css?v=68` and `js/schedule.js?v=29` loaded.
  - the Schedule advisor packet rendered `Live TerpTrack links`.
  - the note included `same browser profile/local plan state`.
  - the note included the open/import fallback and `Next action and Browse target` fallback.
  - live advisor links were present in the packet.
  - there was no horizontal page overflow.
  - browser console errors were clean.
- Finalized the Chrome tab after restoring the original local app state.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add per-major requirement-source citations to generated schedules.
- Add a course-equivalency conflict detector for overlapping AP, IB, transfer, and UMD course attempts.
- Add advisor-packet import/open affordances for loading shared plans before following packet action links.

## 2026-06-30 Pass 74

Focus: add a course-equivalency conflict detector for overlapping AP, IB, transfer, and UMD course attempts.

Planned changes:
- Preserve enough prior-credit resolver metadata to detect selected sources that map to the same UMD course.
- Warn before applying prior credit when a selected credit would overwrite a course already marked passed, in-progress, or failed.
- Surface these warnings in the existing prior-credit review checklist for both onboarding and Settings.
- Keep existing deduping and apply behavior intact.

Completed:
- `onboardResolvePriorCredits()` now returns an `overlaps` array with duplicated UMD-equivalent course codes and their selected sources.
- Added shared helper functions in `js/onboarding.js`:
  - `onboardPriorFormatList()`.
  - `onboardPriorOverlapSummaries()`.
  - `onboardPriorExistingAttemptConflicts()`.
- The prior-credit review checklist now adds:
  - `Selected-credit overlap` when AP/IB/manual sources map to the same UMD course.
  - `Existing attempt conflict` when selected prior credit would replace a passed, in-progress, or failed UMD course state with transfer credit.
- The existing generic duplicate-credit review remains as a final advisor/Registrar caveat.
- Versioned changed browser asset:
  - `js/onboarding.js?v=14`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `ONBOARDING-PRIOR-CREDIT` fixture confirms:
  - AP Calc BC plus manual `MATH140` creates a resolver overlap for `MATH 140`.
  - overlap metadata includes both `AP Calc BC 4+` and `Manual entry`.
  - the review checklist renders `Selected-credit overlap`.
  - the review checklist renders `Existing attempt conflict` when `MATH 140` is already marked passed.
  - applying the credits still dedupes `MATH 140` and marks it transfer without duplicating the planned row.
- Used Chrome with the existing local server at `http://localhost:5173/` and a temporary same-origin seed page, then restored the backed-up local app state and removed the seed page before commit.
- Chrome confirmed in Settings:
  - `styles.css?v=68` and `js/onboarding.js?v=14` loaded.
  - selecting AP Calc BC and typing `MATH140` rendered a visible 7-item prior-credit review.
  - the review showed `Selected-credit overlap` with `MATH 140 via AP Calc BC 4+` and `Manual entry`.
  - the review showed `Existing attempt conflict` with `MATH 140 is already marked passed (A)`.
  - the warning explained that applying prior credit will replace that status with transfer credit.
  - the summary still deduped to `2 courses · 8 credits · MATH 140, MATH 141`.
  - there was no horizontal page overflow.
  - no app-origin console errors appeared; Chrome logged only an unrelated extension message-port error.
- Finalized the Chrome tab after restoring the original local app state.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add per-major requirement-source citations to generated schedules.
- Add advisor-packet import/open affordances for loading shared plans before following packet action links.
- Add an audit panel that summarizes unresolved prior-credit conflicts after credits are applied.

## 2026-06-30 Pass 75

Focus: add an audit panel item that summarizes unresolved prior-credit conflicts after credits are applied.

Planned changes:
- Preserve prior-credit overlap and existing-attempt evidence in the recent change record created by applying prior credits.
- Add a Degree Audit issue source for recent prior-credit changes with unresolved overlap or existing-attempt review evidence.
- Route the audit issue action to Settings, focused on AP / IB / Transfer Credit, with the conflict summary visible there.
- Include the same issue in advisor packet audit snapshots with Settings-oriented action and target copy.

Completed:
- Added `onboardPriorCreditReviewEvidence()` and stored its `overlaps` and `existingAttempts` payload on prior-credit undo records.
- Added prior-credit audit issue helpers in `js/audit.js` that summarize:
  - selected-source overlaps such as `MATH 140 via AP Calc BC 4+, Manual entry`.
  - existing UMD attempts such as `MATH 140 was already marked passed (A)`.
- The Degree Audit issue drawer now shows `Prior credit conflicts need review`, duplicate-credit/transfer/AP/IB/repeat-attempt rules, and Settings-focused actions.
- The issue opens Settings, focuses the prior-credit section, and writes the amber conflict summary into `set-prior-status`.
- Advisor audit snapshots now count prior-credit reviews, label the action as `Review prior-credit conflicts in Settings`, and use `Settings · AP / IB / Transfer Credit` as the target.
- Versioned changed browser assets:
  - `js/audit.js?v=2`
  - `js/schedule.js?v=30`
  - `js/onboarding.js?v=15`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `AUDIT-ISSUES` fixture confirms:
  - saved prior-credit conflict evidence creates a `prior-credit` audit issue.
  - the issue summarizes both selected-credit overlap evidence and existing-attempt evidence.
  - the drawer renders `Review prior credits`, `Open Settings`, and duplicate-credit rules.
  - both primary and secondary actions open/focus Settings.
  - advisor audit exports include the prior-credit issue, Settings action summary, Settings target, and the updated 17-item count.
- The updated `SETTINGS-PRIOR-CREDIT` fixture confirms:
  - applying Settings prior credits preserves selected-credit overlap evidence on the recent change.
  - applying Settings prior credits preserves existing-attempt conflict evidence on the recent change.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/` and a temporary same-origin seed page, then removed the seed page and stopped the server before commit.
- Chrome confirmed:
  - `js/audit.js?v=2`, `js/schedule.js?v=30`, and `js/onboarding.js?v=15` loaded.
  - the Degree Audit toolbar rendered `1 prior-credit review` with no horizontal overflow.
  - the prior-credit issue rendered at the top with the overlap and existing-attempt summary.
  - expanding the issue showed duplicate-credit, transfer-credit, AP/IB, and repeat-attempt rules.
  - the secondary action label was `Open Settings`, not Browse.
  - clicking `Review prior credits` opened Settings, focused `set-prior-codes`, and displayed the amber conflict summary.
  - no app-origin console errors appeared; Chrome logged only an unrelated extension message-port error.
- Finalized the Chrome tab.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add per-major requirement-source citations to generated schedules.
- Add a resolution/dismissal flow for reviewed prior-credit conflict audit items.
- Add advisor-packet import/open affordances for loading shared plans before following packet action links.

## 2026-06-30 Pass 76

Focus: add a resolution/dismissal flow for reviewed prior-credit conflict audit items.

Planned changes:
- Let students mark a prior-credit conflict as reviewed after checking official sources or advisor guidance.
- Persist the reviewed state on the same recent-change review payload that created the audit issue.
- Remove reviewed prior-credit conflicts from Degree Audit and advisor audit snapshots.
- Keep the Settings review action and prior-credit undo behavior intact.

Completed:
- `auditRecentPriorCreditChanges()` now ignores prior-credit review payloads with `resolvedAt` or legacy `reviewedAt`.
- Added `auditMarkPriorCreditReviewed()` to:
  - find the exact prior-credit recent change behind the open audit issue.
  - store `undo.review.resolvedAt`.
  - store `undo.review.resolvedSummary`.
  - add a `Prior-credit conflicts marked reviewed.` highlight to the recent change.
  - save state, refresh the audit panel, refresh change history when present, and show a success toast.
- The prior-credit audit drawer now keeps `Review prior credits` as the primary Settings action and uses `Mark Reviewed` as the secondary action instead of a duplicate Settings button.
- Advisor audit snapshots automatically stop including reviewed prior-credit conflicts because they are built from the filtered audit issue list.
- Versioned changed browser asset:
  - `js/audit.js?v=3`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `AUDIT-ISSUES` fixture confirms:
  - the prior-credit drawer renders `Review prior credits`, `Mark Reviewed`, and duplicate-credit rules.
  - the primary action still opens/focuses Settings.
  - the deep-link Browse-style action still opens/focuses Settings for advisor packet compatibility.
  - marking reviewed returns `true`.
  - the recent change persists `undo.review.resolvedAt` and `undo.review.resolvedSummary`.
  - the recent change adds the reviewed highlight.
  - the reviewed prior-credit issue disappears from Degree Audit.
  - the reviewed prior-credit issue disappears from advisor audit snapshots.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/` and a temporary same-origin seed page, then removed the seed page and stopped the server before commit.
- Chrome confirmed:
  - `js/audit.js?v=3`, `js/schedule.js?v=30`, and `js/onboarding.js?v=15` loaded.
  - before review, Degree Audit showed `1 prior-credit review`.
  - the open issue showed `MATH 140 via AP Calc BC 4+, Manual entry`, `Review prior credits`, and `Mark Reviewed`.
  - after clicking `Mark Reviewed`, Degree Audit showed `0 prior-credit reviews` and no prior-credit conflict item.
  - after reload, the reviewed conflict stayed hidden, confirming persisted state.
  - there was no horizontal overflow.
  - browser console errors were clean.
- Finalized the Chrome tab.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add per-major requirement-source citations to generated schedules.
- Add advisor-packet import/open affordances for loading shared plans before following packet action links.
- Add a reviewed-prior-credit history filter or restore flow in Timeline.

## 2026-06-30 Pass 77

Focus: add advisor-packet import/open affordances for loading shared plans before following packet action links.

Planned changes:
- Build a synchronous same-format shared-plan import link for the current advisor packet.
- Add the import link to the live-link notice in HTML, plain text, and standalone advisor packets.
- Style the new affordance in-app and in exported standalone packet HTML.
- Preserve existing Next action and Browse target links so advisor packets still support targeted follow-up.

Completed:
- Added synchronous `#plan=` helpers in `js/schedule.js` for advisor packet share payloads, UTF-8 bytes, base64url encoding, import hashes, and import URLs.
- Updated the advisor live-link notice to include `Open/import matching plan` before the targeted action links.
- Updated advisor plain-text exports to include the same import hash or full URL.
- Updated standalone advisor packet output to render the styled import link.
- Added in-app and standalone styles for `.schedule-advisor-import-link`.
- Versioned changed browser assets:
  - `styles.css?v=69`
  - `js/schedule.js?v=31`

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- The updated `ACCOUNT-FRIENDS` fixture confirms advisor import hash generation uses the same shared-plan hash format with no browser origin.
- The updated `AUDIT-ISSUES` fixture confirms advisor HTML, plain text, and standalone packet HTML include the `Open/import matching plan` affordance.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/` and a temporary same-origin seed page, then removed the seed page and stopped the server before commit.
- Chrome confirmed:
  - `js/audit.js?v=3`, `js/schedule.js?v=31`, and `js/onboarding.js?v=15` loaded.
  - `styles.css?v=69` loaded.
  - the Advisor Packet output contained `Open/import matching plan`.
  - the import link pointed to `http://127.0.0.1:8765/index.html#plan=...`.
  - the import URL used the expected same-origin shared-plan hash format.
  - existing audit links, Next action, Browse target, and prior-credit issue details still rendered.
  - there was no horizontal overflow.
  - browser console errors were clean.
- Finalized the Chrome tab.

Next pass candidates:
- Broaden prior-credit equivalency coverage with official-source mappings.
- Add per-major requirement-source citations to generated schedules.
- Add a downloaded advisor-packet self-check that can verify its embedded plan hash against the live app.
- Add a reviewed-prior-credit history filter or restore flow in Timeline.

## 2026-06-30 Pass 78

Focus: add regular live random schedule testing against PlanetTerp and fix the first sampled fake/outdated generated-major course codes.

Planned changes:
- Add a standalone verifier that samples generated 4-year plans, runs the app's real auto-plan builder, and checks all generated requirement codes against PlanetTerp.
- Keep the verifier deterministic by seed/count, with an all-major mode for catalog audits.
- Fix every invalid course code found by the first seeded random sample instead of weakening the verifier.
- Keep `README.md` untouched and unstaged per the current goal constraint.

Completed:
- Added `scripts/verify-random-schedules.js`.
  - Loads the app's planning code in a Node VM.
  - Samples generated-only majors with a deterministic seed.
  - Builds live `buildAutoPlanPreview()` plans with profile/start-term variation.
  - Requires full live metadata coverage for every generated requirement code.
  - Calls `https://planetterp.com/api/v1/course?name=...` for every non-placeholder requirement course.
  - Verifies 8 terms, target-credit coverage, <=4 credits over target, <=18 credits per term, full tracked GenEd coverage, and no duplicate real course codes.
  - Supports `--all` and `--keep-going` for broader catalog-debt discovery.
  - Caches PlanetTerp lookups inside the run to keep all-major audits practical.
- Fixed generated-major templates found by the seeded sample:
  - HESP: replaced invalid `HESP427` / `HESP437` with live `HESP417` / `HESP422`.
  - PHSC: replaced dead PHSC codes with live `SPHL100`, `EPIB301`, `PHSC450`, `MIEH300`, and `HLTH391`; updated goal to `PHSC450`.
  - ARCH: replaced outdated `ARCH220`, `ARCH221`, `ARCH222`, `ARCH320`, `ARCH321`, `ARCH478`, `ARCH418`, and `ARCH452` with live Architecture courses; updated goal to `ARCH403`.
  - BCHM: replaced invalid `BCHM499` with live `BSCI410`.
  - AAST: replaced invalid `AASP201`, `AASP298`, `AASP397`, `AASP498`, and `AASP422`; updated goal to `AASP401`.
- Ran an all-generated-major `--keep-going` audit and captured the remaining template-debt list for future passes.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- Ran `node scripts/verify-random-schedules.js --seed pass78-live --count 4`; it passed:
  - `HESP`: 122 credits, 16 required courses verified in PlanetTerp, max 17 credits.
  - `PHSC`: 121 credits, 17 required courses verified in PlanetTerp, max 16 credits.
  - `ARCH`: 120 credits, 19 required courses verified in PlanetTerp, max 16 credits.
  - `BCHM`: 121 credits, 22 required courses verified in PlanetTerp, max 16 credits.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass78-all`.
  - Confirmed AAST now passed after fixes.
  - Confirmed 43 remaining generated templates still have one or more PlanetTerp-missing codes and should be cleaned in follow-up passes:
    `ACCOUNTING`, `AMST`, `ANSC`, `ANTH`, `AOSC`, `AREC`, `ARTH`, `ARTT`, `ASTR`, `BIOE`, `CHEM`, `CINE`, `EDUC`, `ENAE`, `ENCE`, `ENCH`, `ENEE`, `ENFP`, `ENGL`, `ENMA`, `FMSC`, `GEOG`, `GEOL`, `HIST`, `HLTH`, `IS`, `JOUR`, `KNES`, `LING`, `MARKETING`, `MGMT`, `MUSC`, `NEUR`, `NFSC`, `PHIL`, `PHYS`, `PLSC`, `SCM`, `SOCY`, `SPAN`, `STAT`, `THET`, `WMST`.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/`, then finalized Chrome and stopped the server before commit.
- Chrome confirmed:
  - `js/majors.js` loaded from the local server.
  - Settings opened normally.
  - Selecting Hearing & Speech Sciences showed the generated-major note.
  - The HESP auto-plan review rendered `16/16 live course records`.
  - The HESP auto-plan review rendered full tracked GenEd coverage.
  - The review did not include old invalid `HESP427` or `HESP437` codes.
  - There was no horizontal overflow.
  - Browser console errors were clean.

Next pass candidates:
- Use the all-major verifier output to clean the remaining 43 generated templates in batches by college.
- Add a generated template freshness report to Settings so users can see which requirements were verified live and which are placeholders.
- Add a CI-friendly offline fixture for the new random verifier, plus an opt-in live PlanetTerp check for release passes.
- Add official per-major citation links beside generated requirement groups.

## 2026-06-30 Pass 79

Focus: clean Smith Business generated templates against live PlanetTerp and make the verifier support targeted major batches.

Planned changes:
- Fix the Smith-generated templates that failed the all-major PlanetTerp verifier.
- Add targeted-major selection to the random schedule verifier so cleanup batches can be verified directly.
- Keep the all-major audit as the source of truth for remaining template debt.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `--major`, `--major=...`, `--majors`, and `--majors=...` support to `scripts/verify-random-schedules.js`.
- Replaced stale Smith Business template codes with live PlanetTerp-resolving courses:
  - Shared generated Smith core: `BMGT289` -> `BMGT289B`.
  - Accounting: `BMGT322` -> `BMGT310`; `BMGT421` -> `BMGT422`; goal `BMGT322` -> `BMGT310`.
  - Marketing: `BMGT458` / `BMGT459` -> `BMGT458A` / `BMGT458B`.
  - Information Systems: dead `BUSI430`, `BUSI431`, `BUSI432`, `BUSI433`, `BUSI434`, and `BUSI446` -> live `BMGT301`, `BMGT403`, `BMGT407`, `BMGT431`, `BMGT430`, and `BMGT434`; goal `BUSI432` -> `BMGT407`.
  - Management: `BMGT460` -> `BMGT463`; `BMGT462` -> `BMGT468Z`.
  - Supply Chain Management: `BMGT289` -> `BMGT289B`.
  - Finance curated template metadata: `BMGT289` -> `BMGT289B`; invalid `BMGT449` -> `BMGT441`.

Verification:
- Ran direct PlanetTerp checks for the replacement BMGT/BUSI course codes before editing.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- Ran `node scripts/verify-random-schedules.js --majors ACCOUNTING,MARKETING,MGMT,SCM,IS --keep-going --seed pass79-smith`; it passed:
  - `ACCOUNTING`: 122 credits, 21 required courses verified in PlanetTerp.
  - `MARKETING`: 122 credits, 20 required courses verified in PlanetTerp.
  - `MGMT`: 122 credits, 19 required courses verified in PlanetTerp.
  - `SCM`: 122 credits, 19 required courses verified in PlanetTerp.
  - `IS`: 120 credits, 21 required courses verified in PlanetTerp.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass79-all`.
  - Confirmed `ACCOUNTING`, `IS`, `MARKETING`, `MGMT`, and `SCM` now pass and dropped out of the failure summary.
  - Remaining generated-template failure count is now 38:
    `AMST`, `ANSC`, `ANTH`, `AOSC`, `AREC`, `ARTH`, `ARTT`, `ASTR`, `BIOE`, `CHEM`, `CINE`, `EDUC`, `ENAE`, `ENCE`, `ENCH`, `ENEE`, `ENFP`, `ENGL`, `ENMA`, `FMSC`, `GEOG`, `GEOL`, `HIST`, `HLTH`, `JOUR`, `KNES`, `LING`, `MUSC`, `NEUR`, `NFSC`, `PHIL`, `PHYS`, `PLSC`, `SOCY`, `SPAN`, `STAT`, `THET`, `WMST`.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/`, then finalized Chrome and stopped the server before commit.
- Chrome confirmed:
  - `js/majors.js` loaded from the local server.
  - Settings opened normally.
  - Selecting Information Systems showed the generated-major note.
  - The IS auto-plan review rendered `21/21 live course records`.
  - The IS review rendered `13/13 GenEd coverage`.
  - The rendered review did not include old `BUSI43x` codes or generic dead `BMGT289`.
  - There was no horizontal overflow.
  - Browser console errors were clean.

Next pass candidates:
- Clean the remaining CMNS/STEM generated templates that fail the all-major verifier.
- Clean ARHU/BSOS templates with stale upper-level seminar/capstone placeholders.
- Add a generated template freshness report to Settings so users can see which requirements were verified live and which are placeholders.
- Add official per-major citation links beside generated requirement groups.

## 2026-06-30 Pass 80

Focus: clean the next STEM/geo generated-template batch against live PlanetTerp.

Planned changes:
- Use the live verifier to target CMNS/STEM and geography-style templates with stale codes.
- Replace missing codes with live same-department or close-program courses from PlanetTerp.
- Prove the cleaned batch with targeted verification and update the all-major failure count.
- Keep `README.md` untouched and unstaged.

Completed:
- Replaced stale generated-template codes with live PlanetTerp-resolving courses:
  - STAT: `STAT436` -> `STAT464`.
  - CHEM: `CHEM404` -> `CHEM482`; `CHEM498` -> `CHEM483`; goal `CHEM498` -> `CHEM483`.
  - PHYS: `PHYS499` -> `PHYS410`; `PHYS429` -> `PHYS420`.
  - ASTR: `ASTR398` -> `ASTR398B`; `ASTR499` -> `ASTR498N`; `ASTR405` -> `ASTR406`; goal `ASTR499` -> `ASTR498N`.
  - NEUR: old non-resolving NEUR sequence -> live `NEUR200`, `NEUR305`, `NEUR306`, `NEUR405`, `NEUR479`, plus `PSYC414` and `PSYC417`; goal `NEUR400` -> `NEUR405`.
  - AOSC: `AOSC444` -> `AOSC445`; `AOSC410` -> `AOSC432`; goal `AOSC444` -> `AOSC445`.
  - GEOL: `GEOL388`, `GEOL394`, and `GEOL494` -> `GEOL452`, `GEOL460`, and `GEOL453`; goal `GEOL494` -> `GEOL453`.
  - GEOG: `GEOG305`, `GEOG370`, and `GEOG498` -> `GEOG301`, `GEOG372`, and `GEOG498I`; goal `GEOG498` -> `GEOG498I`.

Verification:
- Ran direct PlanetTerp checks and department-list lookups for replacement STAT, CHEM, PHYS, ASTR, AOSC, GEOL, GEOG, NEUR, PSYC, and BSCI courses before editing.
- Ran `node scripts/verify-random-schedules.js --majors STAT,CHEM,PHYS,ASTR,AOSC,GEOL,GEOG,NEUR --keep-going --seed pass80-stem`; it passed:
  - `STAT`: 121 credits, 15 required courses verified in PlanetTerp.
  - `CHEM`: 121 credits, 20 required courses verified in PlanetTerp.
  - `PHYS`: 122 credits, 20 required courses verified in PlanetTerp.
  - `ASTR`: 120 credits, 22 required courses verified in PlanetTerp.
  - `AOSC`: 122 credits, 19 required courses verified in PlanetTerp.
  - `GEOL`: 122 credits, 19 required courses verified in PlanetTerp.
  - `GEOG`: 121 credits, 14 required courses verified in PlanetTerp.
  - `NEUR`: 121 credits, 18 required courses verified in PlanetTerp.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass80-all`.
  - Confirmed `AOSC`, `ASTR`, `CHEM`, `GEOG`, `GEOL`, `NEUR`, `PHYS`, and `STAT` now pass and dropped out of the failure summary.
  - Remaining generated-template failure count is now 30:
    `AMST`, `ANSC`, `ANTH`, `AREC`, `ARTH`, `ARTT`, `BIOE`, `CINE`, `EDUC`, `ENAE`, `ENCE`, `ENCH`, `ENEE`, `ENFP`, `ENGL`, `ENMA`, `FMSC`, `HIST`, `HLTH`, `JOUR`, `KNES`, `LING`, `MUSC`, `NFSC`, `PHIL`, `PLSC`, `SOCY`, `SPAN`, `THET`, `WMST`.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/`, then finalized Chrome and stopped the server before commit.
- Chrome confirmed:
  - `js/majors.js` loaded from the local server.
  - Settings opened normally.
  - Selecting Atmospheric & Oceanic Science showed the generated-major note.
  - The AOSC auto-plan review rendered `19/19 live course records`.
  - The rendered review included new `AOSC445` and did not include old `AOSC444` or `AOSC410`.
  - There was no horizontal overflow.
  - Browser console errors were clean.

Next pass candidates:
- Clean the remaining engineering generated templates with stale ENAE/ENCE/ENCH/ENEE/ENFP/ENMA codes.
- Clean ARHU/BSOS templates with stale upper-level seminar/capstone placeholders.
- Add a generated template freshness report to Settings so users can see which requirements were verified live and which are placeholders.
- Add official per-major citation links beside generated requirement groups.

## 2026-06-30 Pass 81

Focus: clean engineering generated templates against live PlanetTerp.

Planned changes:
- Use the live PlanetTerp verifier to target the remaining engineering templates from the Pass 80 failure list.
- Replace stale engineering requirement, elective, and goal codes with live PlanetTerp-resolving same-program courses.
- Prove the cleaned engineering batch with targeted verification, then rerun the all-major sweep to update the remaining debt count.
- Keep `README.md` untouched and unstaged.

Completed:
- Replaced stale engineering generated-template codes with live PlanetTerp-resolving courses:
  - ENAE: `ENAE201`, `ENAE302`, `ENAE371`, `ENAE451`, `ENAE452`, and `ENAE488` -> `ENAE200`, `ENAE404`, `ENAE455`, `ENAE481`, `ENAE482`, and `ENAE488C`; goals now use `ENAE481` / `ENAE482`.
  - ENCE: `ENCE330`, `ENCE350`, `ENCE362`, `ENCE410`, `ENCE471`, and generic `ENCE489` -> `ENCE305`, `ENCE353`, `ENCE360`, `ENCE411`, `ENCE472`, and `ENCE489B`; goal now uses `ENCE489B`.
  - ENCH: old non-resolving chemical engineering sequence codes -> live `ENCH424`, `ENCH440`, `ENCH446`, `ENCH476`, `ENCH482`, `ENCH490`, `ENCH468C`, and `ENCH468F`.
  - ENEE: `ENEE408`, `ENEE439`, `ENEE459`, and `ENEE429` -> `ENEE408A`, `ENEE411`, `ENEE459B`, and `ENEE420`; goal now uses `ENEE408A`.
  - ENFP: `ENFP251`, `ENFP421`, `ENFP422`, `ENFP424`, and generic `ENFP489` -> `ENFP250`, `ENFP420`, `ENFP440`, `ENFP461`, and `ENFP489I`; goal now uses `ENFP489I`.
  - ENMA: `ENMA371`, generic `ENMA489`, and `ENMA483` -> `ENMA461`, `ENMA490`, and `ENMA482`; goal now uses `ENMA490`.
  - BIOE: `BIOE241L`, `BIOE385`, `BIOE441`, `BIOE451`, `BIOE452`, `BIOE419`, `BIOE438`, and generic `BIOE489` -> `BIOE340`, `BIOE404`, `BIOE453`, `BIOE485`, `BIOE486`, `BIOE411`, `BIOE420`, and `BIOE489A`; goals now use `BIOE485` / `BIOE486`.

Verification:
- Ran direct PlanetTerp department-list and course checks for replacement ENAE, ENCE, ENCH, ENEE, ENFP, ENMA, and BIOE courses before editing.
- Ran `node scripts/verify-random-schedules.js --majors ENAE,ENCE,ENCH,ENEE,ENFP,ENMA,BIOE --keep-going --seed pass81-engineering`; it passed:
  - `ENAE`: 125 credits, 30 required courses verified in PlanetTerp.
  - `ENCE`: 124 credits, 25 required courses verified in PlanetTerp.
  - `ENCH`: 124 credits, 27 required courses verified in PlanetTerp.
  - `ENEE`: 126 credits, 27 required courses verified in PlanetTerp.
  - `ENFP`: 125 credits, 21 required courses verified in PlanetTerp.
  - `ENMA`: 125 credits, 25 required courses verified in PlanetTerp.
  - `BIOE`: 128 credits, 28 required courses verified in PlanetTerp.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass81-all`.
  - Confirmed `BIOE`, `ENAE`, `ENCE`, `ENCH`, `ENEE`, `ENFP`, and `ENMA` now pass and dropped out of the failure summary.
  - Remaining generated-template failure count is now 23:
    `AMST`, `ANSC`, `ANTH`, `AREC`, `ARTH`, `ARTT`, `CINE`, `EDUC`, `ENGL`, `FMSC`, `HIST`, `HLTH`, `JOUR`, `KNES`, `LING`, `MUSC`, `NFSC`, `PHIL`, `PLSC`, `SOCY`, `SPAN`, `THET`, `WMST`.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/`, then finalized Chrome and stopped the server before commit.
- Chrome confirmed:
  - Settings opened normally.
  - Selecting Aerospace Engineering showed the generated-major note.
  - The ENAE auto-plan review rendered `30/30 live course records`.
  - The ENAE review rendered full tracked GenEd coverage.
  - The review did not include old invalid `ENAE201`, `ENAE302`, `ENAE371`, `ENAE451`, `ENAE452`, or `ENAE488` codes.
  - There was no horizontal overflow.
  - Browser console errors were clean.

Next pass candidates:
- Clean the remaining ARHU/BSOS templates with stale upper-level seminar/capstone placeholders.
- Clean AGNR, public-health, and education templates still failing live PlanetTerp verification.
- Add a generated template freshness report to Settings so users can see which requirements were verified live and which are placeholders.
- Add official per-major citation links beside generated requirement groups.

## 2026-06-30 Pass 82

Focus: clean ARHU/BSOS generated templates with stale seminar, capstone, and topic-course codes against live PlanetTerp.

Planned changes:
- Target the remaining ARHU/BSOS generated templates from the Pass 81 all-major failure list.
- Prefer exact live topic variants, then same-department live replacements where the old generic number no longer resolves.
- Keep generated schedules duplicate-free, target-credit complete, and fully covered by live metadata.
- Keep `README.md` untouched and unstaged.

Completed:
- Replaced stale ARHU/BSOS generated-template codes with live PlanetTerp-resolving courses:
  - SOCY: `SOCY498`, `SOCY423`, and `SOCY425` -> `SOCY498C`, `SOCY424`, and `SOCY428`; goal now uses `SOCY498C`.
  - ANTH: `ANTH298`, `ANTH401`, `ANTH497`, and `ANTH445` -> `ANTH305`, `ANTH411`, `ANTH498Y`, and `ANTH447`; goal now uses `ANTH498Y`.
  - ENGL: `ENGL379` and `ENGL488` -> `ENGL379M` and `ENGL489P`.
  - HIST: `HIST208`, `HIST209`, `HIST408`, `HIST319`, and `HIST429` -> `HIST208B`, `HIST205`, `HIST408B`, `HIST319L`, and `HIST429F`; goal now uses `HIST408B`.
  - PHIL: `PHIL330`, `PHIL498`, and `PHIL427` -> `PHIL332`, `PHIL408R`, and `PHIL428A`; goal now uses `PHIL408R`.
  - ARTH: `ARTH100`, `ARTH488`, `ARTH489`, `ARTH354`, and `ARTH443` -> `ARTH221`, `ARTH488K`, `ARTH489K`, `ARTH351`, and `ARTH465`; goal now uses `ARTH489K`.
  - LING: `LING422`, `LING488`, and `LING412` -> `LING420`, `LING444`, and `LING419B`; goal now uses `LING444`.
  - SPAN: `SPAN488` and `SPAN345` -> `SPAN408K` and `SPAN363`; goal now uses `SPAN408K`.
  - THET: dead lower/core/topic Theatre codes -> `THET116`, `THET222`, `THET223`, `THET274`, `THET371`, `THET489P`, `THET408W`, and `THET477`; goal now uses `THET489P`.
  - MUSC: `MUSC110`, `MUSC331`, `MUSC419`, and generic `MUSC448` -> `MUSC210`, `MUSC310`, `MUSC448C`, and `MUSC443`.
  - ARTT: `ARTT250` and `ARTT489` -> `ARTT255` and `ARTT489C`; goal now uses `ARTT489C`.
  - CINE: dead generic Cinema sequence -> live `CINE245`, `CINE280`, `CINE301`, `CINE302`, `CINE411`, `CINE469M`, and `CINE385`; goal now uses `CINE469M`.
  - WMST: `WMST301`, `WMST488`, `WMST498`, `WMST450`, and `WMST463` -> `WMST300`, `WMST488B`, `WMST498Q`, `WMST452`, and `WMST471`; goal now uses `WMST498Q`.
  - AMST: `AMST201`, `AMST330`, `AMST498`, `AMST329`, and `AMST428` -> `AMST202`, `AMST340`, `AMST498A`, `AMST328C`, and `AMST428P`; goal now uses `AMST498A`.

Verification:
- Ran direct PlanetTerp department-list and course-endpoint checks for replacement AMST, ANTH, ARTH, ARTT, CINE, ENGL, HIST, LING, MUSC, PHIL, SOCY, SPAN, THET, and WMST courses before and during editing.
- Ran `node scripts/verify-random-schedules.js --majors AMST,ANTH,ARTH,ARTT,CINE,ENGL,HIST,LING,MUSC,PHIL,SOCY,SPAN,THET,WMST --keep-going --seed pass82-arhu-bsos`; it passed:
  - `AMST`: 122 credits, 11 required courses verified in PlanetTerp.
  - `ANTH`: 121 credits, 10 required courses verified in PlanetTerp.
  - `ARTH`: 121 credits, 10 required courses verified in PlanetTerp.
  - `ARTT`: 122 credits, 12 required courses verified in PlanetTerp.
  - `CINE`: 121 credits, 9 required courses verified in PlanetTerp.
  - `ENGL`: 121 credits, 12 required courses verified in PlanetTerp.
  - `HIST`: 121 credits, 10 required courses verified in PlanetTerp.
  - `LING`: 121 credits, 13 required courses verified in PlanetTerp.
  - `MUSC`: 120 credits, 11 required courses verified in PlanetTerp.
  - `PHIL`: 121 credits, 10 required courses verified in PlanetTerp.
  - `SOCY`: 120 credits, 11 required courses verified in PlanetTerp.
  - `SPAN`: 122 credits, 11 required courses verified in PlanetTerp.
  - `THET`: 121 credits, 13 required courses verified in PlanetTerp.
  - `WMST`: 121 credits, 10 required courses verified in PlanetTerp.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass82-all`.
  - Confirmed all 14 ARHU/BSOS targets now pass and dropped out of the failure summary.
  - Remaining generated-template failure count is now 9:
    `ANSC`, `AREC`, `EDUC`, `FMSC`, `HLTH`, `JOUR`, `KNES`, `NFSC`, `PLSC`.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/`, then finalized Chrome and stopped the server before commit.
- Chrome confirmed:
  - Settings opened normally.
  - Selecting Theatre showed the generated-major note.
  - The Theatre auto-plan review rendered `13/13 live course records`.
  - The Theatre review rendered full tracked GenEd coverage.
  - The rendered review included the live Theatre replacements shown in the metadata sample and did not include old invalid `THET170`, `THET171`, `THET220`, `THET279`, `THET355`, `THET490`, `THET418`, or `THET479` codes.
  - There was no horizontal overflow.
  - Browser console errors were clean.

Next pass candidates:
- Clean the remaining AGNR templates: `ANSC`, `AREC`, `NFSC`, and `PLSC`.
- Clean the remaining public-health and education templates: `FMSC`, `HLTH`, `KNES`, and `EDUC`.
- Clean the remaining Journalism template: `JOUR`.
- Add a generated template freshness report to Settings so users can see which requirements were verified live and which are placeholders.

## 2026-06-30 Pass 83

Focus: clear the final generated-template live PlanetTerp failures across AGNR, public health, education, and journalism.

Planned changes:
- Target the 9 remaining generated templates from the Pass 82 all-major verifier.
- Replace every stale course with a live PlanetTerp-resolving course while keeping templates duplicate-free and scheduleable.
- Improve Elementary Education's generated sequence from dead legacy placeholders to live elementary curriculum courses.
- Prove the full generated-template catalog with the all-major live verifier.
- Keep `README.md` untouched and unstaged.

Completed:
- Replaced the final stale generated-template codes with live PlanetTerp-resolving courses:
  - ANSC: `ANSC203`, `ANSC301`, `ANSC305`, `ANSC411`, and `ANSC412` -> `ANSC204`, `ANSC314`, `ANSC327`, `ANSC410`, and `ANSC417`.
  - AREC: `AREC410`, generic `AREC489`, and `AREC460` -> `AREC422`, `AREC489L`, and `AREC456`; goal now uses `AREC489L`.
  - EDUC: replaced dead `EDUC100`, `EDCI418`, `EDCI419`, `EDCI488`, `MATH210`, `MATH211`, and `EDCI487`; the generated sequence now uses live `EDCI210`, `EDCI322`, `EDCI352`, `EDCI372`, `EDCI397`, `EDCI488R`, `EDCI461`, `MATH212`, and `MATH213`; goal now uses `EDCI488R`.
  - FMSC: `FMSC105` and `FMSC447` -> `FMSC170` and `FMSC450`.
  - HLTH: `HLTH485`, `HLTH320`, and `HLTH456` -> `HLTH498L`, `HLTH302`, and `HLTH460`.
  - JOUR: `JOUR499`, `JOUR450`, and generic `JOUR458` -> `JOUR480`, `JOUR453`, and `JOUR458B`; goal now uses `JOUR480`.
  - KNES: generic `KNES157` -> `KNES157T`.
  - NFSC: `NFSC340`, `NFSC451`, and `NFSC453` -> `NFSC341`, `NFSC450`, and `NFSC455`; goal now uses `NFSC450`.
  - PLSC: `PLSC202`, `PLSC304`, `PLSC313`, `PLSC472`, generic `PLSC489`, and `PLSC470` -> `PLSC201`, `PLSC205`, `PLSC271`, `PLSC476`, `PLSC489B`, and `PLSC471`; goal now uses `PLSC489B`.

Verification:
- Ran direct PlanetTerp department-list and course-endpoint checks for every replacement ANSC, AREC, EDCI, MATH, FMSC, HLTH, JOUR, KNES, NFSC, and PLSC code before editing.
- Ran `node scripts/verify-random-schedules.js --majors ANSC,AREC,EDUC,FMSC,HLTH,JOUR,KNES,NFSC,PLSC --keep-going --seed pass83-remaining`; it passed:
  - `ANSC`: 120 credits, 18 required courses verified in PlanetTerp.
  - `AREC`: 120 credits, 16 required courses verified in PlanetTerp.
  - `EDUC`: 121 credits, 14 required courses verified in PlanetTerp.
  - `FMSC`: 122 credits, 13 required courses verified in PlanetTerp.
  - `HLTH`: 121 credits, 15 required courses verified in PlanetTerp.
  - `JOUR`: 122 credits, 15 required courses verified in PlanetTerp.
  - `KNES`: 121 credits, 16 required courses verified in PlanetTerp.
  - `NFSC`: 121 credits, 19 required courses verified in PlanetTerp.
  - `PLSC`: 122 credits, 17 required courses verified in PlanetTerp.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan fixtures.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass83-all`.
  - Verified all 50 generated schedules against PlanetTerp.
  - This is the first all-major live audit with zero generated-template failures.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/`, then finalized Chrome and stopped the server before commit.
- Chrome confirmed:
  - Settings opened normally.
  - Selecting Plant Sciences showed the generated-major note.
  - The Plant Sciences auto-plan review rendered `17/17 live course records`.
  - The Plant Sciences review rendered full tracked GenEd coverage.
  - The review's live metadata sample included `PLSC201`, `PLSC205`, `PLSC271`, `PLSC476`, and `PLSC489B`.
  - Exact-code matching found no old invalid `PLSC202`, `PLSC304`, `PLSC313`, `PLSC472`, generic `PLSC489`, or `PLSC470` entries.
  - There was no horizontal overflow.
  - Browser console errors were clean.

Next pass candidates:
- Add a generated template freshness report to Settings so users can see that every generated requirement is live-verified.
- Add official per-major citation links beside generated requirement groups.
- Broaden the live verifier to check generated course credits and titles against rendered UI snapshots, not just template metadata.
- Add a lightweight CI/offline fixture for the live-verifier shape with an opt-in network mode for release passes.

## 2026-06-30 Pass 84

Focus: make the generated-template live verification status visible inside Settings.

Planned changes:
- Add a compact Settings panel that tells users the generated catalog passed a live PlanetTerp audit.
- Pair the global generated-template audit with the currently selected major's live metadata coverage.
- Keep the panel responsive and covered by generated-plan regression tests.
- Bump only the needed asset cache tags so browsers load the new Settings UI and CSS.
- Keep `README.md` untouched and unstaged.

Completed:
- Added a `GENERATED_TEMPLATE_AUDIT` summary in `js/settings.js` for the latest all-generated-template audit:
  - Date: June 30, 2026.
  - Seed: `pass84-all`.
  - Command: `node scripts/verify-random-schedules.js --all --keep-going --seed pass84-all`.
  - Result shown in-app: `50/50` generated templates, zero live audit failures.
- Added `generatedTemplateFreshnessSummary`, `autoPlanFreshnessStat`, and `generatedTemplateFreshnessHtml`.
- Rendered the freshness panel in both generated and curated Settings auto-plan reviews.
- The panel reports:
  - `50/50` built-in generated templates verified.
  - `843` built-in generated requirement rows.
  - `PlanetTerp` as the live source.
  - The latest audit seed, `pass84-all`.
  - The selected preview's live coverage, such as `17/17` for Plant Sciences.
- Added responsive CSS for the freshness panel and mobile two-column stat layout.
- Bumped cache tags:
  - `styles.css?v=70`.
  - `js/settings.js?v=15`.
- Extended `scripts/test-generated-plans.js` so the auto-plan diagnostics fixture asserts the freshness title, catalog count, requirement-row count, live source, seed, and selected-preview coverage.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan and planner fixtures.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass84-all`.
  - Verified all 50 generated schedules against PlanetTerp.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/`, then finalized Chrome and stopped the server before commit.
- Chrome confirmed:
  - Settings opened normally after the cache tag bump.
  - Selecting Plant Sciences rendered the generated-major note and auto-plan review.
  - The new freshness panel showed `Generated Catalog Freshness`.
  - The panel showed `50/50` generated templates, `843` requirement rows, `PlanetTerp`, `June 30, 2026`, `pass84-all`, and `17/17` selected preview coverage.
  - The Plant Sciences review still rendered `17/17 live course records`.
  - Exact-code matching found no old invalid `PLSC202`, `PLSC304`, `PLSC313`, `PLSC472`, generic `PLSC489`, or `PLSC470` entries.
  - There was no document, body, modal, or review horizontal overflow.
  - Browser console errors were clean.

Next pass candidates:
- Add official per-major citation links beside generated requirement groups and Settings freshness rows.
- Broaden the live verifier to compare generated course credits and titles against rendered UI snapshots, not just template metadata.
- Add a lightweight CI/offline fixture for the live-verifier shape with an opt-in network mode for release passes.
- Add a Settings history drawer for the last few generated-template audit seeds and results.

## 2026-06-30 Pass 85

Focus: make generated-schedule verification catch real metadata drift, not just fake course codes.

Planned changes:
- Strengthen `scripts/verify-random-schedules.js` so every generated required course must be present in the generated schedule, resolve on PlanetTerp, and keep the live title/credit metadata used by the app.
- Prefer PlanetTerp credits in the app's combined course metadata, while keeping umd.io for structured prereqs and GenEd tags.
- Add retry handling for transient PlanetTerp course endpoint failures in both the app and the verifier.
- Update the Settings freshness report to cite the new stronger all-major audit.
- Keep `README.md` untouched and unstaged.

Completed:
- Added live metadata checks to `scripts/verify-random-schedules.js`:
  - Verifies every required template course is actually scheduled.
  - Verifies every required generated course resolves through PlanetTerp.
  - Verifies each scheduled course's title and credits match the live app metadata object.
  - Verifies scheduled credits also match PlanetTerp credits when PlanetTerp returns a numeric value.
  - Reports `live title/credit pairs matched` per major.
- Added retry/backoff for transient PlanetTerp verification failures, which avoids failing a real course on one temporary `HTTP 500`.
- Updated `fetchCourseFull` in `js/api.js` to prefer PlanetTerp credits over umd.io credits.
  - This fixed source drift found by the stronger verifier for `ARTT489C`, `KNES385`, `PHYS402`, `PHYS410`, and `PLSC201`.
  - umd.io still supplies structured prereqs, coreqs, and GenEd metadata.
- Added retry/backoff to `planetTerpFetchCourse` in `js/planetterp.js`.
  - Permanent 4xx responses are not retried.
  - Transient fetch/5xx failures retry up to three times.
- Updated the Settings generated-catalog freshness audit seed from `pass84-all` to `pass85-all-final`.
- Bumped cache tags:
  - `js/planetterp.js?v=2`.
  - `js/api.js?v=2`.
  - `js/settings.js?v=17`.
- Updated the generated-plan fixture to assert the new freshness seed.

Verification:
- Ran direct live checks against PlanetTerp and umd.io for the courses exposed by the stronger verifier:
  - `ARTT489C`, `KNES385`, `PHYS402`, `PHYS410`, `PLSC201`, `ENAE432`, and `ENCE215`.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan and planner fixtures.
- Ran `node scripts/verify-random-schedules.js --majors ARTT,ENAE,ENCE,KNES,PHYS,PLSC --keep-going --seed pass85-fixed-targets`; it passed all six previously failing targets after the PlanetTerp-credit and retry changes.
- Ran `node scripts/verify-random-schedules.js --majors ARTT,KNES,PHYS,PLSC --keep-going --seed pass85-post-metadata`; it passed the main credit-drift targets after the Settings metadata update.
- Ran `node scripts/verify-random-schedules.js --majors ENAE,ENCE,PHYS,PLSC --keep-going --seed pass85-final-targets`; it passed after retry-flow cleanup.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass85-all-final`.
  - Verified all 50 generated schedules against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
- Used Chrome with a temporary static server at `http://127.0.0.1:8765/`, then finalized Chrome and stopped the server before commit.
- Chrome confirmed before the browser-control timeout:
  - The app loaded `js/planetterp.js?v=2` and `js/api.js?v=2`.
  - Settings opened for Physics.
  - The Physics generated review rendered `121/120` planned credits, `20/20 live course records`, full tracked GenEd coverage, and the freshness panel.
  - The live metadata row included the formerly credit-drifting Physics requirements `PHYS402` and `PHYS410`.
- Chrome limitation:
  - A later attempt to apply Studio Art in Chrome opened the app's local replacement confirmation and the browser-control command timed out while applying. Chrome was reconnected, finalized, and the server was stopped. The full live verifier is the authoritative evidence for generated-plan title/credit correctness in this pass.

Next pass candidates:
- Add official per-major citation links beside generated requirement groups and Settings freshness rows.
- Add a dedicated browser/UI verifier that applies generated templates in a disposable browser profile and inspects rendered course cards without relying on manual Chrome interactions.
- Add a Settings history drawer for the last few generated-template audit seeds and results.
- Add a lightweight CI/offline fixture for the live-verifier shape with an opt-in network mode for release passes.

## 2026-06-30 Pass 86

Focus: add repeatable rendered-browser verification for generated templates, replacing brittle manual Chrome apply checks.

Planned changes:
- Add a browser/UI verifier that starts the static app in a disposable local server and headless browser.
- Verify real Settings previews and rendered course cards for the generated majors that previously exposed live metadata drift.
- Keep the Settings freshness panel aligned with the newest all-major live audit.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scripts/verify-rendered-generated-plans.js`.
- The rendered verifier:
  - Loads the static app through an internal local HTTP server.
  - Finds bundled Playwright from local dependencies or the Codex runtime path.
  - Uses a fresh browser context and skips onboarding when it appears.
  - Opens Settings through the real `#settings-btn`.
  - Selects generated majors and waits for the live preview/freshness panel.
  - Applies each generated major through the real Settings Apply button.
  - Accepts the local replacement confirmation dialog when needed.
  - Inspects rendered `.course` cards in the actual DOM.
  - Checks document/body/modal/review horizontal overflow.
  - Fails on browser page errors and unexpected console errors.
  - Ignores known local-network noise from `/api/config` and browser CORS fallback attempts while still verifying rendered outcomes.
- Covered six high-risk generated majors:
  - `PHYS`: verifies `PHYS402` and `PHYS410` render as 4-credit cards.
  - `ARTT`: verifies `ARTT489C` renders as a 3-credit card.
  - `PLSC`: verifies `PLSC201` renders as a 4-credit card.
  - `KNES`: verifies `KNES385` renders as a 3-credit card.
  - `ENAE`: verifies `ENAE432` renders as a 3-credit card.
  - `ENCE`: verifies `ENCE215` renders as a 3-credit card.
- Updated the Settings generated-catalog freshness audit seed from `pass85-all-final` to `pass86-all`.
- Bumped `js/settings.js` cache tag to `v=18`.
- Updated the generated-plan fixture to assert the new freshness seed.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan and planner fixtures.
- Ran `node scripts/verify-rendered-generated-plans.js --majors PHYS,ARTT --timeout-ms 60000`; it passed after the verifier learned to skip onboarding and filter expected network fallback noise.
- Ran `node scripts/verify-rendered-generated-plans.js --majors ENCE --timeout-ms 120000`; it passed after correcting the expected Civil Engineering display from `124/122` to `124/124`.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`; it passed:
  - `PHYS`: `20/20 live course records`; `PHYS402:4cr`, `PHYS410:4cr`.
  - `ARTT`: `12/12 live course records`; `ARTT489C:3cr`.
  - `PLSC`: `17/17 live course records`; `PLSC201:4cr`.
  - `KNES`: `16/16 live course records`; `KNES385:3cr`.
  - `ENAE`: `30/30 live course records`; `ENAE432:3cr`.
  - `ENCE`: `25/25 live course records`; `ENCE215:3cr`.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass86-all`.
  - Verified all 50 generated schedules against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
- Ran the rendered verifier again after the freshness seed update:
  - `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It passed all six rendered targets and confirmed the app loaded `js/settings.js?v=18`.

Findings for next pass:
- The rendered browser logs expected network noise from local `/api/config` 404s and browser CORS-blocked umd.io fallback requests. The app still renders through PlanetTerp, but a dedicated same-origin proxy for umd.io metadata/sections would make browser behavior cleaner and more reliable.

Next pass candidates:
- Add a Vercel/serverless umd.io proxy and switch browser metadata/section fetches to same-origin requests before falling back to direct external URLs.
- Add official per-major citation links beside generated requirement groups and Settings freshness rows.
- Add a Settings history drawer for the last few generated-template audit seeds and results.
- Add a lightweight CI/offline fixture for the live-verifier shape with an opt-in network mode for release passes.

## 2026-06-30 Pass 87

Focus: add a same-origin umd.io proxy so rendered generated-plan previews and section lookups do not rely on noisy browser CORS fallbacks.

Planned changes:
- Add a Vercel/serverless `/api/umd` proxy for safe umd.io course endpoints.
- Route browser umd.io metadata, semester, and section requests through the same-origin proxy first.
- Keep direct `api.umd.io` fallback for local/static contexts where the proxy route is not available.
- Tighten the rendered verifier so `/api/config` and umd.io calls are proxy-backed and no longer produce expected console noise.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `api/umd.js`.
- The serverless proxy:
  - Allows `GET` and `HEAD`.
  - Accepts only `/courses` umd.io paths.
  - Rejects empty, protocol, double-slash, and non-course paths.
  - Marks responses with `x-terptrack-proxy: umd-io`.
  - Caches successful upstream responses for the edge.
  - Returns safe JSON fallbacks for upstream failures without surfacing failed-resource console noise.
- Updated `js/api.js` so umd.io course, paged course, semester, and section fetches:
  - Try `/api/umd?path=...` first in browser HTTP contexts.
  - Fall back to direct `https://api.umd.io/v1` only when the proxy route looks unavailable and unmarked.
  - Stop falling back to direct browser requests after a proxy timeout/error, preventing CORS console spam when a proxy exists.
- Updated the rendered verifier's local server:
  - `/api/config` now returns an empty local config instead of a 404.
  - `/api/umd` now proxies course endpoints with the same marker header and safe fallback behavior.
  - The verifier now fails if previously ignored CORS/network console errors appear.
- Bumped `js/api.js` to `v=3`.
- Updated the Settings generated-catalog freshness audit seed to `pass87-all`.
- Bumped `js/settings.js` to `v=19`.
- Updated generated-plan and rendered-browser tests to assert the new freshness seed and cache tags.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran a direct `api/umd.js` smoke test:
  - `GET /api/umd?path=/courses/ENEE244` returned a proxied `ENEE244` response.
  - `GET /api/umd?path=/bad` returned a marked 400 rejection.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan and planner fixtures with `pass87-all`.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It passed all six rendered targets.
  - It confirmed the app loaded `js/api.js?v=3` and `js/settings.js?v=19`.
  - It confirmed a clean proxy-backed browser console.
  - `PHYS`: `20/20 live course records`; `PHYS402:4cr`, `PHYS410:4cr`.
  - `ARTT`: `12/12 live course records`; `ARTT489C:3cr`.
  - `PLSC`: `17/17 live course records`; `PLSC201:4cr`.
  - `KNES`: `16/16 live course records`; `KNES385:3cr`.
  - `ENAE`: `30/30 live course records`; `ENAE432:3cr`.
  - `ENCE`: `25/25 live course records`; `ENCE215:3cr`.
- Ran `node scripts/verify-random-schedules.js --all --keep-going --seed pass87-all`.
  - Verified all 50 generated schedules against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
- Ran `node scripts/verify-random-schedules.js --majors PHYS,ARTT,PLSC,KNES,ENAE,ENCE --keep-going --seed pass87-final-targets`.
  - Verified all six rendered targets against PlanetTerp after the freshness/cache bump.

Findings for next pass:
- The generated-template stack now has a clean rendered-browser verification path, but it still depends on live network for release-grade evidence. A small offline fixture for the proxy response shape would make CI coverage less brittle.
- Section previews now have a same-origin path available; the next UX pass can use that to surface richer meeting-time confidence in Browse and replacement flows.

Next pass candidates:
- Add official per-major citation links beside generated requirement groups and Settings freshness rows.
- Add a Settings history drawer for the last few generated-template audit seeds and results.
- Broaden the rendered verifier with a mobile viewport pass for Settings previews and applied course cards.
- Add a lightweight offline fixture for the `/api/umd` proxy shape plus an opt-in network mode for release passes.

## 2026-06-30 Pass 88

Focus: broaden rendered generated-plan verification to mobile, so the high-risk Settings previews and applied course cards are checked at student phone width as well as desktop.

Planned changes:
- Add named rendered verifier viewport profiles.
- Run the existing high-risk generated-major card checks on both desktop and mobile by default.
- Keep a targeted `--viewports` option for faster debugging.
- Replace brittle exact planned-credit assertions with semantic degree-credit checks.
- Keep `README.md` untouched and unstaged.

Completed:
- Added rendered verifier viewport profiles:
  - `desktop`: `1440x960`.
  - `mobile`: `390x844`, touch-enabled, `deviceScaleFactor: 2`.
- Added `--viewport` / `--viewports` arguments; `all`, `desktop`, and `mobile` are supported.
- Changed the default rendered verifier run to execute every selected target across both viewport profiles.
- Refactored the verifier into a per-viewport runner with isolated browser contexts, console-error collection, page-error collection, and overflow checks.
- Added initial Settings modal overflow checks before any major is applied.
- Kept the existing applied-course card assertions for:
  - `PHYS402` and `PHYS410`.
  - `ARTT489C`.
  - `PLSC201`.
  - `KNES385`.
  - `ENAE432`.
  - `ENCE215`.
- Replaced exact generated total strings such as `120/120` with semantic planned-credit validation:
  - the target degree-credit number must match.
  - planned credits must meet the target.
  - planned credits may not exceed target by more than 2.
- This fixed a valid Kinesiology preview variation where the live rendered preview produced `121/120` instead of the previously hard-coded `120/120`.

Verification:
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/verify-rendered-generated-plans.js --majors PHYS --viewports mobile --timeout-ms 120000`.
  - It passed Physics on the mobile viewport with a clean proxy-backed console.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It passed 12 rendered template viewport runs: 6 majors x 2 viewports.
  - Desktop passed `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE`.
  - Mobile passed `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE`.
  - The run kept the proxy-backed browser console clean.
  - The run found no document, body, modal, or review horizontal overflow in the checked states.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`; it passed all generated-plan and planner fixtures.
- Ran `node scripts/verify-random-schedules.js --majors PHYS,ARTT,PLSC,KNES,ENAE,ENCE --keep-going --seed pass88-rendered-viewports`.
  - Verified all six rendered targets against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

Findings for next pass:
- The rendered generated-plan safety net now covers mobile and desktop, but the app still lacks user-visible official source links for generated requirement groups.
- The verifier is now stronger but slower by default; the new `--viewports desktop` or `--viewports mobile` option should be used for targeted debug loops.

Next pass candidates:
- Add official per-major citation links beside generated requirement groups and Settings freshness rows.
- Add a Settings history drawer for the last few generated-template audit seeds and results.
- Add a lightweight offline fixture for the `/api/umd` proxy shape plus an opt-in network mode for release passes.
- Add a mobile rendered verifier for onboarding and Browse replacement flows, not just Settings-generated plans.

## 2026-06-30 Pass 89

Focus: add user-visible official UMD catalog source links to generated-plan evidence so students can jump from TerpTrack previews to the matching catalog requirement source.

Planned changes:
- Add a central official catalog source model for built-in majors.
- Render selected-major official links inside Settings generated-catalog freshness rows.
- Render selected-major source links beside generated requirement evidence.
- Keep source links mobile-safe and included in rendered UI verification.
- Keep `README.md` untouched and unstaged.

Completed:
- Scraped the official UMD Undergraduate Catalog program index to match TerpTrack built-in majors to catalog pages.
- Added explicit source overrides where TerpTrack names differ from the current catalog labels:
  - `STAT` uses the Mathematics Major catalog page.
  - `ENGL` uses English Language and Literature Major.
  - `FMSC` uses Family Health Major.
  - `MGMT` uses Management Major.
  - `AAST` uses African American and Africana Studies Major.
  - `SPAN` uses Spanish Language, Literatures, and Culture Major.
  - `HLTH` uses Public Health Practice Major.
- Added `MAJOR_CATALOG_SOURCES` and `majorOfficialSources()` in `js/majors.js`.
- Attached selected-major source links to auto-plan preview objects in `js/import.js`.
- Added Settings helpers:
  - `autoPlanOfficialSourceLinks()`.
  - `autoPlanOfficialSourceLinksHtml()`.
- The generated catalog freshness panel now shows:
  - the selected official major catalog page.
  - the UMD Catalog programs index.
  - the UMD course catalog.
- The generated requirement evidence block now shows a compact `Requirement source` link for the selected major.
- Added responsive styles for official-source chips so they wrap cleanly inside Settings on mobile.
- Bumped cache tags:
  - `styles.css?v=71`.
  - `js/majors.js?v=1`.
  - `js/settings.js?v=20`.
  - `js/import.js?v=9`.
- Updated the rendered verifier to assert the new cache tags and source labels.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed all generated-plan and planner fixtures.
  - It asserted every built-in major has a selected-major official catalog source.
  - It asserted the Settings freshness HTML links the UMD programs index and UMD course catalog.
  - It asserted the generated requirement evidence HTML includes the selected official source.
- Ran a catalog URL smoke script against every `MAJOR_CATALOG_SOURCES` entry.
  - Verified all 61 official catalog source URLs returned successful responses.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It passed 12 rendered template viewport runs: 6 majors x 2 viewports.
  - It confirmed `styles.css?v=71`, `js/majors.js?v=1`, `js/settings.js?v=20`, and `js/import.js?v=9` loaded.
  - It confirmed `Official sources` and `Requirement source` rendered in the real Settings review.
  - It kept the proxy-backed browser console clean.
  - It found no checked horizontal overflow on desktop or mobile.
- Ran `node scripts/verify-random-schedules.js --majors PHYS,ARTT,PLSC,KNES,ENAE,ENCE --keep-going --seed pass89-official-sources`.
  - Verified all six rendered targets against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

Findings for next pass:
- Source links now exist, but users still cannot see a history of prior generated-template live audits inside Settings.
- The official source map is static; future catalog-year support should let the app show which catalog year a template targets.

Next pass candidates:
- Add a Settings history drawer for generated-template audit seeds and results.
- Add catalog-year/source-year metadata to generated templates and Settings source links.
- Add a lightweight offline fixture for the `/api/umd` proxy shape plus an opt-in network mode for release passes.
- Add a mobile rendered verifier for onboarding and Browse replacement flows, not just Settings-generated plans.

## 2026-06-30 Pass 90

Focus: add a Settings audit history drawer for generated-template live verification evidence.

Planned changes:
- Keep the latest generated-template audit as the primary freshness status.
- Add a compact history drawer showing recent all-major live verification seeds.
- Make the drawer mobile-safe inside the existing Settings freshness panel.
- Update tests and rendered verification to require the history.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `GENERATED_TEMPLATE_AUDIT_HISTORY` in `js/settings.js` with four recent verified all-major runs:
  - `pass87-all`.
  - `pass86-all`.
  - `pass85-all-final`.
  - `pass84-all`.
- Added `generatedTemplateAuditHistoryHtml()` to render the history as a native `details` drawer inside the freshness panel.
- The drawer shows each run's seed, checked date, live source, verified schedule count, issue count, and short scope note.
- Added drawer styles in `styles.css`:
  - compact summary row.
  - wrapped history rows.
  - mobile one-column row layout.
  - cross-browser summary marker reset.
- Bumped cache tags:
  - `styles.css?v=72`.
  - `js/settings.js?v=21`.
- Updated the generated-plan fixture to assert the audit history and prior seeds render.
- Updated the rendered verifier to assert:
  - `styles.css?v=72`.
  - `js/settings.js?v=21`.
  - `Audit history`.
  - `pass86-all`.

Verification:
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed all generated-plan and planner fixtures.
  - It asserted the freshness HTML includes `Audit history`, `pass86-all`, and `pass85-all-final`.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It passed 12 rendered template viewport runs: 6 majors x 2 viewports.
  - It confirmed the audit history text rendered in real Settings reviews.
  - It confirmed the updated cache tags loaded.
  - It kept the proxy-backed browser console clean.
  - It found no checked horizontal overflow on desktop or mobile.
- Ran `node scripts/verify-random-schedules.js --majors PHYS,ARTT,PLSC,KNES,ENAE,ENCE --keep-going --seed pass90-audit-history`.
  - Verified all six rendered targets against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
- Ran `git diff --check`.

Findings for next pass:
- The history drawer is static release evidence. A future pass can store these runs as structured data with catalog-year metadata.
- The strongest remaining automated UI gap is onboarding/Browse mobile rendering, because generated Settings now has desktop and mobile coverage.

Next pass candidates:
- Add catalog-year/source-year metadata to generated templates and Settings source links.
- Add a lightweight offline fixture for the `/api/umd` proxy shape plus an opt-in network mode for release passes.
- Add a mobile rendered verifier for onboarding and Browse replacement flows, not just Settings-generated plans.
- Add a release checklist panel in Settings that summarizes source links, live audit history, and account/cloud setup status.

## 2026-06-30 Pass 91

Focus: add catalog-year metadata to official source links and fix source-link wrapping caught by rendered verification.

Planned changes:
- Confirm the current UMD Undergraduate Catalog year before displaying it.
- Carry catalog-year and checked-date metadata on official source links.
- Show that metadata in the Settings generated-catalog freshness panel.
- Keep the compact requirement-source row uncluttered.
- Keep `README.md` untouched and unstaged.

Completed:
- Fetched UMD Undergraduate Catalog pages directly:
  - `https://academiccatalog.umd.edu/undergraduate/`.
  - `https://academiccatalog.umd.edu/undergraduate/programs/`.
- Confirmed both pages expose the current catalog year as `2026-2027`.
- Added source metadata in `js/majors.js`:
  - `UMD_CATALOG_YEAR = '2026-2027'`.
  - `UMD_CATALOG_CHECKED_AT = 'June 30, 2026'`.
- `majorOfficialSources()` now attaches `year` and `checkedAt` to selected-major, program-index, and course-catalog links.
- Updated Settings source-link rendering to show:
  - `Catalog year 2026-2027`.
  - `checked June 30, 2026`.
- Kept the compact `Requirement source` row from duplicating the metadata line.
- Fixed a real rendered UI overflow caught during verification:
  - The normal official-source row now uses a two-column grid with a bounded link column.
  - Link chips can break long labels safely.
  - The metadata line spans the full row and aligns left on mobile.
- Updated the rendered verifier to ignore hidden review overflow while still checking visible review overflow.
- Bumped cache tags:
  - `styles.css?v=74`.
  - `js/majors.js?v=2`.
  - `js/settings.js?v=22`.

Verification:
- Ran a direct catalog-year check against UMD Undergraduate Catalog pages and confirmed `2026-2027`.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed all generated-plan and planner fixtures.
  - It asserted source-year metadata appears in freshness HTML.
  - It asserted preview source objects carry `year: 2026-2027` and `checkedAt: June 30, 2026`.
- Ran a Playwright DOM diagnostic after the first rendered failure.
  - It found the overflowing child was `.auto-plan-official-sources` in the initial curated Settings review.
  - The grid/link-wrap fix removed the overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It passed 12 rendered template viewport runs: 6 majors x 2 viewports.
  - It confirmed `styles.css?v=74`, `js/majors.js?v=2`, and `js/settings.js?v=22` loaded.
  - It confirmed `Catalog year 2026-2027` rendered in real Settings reviews.
  - It kept the proxy-backed browser console clean.
  - It found no checked horizontal overflow on desktop or mobile.
- Ran `node scripts/verify-random-schedules.js --majors PHYS,ARTT,PLSC,KNES,ENAE,ENCE --keep-going --seed pass91-catalog-year`.
  - Verified all six rendered targets against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

Findings for next pass:
- Generated Settings has strong trust evidence now: live audit freshness, history, official source links, catalog year, and rendered desktop/mobile verification.
- Onboarding and Browse replacement flows still need comparable mobile rendered verification.

Next pass candidates:
- Add a mobile rendered verifier for onboarding and Browse replacement flows, not just Settings-generated plans.
- Add a lightweight offline fixture for the `/api/umd` proxy shape plus an opt-in network mode for release passes.
- Add a release checklist panel in Settings that summarizes source links, live audit history, and account/cloud setup status.
- Add catalog-year targeting controls for students following an older catalog year.

## 2026-06-30 Pass 92

Focus: add deterministic offline coverage for the `/api/umd` proxy contract.

Planned changes:
- Test the same-origin umd.io proxy without depending on live network.
- Cover allowlist rejection, marker headers, success forwarding, safe upstream fallbacks, fetch-error fallbacks, and method rejection.
- Keep the existing rendered and live generated-plan release checks green.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scripts/test-umd-proxy.js`.
- The new fixture imports `api/umd.js` directly and mocks `global.fetch`.
- Covered proxy success behavior:
  - `/courses/ENEE244` calls `https://api.umd.io/v1/courses/ENEE244`.
  - The proxy marker header is present.
  - The `Accept` header is forwarded.
  - Successful upstream responses get the edge cache policy.
  - Upstream JSON bodies are forwarded.
- Covered path normalization:
  - Array query values use the first entry.
  - Missing leading slash is normalized for `/courses/semesters`.
- Covered rejection behavior:
  - non-`/courses` paths.
  - protocol URLs.
  - double-slash URLs.
  - empty paths.
  - unsupported methods with `Allow: GET, HEAD`.
- Covered safe fallback behavior:
  - single-course upstream failure returns HTTP 200 with `null`.
  - section upstream failure returns HTTP 200 with `[]`.
  - fetch errors for course lists return HTTP 200 with `[]`.
  - fallback responses set `Cache-Control: no-store`.
  - fallback responses expose `x-terptrack-upstream-status`.

Verification:
- Ran `node scripts/test-umd-proxy.js`.
  - It passed all offline proxy fixtures.
- Ran `for f in js/*.js scripts/*.js api/*.js; do node --check "$f" || exit 1; done`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed all generated-plan and planner fixtures.
- Ran `node scripts/verify-random-schedules.js --majors PHYS,ARTT,PLSC,KNES,ENAE,ENCE --keep-going --seed pass92-umd-proxy-fixture`.
  - Verified all six rendered targets against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It passed 12 rendered template viewport runs: 6 majors x 2 viewports.
  - It kept the proxy-backed browser console clean.
  - It found no checked horizontal overflow on desktop or mobile.

Findings for next pass:
- The proxy now has deterministic unit-style coverage, but there is still no single command that runs all release checks in the intended order.
- Onboarding and Browse replacement flows still need rendered mobile coverage comparable to generated Settings.

Next pass candidates:
- Add a release-check script that runs syntax, proxy fixtures, generated fixtures, rendered verifier, and optional live verifier in order.
- Add a mobile rendered verifier for onboarding and Browse replacement flows.
- Add a release checklist panel in Settings that summarizes source links, live audit history, and account/cloud setup status.
- Add catalog-year targeting controls for students following an older catalog year.

## 2026-06-30 Pass 93

Focus: add one ordered release-check command for the current TerpTrack verification stack.

Planned changes:
- Add a release orchestrator script that runs local checks in the intended order.
- Keep live PlanetTerp verification opt-in so quick release gates can run without network flakiness.
- Support targeted rendered and live subsets for fast debugging.
- Prove both the default release path and live path work.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scripts/run-release-checks.js`.
- Default release checks now run, in order:
  - JS syntax checks for every `.js` file under `api/`, `js/`, and `scripts/`.
  - `scripts/test-umd-proxy.js`.
  - `scripts/test-generated-plans.js`.
  - `scripts/verify-rendered-generated-plans.js`.
- Added release-check options:
  - `--live`.
  - `--live-all`.
  - `--live-majors A,B,C`.
  - `--live-count N`.
  - `--live-seed SEED`.
  - `--rendered-majors A,B,C`.
  - `--rendered-viewports A,B`.
  - `--rendered-timeout-ms N`.
  - `--skip-syntax`.
  - `--skip-proxy`.
  - `--skip-generated`.
  - `--skip-rendered`.
- The default focused live set is the current high-risk rendered target group:
  - `PHYS`.
  - `ARTT`.
  - `PLSC`.
  - `KNES`.
  - `ENAE`.
  - `ENCE`.
- The script uses `process.execPath` and `child_process.spawn()` with inherited stdio rather than shell chaining.

Verification:
- Ran `node --check scripts/run-release-checks.js`.
- Ran `node scripts/run-release-checks.js --help`.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 42 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed all generated-plan and planner fixtures.
  - It passed the rendered generated-plan verifier:
    - 12 rendered template viewport runs.
    - 6 majors x 2 viewports.
    - clean proxy-backed console.
  - It skipped live PlanetTerp verification with an explicit message explaining the opt-in flags.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --live --live-seed pass93-release-check-live`.
  - It delegated to `scripts/verify-random-schedules.js`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

Findings for next pass:
- The repo now has a single ordered release gate, but onboarding and Browse replacement flows still lack comparable rendered mobile coverage.
- A Settings release checklist panel could surface the same evidence to students/admins, not just developers.

Next pass candidates:
- Add a mobile rendered verifier for onboarding and Browse replacement flows.
- Add a release checklist panel in Settings that summarizes source links, live audit history, release-check status, and account/cloud setup status.
- Add catalog-year targeting controls for students following an older catalog year.
- Add a `--json` output mode to `scripts/run-release-checks.js` for future CI/reporting.

## 2026-06-30 Pass 94

Focus: add rendered mobile verification for onboarding and Browse replacement workflows, not just Settings-generated plans.

Planned changes:
- Add a focused Playwright verifier for mobile onboarding preview.
- Add a focused Playwright verifier for mobile Browse placeholder replacement mode.
- Keep the workflow verifier deterministic by avoiding live catalog/network dependencies.
- Include the new workflow verifier in the ordered release gate.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scripts/verify-rendered-workflows.js`.
- The workflow verifier starts a local static server with:
  - empty `/api/config`.
  - deterministic `/api/umd` fallback response for workflow checks.
- Added mobile onboarding verification:
  - Opens the real onboarding modal.
  - Selects `STAT`.
  - Sets start year, profile goal, preferred departments, current year, graduation year, credit cap, schedule preferences, and a manual `MATH140` prior-credit code.
  - Advances through the real onboarding buttons to the finish step.
  - Waits for the real `#ob-plan-preview`.
  - Asserts the preview includes `Statistics`, `Auto Plan Review`, `Schedule defaults`, `MATH 140`, `13/13`, and `Catalog year 2026-2027`.
  - Checks document/body/modal/preview horizontal overflow on a `390x844` mobile viewport.
- Added mobile Browse replacement verification:
  - Seeds the real app state with the default CE GenEd placeholder target `GenEd HS-1`.
  - Sets replacement tags to `DSHS`.
  - Renders Browse with a deterministic cached `GVPT200` row.
  - Asserts the real Browse grid includes:
    - replacement banner for `GenEd HS-1`.
    - `GVPT 200`.
    - `Replace GenEd HS-1`.
    - `Preview`.
    - `Why`.
    - `Full results`.
    - `Fills gap`.
  - Checks document/body/Browse/grid horizontal overflow on mobile.
- The verifier fails on browser page errors and console errors.
- Updated `scripts/run-release-checks.js` so default release checks now include:
  - `scripts/verify-rendered-workflows.js`.
- Added release-check flags:
  - `--skip-workflows`.
  - `--workflows-timeout-ms N`.

Verification:
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed onboarding mobile verification.
  - It passed Browse replacement mobile verification.
- Ran `node --check scripts/run-release-checks.js && node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/run-release-checks.js --help`.
  - It showed the new workflow timeout and skip flags.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed all generated-plan and planner fixtures.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding and Browse replacement workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass94-workflow-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

Findings for next pass:
- Rendered mobile coverage now includes generated Settings, onboarding preview, and Browse replacement mode.
- The release gate is useful for developers, but students/admins still cannot see a release-readiness checklist inside the app.

Next pass candidates:
- Add a release checklist panel in Settings that summarizes source links, live audit history, release-check status, and account/cloud setup status.
- Add catalog-year targeting controls for students following an older catalog year.
- Add a `--json` output mode to `scripts/run-release-checks.js` for future CI/reporting.
- Add rendered mobile coverage for Account setup and advisor packet export.

## 2026-07-01 Pass 95

Focus: surface launch-readiness evidence inside Settings so release confidence is visible in the app, not only in developer scripts.

Planned changes:
- Add a Settings release-readiness panel.
- Summarize official UMD source links for the selected major.
- Summarize live generated-template audit history.
- Summarize the default developer release gate.
- Reuse the existing account/cloud setup checklist status.
- Extend rendered Settings verification to cover the new panel on desktop and mobile.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `RELEASE_CHECK_SNAPSHOT` metadata for the Pass 95 default gate.
- Added a Settings `Release Readiness` panel with four rows:
  - Official source links.
  - Live generated-template audit.
  - Default release gate.
  - Cloud account setup.
- The source row updates when the selected Settings major changes.
- The cloud row asynchronously checks `/api/config` through the existing account config loader and reuses `accountCloudSetupChecks`.
- Added an `Open Account` action from the cloud setup row.
- Added responsive CSS for the release panel and source-link chips.
- Bumped browser cache tags:
  - `styles.css?v=75`.
  - `js/settings.js?v=23`.
- Extended `scripts/verify-rendered-generated-plans.js` to assert:
  - the new release panel is rendered.
  - `3/4 launch checks ready` appears in local mode.
  - source links, generated audit, Pass 95 release gate, and Supabase/Vercel setup details appear.
  - the release panel has no horizontal overflow.
- Updated `scripts/verify-rendered-workflows.js` for the `styles.css?v=75` cache tag.

Verification:
- Ran `node --check js/settings.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js && node --check js/settings.js`.
- Ran `node scripts/verify-rendered-generated-plans.js --majors=PHYS --viewports=mobile --timeout-ms=120000`.
  - It passed the mobile release panel assertions.
  - It rendered Physics with `20/20 live course records` and clean proxy-backed console output.
- Ran `node --check scripts/verify-rendered-workflows.js && node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding preview verification.
  - It passed mobile Browse replacement verification.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed all generated-plan and planner fixtures.
  - It passed 12 rendered generated-plan viewport runs with release-panel assertions.
  - It passed rendered mobile onboarding and Browse replacement workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass95-release-checklist-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

Findings for next pass:
- Settings now exposes release-readiness evidence inside the app.
- The default local cloud state still shows `3/4 launch checks ready` because Supabase/Vercel credentials are not configured in `/api/config`.

Next pass candidates:
- Add catalog-year targeting controls for students following an older catalog year.
- Add a `--json` output mode to `scripts/run-release-checks.js` for future CI/reporting.
- Add rendered mobile coverage for Account setup and advisor packet export.

## 2026-07-01 Pass 96

Focus: add student-specific catalog-year targeting so plans can record the requirement catalog year a student is following.

Planned changes:
- Add a durable `catalogYear` setting.
- Add Settings and onboarding controls for requirement catalog year.
- Keep official source metadata honest by separating student target year from linked checked source year.
- Thread catalog year into auto-plan previews, release readiness, footer text, and advisor packet exports.
- Add fixture and rendered mobile coverage.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `DEFAULT_SETTINGS.catalogYear` with a current default of `2026-2027`.
- Replaced the old hardcoded CE footer-year note with a generic advisor confirmation note.
- Added state helpers:
  - `currentCatalogYear()`.
  - `normalizeCatalogYear()`.
  - `catalogYearOptions()`.
  - `catalogYearIsCurrent()`.
  - `normalizeSettings()`.
- Updated saved-state loading to normalize settings and catalog years.
- Updated restore/import paths to normalize settings:
  - share links.
  - JSON import.
  - snapshots.
  - cloud load.
- Updated official UMD source records to include:
  - `targetYear`.
  - `sourceYear`.
  - `isCurrentCatalog`.
- Updated Settings:
  - Added `Requirement Catalog Year` selector.
  - Added target/source-year note.
  - Release Readiness source row updates when the catalog year changes.
  - Auto Plan Review receives the selected catalog year.
  - Applying a major preserves the selected catalog year.
  - Footer now shows `Catalog <year>`.
- Updated onboarding:
  - Added requirement catalog-year selector next to starting Fall semester.
  - Preview summary shows the selected catalog year.
  - Auto-plan preview source metadata shows older target year vs linked current source year.
  - Finished plan saves the selected catalog year.
- Updated advisor packet text and HTML to include the saved catalog year.
- Added `CATALOG-YEAR` fixture coverage in `scripts/test-generated-plans.js`.
- Updated rendered verifiers for cache tags:
  - `styles.css?v=76`.
  - `js/majors.js?v=3`.
  - `js/state.js?v=16`.
  - `js/import.js?v=10`.
  - `js/settings.js?v=24`.
  - `js/onboarding.js?v=16`.
  - `js/schedule.js?v=32`.
  - `js/io.js?v=12`.
  - `js/share.js?v=12`.
  - `js/snapshots.js?v=11`.
  - `js/account.js?v=8`.
- Extended the rendered mobile workflow verifier to choose `2024-2025` during onboarding and assert:
  - `Catalog year`.
  - `2024-2025`.
  - `Catalog target 2024-2025`.
  - `linked source 2026-2027`.

Verification:
- Ran syntax checks for touched app and verifier files.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `CATALOG-YEAR` fixture.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding with the older catalog-year target.
  - It passed mobile Browse replacement mode.
- Ran `node scripts/verify-rendered-generated-plans.js --majors=PHYS --viewports=mobile --timeout-ms=120000`.
  - It passed the updated rendered Settings/cache assertions.
  - It rendered Physics with `20/20 live course records`.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed all generated-plan and planner fixtures, including `CATALOG-YEAR`.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding and Browse replacement workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass96-catalog-year-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

Findings for next pass:
- Catalog-year targeting is now saved and visible, but older-year requirement differences still require advisor/official-audit comparison because built-in templates are sourced from the checked current catalog pages.

Next pass candidates:
- Add a `--json` output mode to `scripts/run-release-checks.js` for future CI/reporting.
- Add rendered mobile coverage for Account setup and advisor packet export.
- Add an advisor-facing catalog-year warning/checklist item when the selected target year differs from the checked source year.

## 2026-07-01 Pass 97

Focus: make catalog-year targeting actionable for students and advisors, not just visible metadata.

Planned changes:
- Add a shared catalog-year advising warning when the selected target catalog year differs from the linked checked source year.
- Show the warning in the Timeline registration checklist.
- Show an advisor question about confirming the target catalog year.
- Show the warning in advisor packet HTML, copied text, and downloaded standalone advisor packet.
- Add fixture coverage for checklist, advisor question, advisor packet HTML/text/document, and catalog-year helper output.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `catalogYearAdvisingWarning()` in state helpers.
- Registration Checklist now includes a warning such as `Confirm 2024-2025 catalog requirements` when the plan targets an older catalog year.
- Advisor Questions now include a catalog-year confirmation question when target/source years differ.
- Advisor Packet now includes:
  - a dedicated `schedule-advisor-catalog-warning` section in HTML.
  - `Catalog-year verification` lines in copied text.
  - matching warning styles/markup in standalone downloaded advisor packets.
- Added restrained app and standalone packet styling for the warning block.
- Bumped cache tags:
  - `styles.css?v=77`.
  - `js/state.js?v=17`.
  - `js/timeline.js?v=18`.
  - `js/schedule.js?v=33`.
- Updated rendered verifiers for `styles.css?v=77`.
- Extended `scripts/test-generated-plans.js` assertions for:
  - catalog-year helper target/source years.
  - planner checklist warning text.
  - advisor question warning text.
  - advisor packet HTML/text/document warning output.

Verification:
- Ran syntax checks for touched app and verifier files.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the updated `CATALOG-YEAR`, `PLANNER-CHECKLIST`, `PLANNER-QUESTIONS`, and advisor export assertions.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding and Browse replacement workflows.
- Ran `node scripts/verify-rendered-generated-plans.js --majors=PHYS --viewports=mobile --timeout-ms=120000`.
  - It passed rendered Settings/cache assertions and rendered Physics with `20/20 live course records`.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan and planner fixtures with the new catalog-year advisor warnings.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding and Browse replacement workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass97-catalog-warning-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 98

Focus: expand rendered mobile workflow coverage to Account setup and advisor packet export so release checks protect more complete student workflows.

Planned changes:
- Extend `scripts/verify-rendered-workflows.js` beyond onboarding and Browse replacement.
- Add a mobile Account setup workflow covering local/cloud setup guidance, disabled cloud-only actions, profile saving, and local friend invites.
- Add a mobile advisor packet workflow covering seeded real section picks, catalog-year warnings, blocker filtering, and advisor packet download action wiring.
- Extend mobile overflow checks to Account modals and Schedule advisor packet output while preserving intentional inner table scrolling.
- Keep `README.md` untouched and unstaged.

Completed:
- Added Account modal text and overflow capture to the rendered workflow snapshot helper.
- Added Schedule output/advisor packet text and overflow capture to the same helper.
- Added `verifyAccountSetupMobile()`:
  - clears manual Supabase config.
  - confirms local-only cloud setup guidance and disabled cloud sign-in/sync actions.
  - saves a local display name.
  - creates a local friend invite.
  - confirms the modal remains mobile-safe with no horizontal overflow.
- Added `verifyAdvisorPacketMobile()`:
  - seeds a deterministic Fall 2026 schedule with real course codes and posted section records.
  - renders the real Schedule tab and advisor packet output.
  - confirms the Pass 97 catalog-year warning appears in the advisor packet.
  - switches the advisor packet to the Blockers view.
  - clicks `Download advisor packet` and verifies the generated standalone HTML/text export cache.
  - confirms the mobile Schedule/advisor packet layout has no document-level horizontal overflow.
- Updated the workflow verifier success summary to include Account setup and advisor packet workflows.

Verification:
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Account setup.
  - It passed mobile advisor packet export.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan and planner fixtures.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass98-rendered-workflows-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 99

Focus: make release and random-schedule verification easier to archive and automate with a machine-readable release report.

Planned changes:
- Add a `--json` output mode to `scripts/run-release-checks.js`.
- Preserve the existing human console output for normal release runs.
- Capture stage status, command status, durations, options, and bounded command output tails in JSON mode.
- Represent skipped gates explicitly so CI/report consumers can distinguish skipped checks from missing checks.
- Add regression coverage proving JSON output is parseable and clean.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `--json` parsing and help text to `scripts/run-release-checks.js`.
- Added release report schema `terptrack-release-report/v1`.
- Added structured stage records for:
  - syntax checks.
  - offline proxy fixture.
  - generated-plan fixtures.
  - rendered generated-plan verifier.
  - rendered mobile workflow verifier.
  - live PlanetTerp generated schedule verifier.
- Added command records with:
  - command labels.
  - command strings and args.
  - start/end timestamps.
  - durations.
  - exit codes.
  - pass/fail status.
  - bounded stdout/stderr tails when JSON mode captures child processes.
- Kept default non-JSON behavior streaming child process output to the terminal.
- Added `RELEASE-JSON` regression coverage to `scripts/test-generated-plans.js`.
  - It runs the release gate in JSON mode with only the cheap offline proxy fixture enabled.
  - It parses stdout as JSON.
  - It verifies the proxy command is represented as passed.
  - It verifies skipped gates are explicitly represented.
  - It verifies stdout is clean JSON without the normal `[release]` console preamble.

Verification:
- Ran `node --check scripts/run-release-checks.js && node --check scripts/test-generated-plans.js`.
- Ran `node scripts/run-release-checks.js --json --skip-syntax --skip-generated --skip-rendered --skip-workflows`.
  - It emitted parseable JSON with proxy passed and skipped stage records for syntax/generated/rendered/workflows/live.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `RELEASE-JSON` fixture plus the existing generated-plan regression suite.
- Ran `node scripts/run-release-checks.js --help`.
  - It showed the new `--json` option.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including `RELEASE-JSON`.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass99-release-json-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 100

Focus: make Smart next picks actionable by letting students move a ready recommended course into the current registration term directly from the Plan view.

Planned changes:
- Add a recommendation action that moves a future ready course into the active registration term instead of only linking to Schedule.
- Avoid duplicating courses; move the existing planned course object.
- Record the move in recent plan changes so advisor context/history reflects the recommendation-driven adjustment.
- Keep a Schedule jump next to the move action so students can immediately choose real posted sections.
- Add fixture and rendered mobile coverage for the workflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Added recommendation helpers in `js/recommendations.js`:
  - current-term detection for each recommended course.
  - mutable course placement lookup across active schedule, custom semesters, and custom courses.
  - `recoMoveToSemester()` for moving a planned course to the current registration term.
- Updated Smart next pick rows:
  - future-term ready picks now show `Move here` plus `Schedule`.
  - already-current picks show `In this term` plus `Schedule`.
- Added recent-change logging for recommendation moves with a section-picking follow-up hint.
- Added desktop/mobile action styling for recommendation rows.
- Added canonical API titles for `PHYS 260` and `PHYS 261` so generated plans stay aligned with current UMD live metadata when upstream sources disagree.
- Bumped cache tags:
  - `styles.css?v=78`.
  - `js/api.js?v=4`.
  - `js/recommendations.js?v=12`.
- Updated rendered verifiers for `styles.css?v=78` and `js/api.js?v=4`.
- Added `RECO-MOVE` fixture coverage in `scripts/test-generated-plans.js`.
- Extended rendered mobile workflow verification with a Recommendations move workflow.

Verification:
- Ran syntax checks for touched recommendation/verifier/test files.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `RECO-MOVE` fixture and existing generated-plan regression suite.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed the new mobile Recommendations move workflow.
  - It passed mobile Account setup.
  - It passed mobile advisor packet export.
- Ran `node scripts/verify-rendered-generated-plans.js --majors=PHYS --viewports=mobile --timeout-ms=120000`.
  - It passed rendered Settings/cache assertions and rendered Physics with `20/20 live course records`.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including `RECO-MOVE`.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations move, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-majors PHYS --live-seed pass100-reco-move-live`.
  - It verified the PHYS title stabilization against live PlanetTerp/UMD metadata.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass100-reco-move-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 101

Focus: turn Smart next picks into a direct registration action by saving the best posted section from the recommendation card.

Planned changes:
- Add a `Pick best` action when a recommended course has a live posted section that fits the current registration term.
- If the recommended course is still in a future term, move the existing planned course into the active registration term before saving the section.
- Save the exact posted section into `state.selectedSections` using the Schedule tab's existing section-pick storage.
- Clear stale source-term section picks when the course is moved.
- Record one coherent recent-change entry from `Smart next picks` with section, seat, timing, and Schedule-review follow-up details.
- Keep the Schedule jump available for weekly-grid/advisor-packet review.
- Add fixture and rendered mobile coverage for the direct section-pick workflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Added recommendation helpers in `js/recommendations.js` for:
  - shared course-placement moves.
  - cached section lookup from the live Schedule section cache.
  - source-term section cleanup.
  - section labels/summaries that reuse Schedule helpers.
  - `recoPickBestSection()` for moving a course and saving a posted section in one action.
- Updated Smart next pick actions:
  - live recommendations with a best posted section now show `Pick best` plus `Schedule`.
  - recommendations without a best section keep the existing `Move here` fallback.
- Gated `Pick best` to sections that avoid current picked-section conflicts and unavailable blocked-time preferences.
- Preserved existing section pin behavior when replacing an already selected target-term section.
- Added `RECO-SECTION` fixture coverage in `scripts/test-generated-plans.js`.
- Updated rendered mobile workflow verification to click `Pick best` and assert the posted section is saved.
- Bumped cache tag:
  - `js/recommendations.js?v=13`.

Verification:
- Ran `node --check js/recommendations.js && node --check scripts/test-generated-plans.js && node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `RECO-SECTION` fixture plus the existing generated-plan regression suite.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed the new mobile Recommendations section-pick workflow.
  - It passed mobile Account setup.
  - It passed mobile advisor packet export.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including `RECO-SECTION`.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass101-reco-section-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 102

Focus: make saved real sections visible on Plan cards with seat-status context, not only inside the Schedule tab.

Planned changes:
- Upgrade the Plan-view section chip so selected sections show both meeting summary and live seat status.
- Use the same seat-risk levels as Schedule (`ok`, `watch`, `risk`, `closed`, `unknown`) so students can scan urgent picks quickly.
- Keep chips compact and mobile-safe inside course metadata rows.
- Extend tests so section chips prove low-seat, closed/waitlisted, and open-seat states.
- Extend rendered mobile workflow coverage so a Smart next pick section saved from Plan is visible on the Plan row with seat status.
- Keep `README.md` untouched and unstaged.

Completed:
- Updated `scheduleCourseSummary()` in `js/schedule.js`:
  - returns a compact chip with section/timing summary.
  - appends the current seat-risk label, such as `9 open`, `2 left`, or `7 waitlisted`.
  - exposes the full section summary and seat detail in the chip title.
- Updated `.schedule-chip` styling in `styles.css`:
  - uses inline-flex layout with truncation protection.
  - colors chips by `seat-risk-*` level.
  - keeps the seat label fixed while the meeting summary truncates.
- Bumped cache tags:
  - `styles.css?v=79`.
  - `js/schedule.js?v=34`.
- Updated rendered verifiers for `styles.css?v=79`.
- Added `SCHEDULE-CHIP` fixture coverage in `scripts/test-generated-plans.js`.
- Extended rendered mobile workflow snapshots to capture Plan text and Plan overflow.
- Extended the Recommendations section-pick workflow to assert the Plan row shows the saved section and seat status after `Pick best`.

Verification:
- Ran `node --check js/schedule.js && node --check scripts/test-generated-plans.js && node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `SCHEDULE-CHIP` fixture plus the existing generated-plan regression suite.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick and confirmed the Plan row showed `CMSC 132`, section `0101`, and `9 open`.
  - It passed mobile Account setup.
  - It passed mobile advisor packet export.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including `SCHEDULE-CHIP`.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass102-schedule-chip-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 103

Focus: turn risky saved sections into explicit backup actions across Schedule, Timeline checklist, and advisor packet exports.

Planned changes:
- Warn when a picked section is closed, waitlisted, or down to a small number of seats.
- Reuse the warning in Schedule summaries and advisor packet exports instead of making it a one-off visual cue.
- Add Timeline registration checklist items that tell students to keep a backup for risky picks.
- Add advisor questions that ask what backup section or alternate course to use if a risky pick closes.
- Extend generated and rendered workflow coverage for low-seat/closed selected sections.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `selectedSeatRiskWarnings()` in `js/schedule.js`.
  - Closed picks now say to pick a backup section or alternate course before registration.
  - Low-seat picks now say to pick a backup section before the section fills.
  - Watch-list picks now say to keep a backup ready and watch seats.
- Fed seat-risk warnings into `selectedScheduleWarnings()`, so they appear in:
  - Schedule warning cards.
  - schedule output text.
  - advisor packet HTML/text exports.
  - blocker-focused advisor packet filtering.
- Added Timeline backup helpers in `js/timeline.js`.
  - Registration checklist now creates `Seat risk` actions for risky saved sections.
  - Advisor questions now ask what backup section or alternate course to use for those risky saved sections.
  - Both surfaces keep the `Open Schedule` action.
- Added `SCHEDULE-SEAT-RISK` fixture coverage in `scripts/test-generated-plans.js`.
  - Verifies a closed picked section with a waitlist.
  - Verifies a two-seat picked section.
  - Verifies Schedule warnings, checklist text, advisor-question text, danger levels, and Schedule buttons.
- Extended rendered mobile advisor packet verification in `scripts/verify-rendered-workflows.js`.
  - Seeds `MATH 140 0201` with two open seats.
  - Verifies the low-seat backup warning in the rendered advisor packet.
  - Verifies the warning is present in exported advisor HTML and text.
- Bumped cache tags:
  - `js/timeline.js?v=19`.
  - `js/schedule.js?v=35`.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check js/timeline.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `SCHEDULE-SEAT-RISK` fixture plus the existing generated-plan regression suite.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet export with the new low-seat backup warning.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including `SCHEDULE-SEAT-RISK`.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass103-seat-risk-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 104

Focus: make risky picked-section warnings actionable by recommending a conflict-free backup section students can apply immediately.

Planned changes:
- Find a safer posted backup when a saved section is closed, low-seat, or watch-list.
- Only recommend backups that fit existing selected-section conflicts and unavailable-time preferences.
- Render the backup candidate directly inside the existing section decision card.
- Reuse the existing section-swap save, undo, and recent-change path for `Apply backup`.
- Extend generated and rendered workflow coverage so the backup option is visible and the apply action works.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `sectionBackupCandidate()` in `js/schedule.js`.
  - It activates only for risky picked sections.
  - It filters to conflict-free posted sections with `ok` or `watch` seat risk.
  - It ranks safe candidates by seat risk and current section score.
- Updated `renderSectionDecision()`:
  - risky picks now show `Backup option` with section summary and seat detail.
  - the backup action uses a primary `Apply backup` button.
  - duplicate top-section actions are suppressed when the backup is already the top match.
- Updated `applyBestSectionFromDecision()`:
  - accepts a backup/top action hint.
  - records `Applied backup section for ...` in recent changes when the backup button is used.
  - shows backup-specific success copy while preserving undo.
- Bumped cache tag:
  - `js/schedule.js?v=36`.
- Extended `SCHEDULE-SEAT-RISK` fixture coverage:
  - verifies backup-candidate selection for a closed picked section.
  - verifies backup-candidate selection for a low-seat picked section.
  - verifies the rendered decision card includes `Backup option`, `Apply backup`, and the backup action marker.
- Extended rendered mobile advisor packet verification:
  - seeds a safer `MATH 140 0301` backup.
  - verifies the Schedule section list shows the backup option.
  - verifies the advisor packet still exports the original low-seat warning before applying the backup.
  - clicks `Apply backup`, verifies `MATH140-0301` is saved, verifies a backup-specific recent change, and confirms the old low-seat warning clears.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the extended `SCHEDULE-SEAT-RISK` fixture plus the existing generated-plan regression suite.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet export and the new backup apply action.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the extended `SCHEDULE-SEAT-RISK` backup coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass104-backup-section-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 105

Focus: add an explicit all-departments GenEd search scope so profile-targeted searches can be broadened on demand.

Planned changes:
- Keep profile departments as the default Browse starting point for personalized GenEd searches.
- Add a visible `All departments` Browse scope for GenEd searches that should not be limited to preferred/profile departments.
- Make the broad scope call the global GenEd path instead of fanning out only across profile departments.
- Preserve all-department saved searches through local state and shared-plan import/export.
- Extend generated and rendered mobile coverage for the new broad GenEd scope.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `BROWSE_ALL_DEPTS_VALUE` in `js/browse.js`.
- Added `browseIsAllDeptMode()` and extended `browseDepartmentScope()`:
  - profile mode still resolves to preferred departments.
  - all-departments mode resolves to the full common department scope.
- Added a visible `All departments` option to the Browse department selector.
- Added an `All departments` quick chip beside profile department chips.
- Updated `browseListCoursesForCurrentScope()`:
  - `All departments` + specific GenEd tag uses the global GenEd fetch/fallback path.
  - `All departments` + all GenEds uses the all-tag GenEd fetch/fallback path.
  - `All departments` without a GenEd tag prompts the student to choose a GenEd filter instead of accidentally loading every course.
- Updated Browse labels and saved-search details so broad searches render as `All departments`.
- Updated `normalizeBrowseSavedSearch()` in `js/state.js` so `__ALL_DEPTS__` persists.
- Updated advisor/audit Browse labels in `js/schedule.js` so all-department search targets display clearly.
- Bumped cache tags:
  - `js/state.js?v=18`.
  - `js/browse.js?v=13`.
- Extended `BROWSE-PROFILE-SAVED` fixture coverage:
  - verifies profile GenEd search still fans out across preferred departments.
  - verifies all-department GenEd search uses the global GenEd call with no department.
  - verifies all-department saved searches label and restore correctly.
- Extended rendered mobile Browse workflow verification:
  - verifies the selector includes `All departments`.
  - verifies a DSHU all-department search renders a global `HIST 210` result.
  - verifies the broad search does not stay constrained to the profile department call.

Verification:
- Ran `node --check js/browse.js`.
- Ran `node --check js/state.js`.
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the extended `BROWSE-PROFILE-SAVED` fixture plus the existing generated-plan regression suite.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement plus all-department GenEd search.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet export and backup apply workflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the extended `BROWSE-PROFILE-SAVED` all-department coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement with all-department GenEd search, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass105-all-depts-gened-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 106

Focus: make the all-departments GenEd scope visible as an actual toggle whenever a GenEd Browse search is active.

Planned changes:
- Keep the profile department default and all-departments mode from Pass 105.
- Keep the broad scope discoverable even when a student has no saved profile summary.
- Show scope chips for GenEd searches instead of hiding them behind the department dropdown.
- Verify the rendered mobile Browse flow exposes the scope toggle with no horizontal overflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Updated `renderBrowseProfileHints()` in `js/browse.js`.
  - The hint row now stays visible when a GenEd filter or profile/all-department scope is active.
  - The row label changes to `GenEd search scope` for GenEd searches.
  - `All departments` remains visible even with no profile departments configured.
  - `All profile departments` only renders when profile departments are available.
  - The fallback detail explicitly says broad GenEd search will search every department.
- Bumped cache tag:
  - `js/browse.js?v=14`.
- Extended rendered mobile Browse workflow verification:
  - clears profile preferences before the all-department DSHU search.
  - verifies the scope toggle remains visible.
  - verifies the toggle contains `All departments`.
  - verifies the row explains that the broad search checks every department.

Verification:
- Ran `node --check js/browse.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the existing generated-plan regression suite, including the all-department Browse fixture from Pass 105.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement plus all-department GenEd search and visible scope toggle.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet export and backup apply workflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the all-department Browse fixture.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement with all-department GenEd search, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live --live-seed pass106-visible-gened-scope-live`.
  - It verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.

## 2026-07-01 Pass 107

Focus: make generated schedules prove they move from real freshman/sophomore requirements into later 300/400-level major work.

Planned changes:
- Bias generated major schedules by course level while keeping prerequisite depth as the hard ordering signal.
- Add review diagnostics that show whether an auto-generated major plan starts with real 100/200-level requirements and reaches later 300/400-level and 400-level courses.
- Strengthen generated-plan and live PlanetTerp verification so this freshman-to-senior path is tested instead of assumed.
- Clean up direct GenEd handoffs so placeholder replacement opens a broad real-course search instead of carrying stale department/search filters.
- Keep `README.md` untouched and unstaged.

Completed:
- Added course-level helpers in `js/import.js`:
  - `autoPlanCourseNumber()`.
  - `autoPlanCourseLevelBand()`.
  - `autoPlanPreferredTermIndex()`.
  - `autoPlanLevelProgression()`.
- Updated generated scheduling in `autoSchedule()`:
  - 100-level requirements keep the earliest placement bias.
  - 200-level requirements prefer early follow-up terms.
  - 300-level requirements prefer junior-year terms.
  - 400-level and `major-upper` requirements prefer later terms.
  - prerequisite ordering still sets the earliest legal term before the level preference is applied.
- Added `levelProgression` to every auto-plan review analysis.
- Added an `Intro-to-400 path` diagnostic in Settings auto-plan review:
  - shows real 100/200-level requirement counts in early terms.
  - shows real 300/400-level requirement counts in later terms.
  - explicitly reports 400-level course coverage.
- Updated generated-plan regression coverage:
  - each fixture now asserts early lower-level requirements, later upper-level requirements, and 400-level senior options.
  - the diagnostics fixture asserts the new review card renders with `100/200-level` and `400-level` language.
- Updated random live PlanetTerp verification:
  - every sampled generated major must now satisfy the level-progression checks.
  - verifier output prints early lower/later upper/400-level counts beside live title/credit matches.
- Updated `genEdJumpToBrowse()` in `js/gened.js`:
  - direct GenEd jumps now select the explicit all-departments Browse scope.
  - stale Browse keyword search is cleared before rendering the replacement results.
- Bumped cache tags:
  - `js/import.js?v=11`.
  - `js/settings.js?v=25`.
  - `js/gened.js?v=1`.

Verification:
- Ran `node --check js/import.js`.
- Ran `node --check js/settings.js`.
- Ran `node --check js/gened.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed all generated-plan fixtures.
  - The fixture table reported level paths for `ENAE`, `BIOE`, `AAST`, `SPAN`, `AOSC`, and `STAT`.
  - Example counts included `ENAE` at 10 early lower / 11 later upper / 11 400-level and `STAT` at 6 early lower / 9 later upper / 9 400-level.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It verified 12 generated-template viewport runs across desktop and mobile.
  - It confirmed current cache tags for `js/import.js?v=11` and `js/settings.js?v=25`.
  - Browser console output stayed clean.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures with the new course-level progression assertions.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass107-level-progression-live`.
  - It randomly verified `ENCE`, `HLTH`, `ENFP`, `MGMT`, `BCHM`, and `HESP` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed the early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 108

Focus: make generated major requirement coverage auditable by group instead of hiding it behind one requirement count.

Planned changes:
- Preserve generated major requirement categories through the auto-plan review.
- Show students whether core, supporting, and upper-level requirement groups are fully represented in the generated draft.
- Add a broad no-fetch regression sweep across every built-in generated major so all generated templates prove grouped requirement coverage.
- Extend rendered and live verification to cover the new requirement-group evidence.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `autoPlanRequirementGroupSummary()` in `js/import.js`.
  - Groups generated requirements into `Core Requirements`, `Supporting Courses`, `Upper-Level Choices`, and `Other Requirements` when needed.
  - Counts scheduled vs expected courses for each group.
  - Carries sample scheduled codes and missing-code samples for display and diagnostics.
- Added `requirementGroupSummary` to generated auto-plan review analysis.
- Added `autoPlanRequirementGroupList()` in `js/settings.js`.
- Added a `Major Requirement Groups` block to the generated Auto Plan Review:
  - shows per-group scheduled/total counts.
  - shows representative real course codes for each group.
  - highlights incomplete groups if a future template or custom major fails coverage.
- Added responsive styles for `.auto-plan-req-groups` and `.auto-plan-req-group`.
- Extended generated-plan tests:
  - representative fixtures now assert complete requirement groups and group totals.
  - diagnostics fixture now checks the rendered review includes `Major Requirement Groups`, `Core Requirements`, and `Upper-Level Choices`.
  - added `ALL-GENERATED-REQ-GROUPS`, which sweeps all 50 built-in generated majors and all 843 generated requirement rows.
- Extended rendered generated-plan verification:
  - Settings modal review must now show the requirement group block on desktop and mobile.
- Extended random live PlanetTerp verification:
  - sampled generated majors must have complete requirement groups.
  - live verifier output now prints group counts beside title/credit matches.
- Bumped cache tags:
  - `styles.css?v=80`.
  - `js/import.js?v=12`.
  - `js/settings.js?v=26`.

Verification:
- Ran `node --check js/import.js`.
- Ran `node --check js/settings.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node --check scripts/verify-random-schedules.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed representative generated-plan fixtures.
  - It reported grouped requirement counts such as `ENAE` at `Core Requirements:17/17 | Supporting Courses:9/9 | Upper-Level Choices:4/4`.
  - It passed `ALL-GENERATED-REQ-GROUPS`: 50 majors and 843 grouped requirements.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms 120000`.
  - It verified 12 generated-template viewport runs across desktop and mobile.
  - It confirmed the rendered review includes the new requirement group block.
  - Browser console output stayed clean.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including all generated requirement groups.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass108-requirement-groups-live`.
  - It randomly verified `HIST`, `PLSC`, `THET`, `EDUC`, `ARTH`, and `SOCY` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 109

Focus: make friend shared plans safer to inspect before replacing the current plan.

Planned changes:
- Add a comparison preview for loaded friend plans in the Account modal.
- Compare friend plan courses and picked sections against the current local plan.
- Surface shared courses and timed meeting overlaps before the student clicks `Open`.
- Verify the comparison in unit-style account/share coverage and rendered mobile Account UI.
- Keep `README.md` untouched and unstaged.

Completed:
- Added friend-plan comparison helpers in `js/account.js`:
  - `accountPlanPayload()`.
  - `accountPlanCourseCodes()`.
  - `accountSelectedSectionItems()`.
  - `accountCurrentPlanPayload()`.
  - `accountMeetingOverlapSummary()`.
  - `accountFriendPlanSummary()`.
  - `accountFriendPlanSummaryHtml()`.
- Updated loaded friend plan rows:
  - show the friend plan's major/program label.
  - show total course count.
  - show picked-section count.
  - show courses shared with the current plan.
  - show timed meeting overlaps with the current plan.
  - include short overlap examples such as `MATH 140 with your MATH 140 M 10:30am-10:50am`.
- Kept older shared-plan shapes supported:
  - modern nested `selectedSections[semester][course]` data.
  - flat older `selectedSections[course]` payloads.
- Added compact mobile-safe styles for account comparison chips.
- Bumped cache tags:
  - `styles.css?v=81`.
  - `js/account.js?v=9`.
- Extended tests:
  - `ACCOUNT-FRIENDS` now verifies friend plan course count, picked-section count, shared-course count, meeting-overlap count, and rendered comparison text.
  - Rendered mobile Account setup now injects a loaded friend plan and verifies the comparison row with no overflow.

Verification:
- Ran `node --check js/account.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the account/share fixture with friend-plan comparison coverage.
  - It continued to pass generated-plan fixtures, all generated requirement groups, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup with friend invite and friend-plan comparison.
  - It passed mobile advisor packet workflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including account/share comparison coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup with friend-plan comparison, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass109-friend-plan-compare-live`.
  - It randomly verified `HESP`, `HLTH`, `ARTT`, `MUSC`, `AOSC`, and `NFSC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 110

Focus: make friend plan comparison actionable by showing shared free windows from picked section times.

Planned changes:
- Extend the Account modal friend-plan comparison beyond overlaps.
- Use current and friend selected section meeting blocks to find shared free windows.
- Show the windows before the student opens/imports a friend plan.
- Verify the free-window computation in account/share tests and rendered mobile Account UI.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `accountSharedFreeWindows()` in `js/account.js`.
  - Merges current-plan and friend-plan busy meeting blocks.
  - Finds weekday windows from 8:00am to 8:00pm.
  - Requires at least 60 minutes of shared free time.
  - Returns the first useful windows with labels such as `Mon 8:00am-10:00am`.
- Extended `accountFriendPlanSummary()` with `sharedFreeWindows`.
- Extended `accountFriendPlanSummaryHtml()`:
  - keeps overlap examples.
  - adds a `Shared free windows` line.
  - explains when picked sections are missing and free-time comparison is not possible.
- Added compact Account modal styling for `.account-friend-free`.
- Bumped cache tags:
  - `styles.css?v=82`.
  - `js/account.js?v=10`.
- Extended tests:
  - `ACCOUNT-FRIENDS` now verifies shared free windows are computed and rendered.
  - Rendered mobile Account setup now verifies `Shared free windows` and `Mon 8:00am-10:00am` in the real modal.

Verification:
- Ran `node --check js/account.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the account/share fixture with shared free-window assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup with friend-plan comparison and shared free windows.
  - It passed mobile advisor packet workflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including account/share free-window coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup with shared free windows, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass110-friend-free-windows-live`.
  - It randomly verified `FMSC`, `THET`, `HLTH`, `HESP`, `WMST`, and `ENMA` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 111

Focus: make Supabase account setup more self-service from inside the app.

Planned changes:
- Keep Account cloud setup local-first but more explicit about the required database objects.
- Add a copy action for the bundled Supabase schema SQL.
- Verify the schema checklist in account setup tests and rendered mobile Account UI.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `ACCOUNT_SCHEMA_REQUIREMENTS` in `js/account.js` for:
  - `profiles`.
  - `plans`.
  - `friend_requests`.
  - `shared_plans`.
  - `RLS policies`.
  - `updated_at triggers`.
- Added `accountSchemaChecklistItems()` and `accountSchemaChecklistHtml()`.
- Added `accountCopySchemaSql()`:
  - fetches `supabase/schema.sql`.
  - copies it to the clipboard when browser permissions allow.
  - falls back with a clear Account status if automatic copying fails.
- Added a `Copy schema SQL` action to the Cloud config card.
- Added a `Schema objects` checklist under Account cloud setup so deployers can confirm accounts, friend requests, and shared plans have the needed tables and policies.
- Added compact responsive styles for `.account-schema-checklist`, `.account-schema-grid`, and `.account-schema-item`.
- Bumped cache tags:
  - `styles.css?v=83`.
  - `js/account.js?v=11`.
- Extended tests:
  - `ACCOUNT-CLOUD-SETUP` now asserts the schema checklist IDs and rendered schema HTML.
  - Rendered mobile Account setup now verifies `Schema objects`, `friend_requests`, `shared_plans`, `Copy schema SQL`, and `RLS policies`.

Verification:
- Ran `node --check js/account.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the cloud setup fixture with schema checklist assertions.
  - It continued to pass generated-plan fixtures, account/share, all generated requirement groups, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup with schema checklist, friend-plan comparison, and shared free windows.
  - It passed mobile advisor packet workflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including cloud setup schema checklist coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass111-account-schema-checklist-live`.
  - It randomly verified `ENGL`, `ARCH`, `SOCY`, `BIOE`, `CINE`, and `STAT` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 112

Focus: make the Schedule tab show a concrete registration-readiness checklist before students register.

Planned changes:
- Add one shared readiness model for current-term section registration.
- Surface the same readiness gates in the visible Schedule Output card, text export, advisor packet, and exported advisor HTML.
- Treat unpicked sections, time conflicts, low/closed seats, weak timing, TBA times, and preference warnings as explicit gates.
- Verify the checklist in unit-style schedule tests and rendered mobile advisor-packet workflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleRegistrationReadiness()` in `js/schedule.js`.
  - Checks section-pick completion.
  - Checks picked-section conflicts.
  - Checks urgent and watch-level seat risk from real posted seat data.
  - Checks timing score and TBA meeting times.
  - Checks non-seat schedule warnings from saved time, block, and campus preferences.
- Added shared render/export helpers:
  - `scheduleRegistrationReadinessHtml()`.
  - `scheduleRegistrationReadinessText()`.
- Rendered `Registration Readiness` in:
  - the visible Schedule Output card.
  - the advisor packet in the app.
  - the downloaded advisor-packet HTML document.
  - the plain-text schedule summary.
  - the plain-text advisor packet.
- Added responsive styling for `.schedule-readiness`, `.schedule-readiness-grid`, and `.schedule-readiness-gate`.
- Added standalone advisor-packet CSS for the readiness block so downloaded/printed packets keep the same checklist layout.
- Bumped cache tags:
  - `styles.css?v=84`.
  - `js/schedule.js?v=37`.
- Extended tests:
  - Added `SCHEDULE-READINESS` fixture to `scripts/test-generated-plans.js`.
  - The fixture verifies a realistic blocker case with one unpicked course, one section conflict, and one low-seat section across readiness object, HTML, text, schedule output, advisor HTML, advisor text, and exported advisor document.
  - Rendered mobile advisor-packet workflow now asserts `Registration Readiness`, `Fix before registration`, and exported readiness text.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `SCHEDULE-READINESS` fixture.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including registration readiness coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass112-registration-readiness-live`.
  - It randomly verified `EDUC`, `ARCH`, `PHIL`, `PHSC`, `ENCE`, and `HESP` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 113

Focus: connect Smart next picks to registration-readiness impact before a student moves or picks a recommended section.

Planned changes:
- Reuse the Schedule tab registration-readiness model inside Recommendations.
- Simulate the current term after applying a recommended best section.
- Show whether the recommended section would make the term registration-ready, review-needed, or still blocked.
- Verify the impact row in unit-style recommendation tests and rendered mobile Recommendations UI.
- Keep `README.md` untouched and unstaged.

Completed:
- Added recommendation readiness-impact helpers in `js/recommendations.js`:
  - `recoTermCoursesWithCandidate()`.
  - `recoItemsWithCandidate()`.
  - `recoCandidateReadinessImpact()`.
  - `recoReadinessImpactHtml()`.
  - `recoBadgeClass()`.
- During live recommendation hydration, TerpTrack now:
  - fetches posted sections as before.
  - chooses the best section with existing schedule scoring.
  - simulates the current term with that candidate section added.
  - runs `scheduleRegistrationReadiness()` on the simulated term.
  - uses the impact in the live recommendation score.
- Added a compact `Term impact` row to recommendation cards.
  - It shows statuses such as `Registration ready` or `Fix before registration`.
  - It names the most important readiness gate, such as remaining section picks or conflicts.
- Added readiness-impact badges for recommendation cards.
- Added responsive styles for `.reco-readiness` and readiness badge states.
- Bumped cache tags:
  - `styles.css?v=85`.
  - `js/recommendations.js?v=14`.
- Extended tests:
  - `RECO-SECTION` now asserts a safe live best section renders `Term impact` and `Registration ready`.
  - Rendered mobile Recommendations now asserts `Term impact` and `Fix before registration` in the real panel.
  - Rendered verifiers now assert `styles.css?v=85` and `js/recommendations.js?v=14`.

Verification:
- Ran `node --check js/recommendations.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the updated `RECO-SECTION` fixture with registration-readiness impact assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, schedule timing, registration readiness, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations with Smart next pick section action, term readiness impact, course move, posted section save, and no overflow.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including recommendation readiness-impact coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick with term readiness impact, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass113-reco-readiness-impact-live`.
  - It randomly verified `SCM`, `PHYS`, `ENST`, `IS`, `MGMT`, and `EDUC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 114

Focus: turn Schedule registration-readiness verdicts into concrete recommended fixes.

Planned changes:
- Keep the existing readiness gates as the source of truth.
- Add a deduplicated fix list for blocked/review states.
- Surface fixes in the visible Schedule Output card, advisor packet, downloaded advisor HTML, and text exports.
- Verify the fix list in unit-style readiness tests and rendered mobile advisor-packet workflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleRegistrationFixList()` in `js/schedule.js`.
  - Missing section picks now recommend Auto-pick first, then manual picks for courses without posted sections.
  - Time conflicts now recommend alternatives or switching an overlapping section until the grid has 0 conflicts.
  - Low/closed seats now recommend backup or higher-seat sections for the affected picked sections.
  - Watch-level seats now recommend keeping a backup ready and rechecking before registration time.
  - Timing and preference warnings now recommend alternatives, TBA rechecks, or preference/section adjustments.
- Added `fixes` to the object returned by `scheduleRegistrationReadiness()`.
- Rendered `Recommended fixes` under the readiness gate grid in:
  - the visible Schedule Output card.
  - the advisor packet in the app.
  - the downloaded advisor-packet HTML document.
  - plain-text schedule and advisor exports via `Fix:` lines.
- Added responsive styles for `.schedule-readiness-fixes`.
- Added matching standalone advisor-packet CSS for exported/printed packets.
- Bumped cache tags:
  - `styles.css?v=86`.
  - `js/schedule.js?v=38`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts missing-section, conflict, and seat-risk fix recommendations.
  - Rendered mobile advisor packet now asserts `Recommended fixes` and the `Pick sections for ENGL 101` fix in the DOM, exported advisor HTML, and exported advisor text.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with recommended-fix assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, recommended fixes, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - The first run passed syntax, proxy, and generated-plan fixtures, then hit a rendered generated-plan timeout on mobile `PLSC` while metadata was still loading.
- Re-ran `node scripts/verify-rendered-generated-plans.js --timeout-ms=120000`.
  - It passed all 12 generated-template viewport runs, including mobile `PLSC`.
- Re-ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including recommended-fix readiness coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with recommended fixes.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass114-readiness-fixes-live`.
  - It randomly verified `PLSC`, `AMST`, `ASTR`, `STAT`, `HLTH`, and `EDUC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 115

Focus: make Schedule registration-readiness recommendations actionable from the Schedule Output and advisor packet.

Planned changes:
- Keep the Pass 114 textual recommended fixes as export-friendly advisor language.
- Add quick-action metadata to readiness so blocked schedules can invoke existing schedule workflows directly.
- Wire the actions to Auto-pick sections, Generate alternatives, and Review section picks.
- Verify the action model in fixture tests and the rendered mobile advisor-packet workflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleRegistrationFixActions()` in `js/schedule.js`.
  - Missing section picks now expose `Auto-pick sections` and `Review section picks`.
  - Time conflicts, timing warnings, preference warnings, and seat-risk gates now expose `Generate alternatives` when comparison schedules can help.
  - Seat-risk gates also expose `Review section picks` so students can jump to backup-section controls.
- Added `actions` to `scheduleRegistrationReadiness()`.
- Rendered `Quick actions` below `Recommended fixes` in:
  - the visible Schedule Output readiness card.
  - the advisor packet in the app.
  - the downloaded advisor-packet HTML document.
- Wired readiness action buttons in `renderScheduleOutputPanel()`.
  - `Auto-pick sections` calls the existing section auto-picker.
  - `Generate alternatives` calls the existing alternative-schedule generator and scrolls to alternatives.
  - `Review section picks` scrolls to the section picker, temporarily highlights the panel, and records `lastReadinessAction`.
- Added app and standalone advisor-packet CSS for `.schedule-readiness-actions`.
- Added print rules so quick-action controls do not appear in printed schedule/advisor output.
- Added `.schedule-sections.readiness-focus` styling for the review-section jump.
- Bumped cache tags:
  - `styles.css?v=87`.
  - `js/schedule.js?v=39`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts quick-action IDs and action-button HTML in schedule/advisor/export output.
  - Rendered mobile advisor packet now asserts `Quick actions`, all three action labels, exported quick-action markup, and a real `Review section picks` click/focus path.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with quick-action assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - The first run timed out in the advisor-packet initial wait because the fixture had no conflict gate and therefore no alternatives action.
  - Added `Generate alternatives` for seat-risk gates as a useful higher-seat comparison path.
- Re-ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness quick actions, review-section focus, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - The first full run passed syntax, proxy, and generated-plan fixtures, then hit a rendered generated-plan timeout while PHYS metadata was still loading.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms=120000`.
  - The first direct rerun timed out waiting for the Settings release checklist.
- Re-ran `node scripts/verify-rendered-generated-plans.js --timeout-ms=120000`.
  - It passed all 12 generated-template viewport runs.
- Re-ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including readiness quick-action coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with quick actions.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass115-readiness-quick-actions-live`.
  - It randomly verified `WMST`, `MARKETING`, `HESP`, `PLSC`, `EDUC`, and `MATH` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 116

Focus: let students export picked real class meetings into an importable calendar file.

Planned changes:
- Add a first-class `.ics` export beside schedule text, advisor packet, and print actions.
- Build calendar events from the same real selected-section meeting blocks that power the weekly grid.
- Include course code, section, room, instructor, seat status, and a UMD academic-calendar date review note.
- Verify the calendar payload in unit-style schedule output tests and in the rendered mobile advisor-packet workflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Added calendar export helpers in `js/schedule.js`.
  - `buildScheduleCalendarIcs()` emits standards-style `VCALENDAR` / `VEVENT` content.
  - Timed picked section meetings become weekly recurring events.
  - Events use `America/New_York`, course/section summaries, classroom locations, instructors, seat status, and inferred term windows.
  - Term-window notes explicitly tell students to confirm exact academic-calendar dates with UMD.
  - ICS line folding and escaping are handled for descriptions, rooms, course names, and calendar names.
- Added `scheduleCalendarFilename()` and `scheduleCalendarEventCount()`.
- Added calendar content, filename, and event count to `buildScheduleOutput()`.
- Added a `Download calendar` button to the Schedule Output action row.
- Added `downloadScheduleCalendar()`.
  - It downloads `text/calendar` when timed section events exist.
  - It warns students to pick timed sections before downloading if the current schedule has no calendar events.
- Bumped the Schedule script cache tag to `js/schedule.js?v=40`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts `.ics` filename, `BEGIN:VCALENDAR`, `VEVENT` records, event count, section summary, Fall 2026 inferred first Monday, weekly recurrence, classroom location, and UMD date-review note.
  - Rendered mobile advisor packet now asserts the `Download calendar` button, clicks it, verifies the action marker, and checks the generated calendar cache.
  - Rendered workflow cache assertions now require `js/schedule.js?v=40`.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with calendar export assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - The first run failed because the rendered advisor-packet fixture had four timed class events, not three.
  - Corrected the workflow assertion to match CMSC Monday/Wednesday plus MATH Tuesday/Thursday.
- Re-ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with calendar export, registration readiness quick actions, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including calendar export coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with calendar export.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Renamed the local calendar term-window variable for readability, then re-ran syntax checks for `js/schedule.js`, `scripts/test-generated-plans.js`, and `scripts/verify-rendered-workflows.js`.
- Re-ran `node scripts/run-release-checks.js`.
  - The first final-code rerun passed syntax, proxy, and generated fixtures, then hit a rendered generated-plan timeout after mobile `ARTT`.
- Re-ran `node scripts/verify-rendered-generated-plans.js --timeout-ms=120000`.
  - It passed all 12 generated-template viewport runs.
- Re-ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including calendar export coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with calendar export.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass116-calendar-export-live`.
  - It randomly verified `PHYS`, `ENST`, `WMST`, `FMSC`, `JOUR`, and `SOCY` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 117

Focus: let students set exact calendar export date ranges instead of relying only on inferred term windows.

Planned changes:
- Add per-semester calendar start/end controls in the Schedule tab.
- Save and normalize those dates in schedule preferences.
- Make `.ics` generation use the custom date range when both dates are valid.
- Preserve inferred term-window behavior when dates are blank or invalid.
- Verify custom calendar ranges in fixture and rendered browser workflows.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `calendarStart` and `calendarEnd` to `DEFAULT_SCHEDULE_PREFS`.
- Added `normalizeScheduleDate()` and normalization in `getSchedulePrefs()`.
  - Invalid date strings normalize to blank.
  - End dates earlier than start dates are ignored.
- Added `Calendar starts` and `Calendar ends` date inputs to the Schedule preferences panel.
- Wired the new date inputs through `initScheduleEvents()`.
- Updated Schedule preference styles so date inputs match existing compact controls.
- Updated `scheduleCalendarTermWindow()` to accept schedule prefs.
  - Valid custom ranges now drive first meeting dates and recurrence `UNTIL`.
  - Custom calendar event descriptions include the selected date range plus UMD academic-calendar confirmation guidance.
  - Blank or invalid custom dates still fall back to inferred Spring/Summer/Fall/Winter windows.
- Updated `buildScheduleCalendarIcs()` and `buildScheduleOutput()` to pass schedule prefs into calendar generation.
- Bumped cache tags:
  - `styles.css?v=88`.
  - `js/schedule.js?v=41`.
- Extended tests:
  - `SCHEDULE-READINESS` now sets a custom `2026-09-02` to `2026-12-14` calendar range and asserts the generated `.ics` uses that range.
  - Rendered mobile advisor packet now asserts the date inputs render the saved range and the exported calendar uses the configured start date.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with custom calendar date-range assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with saved calendar date inputs, calendar export, registration readiness quick actions, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including custom calendar range coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with custom calendar date inputs.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass117-calendar-date-controls-live`.
  - It randomly verified `ENAE`, `AREC`, `ACCOUNTING`, `MATH`, `JOUR`, and `LING` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 118

Focus: give students a Testudo-facing registration handoff export from picked real sections.

Planned changes:
- Add a plain-text registration checklist export beside the advisor packet and calendar export.
- Include exact picked section numbers and section IDs so students can copy their choices into Testudo.
- Call out missing section picks, conflicts, low-seat warnings, and final registration checks.
- Verify the export in fixture tests and the rendered mobile advisor-packet workflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleRegistrationFilename()` to generate term-specific `.txt` filenames.
- Added `buildScheduleRegistrationText()` for the registration checklist payload.
  - It includes the plan semester, posted UMD term code, readiness status, picked sections, instructors, meetings, seats, missing section picks, conflicts, warnings, recommended fixes, and final Testudo checks.
  - It keeps the handoff honest by labeling the export as a Testudo checklist and telling students to confirm seats, prerequisites, blocks, and exact meeting details before submitting.
- Added `registrationText` and `registrationFilename` to `buildScheduleOutput()`.
- Added a `Download registration list` button to the schedule output action row.
- Added `downloadScheduleRegistrationList()` and exposed it for test automation.
- Bumped the Schedule script cache tag to `js/schedule.js?v=42`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts registration filename, Testudo checklist labeling, posted UMD term code, picked section IDs, missing picks, conflicts, low-seat warnings, and final Testudo checks.
  - Rendered mobile advisor packet now clicks the registration export button and verifies the generated export cache.
  - Rendered workflow cache assertions now require `js/schedule.js?v=42`.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with registration checklist export assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration export, calendar export, registration readiness quick actions, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including registration checklist export coverage.
  - It passed 12 rendered generated-plan viewport runs.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with registration export.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass118-registration-list-live`.
  - It randomly verified `AOSC`, `AMST`, `JOUR`, `ENGL`, `ENAE`, and `ENCH` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 119

Focus: turn picked real sections into a ranked enrollment order students can follow during registration.

Planned changes:
- Add a deterministic enrollment-order ranking for picked sections.
- Prioritize tight seats, waitlisted/closed sections, conflict review, core/goal courses, GenEds, and courses that unlock later planned work.
- Render the order in the schedule output and advisor packet.
- Include the same order in schedule `.txt`, registration-list `.txt`, advisor text, and advisor HTML exports.
- Remove external page-head font fetches so local-first browser verification is not dependent on Google Fonts.
- Verify the new order in fixture and rendered mobile workflows.
- Keep `README.md` untouched and unstaged.

Completed:
- Added registration-order helpers in `js/schedule.js`.
  - `scheduleFutureUnlockCount()` counts later planned courses that depend on a picked course.
  - `scheduleRegistrationCoursePriority()` scores core, goal, critical, GenEd, and prerequisite-anchor courses.
  - `scheduleRegistrationOrder()` ranks picked sections by seat urgency, conflicts, academic priority, unlock count, and pinned status.
  - `renderScheduleRegistrationOrderHtml()` renders the compact Enrollment Order card.
  - `scheduleRegistrationOrderText()` emits the same order for text exports.
- Added the Enrollment Order card to:
  - The main schedule output.
  - The advisor packet.
  - The standalone advisor HTML export.
- Added the ranked order to:
  - The schedule summary `.txt`.
  - The Testudo-facing registration list `.txt`.
  - The advisor text export.
- Returned `registrationOrder` from `buildScheduleOutput()` for regression coverage.
- Added production and standalone export CSS for the order card.
- Removed Google Fonts `preconnect` and stylesheet links from `index.html`.
  - This keeps the app more local-first and stopped intermittent `net::ERR_NETWORK_IO_SUSPENDED` browser-console noise in rendered generated-plan verification.
- Bumped cache tags:
  - `styles.css?v=89`.
  - `js/schedule.js?v=43`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts the order ranks a low-seat conflicting MATH section first, counts a later prerequisite unlock, renders Enrollment Order HTML, includes the ordered handoff in schedule text, and includes it in the registration-list export.
  - Rendered mobile advisor packet now asserts Enrollment Order in the live UI, registration export, advisor text, advisor HTML, and no-overflow mobile snapshot.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with enrollment-order assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, enrollment order, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - The first run reached rendered generated-plan verification, rendered all desktop target cards, then failed on transient browser-console `net::ERR_NETWORK_IO_SUSPENDED` resource errors.
- Ran `node scripts/verify-rendered-generated-plans.js --timeout-ms=120000`.
  - It reproduced the same external-resource console error after rendering generated-plan cards.
- Removed external Google Fonts page-head fetches.
- Re-ran `node scripts/verify-rendered-generated-plans.js --timeout-ms=120000`.
  - It passed all 12 generated-template viewport runs with clean proxy-backed console output.
- Re-ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including enrollment-order coverage.
  - It passed 12 rendered generated-plan viewport runs with clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with enrollment order.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass119-enrollment-order-live`.
  - It randomly verified `ANSC`, `ACCOUNTING`, `GEOG`, `NFSC`, `SCM`, and `IS` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 120

Focus: add a registration backup plan so students have real alternate sections ready when seats change.

Planned changes:
- Derive backup sections from the same posted section data used by the Schedule tab.
- Use existing conflict-safe backup ranking instead of hand-written fallback notes.
- Render backup choices in the schedule output and advisor packet.
- Include backup choices in the schedule `.txt`, Testudo registration list `.txt`, advisor text, and advisor HTML exports.
- Verify the backup plan in fixture and rendered mobile workflows.
- Keep `README.md` untouched and unstaged.

Completed:
- Added backup-plan helpers in `js/schedule.js`.
  - `scheduleRegistrationBackupPlan()` builds backup rows for low-seat, waitlisted, TBA, or closed picked sections.
  - It reuses `sectionBackupCandidate()` so backups are higher-seat, conflict-safe, and clear saved blocked-time preferences.
  - Rows include primary section, primary seat risk, backup section number, backup section ID, backup seats, meetings, instructor, and a fallback note when no safe backup exists.
  - `renderScheduleRegistrationBackupsHtml()` renders the compact Backup Plan card.
  - `scheduleRegistrationBackupText()` emits the same plan for exports.
- Threaded `sectionsByCode` into `buildScheduleOutput()` through `renderScheduleOutputPanel()` so exports can use live posted alternatives.
- Added the Backup Plan card to:
  - The main schedule output.
  - The advisor packet.
  - The standalone advisor HTML export.
- Added backup sections to:
  - The schedule summary `.txt`.
  - The Testudo-facing registration list `.txt`.
  - The advisor text export.
- Returned `registrationBackupPlan` from `buildScheduleOutput()` for regression coverage.
- Added production and standalone export CSS for the backup plan card.
- Bumped cache tags:
  - `styles.css?v=90`.
  - `js/schedule.js?v=44`.
- Extended tests:
  - `SCHEDULE-READINESS` now passes live-style section alternatives into the output builder and asserts MATH 140 0301 is selected as the conflict-safe higher-seat backup.
  - The fixture asserts Backup Plan HTML, schedule text backup handoff, and registration-list backup handoff.
  - Rendered mobile advisor packet now asserts Backup Plan in the live UI, output cache, registration export, advisor text, advisor HTML, and no-overflow mobile snapshot.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with registration backup-plan assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including registration backup-plan coverage.
  - It passed 12 rendered generated-plan viewport runs with clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with backup plan.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass120-backup-plan-live`.
  - It randomly verified `JOUR`, `PHIL`, `WMST`, `PHYS`, `ACCOUNTING`, and `ENAE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 121

Focus: add a per-semester registration appointment so students can plan around their exact Testudo enrollment time.

Planned changes:
- Add saved registration date and time controls to the Schedule preferences.
- Normalize and persist appointment values per semester.
- Show appointment status, timing, and checklist items in schedule output and advisor packets.
- Include appointment context in schedule text, registration-list text, advisor text, and standalone advisor HTML exports.
- Verify appointment state in generated-plan fixtures and rendered mobile workflows.
- Keep `README.md` untouched and unstaged.

Completed:
- Extended schedule preferences with `registrationDate` and `registrationTime`.
- Added Schedule tab inputs for registration date and registration time.
- Added appointment helpers in `js/schedule.js`.
  - `scheduleRegistrationAppointmentDate()` formats saved Testudo appointment values.
  - `scheduleRegistrationAppointment()` derives status, urgency, and checklist items from the saved appointment, readiness gates, and backup-plan count.
  - `renderScheduleRegistrationAppointmentHtml()` renders the Registration Appointment card.
  - `scheduleRegistrationAppointmentText()` emits appointment checklist lines for exports.
- Added the Registration Appointment card to the main schedule output and advisor packet.
- Added appointment summaries and checklist items to the schedule `.txt`, Testudo registration list `.txt`, advisor text, and standalone advisor HTML export.
- Returned `registrationAppointment` from `buildScheduleOutput()` for regression and rendered-workflow coverage.
- Added production and standalone export CSS for appointment card states.
- Bumped cache tags:
  - `styles.css?v=91`.
  - `js/schedule.js?v=45`.
- Extended tests:
  - `SCHEDULE-READINESS` now saves an Aug. 25, 2099 at 9:30am appointment and asserts the appointment in output cache, HTML, schedule text, registration text, advisor text, and advisor document markup.
  - Rendered mobile advisor packet now asserts the saved appointment inputs, output cache, rendered packet, registration export, advisor text, advisor HTML, mobile snapshot, and no-overflow path.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with registration appointment assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, registration appointment, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including registration appointment coverage.
  - It passed 12 rendered generated-plan viewport runs with clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with registration appointment.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass121-registration-appointment-live`.
  - It randomly verified `BIOE`, `ENAE`, `MUSC`, `PLSC`, `JOUR`, and `ENGL` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 122

Focus: add a Testudo Entry Queue so students can act on the schedule with exact section IDs in registration priority order.

Planned changes:
- Derive a Testudo entry queue from the saved enrollment order and backup plan.
- Show exact section IDs, queue status, seat risk, and backup IDs in the schedule output and advisor packet.
- Include the queue in schedule text, registration-list text, advisor text, and standalone advisor HTML exports.
- Verify the queue in fixture and rendered mobile workflows.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleRegistrationHandoff()` in `js/schedule.js`.
  - It converts enrollment-order rows into a Testudo-facing queue.
  - It marks entries as ready, review, blocked, or missing based on conflicts, seat risk, and missing section IDs.
  - It joins backup-plan rows so risky entries show backup section IDs.
- Added `renderScheduleRegistrationHandoffHtml()` for the Testudo Entry Queue card.
- Added `scheduleRegistrationHandoffText()` for text exports.
- Added the Testudo Entry Queue card to:
  - The main schedule output.
  - The advisor packet.
  - The standalone advisor HTML export.
- Added queue lines to:
  - The schedule summary `.txt`.
  - The Testudo registration list `.txt`.
  - The advisor text export.
- Returned `registrationHandoff` from `buildScheduleOutput()` for regression and rendered-workflow coverage.
- Added production and standalone export CSS for the queue, including blocked/review/ready status styling and mobile stacking.
- Bumped cache tags:
  - `styles.css?v=92`.
  - `js/schedule.js?v=46`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts the queue orders MATH 140 first with exact section ID `MATH140-0201`.
  - The fixture asserts Testudo Entry Queue HTML, schedule text, registration-list text, advisor text, advisor HTML, backup ID, and exported document markup.
  - Rendered mobile advisor packet now asserts the queue in the DOM, output cache, registration export, advisor text, advisor HTML, mobile snapshot, and no-overflow path.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with Testudo Entry Queue assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, registration appointment, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including Testudo Entry Queue coverage.
  - It passed 12 rendered generated-plan viewport runs with clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with Testudo queue.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass122-testudo-entry-queue-live`.
  - It randomly verified `ENEE`, `ANTH`, `HIST`, `PHSC`, `PHYS`, and `ENCH` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 123

Focus: add seat-data freshness tracking so students know whether registration seats were recently refreshed before trusting the Testudo handoff.

Planned changes:
- Track per-course section fetch timestamps in the Schedule tab.
- Summarize fresh, review, stale, and unknown seat data.
- Show seat freshness in schedule output and advisor packets.
- Include freshness context in schedule text, registration-list text, advisor text, and standalone advisor HTML exports.
- Verify stale-seat behavior in fixture and rendered mobile workflows.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleSectionsMeta` alongside the existing posted-section cache.
- Updated `scheduleFetchSectionsFor()` to record fetch time, source, and section count whenever live section data is loaded or manually refreshed.
- Added `scheduleSeatFreshness()` in `js/schedule.js`.
  - It summarizes each schedule-ready course as fresh, review, stale, or unknown based on cache age.
  - It marks stale section data as a registration danger requiring refresh.
  - It includes per-course section counts and human-readable ages.
- Added `renderScheduleSeatFreshnessHtml()` for the Seat Data Freshness card.
- Added `scheduleSeatFreshnessText()` for exports.
- Added the Seat Data Freshness card to:
  - The main schedule output.
  - The advisor packet.
  - The standalone advisor HTML export.
- Added freshness lines to:
  - The schedule summary `.txt`.
  - The Testudo registration list `.txt`.
  - The advisor text export.
- Returned `seatFreshness` from `buildScheduleOutput()` for regression and rendered-workflow coverage.
- Added freshness status to the Schedule tab live section-load status line.
- Added production and standalone export CSS for fresh/warn/stale states with mobile stacking.
- Bumped cache tags:
  - `styles.css?v=93`.
  - `js/schedule.js?v=47`.
- Extended tests:
  - `SCHEDULE-READINESS` now seeds stale MATH 140 section metadata and asserts the stale refresh warning in output cache, HTML, schedule text, registration text, advisor text, advisor HTML, and exported document markup.
  - Rendered mobile advisor packet now seeds stale section metadata and asserts Seat Data Freshness in the DOM, output cache, registration export, advisor text, advisor HTML, mobile snapshot, and no-overflow path.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with seat freshness assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including seat freshness coverage.
  - It passed 12 rendered generated-plan viewport runs with clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with seat freshness.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass123-seat-freshness-live`.
  - It randomly verified `LING`, `SCM`, `THET`, `ENMA`, `SOCY`, and `ENST` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 124

Focus: make stale seat data actionable with an in-packet refresh action.

Planned changes:
- Add a visible refresh action to the Seat Data Freshness card.
- Wire that action to the existing forced Schedule tab section refresh path.
- Preserve refresh guidance in text exports.
- Verify the button in fixture output and rendered mobile workflows.
- Keep `README.md` untouched and unstaged.

Completed:
- Added a `Refresh sections now` action to `renderScheduleSeatFreshnessHtml()` whenever section data rows exist.
- Added seat-refresh action guidance to `scheduleSeatFreshnessText()`.
- Added `handleScheduleSeatFreshnessAction()` in `js/schedule.js`.
  - It records the action on `#schedule-output`.
  - It calls `renderSchedule({ force: true })` so posted sections and seats are refetched.
  - It restores the action marker after the forced re-render for UI verification.
- Bound `[data-seat-freshness-action]` buttons in the schedule output panel.
- Exposed `handleScheduleSeatFreshnessAction` on `window` beside the existing readiness handler.
- Added production and standalone export CSS for the freshness action row.
- Bumped cache tags:
  - `styles.css?v=94`.
  - `js/schedule.js?v=48`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts the refresh action button in schedule/advisor HTML and refresh-action guidance in schedule, registration, and advisor text.
  - Rendered mobile advisor packet now clicks `Refresh sections now`, verifies the forced-refresh action marker, verifies the status moves to fresh seats, and checks no overflow after refresh.
  - Rendered verifiers now assert the updated style/script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with seat refresh action assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including seat refresh action coverage.
  - It passed 12 rendered generated-plan viewport runs with clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with seat refresh action.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass124-seat-refresh-action-live`.
  - It randomly verified `SOCY`, `EDUC`, `NEUR`, `ENGL`, `CINE`, and `THET` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 125

Focus: make friend shared plans actionable for real student coordination and harden live PlanetTerp metadata fetches.

Planned changes:
- Turn existing friend-plan shared free windows into ranked meeting suggestions.
- Add a copyable meeting note so students can coordinate with friends outside TerpTrack.
- Keep the account modal compact and mobile-safe.
- Add a bounded PlanetTerp request timeout so rendered generated-plan previews cannot hang at partial metadata counts.
- Add explicit long-term end goals to this progress log.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `accountRecommendedMeetingWindows()` and meeting-slot scoring in `js/account.js`.
  - Shared free windows now retain duration and campus-aligned day metadata.
  - Suggested slots prefer practical mid-day windows and days where both students already have picked classes.
- Added `accountFriendMeetingPlanHtml()` inside friend-plan comparisons.
  - It shows a best suggested slot, backup slots, and a `Copy meeting note` action.
  - Empty states still explain when picked sections are needed.
- Added `accountFriendMeetingPlanText()` and `accountCopyFriendMeetingNote()`.
  - The note includes the friend plan, best shared slot, backups, and overlap warning.
  - Clipboard failures degrade to a visible ready-to-copy account status.
- Added compact account modal styling for the meeting planner, including mobile stacking.
- Added `planetTerpFetchWithTimeout()` in `js/planetterp.js`.
  - PlanetTerp course metadata requests now abort after a bounded timeout and continue through the existing retry path.
  - Generated-plan previews can finish from UMD metadata instead of stalling forever when a PlanetTerp request hangs.
- Bumped cache tags:
  - `styles.css?v=95`.
  - `js/planetterp.js?v=3`.
  - `js/account.js?v=12`.
- Updated rendered verifier cache assertions for the new CSS, PlanetTerp, and account script tags.
- Added a `Long-Term End Goals` section near the top of this file.

Verification:
- Ran `node --check js/account.js`.
- Ran `node --check js/planetterp.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `ACCOUNT-FRIENDS` fixture with ranked meeting suggestions.
  - It verified the campus-aligned best slot `Mon 12:00pm-1:15pm`, the meeting planner UI, and the copy-note text.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account setup, recommendations, Browse, audit, onboarding, prior-credit, schedule timing, registration readiness, and seat-risk tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup with friend invite, friend-plan meeting planner, copy-note status, and no overflow.
  - It passed mobile advisor packet workflow with registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the previously flaky ARTT mobile rendered preview at `12/12 live course records`.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including friend meeting planner coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass125-friend-meeting-planner-live`.
  - It randomly verified `SOCY`, `PHSC`, `ACCOUNTING`, `AAST`, `HESP`, and `EDUC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 126

Focus: make auto-generated four-year plans explicitly show whether they are real-course ready or still need replacement work.

Planned changes:
- Add a first-class Plan Reality gate to Settings auto-plan previews.
- Summarize live-backed requirement coverage, requirement-group completion, placeholder credits, and freshman-to-senior course-level progression.
- Surface the next replacement actions directly beside the generated plan evidence.
- Verify the new gate in fixture and rendered browser workflows.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `autoPlanRealitySummary()` in `js/settings.js`.
  - It classifies generated previews as `ok`, `warn`, or `danger` from existing evidence.
  - It reports live-backed requirement counts, complete requirement groups, placeholder credits, and freshman-to-senior path status.
  - It produces concrete next actions for placeholder replacement, template fallback review, missing groups, and course-level sequence review.
- Added `autoPlanRealityHtml()` to rendered Settings previews.
  - It appears for generated and curated auto-plan previews.
  - It includes replacement buttons wired through the existing Browse handoff path.
  - It keeps the plan honest by showing placeholder credits before a student applies the draft.
- Added production CSS for the Plan Reality panel.
  - It uses compact operational styling, status colors, four metric tiles, and mobile stacking.
- Bumped cache tags:
  - `styles.css?v=96`.
  - `js/settings.js?v=27`.
- Extended tests:
  - `AUTO-PLAN-DIAGNOSTICS` now asserts Plan Reality warning state, live-backed requirement counts, placeholder-credit warnings, replacement-action text, rendered metrics, and mixed live/fallback coverage.
  - Rendered generated-plan verifier now requires `Plan Reality`, `Live-backed requirements`, and `Next replacement actions` in each sampled browser preview.
  - Rendered verifiers now assert the updated style/settings cache tags.

Verification:
- Ran `node --check js/settings.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `AUTO-PLAN-DIAGNOSTICS` fixture with Plan Reality assertions.
  - It continued to pass generated-plan fixtures, all generated requirement groups, account/share, account setup, recommendations, Browse, audit, onboarding, prior-credit, schedule timing, registration readiness, and seat-risk tests.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile Settings preview, Plan Reality block, and full `12/12 live course records` ARTT metadata path.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including Plan Reality coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts, Plan Reality assertions, and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass126-plan-reality-live`.
  - It randomly verified `MATH`, `ARCH`, `ACCOUNTING`, `THET`, `HLTH`, and `IS` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 127

Focus: improve niche elective placement so generated plans spread profile/free-elective work across later terms instead of front-loading every open slot.

Planned changes:
- Add deliberate preferred placement for free-elective placeholders.
- Expose elective placement distribution in the Plan Reality gate.
- Keep generated plans within credit/load, requirement-group, GenEd, and freshman-to-senior progression constraints.
- Harden account cloud-config loading so Settings cannot stay stuck on cloud readiness checks.
- Keep `README.md` untouched and unstaged.

Completed:
- Added elective placement helpers in `js/import.js`.
  - `autoPlanFreeElectivePreferredIndex()` prefers profile/free electives in sophomore-through-senior terms.
  - `autoPlanElectivePlacementSummary()` classifies elective placeholders as explore, build, or specialize.
  - Auto-generated plan analysis now returns `electivePlacement` for Settings, tests, and future exports.
- Updated `completeAutoGeneratedPlan()` so profile/free electives are placed with the new term preference instead of always starting at term 0.
- Added an `Elective placement` metric to the Settings Plan Reality gate.
  - It shows total elective slots and the explore/build/senior distribution.
  - It flags plans that keep elective placeholders entirely in first-year exploration terms.
- Added `accountFetchWithTimeout()` to bound `/api/config` cloud-readiness loading.
  - This prevents the Settings release checklist from staying on `Checking cloud config...` if the config endpoint stalls.
- Bumped cache tags:
  - `js/import.js?v=13`.
  - `js/settings.js?v=28`.
  - `js/account.js?v=13`.
- Extended tests:
  - Generated-plan fixtures now assert that profile electives remain labeled from interests and are not all front-loaded.
  - Larger elective sets must include senior-year placement.
  - `AUTO-PLAN-DIAGNOSTICS` now asserts the Plan Reality `Elective placement` metric.
  - Rendered generated-plan verifier now requires the `Elective placement` metric in every sampled browser preview.
  - Rendered verifiers now assert updated import/settings/account cache tags.

Verification:
- Ran `node --check js/import.js`.
- Ran `node --check js/settings.js`.
- Ran `node --check js/account.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed generated-plan fixtures with elective distribution output.
  - It continued to pass prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, recommendations, Browse, audit, onboarding, prior-credit, schedule timing, registration readiness, and seat-risk tests.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile Settings preview with `Elective placement` and full `12/12 live course records` ARTT metadata.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including elective placement coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts, Plan Reality and Elective placement assertions, and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass127-elective-placement-live`.
  - It randomly verified `AREC`, `STAT`, `PHSC`, `HLTH`, `BCHM`, and `NEUR` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 128

Focus: make elective placement actionable in generated-plan previews and harden live metadata loading so rendered previews recover from slow course sources without console noise.

Planned changes:
- Add an Elective Roadmap section to Settings auto-plan reviews.
- Show representative explore, build, and senior-focus elective/profile slots instead of only aggregate counts.
- Attach replacement actions to roadmap rows so students can immediately find profile-fit courses.
- Keep roadmap rows compact and non-overflowing on mobile.
- Harden UMD/PlanetTerp metadata fetches and the local/prod umd.io proxy against slow upstream responses.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `autoPlanElectiveRoadmapHtml()` and stage labels in `js/settings.js`.
  - Generated previews now show `Elective Roadmap`, profile/elective slot counts, explore/build/senior distribution, term labels, slot notes, and direct replacement buttons.
- Added `autoPlanElectiveRoadmapSamples()` in `js/import.js`.
  - The sample chooses representative explore, build, and senior-focus rows first, then fills remaining rows chronologically without duplicates.
- Added production CSS for the roadmap panel.
  - Rows use compact stage chips and mobile stacking so action buttons do not collide with labels.
- Hardened metadata loading.
  - UMD browser fetches now abort timed-out requests and JSON body reads.
  - PlanetTerp body reads now have a deadline.
  - Batch course metadata uses an outer per-course deadline plus a bounded UMD retry when both live sources miss.
  - The production `/api/umd` proxy now bounds upstream fetch/body work and returns controlled fallbacks.
  - The rendered generated-plan verifier proxy mirrors that timeout behavior, preventing slow local proxy calls from starving later course requests.
- Bumped cache tags:
  - `styles.css?v=97`.
  - `js/settings.js?v=29`.
  - `js/planetterp.js?v=4`.
  - `js/api.js?v=5`.
- Extended tests:
  - `AUTO-PLAN-DIAGNOSTICS` now asserts the Elective Roadmap, profile/elective slot wording, senior-focus sampling, and replacement actions.
  - Rendered generated-plan verifier now requires `Elective Roadmap` for elective-bearing previews.
  - Rendered verifiers assert the updated style/settings/PlanetTerp/API cache tags.

Verification:
- Ran `node --check js/settings.js`.
- Ran `node --check js/api.js`.
- Ran `node --check js/planetterp.js`.
- Ran `node --check js/import.js`.
- Ran `node --check api/umd.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-umd-proxy.js`.
  - It passed the offline umd.io proxy fixture with the bounded upstream helper.
- Ran `node scripts/test-generated-plans.js`.
  - It passed generated-plan fixtures with Elective Roadmap assertions.
  - It continued to pass prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, recommendations, Browse, audit, onboarding, prior-credit, schedule timing, registration readiness, and seat-risk tests.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile Settings preview with the Elective Roadmap and full `12/12 live course records` ARTT metadata.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ENCE --viewport=desktop --timeout-ms=120000`.
  - It verified the previously slow ENCE path at full `25/25 live course records` with a clean proxy-backed console.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including Elective Roadmap coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts, clean browser console output, Plan Reality, Elective placement, and Elective Roadmap assertions.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass128-elective-roadmap-live`.
  - It randomly verified `HLTH`, `AOSC`, `MARKETING`, `GEOL`, `ENST`, and `NEUR` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 129

Focus: make the Schedule tab useful across the whole four-year plan by adding a concrete term-by-term registration readiness map.

Planned changes:
- Add a whole-plan Schedule Readiness Map to the Schedule tab.
- Summarize each term's picked sections, loaded live-section evidence, posted section counts, blockers, and review status.
- Let students jump from a readiness-map term directly into that semester's schedule picker.
- Keep the map compact and non-overflowing on mobile.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `#schedule-readiness-map` to the Schedule tab below the current-term summary.
- Added readiness-map helpers in `js/schedule.js`.
  - The map derives each term from existing plan semesters, saved section selections, inferred/saved UMD terms, cached live sections, conflict detection, seat risk, timing warnings, and the existing registration-readiness gates.
  - It reports picked sections, loaded live-section evidence, total posted sections, and a concrete status such as `Needs sections`, `Conflicts`, `Seat risk`, `Review`, or `Ready`.
  - It avoids fetching every future semester on render; future terms only count live-section evidence that is already loaded or cached.
- Added click handling for map terms.
  - Selecting a term updates the Schedule semester picker and rerenders that term's section list.
- Added production CSS for the map.
  - Desktop uses a four-column scan layout.
  - Mobile collapses to one term per row with stable metrics and no overflow.
- Bumped cache tags:
  - `styles.css?v=98`.
  - `js/schedule.js?v=49`.
- Extended tests:
  - `SCHEDULE-READINESS` fixture now asserts readiness-map rows, picked counts, loaded counts, posted-section counts, and future-term missing section status.
  - Rendered mobile workflow verifier now checks the Readiness Map text, mobile overflow, and jump-to-term behavior.
  - Rendered verifiers assert the updated style and Schedule script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with readiness-map assertions.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, recommendations, Browse, audit, onboarding, prior-credit, schedule timing, registration readiness, and seat-risk tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with the new Readiness Map, jump-to-term behavior, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, exports, backup apply, seat refresh action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated global CSS cache tag.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the Schedule Readiness Map coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with readiness-map coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass129-readiness-map-live`.
  - It randomly verified `ASTR`, `FMSC`, `ENMA`, `AAST`, `AOSC`, and `CINE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 130

Focus: make the Schedule Readiness Map actionable by letting students load missing live-section evidence across schedule-ready terms.

Planned changes:
- Add a concrete command to load missing readiness-map section data.
- Target only terms missing loaded section evidence so the app does not overwrite already-loaded current-term section choices.
- Keep the action bounded, visible, and mobile-safe.
- Keep `README.md` untouched and unstaged.

Completed:
- Added a `Load map data` button to the Schedule Readiness Map header.
- Added `scheduleReadinessMapLoadTargets()` in `js/schedule.js`.
  - It identifies schedule-ready terms whose courses do not yet have cached section evidence.
  - It skips the active term once the active Schedule render has already loaded its sections.
- Added `loadScheduleReadinessMapData()`.
  - It guards against duplicate clicks.
  - It loads missing term evidence through the existing `scheduleFetchSectionsFor()` cache path.
  - It rerenders the active Schedule view after loading.
  - It reports success or failure through the existing status/toast surfaces.
- Updated map header styling so the status pill and load command wrap cleanly on desktop and mobile.
- Bumped cache tags:
  - `styles.css?v=99`.
  - `js/schedule.js?v=50`.
- Extended tests:
  - `SCHEDULE-READINESS` fixture now asserts that the map loader targets only terms missing section evidence.
  - Rendered mobile workflow verifier now checks the `Load map data` command and confirms the future term changes from `0/2 loaded` to `2/2 loaded`.
  - Rendered verifiers assert updated style and Schedule script cache tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with map-loader target assertions.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, recommendations, Browse, audit, onboarding, prior-credit, schedule timing, registration readiness, and seat-risk tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with Readiness Map rendering, map-data loading, jump-to-term behavior, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, exports, backup apply, seat refresh action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated global CSS cache tag.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the readiness-map loader coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with readiness-map loader coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass130-readiness-map-loader-live`.
  - It randomly verified `THET`, `HESP`, `BCHM`, `BIOE`, `PHIL`, and `ENFP` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 131

Focus: let students turn loaded Schedule Readiness Map evidence into concrete section picks across future terms.

Planned changes:
- Add a bounded Readiness Map action that fills missing section selections in loaded non-active terms.
- Preserve existing section choices while filling only the missing course picks.
- Keep the active Schedule term untouched so a student does not lose the context they are editing.
- Keep `README.md` untouched and unstaged.

Completed:
- Added an `Auto-pick loaded` button to the Schedule Readiness Map header.
- Added `scheduleReadinessMapPickTargets()` in `js/schedule.js`.
  - It finds loaded, non-active schedule-ready terms with courses that still lack selected sections.
  - It keeps the active term out of the bulk action.
- Added `autoPickScheduleReadinessMap()`.
  - It reuses the existing schedule candidate builder.
  - It pins and preserves already-selected sections before filling missing courses.
  - It writes one recent-change entry summarizing the map sections it filled.
  - It rerenders Schedule and Semesters after a successful bulk pick.
- Bumped the Schedule cache tag to `js/schedule.js?v=51`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts that loaded non-active terms become auto-pick targets.
  - The rendered advisor packet workflow loads Spring map data, runs `Auto-pick loaded`, verifies the selected Spring sections, and confirms the Spring card becomes ready.
  - Rendered workflow cache checks now expect the updated Schedule script tag.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with readiness-map auto-pick target assertions.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, recommendations, Browse, audit, onboarding, prior-credit, schedule timing, registration readiness, and seat-risk tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with Readiness Map loading, auto-pick loaded sections, jump-to-term behavior, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, exports, backup apply, seat refresh action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records`.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the readiness-map auto-pick coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with readiness-map auto-pick coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass131-readiness-map-autopick-live`.
  - It randomly verified `JOUR`, `FMSC`, `ASTR`, `CHEM`, `ENAE`, and `GEOL` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 132

Focus: make plan-wide Readiness Map auto-picks reversible so students can safely try future-term section filling.

Planned changes:
- Extend the Schedule undo model to support a batch of section changes across semesters.
- Register Readiness Map auto-picks as an undoable action.
- Verify both the user-visible mobile undo flow and the underlying restore semantics.
- Keep `README.md` untouched and unstaged.

Completed:
- Generalized `renderScheduleUndo()` in `js/schedule.js`.
  - Existing single-section swaps still render the current course-specific undo banner.
  - Readiness Map bulk picks now render a plan-wide undo banner even when the active term was not changed.
- Generalized `undoScheduleSectionChange()`.
  - It can now restore a batch of prior section states across terms.
  - It removes newly auto-filled picks when the previous state had no section.
  - It restores previous pinned picks when a prior section existed.
  - It records an `Undid Readiness Map auto-pick` recent-change entry.
- Updated `autoPickScheduleReadinessMap()`.
  - It records the exact future-term section changes it fills.
  - It registers a batch undo before rerendering Schedule.
- Added a canonical `AMST205` title override in `js/api.js`.
  - The live sample exposed a mismatch between generated AMST schedules and current app live metadata.
  - The override keeps AMST 205 aligned to `American Material Culture: The Study of People, Places, and Things`.
- Bumped cache tags:
  - `js/schedule.js?v=52`.
  - `js/api.js?v=6`.
- Extended tests:
  - Added `SCHEDULE-MAP-UNDO` to `scripts/test-generated-plans.js` for batch undo restore behavior.
  - Added `COURSE-CANONICAL-TITLES` to protect the AMST 205 title correction.
  - Extended the rendered advisor packet workflow to assert the bulk undo banner, undo the loaded Spring picks, and confirm the future term returns to `Needs sections`.
  - Rendered cache checks now expect the updated Schedule and API script tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check js/api.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `SCHEDULE-MAP-UNDO` fixture.
  - It passed the new `COURSE-CANONICAL-TITLES` fixture for AMST 205.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, recommendations, Browse, audit, onboarding, prior-credit, schedule timing, registration readiness, and seat-risk tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with Readiness Map loading, auto-pick loaded sections, bulk undo, jump-to-term behavior, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, exports, backup apply, seat refresh action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated API cache tag.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-majors AMST`.
  - It verified the AMST generated schedule after the AMST 205 canonical-title correction.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including readiness-map undo and canonical-title coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with readiness-map undo coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass132-readiness-map-undo-live`.
  - It randomly verified `STAT`, `AMST`, `PLSC`, `JOUR`, `ENCE`, and `GEOG` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 133

Focus: carry plan-wide Readiness Map evidence into advisor and registration exports so handoffs show every loaded term, not just the active Schedule term.

Planned changes:
- Add a shared plan-wide readiness summary for advisor packets and text exports.
- Thread Schedule Readiness Map rows through registration, schedule, and advisor output builders.
- Style the advisor/export readiness map for desktop and mobile without adding layout overflow.
- Keep `README.md` untouched and unstaged.

Completed:
- Added shared readiness-map export helpers in `js/schedule.js`.
  - `scheduleAdvisorReadinessMapSummary()` counts ready, warning, and blocker terms with courses.
  - `scheduleAdvisorReadinessMapHtml()` renders a compact `Plan Readiness Map` card for advisor packets.
  - `scheduleAdvisorReadinessMapText()` adds the same plan-wide evidence to copyable/exported text.
- Threaded `scheduleReadinessMapRows()` through the Schedule output cache, schedule text export, registration handoff text, advisor HTML, and advisor text.
- Added in-app and standalone advisor styles for the exported readiness-map card, including mobile one-column behavior.
- Bumped cache tags:
  - `styles.css?v=100`.
  - `js/schedule.js?v=53`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts that registration text, advisor text, advisor HTML, and rendered advisor documents include the plan-wide `Plan Readiness Map`.
  - The rendered mobile advisor packet workflow now waits for and asserts the plan-wide readiness summary in the Schedule output and advisor export.
  - Rendered cache checks now expect the updated stylesheet and Schedule script tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with plan-wide advisor/export readiness map assertions.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, canonical titles, schedule timing, readiness map undo, schedule chips, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with the plan-wide Readiness Map export, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply action, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records`.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the expanded plan-wide readiness export coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with the plan-wide readiness export.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass133-plan-readiness-export-live`.
  - It randomly verified `HESP`, `AAST`, `PHSC`, `SPAN`, `CINE`, and `EDUC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 134

Focus: make calendar downloads auditable before export so students can see event count, date range, and TBA omissions before trusting an `.ics` file.

Planned changes:
- Add a reusable calendar export readiness summary for picked sections.
- Surface event count, timed-pick coverage, term date range, and calendar notes in the Schedule output and advisor packet.
- Include the same calendar evidence in schedule, registration, and advisor text exports.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleCalendarExportSummary()` in `js/schedule.js`.
  - It reports the active term range, custom/inferred date note, ICS event count, timed picked-section coverage, and TBA/no-event picks.
  - It derives event counts from the same generated ICS content used by the calendar download.
- Added shared HTML and text renderers:
  - `renderScheduleCalendarExportHtml()` renders a `Calendar Export` readiness card in the Schedule output and advisor packet.
  - `scheduleCalendarExportText()` adds the same event/range/course evidence to copyable schedule text, registration lists, and advisor text.
- Threaded `calendarSummary` through `buildScheduleOutput()`, `buildScheduleOutputText()`, `buildScheduleRegistrationText()`, `scheduleAdvisorPacketHtml()`, and `scheduleAdvisorText()`.
- Added app and standalone advisor styles for the calendar export card, with mobile one-column behavior for course rows.
- Bumped cache tags:
  - `styles.css?v=101`.
  - `js/schedule.js?v=54`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts the calendar summary object, visible schedule card, registration text, advisor HTML/text, and exported advisor document.
  - The rendered mobile advisor packet workflow now waits for the `Calendar Export` card and asserts the cached summary, exported HTML, exported text, and no-overflow behavior.
  - Rendered cache checks now expect the updated stylesheet and Schedule script tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with calendar export readiness assertions.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, canonical titles, schedule timing, registration readiness, readiness map undo, schedule chips, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with calendar readiness, Readiness Map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including calendar export readiness coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with calendar readiness coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass134-calendar-readiness-live`.
  - It randomly verified `BCHM`, `CHEM`, `ASTR`, `ENMA`, `WMST`, and `AOSC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 135

Focus: make calendar export readiness cover the full planned term, not only the sections already picked.

Planned changes:
- Treat unpicked planned courses as calendar omissions before `.ics` export.
- Keep timed picked sections, TBA picked sections, and missing section picks visible in the same calendar evidence.
- Update rendered and text exports so students know exactly which planned courses will be absent from the downloaded calendar.
- Keep `README.md` untouched and unstaged.

Completed:
- Expanded `scheduleCalendarExportSummary()` in `js/schedule.js`.
  - It now accepts the full planned course list.
  - It reports `courseCount`, `missingCount`, and `omittedCount` in addition to picked/timed event counts.
  - It downgrades terms with missing current-term sections from `Calendar ready` to `Calendar incomplete`.
  - It lists missing courses as omitted rows until a real section is picked.
- Updated calendar export HTML and text.
  - The metrics now show timed planned-course coverage and omitted courses.
  - Missing section rows render with a danger state.
  - Schedule text, registration text, advisor text, and advisor HTML now name omitted courses such as `ENGL 101 Missing section`.
- Bumped cache tags:
  - `styles.css?v=102`.
  - `js/schedule.js?v=55`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts that an active term with one missing section reports `Calendar incomplete`, `2/3` timed planned-course coverage, and one omitted course.
  - The rendered mobile advisor packet workflow now asserts the stricter calendar omission summary in the visible UI, output cache, advisor text, and no-overflow checks.
  - Rendered cache checks now expect the updated stylesheet and Schedule script tags.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with full-term calendar omission assertions.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule chips, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with full-term calendar omission readiness, Readiness Map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including full-term calendar omission coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with calendar omission coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass135-calendar-omissions-live`.
  - It randomly verified `ENGL`, `ENCE`, `AOSC`, `EDUC`, `SOCY`, and `ENFP` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 136

Focus: make calendar omissions actionable and make partial calendar downloads explicit.

Planned changes:
- Add a direct action from the `Calendar Export` card to the omitted current-term course.
- Warn students when a downloaded calendar is partial because planned courses are omitted.
- Verify the action in rendered mobile workflow coverage, not only in static export strings.
- Keep `README.md` untouched and unstaged.

Completed:
- Added a `Review omitted courses` action to the calendar export card when `omittedCount > 0`.
- Added `handleScheduleCalendarExportAction()` in `js/schedule.js`.
  - It records `data-last-calendar-action` on the Schedule output panel.
  - It scrolls to the Schedule section picker.
  - It highlights the first omitted course with a `calendar-omission-focus` state.
  - It shows a direct toast telling the student to review omitted courses before relying on the calendar export.
- Updated `downloadScheduleCalendar()`.
  - Complete calendars still show the existing success message.
  - Partial calendars now download but warn how many planned courses are omitted.
- Added styles for calendar export action rows and omitted-course focus states, including mobile stacking and print hiding.
- Bumped cache tags:
  - `styles.css?v=103`.
  - `js/schedule.js?v=56`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts the calendar omission action appears in schedule output, advisor HTML, advisor text guidance, and exported advisor documents.
  - The rendered mobile advisor packet workflow now clicks `Review omitted courses`, verifies the section-list focus and omitted `ENGL 101` highlight, downloads the partial calendar, and asserts the partial-download warning toast.
  - Rendered workflow logs now name `calendar omission action` coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with calendar omission action markup and text guidance.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule chips, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with the calendar omission action, partial-calendar warning toast, full-term calendar omission readiness, Readiness Map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including calendar omission action coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with calendar omission action coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass136-calendar-omission-action-live`.
  - It randomly verified `STAT`, `ANSC`, `HESP`, `WMST`, `AREC`, and `AAST` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 137

Focus: make calendar omissions fixable from the Calendar Export card without forcing students to manually hunt for timed sections.

Planned changes:
- Add an `Auto-fill timed sections` action for omitted planned courses.
- Preserve existing section picks while filling only missing or TBA-only calendar omissions.
- Make the auto-fill action undoable and record it in Recent changes.
- Keep `README.md` untouched and unstaged.

Completed:
- Added an `Auto-fill timed sections` primary action beside `Review omitted courses` when the Calendar Export card has omissions.
- Added `autoFillScheduleCalendarOmissions()` in `js/schedule.js`.
  - It fetches current-term sections for omitted planned courses.
  - It keeps existing timed section picks.
  - It chooses conflict-free timed sections that respect blocked meeting preferences.
  - It skips courses when no conflict-free timed section is available.
  - It refreshes the schedule, records a Recent changes entry, and shows success/partial-success toasts.
- Generalized schedule undo handling for batched section changes while preserving the existing Readiness Map undo labels and toasts.
- Added nested calendar action styling in app CSS and standalone schedule CSS.
- Bumped cache tags:
  - `styles.css?v=104`.
  - `js/schedule.js?v=57`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts both calendar omission actions in schedule output, advisor HTML, and exported advisor documents.
  - The rendered mobile advisor packet workflow now clicks `Auto-fill timed sections`, verifies `ENGL 101` receives a timed section, confirms the calendar becomes ready, checks the undo entry, undoes the fill, and then verifies the existing review/download omission warning path.
  - Rendered workflow logs now name `calendar omission auto-fill` coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with both calendar omission actions.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule chips, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with calendar omission auto-fill, undo, calendar omission review, partial-calendar warning toast, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including calendar omission auto-fill coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with calendar omission auto-fill coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass137-calendar-auto-fill-live`.
  - It randomly verified `HESP`, `FMSC`, `EDUC`, `ARTT`, `ARCH`, and `MARKETING` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 138

Focus: make major Schedule actions reversible so students can safely try auto-pick, alternate schedules, manual section swaps, and clear-picks without losing work.

Planned changes:
- Add undo coverage for Auto-pick no-conflict sections.
- Add undo coverage for applying alternate schedules.
- Add undo coverage for Clear picks and manual section select changes.
- Verify the destructive clear-picks path in rendered mobile workflow coverage.
- Keep `README.md` untouched and unstaged.

Completed:
- Added shared section-change helpers in `js/schedule.js`.
  - `scheduleSelectionKey()` compares saved section selections without depending on object identity.
  - `scheduleSectionUndoChange()` captures previous section payloads and pinned state for batch restore.
- Made Auto-pick no-conflict sections undoable.
  - It now records only actual changed picks.
  - Undo restores replaced sections and clears courses that were newly filled by the auto-pick.
- Made alternate schedule apply undoable.
  - It restores previous section choices.
  - It also restores any non-option course picks that were removed when the alternate was applied.
- Made Clear picks undoable.
  - It records all cleared section picks for the active term.
  - Undo restores cleared picks, including pinned state.
- Added single-section undo for manual section dropdown changes.
- Bumped the Schedule cache tag:
  - `js/schedule.js?v=58`.
- Extended tests:
  - Added `SCHEDULE-ACTION-UNDO` to generated-plan regression fixtures for clear-picks undo, auto-pick undo, and alternate-apply undo.
  - The rendered mobile advisor packet workflow now clicks Clear picks, verifies the destructive state and undo banner, undoes it, and continues through the existing calendar omission flow.
  - Rendered workflow logs now name `clear-picks undo` coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `SCHEDULE-ACTION-UNDO` fixture.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule chips, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with calendar omission auto-fill, clear-picks undo, calendar omission review, partial-calendar warning toast, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, backup apply, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records`.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including schedule action undo coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with clear-picks undo coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass138-schedule-action-undo-live`.
  - It randomly verified `GEOG`, `SCM`, `AOSC`, `CHEM`, `THET`, and `EDUC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 139

Focus: turn backup-section evidence into a one-click registration safety action.

Planned changes:
- Add an `Apply ready backups` action to the Backup Plan card when safe backup sections exist.
- Apply all ready low-seat backups for the active term while preserving conflict checks and pinned state.
- Make the bulk backup action undoable.
- Verify the action in generated fixtures and rendered mobile workflow coverage.
- Keep `README.md` untouched and unstaged.

Completed:
- Added an action row to `renderScheduleRegistrationBackupsHtml()`.
  - The Backup Plan card now shows `Apply ready backups` when at least one safe backup section is ready.
  - The same action markup is included in advisor packet HTML exports.
- Added `applyScheduleReadyBackups()` and `handleScheduleBackupAction()` in `js/schedule.js`.
  - It fetches current-term posted sections through the existing Schedule cache/fetch path.
  - It recomputes backup candidates after each applied backup so multiple backup swaps remain conflict-safe.
  - It preserves pinned state through `setSelectedSection()` and restores prior pinned state through batch undo.
  - It records a Recent changes entry and toast for the bulk backup action.
- Added app and standalone advisor CSS for the Backup Plan action row.
- Bumped cache tags:
  - `styles.css?v=105`.
  - `js/schedule.js?v=59`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts the Backup Plan card and exported advisor document include `data-backup-action="apply-ready"`.
  - Added `SCHEDULE-READY-BACKUPS` to generated-plan regression fixtures for applying two ready backups and undoing them back to the original risky picks.
  - The rendered mobile advisor packet workflow now clicks `Apply ready backups`, verifies `MATH 140` moves to the safer `0301` section, checks the undo banner, and confirms the old low-seat warning clears.
  - Rendered workflow logs now name `ready backup apply action` coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `SCHEDULE-READY-BACKUPS` fixture.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with ready backup apply, calendar omission auto-fill, clear-picks undo, calendar omission review, partial-calendar warning toast, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including ready backup apply coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with ready backup apply coverage.
  - It skipped live PlanetTerp verification with the expected opt-in message.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass139-ready-backup-apply-live`.
  - It randomly verified `ENFP`, `WMST`, `NFSC`, `MUSC`, `ENST`, and `ENMA` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 140

Focus: add a final registration launch checklist that tells students whether the full schedule packet is actually ready before they open Testudo.

Planned changes:
- Summarize registration readiness, Testudo entry queue, seat freshness, backup sections, calendar export, and registration appointment in one final launch card.
- Include the same checklist in schedule output text, registration-list exports, advisor packet HTML, and advisor text exports.
- Keep no-course terms from falsely failing the Testudo queue check.
- Verify the checklist in generated fixtures, rendered mobile workflows, release checks, and live PlanetTerp validation.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleFinalRegistrationChecklist()` in `js/schedule.js`.
  - It reports `Ready for Testudo`, `Final review`, or `Fix before Testudo`.
  - It counts ready launch checks out of 6 and carries individual levels for readiness, Testudo queue, seat freshness, backups, calendar, and appointment.
  - It treats terms with no registration-ready courses as not needing Testudo queue entries.
- Added checklist rendering and text export helpers.
  - The Schedule output now shows a `Final Registration Checklist` card after Registration Readiness.
  - Schedule text exports include final checklist rows.
  - Registration-list text exports include the same final checklist before backup and readiness-map handoffs.
  - Advisor packet HTML and advisor text exports include the checklist.
- Added app CSS and standalone advisor CSS for the final checklist card, including mobile one-column stacking.
- Bumped cache tags:
  - `styles.css?v=106`.
  - `js/schedule.js?v=60`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts the final checklist object, `1/6` launch score, backup warning, schedule text, registration-list text, advisor HTML, advisor text, and exported advisor document markup.
  - The rendered mobile advisor packet workflow now waits for the final checklist, verifies `scheduleOutputCache.finalChecklist`, checks advisor exports, checks rendered output text, and includes the checklist in mobile no-overflow snapshots.
  - Rendered workflow logs now name `final registration checklist` coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with final checklist coverage.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule ready backups, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with the final registration checklist, ready backup apply, calendar omission auto-fill, clear-picks undo, calendar omission review, partial-calendar warning toast, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js --live --live-seed=pass140-final-registration-checklist-live`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including final checklist coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with final checklist coverage.
  - It live-verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp with every generated required course reporting a matching live title/credit pair.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass140-final-registration-checklist-random-live`.
  - It randomly verified `AMST`, `STAT`, `CINE`, `ACCOUNTING`, `ENMA`, and `ARTT` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 141

Focus: add a workload reality check so students and advisors can see whether picked sections create a sustainable weekly class load, not just a conflict-free grid.

Planned changes:
- Derive workload from real picked UMD sections, meeting minutes, current-term credits, active days, TBA picks, and missing section evidence.
- Render the workload summary in the live Schedule tab.
- Include the same workload evidence in schedule output, registration-list text, advisor packet HTML, and advisor text exports.
- Verify generated fixtures, rendered mobile output, release checks, and live PlanetTerp samples.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleWorkloadBalance()` in `js/schedule.js`.
  - It computes picked credits vs planned credits, weekly in-class time, active days, per-day course load, TBA picked sections, and missing section count from selected section meetings.
  - It labels the term as `Balanced workload`, `Review workload`, `Heavy week`, `Pick sections`, or `No workload`.
  - It surfaces concrete workload notes such as missing sections, compressed active days, heavy in-class days, and the busiest weekday.
- Added workload render/text helpers.
  - The Schedule tab now shows a `Workload Balance` card beside the timing/readiness flow.
  - Schedule output HTML includes the workload card.
  - Schedule text exports include workload rows.
  - Registration-list text exports include workload evidence before backup and readiness-map handoffs.
  - Advisor packet HTML and advisor text exports include the workload card/metrics.
- Added app CSS and standalone advisor CSS for the workload card, including mobile one-column day rows and two-column metric rows.
- Bumped cache tags:
  - `styles.css?v=107`.
  - `js/schedule.js?v=61`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts workload cache data, `8/11` scheduled credits, `3 hr 45 min` weekly class time, missing-section evidence, schedule output HTML/text, registration-list text, advisor HTML/text, and exported advisor document markup.
  - The rendered mobile advisor packet workflow now waits for the workload card, verifies `scheduleOutputCache.workloadBalance`, checks registration/advisor exports, checks rendered packet text, and includes workload balance in no-overflow snapshots.
  - Rendered workflow logs now name `workload balance` coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with workload balance coverage.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule ready backups, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with workload balance, final registration checklist, ready backup apply, calendar omission auto-fill, clear-picks undo, calendar omission review, partial-calendar warning toast, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js --live --live-seed=pass141-workload-balance-live`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including workload balance coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with workload balance coverage.
  - It live-verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp with every generated required course reporting a matching live title/credit pair.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass141-workload-balance-random-live`.
  - It randomly verified `ENMA`, `SPAN`, `AOSC`, `ENST`, `SOCY`, and `NEUR` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 142

Focus: add registration eligibility awareness so students can see major, college, reserved-seat, and permission restrictions before relying on a section as Testudo-ready.

Planned changes:
- Preserve restriction-like section metadata when students save picked sections.
- Extract eligibility/permission notes from posted section fields without inventing warnings when upstream UMD section data does not include those fields.
- Add eligibility to Schedule cards, registration readiness, Testudo entry order/queue, schedule exports, registration-list exports, advisor packets, and advisor text.
- Verify focused fixtures, rendered browser workflows, release checks, and deterministic plus random live PlanetTerp samples.
- Keep `README.md` untouched and unstaged.

Completed:
- Added shared section eligibility helpers in `js/schedule.js`.
  - They normalize restriction, permission, registration, enrollment, note, and section-info fields from strings, arrays, and small objects.
  - They ignore empty and explicit no-restriction text, and boolean `false` flags do not become warnings.
  - Saved section picks now retain the eligibility-related fields needed after reloads, undo, pinning, exports, and advisor packets.
- Added eligibility visibility throughout the Schedule workflow.
  - Picked section cards now show a `Check eligibility` / `Review eligibility` row when a section carries restriction metadata.
  - Schedule chips include eligibility context in their tooltip and state class.
  - Registration readiness now has a first-class `Eligibility` gate, separate from seats, timing, and preferences.
  - Eligibility warnings no longer double-count inside the generic preferences gate.
  - Recommended fixes and quick actions now call out Testudo eligibility, permission, or less-restricted section review.
- Added eligibility to registration handoff surfaces.
  - Enrollment order raises restricted sections in priority and labels them `Eligibility first` or `Review eligibility` when appropriate.
  - Testudo entry queue marks restricted sections as blocked/review until eligibility is confirmed.
  - Schedule output text, registration-list text, advisor HTML/text, advisor document HTML, and course tables include eligibility notes beside exact section IDs.
- Updated CSS.
  - Added section eligibility row styling.
  - Changed readiness grids from five cramped columns to three desktop columns, while preserving two-column mobile behavior.
- Bumped cache tags:
  - `styles.css?v=108`.
  - `js/schedule.js?v=62`.
- Extended tests:
  - `SCHEDULE-READINESS` now fixtures a CMSC section restricted to Computer Science majors or department permission.
  - The fixture asserts the `eligibility:danger` readiness gate, eligibility fix guidance, Testudo handoff blocking, registration-list text, schedule output, advisor HTML/text, and exported advisor document markup.
  - The rendered mobile advisor packet workflow now waits for the eligibility gate and section-card eligibility row, verifies restricted-section handoff cache data, and checks registration/advisor exports and rendered packet text.
  - Rendered workflow logs now name `eligibility gate` coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with `eligibility:danger` coverage.
  - It continued to pass generated-plan fixtures, prerequisite, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule seat-risk, schedule ready backups, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with eligibility gate, workload balance, final registration checklist, ready backup apply, calendar omission auto-fill, clear-picks undo, calendar omission review, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js --live --live-seed=pass142-registration-eligibility-live`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including eligibility gate coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with eligibility gate coverage.
  - It live-verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp with every generated required course reporting a matching live title/credit pair.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass142-registration-eligibility-random-live`.
  - It randomly verified `HLTH`, `GEOG`, `ACCOUNTING`, `ASTR`, `HESP`, and `ANSC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 143

Focus: add prerequisite readiness to real registration handoff so a section with seats, no conflicts, and valid eligibility still cannot be treated as Testudo-ready when the course prerequisite is missing or only pending.

Planned changes:
- Reuse the existing prerequisite model instead of adding a separate parser.
- Add a first-class `Prereqs` registration readiness gate.
- Carry prerequisite blockers into enrollment order, Testudo entry queue, schedule text, registration-list text, and advisor packet exports.
- Keep prior-term/in-progress prerequisites as review items rather than silently treating them as complete.
- Verify focused fixtures, rendered browser workflows, release checks, and deterministic plus random live PlanetTerp samples.
- Keep `README.md` untouched and unstaged.

Completed:
- Added shared prerequisite readiness helpers in `js/schedule.js`.
  - `scheduleCoursePrereqStatus()` wraps the existing `prereqsMet()` result and classifies courses as ready, pending review, or blocked.
  - Missing prerequisites are danger-level blockers.
  - In-progress or earlier-planned prerequisites are warning-level pending items that must be confirmed before Testudo submission.
  - Failed, same-term, later-term, or absent prerequisites stay blocked.
- Added a first-class `Prereqs` gate to `scheduleRegistrationReadiness()`.
  - The gate appears beside sections, conflicts, seats, eligibility, timing, and preferences.
  - Recommended fixes now explicitly tell the student to mark completed credit or move locked courses after prerequisites.
  - Quick actions still guide students into section/advisor review without adding an unsupported new action handler.
- Added prerequisite status to registration handoff surfaces.
  - Enrollment order now scores prerequisite blockers and labels clean cases as `Prereq first` or `Confirm prereq`.
  - Testudo entry queue marks prerequisite-blocked rows as blocked and uses `Resolve prerequisites before entering`.
  - Schedule output text, registration-list text, advisor HTML/text, advisor document HTML, and the picked-section table include prerequisite notes.
- Fixed readiness-map status fallthrough.
  - Any danger gate beyond sections/conflicts/seats, including prerequisites and eligibility, now prevents a term from showing as `Ready`.
  - Future terms with earlier planned but unconfirmed prerequisites now show `Review` after auto-pick instead of overclaiming readiness.
- Bumped cache tags:
  - `styles.css?v=109`.
  - `js/schedule.js?v=63`.
- Extended tests:
  - `SCHEDULE-READINESS` now fixtures `MATH 140` with missing `MATH 115` prerequisite evidence.
  - The fixture asserts the `prereqs:danger` readiness gate, prerequisite fix guidance, Testudo queue prereq detail, registration-list text, schedule output, advisor HTML/text, and exported advisor document markup.
  - The rendered mobile advisor packet workflow now waits for the prerequisite gate, checks missing `MATH 115`, verifies prerequisite detail in exports/cache, and expects future auto-picked terms with pending prereqs to show `Review`.
  - Rendered workflow logs now name `prerequisite gate` coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with `prereqs:danger` coverage.
  - It continued to pass generated-plan fixtures, prerequisite chain, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule seat-risk, schedule ready backups, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with prerequisite gate, eligibility gate, workload balance, final registration checklist, ready backup apply, calendar omission auto-fill, clear-picks undo, calendar omission review, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js --live --live-seed=pass143-prereq-readiness-live`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including prerequisite gate coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with prerequisite gate coverage.
  - It live-verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp with every generated required course reporting a matching live title/credit pair.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass143-prereq-readiness-random-live`.
  - It randomly verified `WMST`, `PLSC`, `THET`, `GEOG`, `ARTT`, and `ENCH` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 144

Focus: add corequisite readiness to registration handoff so a course cannot look Testudo-ready when its required co-req is missing, unpicked, only pending, or planned in the wrong term.

Planned changes:
- Reuse existing `coreqs` course data rather than introducing a separate parser.
- Add a first-class `Coreqs` registration readiness gate beside prerequisites, eligibility, seats, conflicts, timing, and preferences.
- Treat already-completed or same-term picked corequisites as ready, pending/prior planned corequisites as review, and missing/same-term-unpicked/later corequisites as blockers.
- Carry corequisite blockers into enrollment order, Testudo entry queue, schedule text, registration-list text, advisor packet HTML/text, and picked-section tables.
- Verify focused fixtures, rendered browser workflows, release checks, and deterministic plus random live PlanetTerp samples.
- Keep `README.md` untouched and unstaged.

Completed:
- Added shared corequisite readiness helpers in `js/schedule.js`.
  - `scheduleCourseCoreqStatus()` classifies course `coreqs` as ready, warning, or danger using completed credit, in-progress credit, plan order, current-term course lists, and picked sections.
  - Same-term corequisites must have picked sections before the Testudo queue treats them as ready.
  - Prior planned or in-progress corequisites remain warning-level confirmation items.
  - Missing, failed, later-term, or same-term-unpicked corequisites become danger-level blockers.
- Added a first-class `Coreqs` gate to `scheduleRegistrationReadiness()`.
  - Recommended fixes now call out required corequisites separately from prerequisites.
  - Quick actions route students to section review when co-req pairs need same-term picks.
- Added corequisite status to registration handoff surfaces.
  - Enrollment order now scores co-req blockers and labels them `Coreq first` or `Confirm coreq` when they are the highest-priority issue.
  - Testudo entry queue marks corequisite-blocked rows as blocked and includes `Coreqs:` detail lines in HTML/text.
  - Schedule output text, registration-list text, advisor HTML/text, advisor document HTML, and the picked-section table now include corequisite notes.
- Bumped cache tags:
  - `styles.css?v=110`.
  - `js/schedule.js?v=64`.
- Extended tests:
  - `SCHEDULE-READINESS` now fixtures `CMSC 131` with missing `CMSC 100` corequisite evidence.
  - The fixture asserts the `coreqs:danger` readiness gate, co-req fix guidance, Testudo queue co-req detail, schedule text, registration-list text, advisor HTML/text, and exported advisor document markup.
  - The rendered mobile advisor packet workflow now waits for the `Coreqs` gate, checks missing `CMSC 100`, verifies co-req detail in exports/cache, and logs corequisite gate coverage.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with `coreqs:danger` coverage.
  - It continued to pass generated-plan fixtures, prerequisite chain, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule seat-risk, schedule ready backups, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with prerequisite gate, corequisite gate, eligibility gate, workload balance, final registration checklist, ready backup apply, calendar omission auto-fill, clear-picks undo, calendar omission review, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js --live --live-seed=pass144-coreq-readiness-live`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including corequisite gate coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with corequisite gate coverage.
  - It live-verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp with every generated required course reporting a matching live title/credit pair.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass144-coreq-readiness-random-live`.
  - It randomly verified `ENAE`, `IS`, `PHIL`, `SPAN`, `HIST`, and `AOSC` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.
- After final template/helper cleanup, reran final-state checks:
  - `node --check js/schedule.js`.
  - `node scripts/test-generated-plans.js`.
  - `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.

## 2026-07-01 Pass 145

Focus: add UMD credit-load readiness so registration exports warn when a term is below full-time, above pre-class credit limits, or above posted fall/spring, summer, or winter maximums.

Official policy references checked:
- UMD Registrar Enrollment Status: fall/spring undergraduate full-time status is 12+ credits; falling below 12 can affect aid, scholarships, and other services.
- UMD Undergraduate Catalog Registration: undergraduates need Advising College approval to exceed fall/spring 20 credits, fall/spring 16 credits before the first day of classes, 8 credits per summer session, or 4 credits in winter.

Planned changes:
- Add credit-load policy helpers tied to the active posted UMD term.
- Add a first-class `Credits` gate to registration readiness.
- Feed credit-load status into recommended fixes, quick actions, final checklist, registration-list text, schedule output, advisor text, and advisor packet exports.
- Keep Smart next picks actionable when a single safe recommended section is below full-time by itself, while still surfacing overload and other real readiness blockers.
- Verify focused fixtures, rendered browser workflows, release checks, and deterministic plus random live PlanetTerp samples.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleTermCreditPolicy()` and `scheduleCreditLoadStatus()` in `js/schedule.js`.
  - Fall/spring terms check 12-credit full-time status, 16-credit pre-class overload review, and 20-credit maximums.
  - Summer and winter terms check posted per-session/session caps.
  - The status records picked credits versus planned credits, missing-section credits, UMD policy detail, and a concrete fix.
- Added a first-class `Credits` registration readiness gate.
  - The gate appears next to sections, prerequisites, corequisites, conflicts, seats, eligibility, timing, and preferences.
  - Recommended fixes include credit-load guidance for below-full-time or overload terms.
  - Quick actions route students into section review when credits need adjustment.
- Added credit load to final Testudo launch checks.
  - The final checklist now has 7 launch checks and includes a `Credit load` row.
  - Registration-list final instructions now explicitly tell students to confirm credit load before Testudo submission.
- Adjusted Smart next-pick readiness impact in `js/recommendations.js`.
  - A single safe section pick can still show `Registration ready` when the only warning is that the whole term remains below full-time until more courses are added.
  - Other credit warnings, overloads, section blockers, conflicts, seats, prerequisites, corequisites, and eligibility still affect the recommendation impact normally.
- Bumped cache tags:
  - `styles.css?v=111`.
  - `js/schedule.js?v=65`.
  - `js/recommendations.js?v=15`.
- Extended tests:
  - `SCHEDULE-READINESS` now asserts `credits:warn`, `8/11 cr`, 12-credit full-time copy, credit-load fixes, the 7-item final checklist, and credit-load rows in schedule/advisor/registration text.
  - Rendered mobile workflow coverage now waits for the credit-load gate and asserts the final checklist cache includes a credit-load warning.
  - Recommendation fixture continues to assert that a complete safe Smart next pick is actionable even when full-term load is not yet complete.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check js/recommendations.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with `credits:warn` coverage.
  - It continued to pass generated-plan fixtures, prerequisite chain, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule seat-risk, schedule ready backups, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with credit-load gate, prerequisite gate, corequisite gate, eligibility gate, workload balance, final registration checklist, ready backup apply, calendar omission auto-fill, clear-picks undo, calendar omission review, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, low-seat backup warning, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js --live --live-seed=pass145-credit-load-readiness-live`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including credit-load gate coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with credit-load gate coverage.
  - It live-verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp with every generated required course reporting a matching live title/credit pair.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass145-credit-load-readiness-random-live`.
  - It randomly verified `AAST`, `WMST`, `ARTH`, `ARCH`, `AOSC`, and `GEOG` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-01 Pass 146

Focus: add explicit waitlist strategy to registration handoff so a picked closed or waitlisted section produces a concrete backup/alternate plan instead of being buried inside generic seat-risk wording.

Planned changes:
- Reuse posted section `open_seats`, `waitlist`, and existing backup-section evidence.
- Add a structured waitlist strategy model that distinguishes waitlisted-with-backup, waitlisted-without-backup, and open-but-waitlist-pressure cases.
- Surface the strategy in the on-screen schedule packet, final registration checklist, registration-list export, advisor text, exported advisor HTML, and output cache.
- Keep the existing ready-backup apply flow as the actionable fix for waitlisted sections with safer backups.
- Verify focused fixtures, rendered browser workflows, release checks, and deterministic plus random live PlanetTerp samples.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `scheduleWaitlistStrategy()`, `renderScheduleWaitlistStrategyHtml()`, and `scheduleWaitlistStrategyText()` in `js/schedule.js`.
  - Closed picked sections with posted waitlists now show the waitlisted count, selected section, backup section ID/label, backup seat detail, and a specific action.
  - Waitlisted sections without a ready backup escalate to danger-level alternate-course guidance.
  - Open sections with waitlist pressure remain review-level and still recommend early entry plus backup monitoring.
- Added waitlist strategy to final Testudo launch checks.
  - The final checklist now has 8 launch checks and includes a `Waitlist strategy` row.
  - Waitlist strategy is also included in schedule text, registration-list text, advisor text, and exported advisor HTML.
- Added a visible `Waitlist Strategy` card to the schedule/advisor output.
  - The card renders in the live app and standalone advisor-packet document.
  - Added responsive styling in `styles.css` and standalone packet CSS.
- Bumped cache tags:
  - `styles.css?v=112`.
  - `js/schedule.js?v=66`.
- Extended tests:
  - `SCHEDULE-READINESS` now fixtures `MATH 140` as `0 open · 4 waitlisted` with a ready `MATH140-0301` backup.
  - The fixture asserts waitlist strategy cache data, waitlist backup handoff text, the 8-item final checklist, schedule/advisor/registration text, and exported advisor markup.
  - Rendered mobile workflow coverage now waits for the `Waitlist Strategy` card, checks `4 waitlisted`, verifies the strategy in the output cache, registration export, advisor text, advisor HTML, mobile snapshot, and confirms ready-backup apply clears the prior waitlist warning.

Verification:
- Ran `node --check js/schedule.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node --check scripts/verify-rendered-workflows.js`.
- Ran `node --check scripts/verify-rendered-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded `SCHEDULE-READINESS` fixture with waitlist strategy coverage.
  - It continued to pass generated-plan fixtures, prerequisite chain, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule seat-risk, schedule ready backups, recommendations, planner questions/checklist, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms 120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with waitlist strategy, waitlist backup warning, credit-load gate, prerequisite gate, corequisite gate, eligibility gate, workload balance, final registration checklist, ready backup apply, calendar omission auto-fill, clear-picks undo, calendar omission review, readiness map, blocker view, registration readiness, registration appointment, seat freshness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, seat refresh action, export action, and no overflow.
- Ran `node scripts/verify-rendered-generated-plans.js --major=ARTT --viewport=mobile --timeout-ms=120000`.
  - It verified the rendered mobile generated-plan preview at full `12/12 live course records` with the updated cache tags.
- Ran `node scripts/run-release-checks.js --live --live-seed=pass146-waitlist-strategy-live`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including waitlist strategy coverage.
  - It passed 12 rendered generated-plan viewport runs with full live metadata counts and clean browser console output.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows with waitlist strategy coverage.
  - It live-verified `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` against PlanetTerp with every generated required course reporting a matching live title/credit pair.
- Ran `node scripts/run-release-checks.js --skip-syntax --skip-proxy --skip-generated --skip-rendered --skip-workflows --live-count 6 --live-seed pass146-waitlist-strategy-random-live`.
  - It randomly verified `EDUC`, `SPAN`, `CHEM`, `ENFP`, `SOCY`, and `SCM` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.

## 2026-07-02 Pass 147

Focus: bring full Schedule registration readiness into the Planner/Advisor surfaces so the next open term shows the same registration blockers before a student opens the Schedule tab.

Planned changes:
- Reuse the existing Schedule readiness engine from Timeline instead of duplicating separate readiness rules.
- Add a next-term registration-readiness card to the planner checklist with gate summaries and an Open Schedule action.
- Add a matching advisor question when the readiness engine finds blockers or review items.
- Keep existing timing, prerequisite, seat-backup, catalog-year, and GenEd planner actions intact.
- Bump the `timeline.js` cache key and extend focused fixtures for the new planner/advisor readiness handoff.
- Verify focused fixtures, rendered browser workflows, release checks, and seeded random live PlanetTerp samples.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `plannerRegistrationReadinessContext()` in `js/timeline.js`.
  - It gathers next-term UMD-coded open courses, selected sections, saved schedule preferences, conflicts, warnings, and unscheduled courses.
  - It calls `scheduleRegistrationReadiness()` directly so Timeline uses the same sections, credits, prereqs, coreqs, conflicts, seats, eligibility, timing, and preferences gates as Schedule.
- Added planner helper copy for readiness bodies and gate summaries.
  - Checklist cards now show labels like `Fix before registration` with the first recommended fix.
  - Metadata summarizes flagged gates such as `Credits warn`, `Prereqs danger`, and `Seats warn`.
- Added a registration-readiness checklist card for the next open planner term.
  - The card keeps an `Open Schedule` action and appears alongside existing load, prerequisite, timing, seat-risk, catalog-year, and GenEd items.
  - The checklist limit increased from 7 to 8 so the new readiness card does not crowd out existing high-value actions.
- Added a registration-readiness advisor question.
  - When readiness is not clear, the advisor questions now ask which registration issue should be resolved first before the registration appointment.
  - The question carries the same gate summary and `Open Schedule` action.
- Updated planner headings to include readiness as a source of checklist actions and advisor questions.
- Bumped `index.html` from `js/timeline.js?v=19` to `js/timeline.js?v=20`.
- Extended `scripts/test-generated-plans.js`.
  - `PLANNER-CHECKLIST` now asserts the full registration-readiness status, readiness detail, and flagged gate summary.
  - `PLANNER-QUESTIONS` now asserts the advisor readiness question and flagged gate summary.

Verification:
- Ran `node scripts/test-generated-plans.js`.
  - It passed the expanded planner checklist fixture with 8 items and readiness gate coverage.
  - It passed the expanded planner advisor-questions fixture with 8 questions and readiness gate coverage.
  - It continued to pass generated-plan fixtures, prerequisite chain, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule seat-risk, schedule ready backups, recommendations, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms=120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with readiness map, blocker view, registration readiness, credit-load gate, prerequisite gate, corequisite gate, eligibility gate, final registration checklist, workload balance, registration appointment, seat freshness, waitlist strategy, calendar readiness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, waitlist backup warning, ready backup apply action, seat refresh action, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the new planner readiness coverage.
  - It passed 12 rendered generated-plan viewport runs for `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` across desktop and mobile.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - Live verification was skipped by the release runner as expected because no live flag was provided.
- Ran `node scripts/verify-random-schedules.js --keep-going --count=6 --seed=pass147-planner-readiness`.
  - It randomly verified `EDUC`, `WMST`, `ENFP`, `MARKETING`, `JOUR`, and `KNES` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.
- Ran `git diff --check`.
  - It reported no whitespace errors.

## 2026-07-02 Pass 148

Focus: make planner term availability seat-aware so a course with posted sections but no open seats is treated as a registration risk instead of a safe placement.

Planned changes:
- Reuse live UMD section evidence already loaded by the planner availability checker.
- Distinguish posted-section count from actual open-seat availability.
- Warn or escalate when posted sections are closed, waitlisted, or already tight.
- Let the planner suggest a later term when that term has stronger posted/open-seat evidence.
- Bump the `timeline.js` cache key and add a focused fixture for closed posted sections.
- Verify focused fixtures, rendered browser workflows, release checks, and seeded random live PlanetTerp samples.
- Keep `README.md` untouched and unstaged.

Completed:
- Added `plannerFetchSections()` and `plannerAvailabilitySeatProfile()` in `js/timeline.js`.
  - Availability rows now calculate total open seats, open-section count, waitlist total, closed sections, filling sections, TBA sections, and best open-seat count.
  - Posted terms with all sections closed now become `danger`.
  - Posted terms with very low seats, waitlists, filling sections, or TBA seat counts become `warn`.
- Updated planner availability scoring.
  - A posted-but-closed term no longer outranks a future term with open seats.
  - Destination suggestions include seat evidence such as `24 open seats`.
- Updated planner availability copy.
  - Rows now render a seat snapshot instead of only saying a course has posted sections.
  - Closed posted sections get a title like `has posted sections but no open seats`.
- Bumped `index.html` from `js/timeline.js?v=20` to `js/timeline.js?v=21`.
- Extended `scripts/test-generated-plans.js`.
  - Added `PLANNER-AVAILABILITY-SEATS`.
  - The fixture stubs live UMD section data where `CMSC 132` has two Fall 2026 sections, both with `0 open` and `15` total waitlisted students.
  - The fixture verifies danger status, seat snapshot text, risk stats, and a Spring 2027 move suggestion with `24 open seats`.

Verification:
- Ran `node --check js/timeline.js`.
- Ran `node --check scripts/test-generated-plans.js`.
- Ran `node scripts/test-generated-plans.js`.
  - It passed the new `PLANNER-AVAILABILITY-SEATS` fixture.
  - It continued to pass generated-plan fixtures, prerequisite chain, auto-plan diagnostics, all generated requirement groups, catalog-year targeting, account/share, account setup, release JSON, canonical titles, schedule timing, registration readiness, calendar export readiness, readiness map undo, schedule action undo, schedule chips, schedule seat-risk, schedule ready backups, recommendations, planner checklist, planner questions, Browse, audit, onboarding, and prior-credit tests.
- Ran `node scripts/verify-rendered-workflows.js --timeout-ms=120000`.
  - It passed mobile onboarding.
  - It passed mobile Browse replacement.
  - It passed mobile Recommendations section pick.
  - It passed mobile Account setup.
  - It passed mobile advisor packet workflow with readiness map, blocker view, registration readiness, credit-load gate, prerequisite gate, corequisite gate, eligibility gate, final registration checklist, workload balance, registration appointment, seat freshness, waitlist strategy, calendar readiness, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, waitlist backup warning, ready backup apply action, seat refresh action, export action, and no overflow.
- Ran `node scripts/run-release-checks.js`.
  - It syntax-checked 43 JavaScript files.
  - It passed the offline umd.io proxy fixture.
  - It passed generated-plan fixtures, including the planner availability seat-pressure fixture.
  - It passed 12 rendered generated-plan viewport runs for `PHYS`, `ARTT`, `PLSC`, `KNES`, `ENAE`, and `ENCE` across desktop and mobile.
  - It passed rendered mobile onboarding, Browse replacement, Recommendations section pick, Account setup, and advisor packet workflows.
  - Live verification was skipped by the release runner as expected because no live flag was provided.
- Ran `node scripts/verify-random-schedules.js --keep-going --count=6 --seed=pass148-availability-seats`.
  - It randomly verified `GEOL`, `THET`, `HLTH`, `MARKETING`, `ENMA`, and `ENAE` against PlanetTerp.
  - Every generated required course reported a matching live title/credit pair.
  - Every sampled generated major passed complete requirement-group checks and early lower / later upper / 400-level progression checks.
- Ran `git diff --check`.
  - It reported no whitespace errors.
