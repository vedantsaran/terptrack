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
