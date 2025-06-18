/* graph.js – version 10.4  (2025‑06‑18)
 * -----------------------------------------------------------------------
 * Responsive, collision‑free line‑chart — jQuery + Canvas (no scroll)
 * -----------------------------------------------------------------------
 *  NEW IN v10.4 – single‑point mode
 *  --------------------------------
 *  • When the dataset contains **exactly one point** (`curveData.X.length === 1`)
 *    the chart switches to a special display:
 *       – No axes, no grid, no line.
 *       – In the centre: the X value (large font),
 *         and just beneath it, the associated Y value (smaller font).
 *  • Normal multi‑point behaviour unchanged.
 * -----------------------------------------------------------------------*/

(function ($) {
  "use strict";

  /* ======= INTERNAL CONSTANTS (edit here) ============================ */
  const TICK_LABEL_GAP_Y = 6;   // distance tick ↔ Y label
  const TICK_LABEL_GAP_X = 6;   // distance tick ↔ X label
  
  const SINGLE_BLOCK_RATIO = 0.6;   // 70 % of canvas height
  const SINGLE_Y_RATIO    = 0.8;    // 60 % of that block for X
  const SINGLE_X_RATIO    = 0.2;
  /* =================================================================== */

  function graph(options) {
    /* ----- merge defaults ------------------------------------------- */
    const opts = $.extend({
      target: null,
      curveData: { X: [], Y: [], color: "#00bfff" },
      lineWidth: 2,
      dotColor: null,
      dotSize: 3,
      gradientStops: null,
      showGrid: false,
      showXaxe: false,
      showYaxe: false,
      showDots: false,
      showDataTag: false,
      dataTagPrecision: 2,
      dataTagSize: 12,
      dataTagSpacing: 30,
      yLabelPad: 0,
      xLabelPad: 0,
      pxPerPoint: null,
      nbPoints: null 
    }, options);

    /* back‑compat – showAxes:true */
    if (options && options.showAxes) opts.showXaxe = opts.showYaxe = true;

    /* ----- target checks -------------------------------------------- */
    if (!opts.target || !opts.target.length) throw new Error("graph(): target missing");
    const $el = opts.target.eq(0);

    const prev = $el.data("graph-instance");
    if (prev) prev.destroy();

    /* ----- canvas setup --------------------------------------------- */
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    $el.empty().append(canvas);
    if ($el.css("position") === "static") $el.css("position", "relative");
    $el.css({ overflowX: "hidden", overflowY: "hidden" });

    /* ----- helpers --------------------------------------------------- */
    const rgba = (hex, a) => {
      hex = hex.replace('#', ''); if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const n = parseInt(hex, 16);
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
    };

    const niceStep = r => {
      const t = r / 5;
      const p = Math.pow(10, Math.floor(Math.log10(t)));
      const m = t / p;
      return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
    };

    /* ----- main draw ------------------------------------------------- */
    function redraw() {
      const rect = $el[0].getBoundingClientRect();
      const wCSS = Math.round(rect.width);
      const hCSS = Math.round(rect.height);
      if (!wCSS || !hCSS) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (canvas.width !== wCSS * dpr || canvas.height !== hCSS * dpr) {
        canvas.width = wCSS * dpr;
        canvas.height = hCSS * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, wCSS, hCSS);


      /* ----- data checks --------------------------------------------- */
      const Xsrc = opts.curveData.X, Ysrc = opts.curveData.Y;
      if (!Array.isArray(Xsrc) || Xsrc.length !== Ysrc.length || !Xsrc.length) return;
      let X = Xsrc, Y = Ysrc, n = Xsrc.length;

      /* ----- data slicing (nbPoints) ------------------------------ */
      if (opts.nbPoints && opts.nbPoints > 0 && n > opts.nbPoints) {
        X = Xsrc.slice(n - opts.nbPoints);
        Y = Ysrc.slice(n - opts.nbPoints);
        n = X.length;
      }

      /* ----- data slicing (pxPerPoint) ------------------------------ */
      if (opts.pxPerPoint && opts.pxPerPoint > 0) {
        const maxPts = Math.floor(wCSS / opts.pxPerPoint);
        if (maxPts > 0 && n > maxPts) {
          X = Xsrc.slice(n - maxPts);
          Y = Ysrc.slice(n - maxPts);
          n = X.length;
        }
      }

      /* ===== SINGLE‑POINT MODE ===================================== */
      if(n===1){
        const isDate=X[0] instanceof Date;
        const xLabel=isDate?(typeof window.formatDate==='function'?window.formatDate(X[0]):X[0].toLocaleDateString()):String(X[0]);
        const yLabel=String(Y[0]);

        const blockH = hCSS * SINGLE_BLOCK_RATIO;
        const fontX  = Math.round(blockH * SINGLE_X_RATIO);
        const fontY  = Math.round(blockH * SINGLE_Y_RATIO);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';

        ctx.save();                       // isolate state changes
        ctx.globalAlpha   = 1;            // reset opacity
        ctx.textBaseline  = 'bottom';
        ctx.font          = `${fontY}px sans-serif`;
        ctx.fillText(yLabel, wCSS / 2, (hCSS - blockH) / 2 + fontY);
        ctx.restore();                    // restores previous state

        // --- X label: semi-transparent ------------------------------
        ctx.save();
        ctx.globalAlpha   = 0.6;          // only this draw uses 60 % opacity
        ctx.textBaseline  = 'top';
        ctx.font          = `${fontX}px sans-serif`;
        ctx.fillText(xLabel, wCSS / 2, (hCSS - blockH) / 2 + fontY);
        ctx.restore();             

        return;
      }
      /* ===== END SINGLE‑POINT MODE ================================= */

      const isDate = X[0] instanceof Date;
      const Xnum = isDate ? X.map(d => d.getTime()) : X.map(Number);
      const Ynum = Y.map(Number);

      /* ----- fonts & metrics --------------------------------------- */
      const tickLen = 5;
      const fontAxis = 12;
      ctx.font = `${fontAxis}px sans-serif`;

      /* max Y‑label width */
      let maxLabelW = 0;
      if (opts.showYaxe) {
        const yMinTmp = Math.min(...Ynum);
        const yMaxTmp = Math.max(...Ynum);
        const stTmp = niceStep(yMaxTmp - yMinTmp);
        const decTmp = stTmp >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(stTmp)));
        maxLabelW = Math.max(
          ctx.measureText(yMinTmp.toFixed(decTmp)).width,
          ctx.measureText(yMaxTmp.toFixed(decTmp)).width
        );
      }

      /* ----- margins ------------------------------------------------ */
      const margins = {
        left: opts.showYaxe ? (2 + opts.yLabelPad + maxLabelW + TICK_LABEL_GAP_Y + tickLen) : 20,
        right: 20,
        top: opts.showDataTag ? opts.dataTagSize * 3 : 20,
        bottom: opts.showXaxe ? (opts.xLabelPad + tickLen + TICK_LABEL_GAP_X + fontAxis) : 20
      };

      const chartW = wCSS - margins.left - margins.right;
      const chartH = hCSS - margins.top - margins.bottom;
      if (chartW <= 0 || chartH <= 0) return;

      /* ----- scales ------------------------------------------------- */
      const xMin = Xnum[0], xMax = Xnum[n - 1];
      const yMin = Math.min(...Ynum), yMax = Math.max(...Ynum);
      const x2p = v => margins.left + ((v - xMin) / (xMax - xMin || 1)) * chartW;
      const y2p = v => margins.top + (1 - (v - yMin) / (yMax - yMin || 1)) * chartH;

      /* ----- grid --------------------------------------------------- */
      if (opts.showGrid) {
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const yL = margins.top + (i / 5) * chartH + 0.5;
          ctx.beginPath();
          ctx.moveTo(margins.left, yL);
          ctx.lineTo(wCSS - margins.right, yL);
          ctx.stroke();
        }
      }

      /* ----- axes lines -------------------------------------------- */
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      if (opts.showYaxe) {
        ctx.beginPath();
        ctx.moveTo(margins.left, margins.top);
        ctx.lineTo(margins.left, hCSS - margins.bottom);
        ctx.stroke();
      }
      if (opts.showXaxe) {
        ctx.beginPath();
        ctx.moveTo(margins.left, hCSS - margins.bottom);
        ctx.lineTo(wCSS - margins.right, hCSS - margins.bottom);
        ctx.stroke();
      }

      /* ----- Y ticks & labels -------------------------------------- */
      if (opts.showYaxe) {
        const stepY = niceStep(yMax - yMin);
        const dec = stepY >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(stepY)));
        const yStepPx = Math.abs(y2p(yMin + stepY) - y2p(yMin));
        const minGapY = 25;
        const skip = Math.max(1, Math.round(minGapY / yStepPx));

        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let idx = 0;
        for (let v = Math.ceil(yMin / stepY) * stepY; v <= yMax + 1e-9; v += stepY, idx++) {
          if (idx % skip) continue;
          const yy = y2p(v);
          ctx.beginPath();
          ctx.moveTo(margins.left, yy);
          ctx.lineTo(margins.left - tickLen, yy);
          ctx.stroke();
          ctx.fillText(v.toFixed(dec), 2 + opts.yLabelPad, yy);
        }
      }

      /* ----- X ticks & labels -------------------------------------- */
      const labelledIdx = new Set();
      if (opts.showXaxe) {
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const minGapX = 15;
        let lastRight = -Infinity;
        const axisY = hCSS - margins.bottom;
        for (let i = 0; i < n; i++) {
          const xp = x2p(Xnum[i]);
          const lbl = isDate ? (typeof window.formatDate === 'function' ? window.formatDate(X[i]) : X[i].toLocaleDateString()) : String(X[i]);
          const lblW = ctx.measureText(lbl).width;
          if (xp - lblW / 2 < margins.left || xp + lblW / 2 > wCSS - margins.right) continue;
          if (xp - lblW / 2 < lastRight + minGapX) continue;
          ctx.beginPath();
          ctx.moveTo(xp, axisY);
          ctx.lineTo(xp, axisY + tickLen);
          ctx.stroke();
          ctx.fillText(lbl, xp, axisY + tickLen + TICK_LABEL_GAP_X + opts.xLabelPad);
          lastRight = xp + lblW / 2;
          labelledIdx.add(i);
        }
      }

      /* ----- polyline ---------------------------------------------- */
      ctx.lineWidth = opts.lineWidth;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = opts.curveData.color;
      ctx.beginPath();
      ctx.moveTo(x2p(Xnum[0]), y2p(Ynum[0]));
      for (let i = 1; i < n; i++) ctx.lineTo(x2p(Xnum[i]), y2p(Ynum[i]));
      ctx.stroke();

      /* ----- gradient fill ----------------------------------------- */
      const gStops = Array.isArray(opts.gradientStops) && opts.gradientStops.length ? opts.gradientStops : [
        { pos: 0, alpha: 0.6 }, { pos: 0.4, alpha: 0.3 }, { pos: 0.85, alpha: 0 }
      ];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x2p(Xnum[0]), y2p(Ynum[0]));
      for (let i = 1; i < n; i++) ctx.lineTo(x2p(Xnum[i]), y2p(Ynum[i]));
      ctx.lineTo(x2p(Xnum[n - 1]), hCSS - margins.bottom);
      ctx.lineTo(x2p(Xnum[0]), hCSS - margins.bottom);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, margins.top, 0, hCSS - margins.bottom);
      gStops.forEach(s => grad.addColorStop(Math.max(0, Math.min(1, s.pos)), rgba(opts.curveData.color, s.alpha)));
      ctx.fillStyle = grad; ctx.fill(); ctx.restore();

      /* ----- dots --------------------------------------------------- */
      if (opts.showDots) {
        const rDot = Math.max(1, opts.dotSize);
        ctx.fillStyle = opts.dotColor || opts.curveData.color;
        for (let i = 0; i < n; i++) {
          ctx.beginPath(); ctx.arc(x2p(Xnum[i]), y2p(Ynum[i]), rDot, 0, Math.PI * 2); ctx.fill();
        }
      }

      /* ----- data‑tags --------------------------------------------- */
      if (opts.showDataTag) {
        const fPx = opts.dataTagSize;
        ctx.font = `${fPx}px sans-serif`;
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        const padX = Math.round(fPx * 0.5), padY = Math.round(fPx * 0.35);
        const radiusTag = 4;
        const clearY = Math.max(opts.showDots ? opts.dotSize : 0, opts.lineWidth / 2) + 8;
        const minDX = opts.dataTagSpacing;

        const orderedIdx = [...labelledIdx].sort((a,b)=>b-a).concat([...Array(n).keys()].filter(i=>!labelledIdx.has(i)).sort((a,b)=>b-a));
        const placed = [];
        for (const i of orderedIdx) {
          const txt = Ynum[i].toFixed(opts.dataTagPrecision);
          const tW = ctx.measureText(txt).width;
          const boxW = tW + padX * 2;
          const boxH = fPx + padY * 2;
          const cx = x2p(Xnum[i]);
          const cy = y2p(Ynum[i]);
          const tx = cx - boxW / 2;
          const ty = cy - boxH - clearY;
          if (tx < margins.left || tx + boxW > wCSS - margins.right || ty < 0) continue;
          if (placed.some(px => Math.abs(px - cx) < minDX)) continue;
          placed.push(cx);
          ctx.fillStyle = opts.curveData.color;
          ctx.beginPath();
          ctx.moveTo(tx + radiusTag, ty);
          ctx.lineTo(tx + boxW - radiusTag, ty);
          ctx.quadraticCurveTo(tx + boxW, ty, tx + boxW, ty + radiusTag);
          ctx.lineTo(tx + boxW, ty + boxH - radiusTag);
          ctx.quadraticCurveTo(tx + boxW, ty + boxH, tx + boxW - radiusTag, ty + boxH);
          ctx.lineTo(tx + radiusTag, ty + boxH);
          ctx.quadraticCurveTo(tx, ty + boxH, tx, ty + boxH - radiusTag);
          ctx.lineTo(tx, ty + radiusTag);
          ctx.quadraticCurveTo(tx, ty, tx + radiusTag, ty);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.fillText(txt, cx, ty + boxH / 2);
        }
      }
    }

    /* ----- observe & expose --------------------------------------- */
    const ro = new ResizeObserver(redraw);
    ro.observe($el[0]);
    window.addEventListener('resize', redraw);
    redraw();

    const api = {
      redraw,
      destroy() {
        ro.disconnect();
        window.removeEventListener('resize', redraw);
        $(canvas).remove();
      }
    };
    $el.data("graph-instance", api);
    return api;
  }

  window.graph = graph;
})(jQuery);
