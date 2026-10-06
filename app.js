(() => {
const $ = (id) => document.getElementById(id);
const fa = (n) => Number(n).toLocaleString('fa-IR');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= animated background ================= */
const cv = $('bg'), cx = cv.getContext('2d');
let W, H, DPR, mx = 0, my = 0, tmx = 0, tmy = 0;
function size() { DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); }
size(); addEventListener('resize', size);
addEventListener('pointermove', (e) => { tmx = e.clientX / W - 0.5; tmy = e.clientY / H - 0.5; });
const rnd = (a, b) => a + Math.random() * (b - a);
const N = Math.round(Math.min(46, Math.max(22, innerWidth / 34)));
const mk = (z) => ({ x: rnd(-9, 9), y: rnd(-5.5, 5.5), z: z ?? rnd(2, 26), rx: rnd(-0.9, 0.9), ry: rnd(-1.2, 1.2), vrx: rnd(-0.0012, 0.0012), vry: rnd(-0.0016, 0.0016), s: rnd(0.55, 1.25), hot: Math.random() < 0.22, ph: Math.random() * 6.28 });
const P = Array.from({ length: N }, () => mk());
const dust = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.2, v: rnd(0.00004, 0.00018), a: Math.random() }));
const proj = (x, y, z) => { const f = Math.min(W, H) * 0.9 / z; return [W / 2 + (x - mx * 2.2) * f, H * 0.42 + (y - my * 1.6) * f, f]; };
let hidden = false; document.addEventListener('visibilitychange', () => { hidden = document.hidden; if (!hidden && !RM) requestAnimationFrame(frame); });
function frame(t) {
  mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
  cx.clearRect(0, 0, W, H);
  const a1x = W * (0.5 + Math.sin(t * 0.00011) * 0.25), a1y = H * (0.25 + Math.cos(t * 0.00009) * 0.12);
  let g = cx.createRadialGradient(a1x, a1y, 0, a1x, a1y, Math.max(W, H) * 0.55);
  g.addColorStop(0, 'rgba(30,200,135,.16)'); g.addColorStop(1, 'rgba(30,200,135,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  const a2x = W * (0.5 + Math.cos(t * 0.00008) * 0.35), a2y = H * (0.8 + Math.sin(t * 0.00012) * 0.1);
  g = cx.createRadialGradient(a2x, a2y, 0, a2x, a2y, Math.max(W, H) * 0.5);
  g.addColorStop(0, 'rgba(20,120,160,.12)'); g.addColorStop(1, 'rgba(20,120,160,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  cx.lineWidth = 1;
  for (let i = -12; i <= 12; i++) { const p1 = proj(i * 1.6, 4.2, 2.2), p2 = proj(i * 1.6, 4.2, 30); cx.strokeStyle = 'rgba(52,240,165,.05)'; cx.beginPath(); cx.moveTo(p1[0], p1[1]); cx.lineTo(p2[0], p2[1]); cx.stroke(); }
  const off = (t * 0.0006) % 2;
  for (let k = 0; k < 16; k++) { const z = 2.2 + k * 2 - off; if (z < 2.2) continue; const p1 = proj(-20, 4.2, z), p2 = proj(20, 4.2, z); cx.strokeStyle = `rgba(52,240,165,${0.07 * (1 - z / 34)})`; cx.beginPath(); cx.moveTo(p1[0], p1[1]); cx.lineTo(p2[0], p2[1]); cx.stroke(); }
  for (const d of dust) { d.y -= d.v; if (d.y < 0) d.y = 1; const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.001 + d.a * 9)); cx.fillStyle = `rgba(170,255,220,${0.35 * tw})`; cx.beginPath(); cx.arc(d.x * W, d.y * H, d.r, 0, 6.28); cx.fill(); }
  P.sort((a, b) => b.z - a.z);
  for (const p of P) {
    p.z -= 0.012; p.rx += p.vrx; p.ry += p.vry;
    if (p.z < 1.2) Object.assign(p, mk(26));
    const w = 0.8 * p.s, h = 0.45 * p.s, cr = Math.cos(p.rx), sr = Math.sin(p.rx), cy = Math.cos(p.ry), sy = Math.sin(p.ry);
    const pt = (u, v) => { const X = u, Y = v * cr, Z = v * sr; return proj(p.x + X * cy + Z * sy, p.y + Y, p.z - X * sy + Z * cy); };
    const c = [pt(-w, -h), pt(w, -h), pt(w, h), pt(-w, h)];
    const depth = Math.max(0, Math.min(1, 1 - (p.z - 1.2) / 24));
    const al = depth * Math.min(1, (26 - p.z) / 3) * (p.hot ? 1 : 0.55);
    cx.beginPath(); cx.moveTo(c[0][0], c[0][1]); for (let i = 1; i < 4; i++) cx.lineTo(c[i][0], c[i][1]); cx.closePath();
    cx.fillStyle = p.hot ? `rgba(52,240,165,${0.06 * al})` : `rgba(160,255,215,${0.025 * al})`; cx.fill();
    cx.strokeStyle = p.hot ? `rgba(52,240,165,${0.75 * al})` : `rgba(170,240,210,${0.32 * al})`; cx.lineWidth = p.hot ? 1.3 : 1;
    if (p.hot) { cx.shadowColor = 'rgba(52,240,165,.8)'; cx.shadowBlur = 14 * al; }
    cx.stroke(); cx.shadowBlur = 0;
    if (al > 0.12) {
      const ln = (u1, v1, u2, v2, a) => { const q1 = pt(u1, v1), q2 = pt(u2, v2); cx.strokeStyle = `rgba(52,240,165,${a})`; cx.beginPath(); cx.moveTo(q1[0], q1[1]); cx.lineTo(q2[0], q2[1]); cx.stroke(); };
      cx.lineWidth = Math.max(1, 2 * depth); ln(w * 0.75, -h * 0.55, -w * 0.1, -h * 0.55, 0.7 * al);
      cx.lineWidth = 1; const pulse = 0.5 + 0.5 * Math.sin(t * 0.002 + p.ph);
      ln(w * 0.75, -h * 0.1, -w * 0.55, -h * 0.1, 0.3 * al); ln(w * 0.75, h * 0.2, -w * 0.3, h * 0.2, 0.3 * al * pulse + 0.08 * al);
    }
  }
  if (!RM && !hidden) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ================= hero form ================= */
const inp = $('topic');
const ideas = ['استراتژی ورود یک استارتاپ به بازار ترکیه', 'آینده‌ی انرژی خورشیدی در ایران', 'گزارش فصلی فروش برای هیئت‌مدیره', 'معرفی هوش مصنوعی به دانش‌آموزان دبیرستان'];
let ii = 0, ci = 0, del = false;
function typeLoop() {
  const s = ideas[ii];
  if (!del) { ci++; if (ci > s.length) { del = true; inp.placeholder = s; setTimeout(typeLoop, 1800); return; } }
  else { ci--; if (ci === 0) { del = false; ii = (ii + 1) % ideas.length; } }
  inp.placeholder = s.slice(0, ci) + (ci ? '│' : '');
  setTimeout(typeLoop, del ? 22 : 55);
}
if (RM) inp.placeholder = 'درباره‌ی چه چیزی ارائه می‌سازید؟'; else typeLoop();

const opts = { count: 8, tone: 'pro', lang: 'fa', depth: 'mid' };
document.querySelectorAll('.chips').forEach((gr) => gr.addEventListener('click', (e) => {
  const b = e.target.closest('.chip'); if (!b) return;
  gr.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
  const k = gr.dataset.group; opts[k] = k === 'count' ? +b.dataset.v : b.dataset.v;
  if (k === 'count') $('cntv').textContent = fa(opts.count);
}));
document.querySelectorAll('.ex').forEach((b) => b.addEventListener('click', () => { inp.value = b.textContent; inp.focus(); }));

/* ================= studio state ================= */
const SAMPLE = {
  title: 'آینده‌ی انرژی خورشیدی در ایران', subtitle: 'فرصت‌ها، موانع و یک نقشه‌ی راه عملی',
  slides: [
    { layout: 'cover', title: 'آینده‌ی انرژی خورشیدی در ایران', subtitle: 'فرصت‌ها، موانع و یک نقشه‌ی راه عملی', notes: 'خوشامد و معرفی موضوع.' },
    { layout: 'bullets', title: 'چرا همین حالا؟', bullets: ['ناترازی برق در تابستان هر سال جدی‌تر می‌شود', 'هزینه‌ی پنل‌های خورشیدی در دهه‌ی اخیر به‌شدت کاهش یافته', 'بخش بزرگی از کشور تابش بالایی در طول سال دارد'], notes: 'زمینه‌ی مسئله را کوتاه بگو.' },
    { layout: 'stats', title: 'تصویر کلی در چند عدد', stats: [{ value: '۳۰۰+', label: 'روز آفتابی در سال در بسیاری از مناطق' }, { value: '۵', label: 'کیلووات‌ساعت تابش روزانه بر مترمربع، به‌طور تقریبی' }, { value: '۲۰+', label: 'سال عمر مفید یک پنل' }], notes: 'اعداد تقریبی‌اند؛ پیش از ارائه با منبع به‌روز چک شوند.' },
    { layout: 'two', title: 'نیروگاه بزرگ یا پشت‌بام؟', left: { heading: 'نیروگاه متمرکز', bullets: ['هزینه‌ی هر کیلووات کمتر', 'نیاز به زمین و خط انتقال', 'مجوزهای طولانی'] }, right: { heading: 'پنل پشت‌بامی', bullets: ['تولید کنار مصرف', 'بدون اتلاف انتقال', 'سرمایه‌گذاری خرد و سریع'] }, notes: 'دو مدل مکمل هم‌اند.' },
    { layout: 'chart', title: 'سهم پیشنهادی ظرفیت جدید', chart: { labels: ['پشت‌بام خانگی', 'صنعتی', 'کشاورزی', 'نیروگاهی'], values: [25, 35, 15, 25], unit: 'درصد · سناریوی فرضی برای نمونه' }, notes: 'این توزیع فقط یک سناریوی پیشنهادی است.' },
    { layout: 'quote', title: 'یک جمله برای به خاطر سپردن', quote: 'ارزان‌ترین کیلووات، کیلوواتی است که کنار مصرف تولید شود.', author: 'اصل تولید پراکنده', notes: 'مکث کن.' },
    { layout: 'bullets', title: 'نقشه‌ی راه شش‌ماهه', bullets: ['ساده‌سازی مجوز نصب پشت‌بامی', 'تسهیلات خرد برای خانوارها', 'خرید تضمینی برق با قرارداد شفاف', 'آموزش نصاب‌های محلی'], notes: 'هر گام مالک مشخص دارد.' },
    { layout: 'closing', title: 'آفتاب داریم؛ تصمیم لازم داریم', subtitle: 'گام بعدی: یک پروژه‌ی آزمایشی در یک شهر', notes: 'تشکر و پرسش و پاسخ.' },
  ],
};
const st = { deck: SAMPLE, lang: 'fa', cur: 0, sample: true, history: [], busy: false };

const ol = $('ol'), strip = $('strip'), viewbox = $('viewbox'), steps = [...document.querySelectorAll('.step')];
const scaleBox = (box) => { const w = box.getBoundingClientRect().width; if (w) box.style.setProperty('--k', w / 1280); };
const ro = new ResizeObserver((entries) => entries.forEach((e) => scaleBox(e.target)));
const num = (n) => (st.lang === 'en' ? String(n).padStart(2, '0') : fa(n));

function renderAll() {
  const d = st.deck, n = d.slides.length;
  st.cur = Math.min(st.cur, n - 1);
  $('decktitle').textContent = d.title;
  $('sample').hidden = !st.sample;
  $('deckmeta').textContent = `${fa(n)} اسلاید · 16:9`;
  $('olmeta').textContent = st.lang === 'en' ? 'EN' : 'FA';
  ol.innerHTML = d.slides.map((s, i) => `<li data-i="${i}" dir="${st.lang === 'en' ? 'ltr' : 'rtl'}" style="animation-delay:${i * 40}ms"><b>${num(i + 1)}</b>${Deck.esc(s.title)}</li>`).join('');
  ro.disconnect();
  strip.innerHTML = d.slides.map((s, i) => `<button type="button" class="th" data-i="${i}" aria-label="اسلاید ${fa(i + 1)}"><div class="sxbox">${Deck.slideHTML(s, i, n, st.lang, d.title)}</div></button>`).join('');
  strip.querySelectorAll('.sxbox').forEach((b) => { ro.observe(b); scaleBox(b); });
  ro.observe(viewbox);
  $('undo').disabled = !st.history.length;
  show(st.cur, true);
}
function show(i, silent) {
  const d = st.deck, n = d.slides.length;
  st.cur = (i + n) % n;
  viewbox.innerHTML = Deck.slideHTML(d.slides[st.cur], st.cur, n, st.lang, d.title);
  scaleBox(viewbox);
  const notes = d.slides[st.cur].notes;
  $('notes').innerHTML = notes ? `<b>یادداشت ارائه‌دهنده</b>${Deck.esc(notes)}` : '';
  ol.querySelectorAll('li').forEach((li) => li.classList.toggle('cur', +li.dataset.i === st.cur));
  strip.querySelectorAll('.th').forEach((t) => t.classList.toggle('cur', +t.dataset.i === st.cur));
  if (!silent) strip.children[st.cur]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: RM ? 'auto' : 'smooth' });
}
ol.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) show(+li.dataset.i); });
strip.addEventListener('click', (e) => { const t = e.target.closest('.th'); if (t && !t.classList.contains('skel')) show(+t.dataset.i); });
$('next').onclick = () => show(st.cur + 1);
$('prev').onclick = () => show(st.cur - 1);
$('view').addEventListener('keydown', (e) => {
  const fwd = st.lang === 'en' ? 'ArrowRight' : 'ArrowLeft', back = st.lang === 'en' ? 'ArrowLeft' : 'ArrowRight';
  if (e.key === fwd) { show(st.cur + 1); e.preventDefault(); } else if (e.key === back) { show(st.cur - 1); e.preventDefault(); }
});

/* ================= API ================= */
const toast = (m, ms = 3200) => { const el = $('toast'); el.textContent = m; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), ms); };
let tick;
function busy(on, text) {
  st.busy = on; $('busy').hidden = !on; $('go').disabled = on; $('send').disabled = on;
  clearInterval(tick);
  if (on) { $('busytext').textContent = text; const t0 = performance.now(); $('timer').textContent = '0.0s'; tick = setInterval(() => { $('timer').textContent = ((performance.now() - t0) / 1000).toFixed(1) + 's'; }, 100); }
}
async function api(body) {
  body.onRetry = (m, n) => { $('busytext').textContent = `Gemini شلوغ است؛ تلاش دوباره (${fa(n)})…`; };
  try { return await Gemini.run(body); }
  catch (e) { if (e.kind === 'nokey' || e.kind === 'key') openKey(e.kind === 'key' ? e.message : '', lastAction); throw e; }
}

/* ================= error panel ================= */
let lastAction = null;
function showErr(msg, detail) { $('errmsg').textContent = msg || ''; $('errdetail').textContent = detail || ''; $('err').hidden = !msg; }
$('errretry').onclick = () => { showErr(''); lastAction && lastAction(); };
$('errkey').onclick = () => openKey('', lastAction);

/* ================= key dialog ================= */
const dlg = $('keydlg');
function keyState() { const has = !!Gemini.getKey(); $('keybtn').classList.toggle('ok', has); $('keylabel').textContent = has ? 'کلید ثبت شده' : 'کلید Gemini'; $('keyclear').hidden = !has; }
let pending = null;
function openKey(msg, then) { pending = then || null; $('keymsg').textContent = msg || ''; $('keyin').value = Gemini.getKey(); dlg.hidden = false; setTimeout(() => $('keyin').focus(), 30); }
function closeKey() { dlg.hidden = true; pending = null; }
$('keybtn').onclick = () => openKey();
$('keyform').addEventListener('submit', (e) => { e.preventDefault(); const v = $('keyin').value.trim(); if (v.length < 20) { $('keymsg').textContent = 'این کلید کوتاه است. کل کلید را کپی کن.'; return; } Gemini.setKey(v); keyState(); const next = pending; closeKey(); if (next) { toast('کلید ذخیره شد.'); next(); } else toast('کلید ذخیره شد. حالا می‌توانی ارائه بسازی.'); });
$('keyclear').onclick = () => { Gemini.setKey(''); keyState(); closeKey(); toast('کلید از این مرورگر پاک شد.'); };
$('keycancel').onclick = closeKey;
dlg.addEventListener('click', (e) => { if (e.target === dlg) closeKey(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !dlg.hidden) closeKey(); });
$('keytest').onclick = async () => {
  const v = $('keyin').value.trim(); const out = $('keymsg');
  if (v.length < 20) { out.textContent = 'اول کلید را وارد کن.'; return; }
  out.style.color = 'var(--muted)'; out.textContent = 'در حال بررسی کلید…';
  try {
    const models = await Gemini.testKey(v);
    out.style.color = 'var(--accent)';
    out.textContent = models.length ? `کلید سالم است. مدل‌های در دسترس: ${models.slice(0, 4).join('، ')}` : 'کلید سالم است، ولی هیچ مدل Flash برایش فعال نیست.';
  } catch (e) { out.style.color = ''; out.textContent = `${e.message}${e.detail ? ' — ' + e.detail : ''}`; }
};
$('keyshow').onclick = () => { const i = $('keyin'); i.type = i.type === 'password' ? 'text' : 'password'; };
keyState();
const setSteps = (on, run) => steps.forEach((s, i) => { s.classList.toggle('on', i < on); s.classList.toggle('run', i === run); });

$('form').addEventListener('submit', (e) => { e.preventDefault(); generate(); });
async function generate() {
  if (st.busy) return;
  const topic = inp.value.trim();
  if (topic.length < 3) { toast('اول موضوع ارائه را بنویس.'); inp.focus(); return; }
  lastAction = generate;
  if (!Gemini.getKey()) { openKey('برای ساخت ارائه، یک بار کلید Gemini خودت را وارد کن. بعد از ذخیره، ساخت خودش شروع می‌شود.', generate); return; }
  showErr('');
  const goLabel = $('go').firstChild; goLabel.textContent = 'در حال ساخت… ';
  setSteps(1, 1);
  $('studio').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
  strip.innerHTML = Array.from({ length: opts.count }, () => '<div class="th skel"></div>').join('');
  ol.innerHTML = '';
  busy(true, 'در حال نوشتن ساختار و متن اسلایدها…');
  try {
    const deck = await api({ topic, count: opts.count, tone: opts.tone, lang: opts.lang, depth: opts.depth });
    if (!st.sample) st.history.push({ deck: st.deck, lang: st.lang });
    Object.assign(st, { deck, lang: opts.lang, cur: 0, sample: false });
    setSteps(2, 2);
    renderAll();
    setTimeout(() => setSteps(3, -1), 500);
    toast(`${fa(deck.slides.length)} اسلاید آماده شد.`);
  } catch (err) {
    console.error(err);
    setSteps(1, -1); renderAll(); showErr(err.message || 'ساخت ارائه ناموفق بود.', err.detail);
  } finally { busy(false); goLabel.textContent = 'ساختن ارائه '; }
}

async function edit(instruction) {
  if (st.busy || !instruction) return;
  lastAction = () => edit(instruction);
  if (!Gemini.getKey()) { openKey('برای ویرایش، کلید Gemini خودت را وارد کن.', lastAction); return; }
  showErr('');
  busy(true, 'در حال اعمال تغییر…');
  try {
    const deck = await api({ deck: st.deck, instruction, lang: st.lang });
    st.history.push({ deck: st.deck, lang: st.lang });
    st.deck = deck; st.sample = false;
    renderAll(); $('instr').value = '';
    toast('تغییر اعمال شد.');
  } catch (err) { console.error(err); showErr(err.message || 'ویرایش ناموفق بود.', err.detail); }
  finally { busy(false); }
}
$('chat').addEventListener('submit', (e) => { e.preventDefault(); edit($('instr').value.trim()); });
$('sugg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) edit(b.textContent); });
$('undo').onclick = () => { const h = st.history.pop(); if (!h) return; st.deck = h.deck; st.lang = h.lang; renderAll(); toast('به نسخه‌ی قبل برگشت.'); };

/* ================= exports ================= */
const fname = () => (st.deck.title || 'presentation').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60).trim() || 'presentation';
$('xpptx').onclick = async (e) => {
  const b = e.currentTarget; if (!window.PptxGenJS) return toast('کتابخانه‌ی PPTX هنوز بارگیری نشده. چند لحظه دیگر امتحان کن.');
  b.disabled = true;
  try { const pres = await Deck.toPptx(st.deck, st.lang); await pres.writeFile({ fileName: fname() + '.pptx' }); }
  catch (err) { console.error(err); toast('ساخت فایل PPTX ناموفق بود.'); }
  finally { b.disabled = false; }
};
$('xpdf').onclick = async (e) => {
  const b = e.currentTarget; if (!window.jspdf || !window.htmlToImage) return toast('کتابخانه‌ی PDF هنوز بارگیری نشده. چند لحظه دیگر امتحان کن.');
  b.disabled = true; toast('در حال ساخت PDF…', 8000);
  try { await document.fonts.ready; const pdf = await Deck.toPdf(st.deck, st.lang, $('pdfstage')); pdf.save(fname() + '.pdf'); toast('PDF آماده شد.'); }
  catch (err) { console.error(err); toast('ساخت فایل PDF ناموفق بود.'); }
  finally { b.disabled = false; }
};

document.querySelectorAll('.feat').forEach((f) => f.addEventListener('pointermove', (e) => { const r = f.getBoundingClientRect(); f.style.setProperty('--mx', e.clientX - r.left + 'px'); f.style.setProperty('--my', e.clientY - r.top + 'px'); }));

document.fonts?.ready.then(() => renderAll());
renderAll();
})();
