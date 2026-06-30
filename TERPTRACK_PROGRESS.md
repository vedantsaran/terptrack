# TerpTrack Progress Log

Goal name: TerpTrack Definitive UMD Planner

This file tracks each implementation pass toward making TerpTrack a polished, individualized UMD degree, course-finding, GenEd, recommendation, automatic planning, class timing, and weekly scheduling app.

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
