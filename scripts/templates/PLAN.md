# Template build plan (2026-09-17)

Keyword data: DataForSEO Labs, US, pulled 2026-09-17. Vol = monthly searches,
KD = difficulty. Every page: primary keyword first in `<title>`, formats in the
title, "Free" in title, H1 = the natural document name. Meta description ≤ 160
chars naming the formats and "No email required".

Sample story for every completed example: `STORY` + `SAMPLE_*` in
`kit/tokens.mjs` (Summit Mechanical Contractors, Denver mechanical sub, on the
Harbor Point Medical Office job for GC Brightline Builders; owner Harbor Point
Development LLC; contract $486,200; COs 001–003; pay app #3 for August 2026).

Existing slugs keep their historical `basename` (indexed download URLs).

## Billing & payment

### aia-g702-g703 — basename `pay-application-template-g702-g703-style`

Cluster: g703 3,600 · aia g702 1,600 · aia pay application 880 · g702 form 390 ·
aia g702 g703 forms 320 · pay application template 70 · aia g703 excel 40. GSC
queries hitting the page: "aia g702 g703 excel download free", "free aia g702
g703 fillable form pdf", "g702 application for payment".
Title: `Free G702 & G703 Style Pay Application Template — Excel + Fillable PDF`.
Formats: **xlsx** (primary; 3 sheets: Pay Application, Continuation Sheet, How to
Use), **pdf** (2 sections: portrait application page built with `H.compactHeader`

- `H.formCells` + a two-column G702-style lines block + certification/notary +
  certificate; landscape continuation sheet with the A–I column table), example.
  Rules: never print AIA/G702/G703 inside the documents; footer center text
  "Formatted to standard progress-billing conventions. Not an AIA document."
  Sample: pay app #3, `STORY.sov` lines with previous/this-period/stored values
  that foot; retainage 10%; CO-001/002 as CO lines.
  Preserve the existing page's FAQs (trademark answer) and add: how to calculate
  retainage, what goes in column F, how many applications, what "certificate"
  means, can I use Excel instead of the AIA form. Related: schedule-of-values,
  change-order, lien-waiver, construction-invoice. Feature: /features/pay-applications/
  (AIA billing software). Blog interlink: /blog/aia-pay-application-guide/.

### schedule-of-values — basename `schedule-of-values-template`

Cluster: schedule of values template 390 · sov template 70 · sov template excel 90
(+ head "schedule of values" 1,900 stays on the blog guide, link to it).
Title: `Free Schedule of Values Template (Excel + PDF)`.
Formats: **xlsx** (SOV sheet: item no., description, scheduled value, % of
contract, notes, tie-out check row that must be 0.00; plus a "Billing tracker"
sheet that carries previous / this period / stored / total / % / balance /
retainage per line — the continuation-sheet math; How to Use), **pdf** (portrait
SOV form with 22 blank rows + totals; sample = STORY.sov), example.
Related: aia-g702-g703, construction-estimate, change-order, construction-budget.
Feature: /features/pay-applications/. Blog: /blog/schedule-of-values-guide/.

### construction-invoice — basename `construction-invoice-template`

Cluster: contractor invoice template 1,900 · construction invoice template 1,000
· construction invoice template word 1,000 · free construction invoice template
170 · subcontractor invoice template 110 · progress invoice template 30.
Title: `Free Contractor Invoice Template — Excel, Word & PDF`. H1: "Contractor
Invoice Template". Formats: **xlsx** (Invoice sheet: bill-to/project/invoice
meta, line items qty × unit price, subtotal, taxable toggle + tax rate,
retainage held line, previous payments, balance due; hero amount due; How to
Use), **docx**, **pdf** (fillable, `H.hero` amount due), example.
Content must teach invoice vs. pay application (direct-to-owner vs. GC
progress billing), progress invoice, retainage on invoices, payment terms,
late fees. Related: aia-g702-g703, construction-quote, lien-waiver, tm-ticket.
Feature: /features/pay-applications/ (invoicing lives there). Blog: /blog/retainage-construction-guide/.

### lien-waiver — basename `lien-waiver-forms` (NEW)

Cluster: lien waiver form 2,900 · lien waiver template 320 · conditional lien
waiver template 170 · construction lien waiver template 140 · final lien waiver
template 110 · unconditional lien waiver template 110 · partial lien waiver
template 70 · notice of intent to lien template 50.
Title: `Free Lien Waiver Forms — Conditional & Unconditional (Word + Fillable PDF)`.
H1: "Lien Waiver Forms (4 types)". Formats: **pdf** (4 pages, one form per page:
conditional waiver on progress payment, unconditional waiver on progress
payment, conditional waiver on final payment, unconditional waiver on final
payment; each with claimant, customer, owner, project, through date, amount,
exceptions (disputed claims / retention / pending changes), signature +
notary-optional block), **docx** (same 4 forms), example (filled for pay app #3
progress payment). MUST say: 12 states have statutory forms (CA, TX, AZ, NV, UT,
GA, FL, MA, MI, MO, MS, WY) — use the state form there; this is a general form
for the rest; not legal advice. Related: aia-g702-g703, construction-invoice,
subcontractor-agreement, certificate-of-completion. Feature: /features/pay-applications/.
Blog: /blog/construction-lien-waivers-explained/ (link both ways — the agent adds
a callout in that post linking to the template).

## Estimates, bids & proposals

### construction-estimate — basename `construction-estimate-template`

Cluster: estimate template 2,400 · free estimate template 1,900 · construction
estimate template 1,000 · contractor estimate template 1,000 · job estimate
template 880 · construction estimate template excel 390 · free construction
estimate template 320 · construction work estimate template 210.
Title: `Free Construction Estimate Template — Excel + PDF (Contractor & Job Estimates)`.
Formats: **xlsx** (Estimate sheet: sections (rows with `X.sectionRow`) for
Materials / Labor / Equipment / Subcontractors, each line qty × unit cost with
labor hours × rate; section subtotals; overhead %, profit % (margin, not
markup — show the math), contingency %, tax on materials; grand total; a
"Markup vs Margin" sheet like the existing one; How to Use), **pdf** (portrait,
blank estimate form; sample = a priced mechanical rough-in estimate), example.
Related: construction-quote, construction-bid-proposal, schedule-of-values,
construction-budget. Feature: /features/construction-bidding/. Blog:
/blog/construction-markup-vs-margin/ (keep the existing link from the post).

### construction-bid-proposal — basename `construction-bid-proposal-template`

Cluster: construction proposal template 1,300 · construction proposal template
word 1,300 · bid proposal template 880 · construction bid template 590 ·
contractor proposal template 320 · construction bid proposal template 210 ·
bid template for contractors 210 · construction bid form 170.
Title: `Free Construction Bid Proposal Template (Word + PDF)`.
Formats: **docx** (primary), **pdf** (flow document: cover block, scope of
work, price + alternates table, inclusions / exclusions two columns, schedule,
payment terms, validity, acceptance signature), example. Related:
construction-estimate, construction-quote, scope-of-work, subcontractor-agreement.
Feature: /features/construction-bidding/. Blog: /blog/how-to-create-construction-bid/.

### construction-quote — basename `construction-quote-template` (NEW)

Cluster: contractor quote template 1,000 (KD31) · construction quote template
590 · construction quote template free 70 · quote forms for contractors 30.
Title: `Free Construction Quote Template — Excel, Word & PDF`. One-page
fixed-price quote: quote no., valid until, prepared for, job address, line
items (qty, unit, price, amount), optional items table, subtotal/tax/total,
terms (deposit, schedule, exclusions), acceptance signature. Formats: **xlsx**,
**docx**, **pdf**, example. Content: quote vs estimate vs proposal. Related:
construction-estimate, construction-bid-proposal, construction-invoice,
work-order. Feature: /features/construction-bidding/.

### bid-tabulation — basename `bid-tabulation-template` (NEW)

Cluster: bid tabulation template 90 · bid tab template 90 · bid comparison
template 70 ("free bid leveling template" shows in GSC).
Title: `Free Bid Tabulation Template — Compare & Level Sub and Supplier Bids (Excel)`.
Formats: **xlsx** (landscape: scope items down the rows, up to 5 bidders across,
included/excluded/plug per cell, leveled totals, low bidder highlight via
conditional format, notes), **pdf** (landscape blank), example. Related:
construction-estimate, construction-bid-proposal, subcontractor-agreement,
scope-of-work. Feature: /features/construction-bidding/.

## Contracts & scope

### subcontractor-agreement — basename `subcontractor-agreement-template`

Cluster: subcontractor agreement 1,600 · subcontractor agreement template
1,600 · subcontractor contract template 1,600 · master subcontractor agreement
template 20 · GSC: "free standard form of agreement between contractor and
subcontractor", "subcontract agreement format in word".
Title: `Free Subcontractor Agreement Template (Word + PDF)`. Formats: **docx**
(primary — 15 numbered sections, keep the existing 14 and add Safety; real
signature tables; exhibits list), **pdf** (flow), example (parties filled in
page 1). Keep the existing FAQs. Related: scope-of-work, construction-contract,
change-order, lien-waiver. Feature: /features/project-management/.

### construction-contract — basename `construction-contract-template` (NEW)

Cluster: construction contract template 1,900 · contractor agreement template
1,300 · basic construction contract template 110 · construction contract
agreement template 90 · residential construction contract template 70 · home
construction contract template 30.
Title: `Free Construction Contract Template — Owner-Contractor Agreement (Word + PDF)`.
Owner ↔ contractor for direct work (residential/light commercial): parties,
project, scope + documents, contract price (fixed / cost-plus option), payment
schedule (deposit, progress, final), change orders in writing, schedule +
delays, permits, insurance, warranty (1 year), termination, disputes, right
to cancel where applicable, signatures. Formats: **docx**, **pdf** (flow),
example. Related: subcontractor-agreement, scope-of-work, construction-quote,
change-order. Feature: /features/construction-bidding/.

### scope-of-work — basename `scope-of-work-template` (NEW)

Cluster: scope of work template 2,400 · construction scope of work template
390 · scope of work template construction 390 · remodeling scope of work
template 30 · subcontractor scope of work template 20.
Title: `Free Scope of Work Template for Construction (Word + PDF)`. Sections:
project overview, included work by area/system (table: item, description,
qty/spec ref), exclusions, assumptions & clarifications, by others, materials
& submittals, schedule milestones, acceptance criteria, attachments, signatures.
Formats: **docx**, **pdf** (flow), example. Related: construction-bid-proposal,
subcontractor-agreement, construction-contract, change-order. Feature:
/features/construction-bidding/.

### notice-to-proceed — basename `notice-to-proceed-template` (NEW)

Cluster: notice to proceed template 110 · notice to proceed construction 170.
Title: `Free Notice to Proceed Template (Word + Fillable PDF)`. One page letter-
form: to/from, project, contract ref, NTP date, contract time starts on, days /
completion date, conditions (insurance certs, bonds, schedule, permits
received), acknowledgment signature. Formats: **pdf**, **docx**, example.
Related: construction-contract, subcontractor-agreement, construction-schedule,
certificate-of-completion. Feature: /features/project-management/.

### certificate-of-completion — basename `certificate-of-completion-template` (NEW)

Cluster: substantial completion certificate 390 · certificate of completion
construction 320 · certificate of completion for contractor 170 · construction
certificate of completion template 110 · certificate of substantial completion
template 50 · letter of completion construction 90.
Title: `Free Certificate of Substantial Completion Template (Word + Fillable PDF)`.
H1 "Certificate of Substantial Completion". One page: project/contract,
definition line, date of substantial completion, punch list attached (count,
completion by date), warranty start date, retainage release terms, utilities/
insurance responsibility transfer, signatures (contractor, owner, architect
optional). Formats: **pdf**, **docx**, example. Related: punch-list, lien-waiver,
aia-g702-g703, notice-to-proceed. Feature: /features/project-management/. Blog:
/blog/construction-project-closeout-checklist/ (add a link there).

## Field & daily paperwork

### daily-report — basename `daily-report-template` (NEW page; file existed on the blog)

Cluster: construction daily report template 720 · daily construction report
template 720 · daily report template 720 · daily log template 390 · construction
daily log template 210 · daily log template construction 210 · construction
daily report template excel 110 · daily report template excel 110 · construction
daily report form 50 · daily field report template 30.
Title: `Free Construction Daily Report Template — Fillable PDF, Word & Excel`.
One page: project/date/weather (AM/PM temp, conditions, delays), crew table
(name/company, trade, hours, area), equipment on site, work performed, materials
delivered, visitors/inspections, delays & issues, safety/incidents, photos
count/refs, foreman + reviewed-by signatures. Formats: **pdf** (primary,
fillable), **docx**, **xlsx** (one sheet per day layout + a weekly hours
summary formula), example (STORY.people.foreman filing an August day).
Related: tm-ticket, timesheet, work-order, punch-list. Feature: /features/site-logs/.
Blog: /blog/construction-daily-report-template/ stays the guide — the agent
changes its download callout to link to /templates/daily-report/ (keep the
direct file links too) and /blog/construction-site-log-best-practices/.

### work-order — basename `work-order-template` (NEW)

Cluster: work order template 2,900 · work order form 1,000 · construction work
order template 110 · construction work order form 110 (GSC on change-order page:
"construction work order template", "construction work order format in word").
Title: `Free Work Order Template — Fillable PDF, Word & Excel (Construction)`.
One page: WO number, date, priority, requested by, customer/site, description
of work requested, labor table (tech, hours, rate), materials table, equipment,
totals, completion notes, technician + customer sign-off. Formats: **pdf**,
**docx**, **xlsx** (with a Work Order Log sheet), example. Content: work order
vs change order vs T&M ticket vs purchase order. Related: change-order,
tm-ticket, construction-quote, construction-invoice. Feature: /features/project-management/.

### tm-ticket — basename `tm-ticket-template`

Cluster: time and materials template 90 · t&m ticket template 70 · time and
material ticket template 30 (GSC: ranks #7–11 already — keep the H1 "T&M Ticket
Template" and the copy that ranks). Title: `Free T&M Ticket Template — Time and
Materials Form (Fillable PDF + Excel)`. Formats: **pdf** (one-page field ticket:
labor with ST/OT hours × rates, materials, equipment, subtotal, markup, total,
GC/super signature same day), **xlsx** (keep the existing computed layout,
restyled), example. Related: change-order, daily-report, work-order, timesheet.
Feature: /features/time-tracking/.

### rfi — basename `rfi-template`

Cluster: rfi template 880 · construction rfi template 480 · rfi template word
320 · rfi log template 110 · construction request for information form 70.
Title: `Free RFI Template — Construction Request for Information (Word, PDF + RFI Log)`.
Formats: **pdf** (one page fillable: RFI no., to/from, spec/drawing ref,
response required by, question, suggested answer, impact flags cost/schedule/
hold, response block, signatures), **docx**, **xlsx** (RFI Log: 30 rows, status
dropdown, days-open formula, overdue conditional format), example. Keep the
existing FAQs. Related: change-order, submittal-log, tm-ticket, meeting-minutes.
Feature: /features/project-management/.

### timesheet — basename `construction-timesheet-template` (NEW)

Cluster: time card template 1,000 · weekly timesheet template 480 · construction
timesheet template 90 · timesheet template for construction 90.
Title: `Free Construction Timesheet Template — Weekly Time Card (Excel + PDF)`.
Formats: **xlsx** (Weekly Timesheet: employee, week ending, rows Mon–Sun with
job / cost code / start / end / break / hours; regular vs OT split by a weekly
threshold cell (40) and daily threshold option (8); totals; rate × hours; a
Crew Summary sheet), **pdf** (landscape one-page card), example. Content:
certified payroll note → /blog/prevailing-wage-certified-payroll/. Related:
daily-report, tm-ticket, work-order, construction-budget. Feature: /features/time-tracking/.

## Project controls & logs

### construction-schedule — basename `construction-schedule-template`

Cluster: construction schedule template 880 · construction project schedule
template 880 · construction schedule template excel 320 · construction timeline
template 170 · construction project timeline template 170 · gantt chart template
construction 90.
Title: `Free Construction Schedule Template — Excel Gantt + PDF`. Formats:
**xlsx** (Schedule sheet: phase/task rows, start, duration, end formula, %
complete, predecessor, plus 16 weekly columns with conditional-format Gantt
bars driven by formulas comparing week start to task dates), **pdf** (landscape
blank schedule grid), example (STORY mechanical phases Jun–Nov 2026). Related:
notice-to-proceed, daily-report, punch-list, construction-budget. Feature:
/features/project-management/.

### punch-list — basename `punch-list-template`

Cluster: punch list template 880 · punch list template word 880 · construction
punch list template 590 · punch list template excel 210 · punch list form 40.
Title: `Free Punch List Template — Excel, Word & PDF`. Formats: **xlsx** (40
rows: #, location, item, trade/responsible, priority, status dropdown, date
noted, date completed, verified by; live counts), **docx** (table form), **pdf**
(landscape fillable list), example. Keep existing FAQs. Related:
certificate-of-completion, daily-report, meeting-minutes, construction-schedule.
Feature: /features/project-management/. Blog: /blog/punch-list-management-for-subcontractors/.

### submittal-log — basename `submittal-log-template`

Cluster: submittal log template 170 · construction submittal log template 170 ·
construction submittal template 210 · submittal cover sheet template 110 ·
submittal template 70 · construction submittals examples 320 (GSC shows the page
gets "construction submittal template" / "submittal example" impressions —
include a submittal cover sheet / transmittal and a worked example).
Title: `Free Submittal Log Template + Submittal Cover Sheet (Excel + PDF)`.
Formats: **xlsx** (Submittal Log restyled with live counts, type/status
dropdowns, days-in-review formula; a Transmittal / Cover Sheet sheet), **pdf**
(landscape log + portrait cover sheet as 2 sections), example. Related: rfi,
construction-schedule, meeting-minutes, scope-of-work. Feature: /features/project-management/.

### construction-budget — basename `construction-budget-template` (NEW)

Cluster: construction budget template 480 · construction budget template excel
210 · home construction budget template 170 · job cost template 70 · job
costing template excel 70 · construction cost breakdown template 140.
Title: `Free Construction Budget Template — Job Cost Tracker (Excel + PDF)`.
Formats: **xlsx** (Budget sheet by cost code: original budget, approved changes,
revised budget, committed, actual to date, projected final, variance, %
spent; summary block; Cost Codes sheet with a CSI-style starter list), **pdf**
(landscape blank), example. Related: construction-estimate, schedule-of-values,
change-order, timesheet. Feature: /features/reports/. Blog: /blog/job-costing-for-subcontractors/.

### meeting-minutes — basename `construction-meeting-minutes-template` (NEW)

Cluster: construction meeting minutes template 140 · pre construction meeting
template 30. Title: `Free Construction Meeting Minutes Template (Word + Fillable PDF)`.
Formats: **pdf** (2 pages: meeting info, attendees table, agenda/discussion
table with item no., topic, discussion, action, owner, due; old business /
new business; next meeting), **docx**, example. Related: rfi, submittal-log,
punch-list, construction-schedule. Feature: /features/project-management/.

## Safety

### job-safety-analysis — basename `job-safety-analysis-template` (NEW)

Cluster: job safety analysis template 880 · jsa template 880 · job hazard
analysis template 480. Title: `Free Job Safety Analysis (JSA) Template — Fillable PDF, Word & Excel`.
H1 "Job Safety Analysis (JSA) Template". One page landscape: job/task, location,
date, prepared by, required PPE checkboxes, table (step no., task step,
potential hazards, controls / safe practices, responsible), crew sign-off
table. Formats: **pdf**, **docx**, **xlsx**, example (a rooftop RTU set with
crane — hazards: falls, suspended loads, pinch points). Content: JSA vs JHA vs
toolbox talk; OSHA context (not legal advice). Related: toolbox-talk,
daily-report, work-order, timesheet. Feature: /features/site-logs/.

### toolbox-talk — basename `toolbox-talk-template` (NEW)

Cluster: toolbox talk template 170 · safety meeting template 110 · toolbox talk
form 70 · tailgate meeting template 20. Title: `Free Toolbox Talk Template —
Safety Meeting Sign-In Sheet (PDF + Word)`. One page: topic, date, presenter,
project, key points (lines), hazards discussed, questions/concerns raised,
corrective actions, attendee sign-in table (name, company, signature) 14 rows.
Formats: **pdf**, **docx**, example. Related: job-safety-analysis,
daily-report, meeting-minutes, timesheet. Feature: /features/site-logs/.
