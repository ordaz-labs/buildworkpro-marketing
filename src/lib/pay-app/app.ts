// DOM controller for /tools/pay-app/. Owns the state, renders the schedule of
// values table and the line 1–9 summary, persists to localStorage, rolls the
// application forward, and fills the PDF. Math lives in ./math, PDF mapping in
// ./pdf. Everything stays in the visitor's browser: no network call except
// fetching the blank template PDF from this site.
import {
  blankRow,
  computeApp,
  computeRow,
  emptyState,
  longDate,
  money,
  num,
  pct,
  rollForward,
  sampleState,
  type AppCalc,
  type Row,
  type State,
} from './math';
import { fillPayAppPdf, pdfFileName, PDF_ROW_CAPACITY, PDF_TEMPLATE_URL } from './pdf';

export const STORAGE_KEY = 'bwp.tools.payapp.v1';

type TrackFn = (
  meta: { name: string; params?: Record<string, unknown> },
  ga: { name: string; params?: Record<string, unknown> }
) => void;

function track(action: string, extra: Record<string, unknown> = {}): void {
  const w = window as unknown as { bwpTrack?: TrackFn };
  const params = { tool: 'pay-app', action, ...extra };
  w.bwpTrack?.({ name: 'ToolUse', params }, { name: 'tool_use', params });
}

function load(): State | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as State;
    if (parsed?.v !== 1 || !Array.isArray(parsed.rows)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(state: State): boolean {
  try {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CELL_INPUT =
  'w-full min-w-0 bg-transparent px-2 py-1.5 text-sm text-slate-900 rounded-md border border-transparent hover:border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 tabular-nums';
const NUM_INPUT = `${CELL_INPUT} text-right`;

function rowHtml(r: Row, ratePct: number, index: number): string {
  const rc = computeRow(r, ratePct);
  const tag = r.co
    ? '<span class="ml-1 inline-block rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 border border-amber-200">CO</span>'
    : '';
  const beyond = index >= PDF_ROW_CAPACITY ? ' opacity-60' : '';
  return `<tr data-row="${r.id}" class="border-b border-slate-100${beyond}">
    <td class="px-1 py-0.5 w-20"><div class="flex items-center"><input data-f="n" aria-label="Item number, row ${index + 1}" value="${esc(r.n)}" class="${CELL_INPUT} w-14">${tag}</div></td>
    <td class="px-1 py-0.5 min-w-[220px]"><input data-f="desc" aria-label="Description, row ${index + 1}" value="${esc(r.desc)}" class="${CELL_INPUT}" placeholder="Description of work"></td>
    <td class="px-1 py-0.5 w-32"><input data-f="c" inputmode="decimal" aria-label="Scheduled value, row ${index + 1}" value="${r.c ? money(r.c) : ''}" class="${NUM_INPUT}" placeholder="0.00"></td>
    <td class="px-1 py-0.5 w-32"><input data-f="d" inputmode="decimal" aria-label="From previous applications, row ${index + 1}" value="${money(r.d, true)}" class="${NUM_INPUT}" placeholder="0.00"></td>
    <td class="px-1 py-0.5 w-32 bg-brand-50/60"><input data-f="e" inputmode="decimal" aria-label="This period, row ${index + 1}" value="${money(r.e, true)}" class="${NUM_INPUT} font-medium" placeholder="0.00"></td>
    <td class="px-1 py-0.5 w-32"><input data-f="f" inputmode="decimal" aria-label="Materials presently stored, row ${index + 1}" value="${money(r.f, true)}" class="${NUM_INPUT}" placeholder="0.00"></td>
    <td data-c="g" class="px-3 py-1.5 w-32 text-right text-sm tabular-nums text-slate-700">${money(rc.g, true)}</td>
    <td data-c="h" class="px-3 py-1.5 w-16 text-right text-sm tabular-nums text-slate-500">${r.c ? pct(rc.pct, 0) : ''}</td>
    <td data-c="i" class="px-3 py-1.5 w-32 text-right text-sm tabular-nums text-slate-700">${money(rc.balance, true)}</td>
    <td data-c="r" class="px-3 py-1.5 w-28 text-right text-sm tabular-nums text-slate-500">${money(rc.retainage, true)}</td>
    <td class="px-1 py-0.5 w-10 text-center"><button type="button" data-action="remove-row" aria-label="Remove row ${index + 1}" class="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/30">&times;</button></td>
  </tr>`;
}

export function mount(root: HTMLElement): void {
  let state: State = load() ?? sampleState();
  const isFirstVisit = !load();
  const $ = <T extends HTMLElement>(sel: string): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`pay-app: missing ${sel}`);
    return el;
  };

  const tbody = $<HTMLTableSectionElement>('[data-sov-body]');
  const status = $<HTMLElement>('[data-status]');
  const note = $<HTMLElement>('[data-note]');

  const fieldEls = Array.from(root.querySelectorAll<HTMLInputElement>('[data-field]'));

  function setStatus(text: string, tone: 'ok' | 'warn' = 'ok'): void {
    status.textContent = text;
    status.className =
      tone === 'ok'
        ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
        : 'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700';
  }

  function setNote(text: string): void {
    note.textContent = text;
  }

  function readFields(): void {
    for (const el of fieldEls) {
      const path = el.dataset.field ?? '';
      const [group, key] = path.split('.');
      if (group === 'company') state.company[key as keyof State['company']] = el.value;
      else if (group === 'job') state.job[key as keyof State['job']] = el.value;
      else if (group === 'app') {
        if (key === 'number') state.app.number = Math.max(1, Math.round(num(el.value)) || 1);
        else if (key === 'ratePct') state.app.ratePct = Math.min(100, Math.max(0, num(el.value)));
        else if (key === 'prevCertified')
          state.app.prevCertified = el.value.trim() === '' ? null : num(el.value);
        else if (key === 'periodFrom' || key === 'periodTo' || key === 'date')
          state.app[key] = el.value;
      }
    }
  }

  function writeFields(): void {
    for (const el of fieldEls) {
      const path = el.dataset.field ?? '';
      const [group, key] = path.split('.');
      let v = '';
      if (group === 'company') v = state.company[key as keyof State['company']];
      else if (group === 'job') v = state.job[key as keyof State['job']];
      else if (group === 'app') {
        if (key === 'number') v = String(state.app.number);
        else if (key === 'ratePct') v = String(state.app.ratePct);
        else if (key === 'prevCertified')
          v = state.app.prevCertified === null ? '' : money(state.app.prevCertified);
        else if (key === 'periodFrom' || key === 'periodTo' || key === 'date') v = state.app[key];
      }
      el.value = v;
    }
  }

  function renderRows(): void {
    tbody.innerHTML = state.rows.map((r, i) => rowHtml(r, state.app.ratePct, i)).join('');
  }

  function updateRowCells(): void {
    state.rows.forEach((r) => {
      const tr = tbody.querySelector<HTMLTableRowElement>(`tr[data-row="${r.id}"]`);
      if (!tr) return;
      const rc = computeRow(r, state.app.ratePct);
      const set = (c: string, v: string) => {
        const td = tr.querySelector<HTMLElement>(`[data-c="${c}"]`);
        if (td) td.textContent = v;
      };
      set('g', money(rc.g, true));
      set('h', r.c ? pct(rc.pct, 0) : '');
      set('i', money(rc.balance, true));
      set('r', money(rc.retainage, true));
    });
  }

  function renderSummary(calc: AppCalc): void {
    const out = (k: string, v: string) => {
      root.querySelectorAll<HTMLElement>(`[data-out="${k}"]`).forEach((el) => (el.textContent = v));
    };
    out(
      'title',
      `Pay Application #${state.app.number}${state.job.project ? ` · ${state.job.project}` : ''}`
    );
    out(
      'period',
      state.app.periodTo ? `Period ending ${longDate(state.app.periodTo)}` : 'Period not set'
    );
    out('base', money(calc.base));
    out('net', money(calc.net));
    out('revised', money(calc.revised));
    out('g', money(calc.totals.g));
    out('rate', `${state.app.ratePct}%`);
    out('5a', money(calc.retWork));
    out('5b', money(calc.retStored));
    out('retainage', money(calc.retainage));
    out('earned', money(calc.earned));
    out('prev', money(calc.previousCerts));
    out(
      'prevNote',
      calc.previousDerived
        ? 'derived from column D at the current rate'
        : 'carried from the previous application'
    );
    out('due', money(calc.due));
    out('balance', money(calc.balance));
    out('pct', pct(calc.pct));
    out('tc', money(calc.totals.c));
    out('td', money(calc.totals.d));
    out('te', money(calc.totals.e));
    out('tf', money(calc.totals.f));
    out('tg', money(calc.totals.g));
    out('tr', money(calc.retainage));
    out('ti', money(calc.remaining));
    out('lines', `${state.rows.length} line${state.rows.length === 1 ? '' : 's'}`);
    const over = state.rows.length - PDF_ROW_CAPACITY;
    const cap = root.querySelector<HTMLElement>('[data-capacity]');
    if (cap) cap.hidden = over <= 0;
    if (cap && over > 0)
      cap.textContent = `The PDF continuation sheet holds ${PDF_ROW_CAPACITY} lines; the last ${over} will not print. Combine lines or bill them on a second sheet.`;
    const hist = root.querySelector<HTMLElement>('[data-history]');
    if (hist) {
      hist.innerHTML = state.history.length
        ? state.history
            .slice()
            .reverse()
            .map(
              (h) =>
                `<li class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><span class="font-medium text-slate-800">Application #${h.number}</span><span class="text-slate-500 text-xs">through ${esc(longDate(h.periodTo))}</span><span class="tabular-nums text-slate-700">${money(h.due)} due</span></li>`
            )
            .join('')
        : '<li class="text-sm text-slate-500">No previous applications yet. Roll this one forward when it is approved and it will appear here.</li>';
    }
  }

  function recompute(persist = true): void {
    const calc = computeApp(state.rows, state.app.ratePct, state.app.prevCertified);
    updateRowCells();
    renderSummary(calc);
    if (persist) {
      const ok = save(state);
      setStatus(
        ok ? 'Saved in this browser' : 'Could not save in this browser',
        ok ? 'ok' : 'warn'
      );
    }
  }

  function renderAll(persist = true): void {
    writeFields();
    renderRows();
    recompute(persist);
  }

  // ---- events ---------------------------------------------------------
  root.addEventListener('input', (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.matches('[data-field]')) {
      readFields();
      if (el.dataset.field === 'app.ratePct') renderRows();
      recompute();
      return;
    }
    if (el.matches('[data-f]')) {
      const tr = el.closest<HTMLTableRowElement>('tr[data-row]');
      const row = state.rows.find((r) => r.id === tr?.dataset.row);
      if (!row) return;
      const f = el.dataset.f as keyof Row;
      if (f === 'n' || f === 'desc') row[f] = el.value;
      else if (f === 'c' || f === 'd' || f === 'e' || f === 'f') row[f] = num(el.value);
      recompute();
    }
  });

  root.addEventListener('focusout', (ev) => {
    const el = ev.target as HTMLInputElement;
    if (!el.matches('[data-f="c"],[data-f="d"],[data-f="e"],[data-f="f"]')) return;
    const v = num(el.value);
    el.value = v ? money(v) : '';
  });

  root.addEventListener('click', async (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'remove-row') {
      const id = btn.closest<HTMLTableRowElement>('tr[data-row]')?.dataset.row;
      state.rows = state.rows.filter((r) => r.id !== id);
      if (state.rows.length === 0) state.rows.push(blankRow('1'));
      renderRows();
      recompute();
      return;
    }
    if (action === 'add-row' || action === 'add-co') {
      const co = action === 'add-co';
      const n = co
        ? `CO-${String(state.rows.filter((r) => r.co).length + 1).padStart(3, '0')}`
        : String(state.rows.filter((r) => !r.co).length + 1);
      state.rows.push(blankRow(n, co));
      renderRows();
      recompute();
      tbody.querySelector<HTMLInputElement>('tr:last-child [data-f="desc"]')?.focus();
      track(co ? 'add_co' : 'add_row');
      return;
    }
    if (action === 'load-sample') {
      state = sampleState();
      renderAll();
      setNote(
        'Example loaded: application #3 on a $486,200 mechanical subcontract. Replace it with your own job whenever you like.'
      );
      track('load_sample');
      return;
    }
    if (action === 'clear') {
      if (
        !window.confirm(
          'Clear this application and start blank? Your saved copy in this browser will be replaced.'
        )
      )
        return;
      state = emptyState();
      renderAll();
      setNote(
        'Blank application. Fill in the project, add your schedule of values, and the math follows.'
      );
      track('clear');
      return;
    }
    if (action === 'roll-forward') {
      const calc = computeApp(state.rows, state.app.ratePct, state.app.prevCertified);
      if (
        !window.confirm(
          `Close application #${state.app.number} (${money(calc.due)} due) and start #${state.app.number + 1}? This period moves into previous applications, this period clears, and line 7 becomes ${money(calc.earned)}.`
        )
      )
        return;
      state = rollForward(state);
      renderAll();
      setNote(
        `Application #${state.app.number} started. Only this period's work and updated stored materials need entering now.`
      );
      track('roll_forward', { application: state.app.number });
      return;
    }
    if (action === 'download-pdf') {
      const b = btn as HTMLButtonElement;
      const label = b.textContent;
      b.disabled = true;
      b.textContent = 'Filling the PDF…';
      try {
        const res = await fetch(PDF_TEMPLATE_URL);
        if (!res.ok) throw new Error(`template ${res.status}`);
        const bytes = await fillPayAppPdf(await res.arrayBuffer(), state);
        const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfFileName(state);
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        setNote(
          `Downloaded ${pdfFileName(state)}. Open it in Acrobat, Preview or Chrome; every field stays editable.`
        );
        track('download_pdf', { application: state.app.number, rows: state.rows.length });
      } catch {
        setNote(
          'The PDF could not be generated in this browser. Try again, or download the blank template from the templates page.'
        );
      } finally {
        b.disabled = false;
        b.textContent = label;
      }
    }
  });

  // ---- first paint -----------------------------------------------------
  renderAll(false);
  if (isFirstVisit) {
    setStatus('Example loaded · edits save in this browser', 'ok');
    setNote(
      'This is a worked example. Type over it or press “Start blank”. Nothing you enter leaves your browser.'
    );
  } else {
    setStatus('Saved in this browser', 'ok');
    setNote(
      `Picked up where you left off (last edit ${new Date(state.updatedAt).toLocaleString()}).`
    );
  }
  root.dataset.ready = 'true';
}
