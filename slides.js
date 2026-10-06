/* Slide rendering (HTML), PPTX export (pptxgenjs) and PDF export (html-to-image + jsPDF).
   One design, three outputs. Exposes window.Deck. */
(function () {
  const C = { bg: '07110E', panel: '0F1F1A', line: '1C3A30', accent: '34F0A5', accentDim: '1A7A55', fg: 'EAF4F0', muted: '9BB3AA' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const faNum = (n) => Number(n).toLocaleString('fa-IR');
  const num = (n, lang) => (lang === 'en' ? String(n).padStart(2, '0') : faNum(n));
  const fmtVal = (v, lang) => (lang === 'en' ? Number(v).toLocaleString('en-US') : faNum(v));

  /* ---------------- HTML ---------------- */
  function slideHTML(sl, i, n, lang, deckTitle) {
    const dir = lang === 'en' ? 'ltr' : 'rtl';
    const foot = `<div class="sx-foot"><span>${esc(deckTitle)}</span><span>${num(i + 1, lang)} / ${num(n, lang)}</span></div>`;
    const title = `<div class="sx-kicker"></div><h2 class="sx-title">${esc(sl.title)}</h2>`;
    let body = '';
    switch (sl.layout) {
      case 'cover':
        return `<div class="sx sx-cover" dir="${dir}"><div class="sx-orb"></div><div class="sx-grid"></div>
          <div class="sx-cover-in"><div class="sx-tag">${lang === 'en' ? 'PRESENTATION' : 'ارائه'}</div>
          <h1>${esc(sl.title)}</h1>${sl.subtitle ? `<p>${esc(sl.subtitle)}</p>` : ''}<div class="sx-bar"></div></div></div>`;
      case 'closing':
        return `<div class="sx sx-close" dir="${dir}"><div class="sx-orb b"></div>
          <div class="sx-close-in"><h1>${esc(sl.title)}</h1>${sl.subtitle ? `<p>${esc(sl.subtitle)}</p>` : ''}<div class="sx-bar"></div></div>${foot}</div>`;
      case 'two':
        body = `<div class="sx-two">${[sl.left, sl.right].map((c) => `<div class="sx-card"><h3>${esc(c?.heading)}</h3><ul>${(c?.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>`).join('')}</div>`;
        break;
      case 'stats':
        body = `<div class="sx-stats" style="--n:${sl.stats.length}">${sl.stats.map((s) => `<div class="sx-stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>`;
        break;
      case 'quote':
        body = `<div class="sx-quote"><div class="sx-qm">”</div><blockquote>${esc(sl.quote)}</blockquote>${sl.author ? `<cite>— ${esc(sl.author)}</cite>` : ''}</div>`;
        break;
      case 'chart': {
        const max = Math.max(...sl.chart.values.map(Math.abs), 1);
        body = `<div class="sx-chart">${sl.chart.values.map((v, k) => { const h = Math.max(2, (Math.abs(v) / max) * 82); return `<div class="sx-col"><div class="sx-ba"><i style="height:${h}%"></i><em style="bottom:calc(${h}% + 8px)">${fmtVal(v, lang)}</em></div><span>${esc(sl.chart.labels[k])}</span></div>`; }).join('')}</div>${sl.chart.unit ? `<div class="sx-unit">${esc(sl.chart.unit)}</div>` : ''}`;
        break;
      }
      default:
        body = `<ul class="sx-list">${(sl.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
    }
    return `<div class="sx is-${sl.layout}" dir="${dir}">${title}${body}${foot}</div>`;
  }

  /* ---------------- PPTX ---------------- */
  async function toPptx(deck, lang) {
    const rtl = lang !== 'en';
    const FONT = rtl ? 'Tahoma' : 'Calibri';
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
    pres.rtlMode = rtl;
    pres.title = deck.title;
    const W = 13.333, M = 0.8, CW = W - 2 * M;
    const al = rtl ? 'right' : 'left';
    const T = (o) => Object.assign({ fontFace: FONT, color: C.fg, rtlMode: rtl, align: al, valign: 'top', margin: 0, lang: rtl ? 'fa-IR' : 'en-US' }, o);
    const n = deck.slides.length;

    deck.slides.forEach((sl, i) => {
      const s = pres.addSlide();
      s.background = { color: C.bg };
      if (sl.notes) s.addNotes(sl.notes);
      const footer = () => {
        s.addShape(pres.ShapeType.line, { x: M, y: 6.85, w: CW, h: 0, line: { color: C.line, width: 0.75 } });
        s.addText(deck.title, T({ x: M, y: 6.95, w: CW - 1.5, h: 0.3, fontSize: 10, color: C.muted, align: rtl ? 'right' : 'left' }));
        s.addText(`${num(i + 1, lang)} / ${num(n, lang)}`, T({ x: rtl ? M : W - M - 1.4, y: 6.95, w: 1.4, h: 0.3, fontSize: 10, color: C.muted, align: rtl ? 'left' : 'right' }));
      };
      const head = () => {
        s.addShape(pres.ShapeType.rect, { x: rtl ? W - M - 0.6 : M, y: 0.7, w: 0.6, h: 0.07, fill: { color: C.accent }, line: { type: 'none' } });
        s.addText(sl.title, T({ x: M, y: 0.95, w: CW, h: 1.0, fontSize: 32, bold: true, valign: 'middle', fit: 'shrink' }));
      };

      if (sl.layout === 'cover' || sl.layout === 'closing') {
        s.addShape(pres.ShapeType.ellipse, { x: rtl ? -2 : 8.5, y: -2.5, w: 7, h: 7, fill: { color: C.accent, transparency: 88 }, line: { type: 'none' } });
        const center = sl.layout === 'closing';
        const a = center ? 'center' : al;
        if (!center) s.addText(lang === 'en' ? 'PRESENTATION' : 'ارائه', T({ x: M, y: 2.2, w: CW, h: 0.4, fontSize: 14, color: C.accent, bold: true, align: a, charSpacing: 4 }));
        s.addText(sl.title, T({ x: M, y: center ? 2.4 : 2.7, w: CW, h: 1.8, fontSize: center ? 44 : 50, bold: true, align: a, valign: 'middle', fit: 'shrink' }));
        if (sl.subtitle) s.addText(sl.subtitle, T({ x: M, y: center ? 4.3 : 4.6, w: CW, h: 0.9, fontSize: 20, color: C.muted, align: a }));
        const bx = center ? (W - 1.2) / 2 : rtl ? W - M - 1.2 : M;
        s.addShape(pres.ShapeType.rect, { x: bx, y: center ? 5.4 : 5.7, w: 1.2, h: 0.08, fill: { color: C.accent }, line: { type: 'none' } });
        if (center) footer();
        return;
      }

      head();
      const top = 2.25, H = 4.3;

      if (sl.layout === 'bullets') {
        const fs = sl.bullets.length > 4 ? 20 : 24;
        s.addText(sl.bullets.map((b) => ({ text: b, options: { bullet: { code: '25A0', indent: 22 }, color: C.fg, paraSpaceAfter: 14, rtlMode: rtl } })),
          T({ x: M, y: top, w: CW, h: H, fontSize: fs, lineSpacingMultiple: 1.15 }));
      } else if (sl.layout === 'two') {
        const gw = 0.4, cw = (CW - gw) / 2;
        [sl.left, sl.right].forEach((c, k) => {
          const x = rtl ? W - M - cw - k * (cw + gw) : M + k * (cw + gw);
          s.addShape(pres.ShapeType.roundRect, { x, y: top, w: cw, h: H, rectRadius: 0.12, fill: { color: C.panel }, line: { color: C.line, width: 1 } });
          s.addText(c.heading || '', T({ x: x + 0.35, y: top + 0.3, w: cw - 0.7, h: 0.6, fontSize: 22, bold: true, color: C.accent }));
          s.addText((c.bullets || []).map((b) => ({ text: b, options: { bullet: { code: '25A0', indent: 18 }, paraSpaceAfter: 10, rtlMode: rtl } })),
            T({ x: x + 0.35, y: top + 1.05, w: cw - 0.7, h: H - 1.3, fontSize: 18 }));
        });
      } else if (sl.layout === 'stats') {
        const k = sl.stats.length, gw = 0.35, cw = (CW - gw * (k - 1)) / k;
        sl.stats.forEach((st, j) => {
          const x = rtl ? W - M - cw - j * (cw + gw) : M + j * (cw + gw);
          s.addShape(pres.ShapeType.roundRect, { x, y: top + 0.4, w: cw, h: 3.2, rectRadius: 0.12, fill: { color: C.panel }, line: { color: C.line, width: 1 } });
          s.addText(st.value, T({ x: x + 0.3, y: top + 0.8, w: cw - 0.6, h: 1.4, fontSize: 54, bold: true, color: C.accent, align: 'center', valign: 'middle', fit: 'shrink' }));
          s.addText(st.label, T({ x: x + 0.3, y: top + 2.3, w: cw - 0.6, h: 1.1, fontSize: 17, color: C.muted, align: 'center' }));
        });
      } else if (sl.layout === 'quote') {
        s.addText('”', T({ x: M, y: top - 0.2, w: CW, h: 1.2, fontSize: 110, color: C.accent, fontFace: 'Georgia' }));
        s.addText(sl.quote, T({ x: M, y: top + 0.9, w: CW, h: 2.2, fontSize: 30, italic: !rtl, valign: 'middle', fit: 'shrink' }));
        if (sl.author) s.addText(`— ${sl.author}`, T({ x: M, y: top + 3.3, w: CW, h: 0.5, fontSize: 18, color: C.muted }));
      } else if (sl.layout === 'chart') {
        const labels = rtl ? [...sl.chart.labels].reverse() : sl.chart.labels;
        const values = rtl ? [...sl.chart.values].reverse() : sl.chart.values;
        s.addChart(pres.ChartType.bar, [{ name: sl.chart.unit || sl.title, labels, values }], {
          x: M, y: top, w: CW, h: H, barDir: 'col', chartColors: [C.accent], barGapWidthPct: 60,
          catAxisLabelColor: C.muted, valAxisLabelColor: C.muted, catAxisLabelFontFace: FONT, valAxisLabelFontFace: FONT,
          catAxisLabelFontSize: 14, valAxisLabelFontSize: 12, valGridLine: { color: C.line, size: 0.75 }, catAxisLineShow: false, valAxisLineShow: false,
          showValue: true, dataLabelColor: C.fg, dataLabelFontSize: 13, dataLabelPosition: 'outEnd', dataLabelFontFace: FONT,
          showLegend: false,
        });
        if (sl.chart.unit) s.addText(sl.chart.unit, T({ x: M, y: 6.45, w: CW, h: 0.3, fontSize: 11, color: C.muted }));
      }
      footer();
    });
    return pres;
  }

  /* ---------------- PDF ---------------- */
  async function toPdf(deck, lang, stage) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720], hotfixes: ['px_scaling'] });
    stage.innerHTML = '';
    const n = deck.slides.length;
    for (let i = 0; i < n; i++) {
      stage.innerHTML = slideHTML(deck.slides[i], i, n, lang, deck.title);
      const node = stage.firstElementChild;
      const url = await htmlToImage.toJpeg(node, { quality: 0.92, pixelRatio: 1.5, width: 1280, height: 720, backgroundColor: '#' + C.bg });
      if (i) pdf.addPage([1280, 720], 'landscape');
      pdf.addImage(url, 'JPEG', 0, 0, 1280, 720);
    }
    stage.innerHTML = '';
    return pdf;
  }

  window.Deck = { slideHTML, toPptx, toPdf, esc, faNum, num };
})();
