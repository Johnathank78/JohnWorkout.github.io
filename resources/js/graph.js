/* graph.js – version 11.3  (2025-06-22)
 * -----------------------------------------------------------------------
 * Responsive, collision-free line-chart — jQuery + Canvas
 * -----------------------------------------------------------------------
 *  NEW IN v11.3
 *  ------------
 *  • Fixed performance issues with sticky Y-axis
 *  • Y-axis now uses true CSS sticky positioning
 *  • Eliminated scroll event redraws for better performance
 *  • No more visual glitches during horizontal scroll
 * 
 *  NEW IN v11.2
 *  ------------
 *  • Fixed sticky Y-axis for scrollable charts
 *  • Y-axis labels now stay visible during horizontal scroll
 *  • Nothing draws to the left of Y-axis line
 * 
 *  NEW IN v11.1
 *  ------------
 *  • `absoluteXaxis` (bool) :
 *        false (défaut) → échelle X proportionnelle au temps (dates).
 *        true           → espacement horizontal égal point-par-point,
 *                         quelle que soit la distance réelle entre dates.
 * ----------------------------------------------------------------------*/

(function ($) {
  "use strict";

  /* ======= CONSTANTES RÉGLABLES ==================================== */
  const TICK_GAP_Y  = 12;
  const TICK_GAP_X  = 8;
  const BORDER_GAP  = 6;
  const SINGLE_H    = 0.60; /* bloc 60 % hauteur */
  const SINGLE_Y_FR = 0.80; /* 80 % bloc pour Y */
  const SINGLE_X_FR = 0.20; /* 20 % bloc pour X */
  /* ================================================================= */

  function graph(optsIn) {
    /* ---------- options par défaut -------------------------------- */
    const opts = $.extend({
      target            : null,
      curveData         : { X: [], Y: [], color: "#00bfff" },
      lineWidth         : 2,
      dotColor          : null,
      dotSize           : 3,
      gradientStops     : null,
      showGrid          : false,
      showXaxe          : false,
      showYaxe          : false,
      showDots          : false,
      showDataTag       : false,
      dataTagPrecision  : 2,
      dataTagSize       : 12,
      dataTagSpacing    : 30,
      yLabelPad         : 0,
      xLabelPad         : 0,
      pxPerWidth        : null,    // max points dans une largeur visible
      scrollable        : false,   // activer le scroll horiz.
      absoluteXaxis     : false,
      nbPoints          : null,
      hideLastDataTag   : false
    }, optsIn);

    if (optsIn && optsIn.showAxes) opts.showXaxe = opts.showYaxe = true;

    /* ---------- cible DOM ----------------------------------------- */
    if (!opts.target || !opts.target.length)
      throw new Error("graph(): target missing");
    const $el = opts.target.eq(0);

    const prev = $el.data("graph-instance");
    if (prev) prev.destroy();

    /* ---------- container setup ----------------------------------- */
    const chartContainer = document.createElement("div");
    Object.assign(chartContainer.style, {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden"
    });

    const scrollContainer = document.createElement("div");
    Object.assign(scrollContainer.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      overflowX: "hidden",
      overflowY: "hidden"
    });

    /* ---------- canvas setup -------------------------------------- */
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // Y-axis canvas with true sticky positioning
    const yAxisCanvas = document.createElement("canvas");
    Object.assign(yAxisCanvas.style, { 
      position: "absolute",
      left: "0",
      top: "0",
      height: "100%",
      pointerEvents: "none",
      zIndex: "10",
      display: "none" // Initially hidden
    });
    const yAxisCtx = yAxisCanvas.getContext("2d");

    scrollContainer.appendChild(canvas);
    chartContainer.appendChild(scrollContainer);
    chartContainer.appendChild(yAxisCanvas);

    $el.empty().append(chartContainer);
    if ($el.css("position") === "static") $el.css("position", "relative");

    /* ---------- utilitaires --------------------------------------- */
    const rgba = (hex, a) => {
      hex = hex.replace("#", "");
      if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
      const n = parseInt(hex, 16);
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
    };
    const niceStep = r => {
      const t = r / 5, p = Math.pow(10, Math.floor(Math.log10(t)));
      const m = t / p;
      return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
    };

    /* ---------- rendu principal ----------------------------------- */
    function redraw() {
      /* — dimensions visibles — */
      const rect = $el[0].getBoundingClientRect();
      const wVis = Math.round(rect.width);
      const hVis = Math.round(rect.height);
      if (!wVis || !hVis) return;

      /* — données complètes — */
      const Xsrc = opts.curveData.X, Ysrc = opts.curveData.Y;
      if (!Array.isArray(Xsrc) || Xsrc.length !== Ysrc.length || !Xsrc.length) return;

      let X = Xsrc.slice(), Y = Ysrc.slice(), n = X.length;

      /* découpe par nbPoints */
      if (opts.nbPoints && n > opts.nbPoints) {
        X = X.slice(n - opts.nbPoints);
        Y = Y.slice(n - opts.nbPoints);
        n = X.length;
      }

      /* — calculate Y-axis width first — */
      const isDate = X[0] instanceof Date;
      const Ynum = Y.map(Number);
      const tickLen = 5, fontAxis = 12;
      ctx.font = `${fontAxis}px sans-serif`;

      let yAxisWidth = 0;
      if (opts.showYaxe) {
        const st = niceStep(Math.max(...Ynum) - Math.min(...Ynum)) || 0.5;
        const dec = st >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(st)));
        const maxYw = Math.max(
          ctx.measureText(Math.min(...Ynum).toFixed(dec)).width,
          ctx.measureText(Math.max(...Ynum).toFixed(dec)).width
        );
        yAxisWidth = 2 + opts.yLabelPad + maxYw + TICK_GAP_Y + tickLen;
      }

      /* — gestion largeur / scroll — */
      let wDraw = wVis;
      let isScrollable = false;
      if (opts.pxPerWidth && opts.pxPerWidth > 0) {
        const maxVis = opts.pxPerWidth;
        if (n > maxVis) {
          if (opts.scrollable) {
            const pxPt = (wVis - yAxisWidth) / maxVis;
            wDraw = Math.round(pxPt * n) + yAxisWidth;
            canvas.style.width = wDraw + "px";
            scrollContainer.style.overflowX = "auto";
            scrollContainer.style.scrollbarWidth = "none";
            scrollContainer.style.msOverflowStyle = "none";
            
            scrollContainer.scrollLeft = wDraw; 
            isScrollable = true;
          } else {
            X = X.slice(n - maxVis);
            Y = Y.slice(n - maxVis);
            n = X.length;
          }
        } else {
          canvas.style.width = "100%";
          scrollContainer.style.overflowX = "hidden";
        }
      } else {
        canvas.style.width = "100%";
        scrollContainer.style.overflowX = "hidden";
      }

      /* — Setup Y-axis canvas (render once, position with CSS) — */
      if (opts.showYaxe && isScrollable) {
        yAxisCanvas.style.width = yAxisWidth + "px";
        yAxisCanvas.style.display = "block";
        
        // Set up Y-axis canvas dimensions
        yAxisCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (yAxisCanvas.width !== yAxisWidth * dpr || yAxisCanvas.height !== hVis * dpr) {
          yAxisCanvas.width = yAxisWidth * dpr;
          yAxisCanvas.height = hVis * dpr;
          yAxisCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        yAxisCtx.clearRect(0, 0, yAxisWidth, hVis);
        yAxisCtx.font = `${fontAxis}px sans-serif`;
        
        // Get background color from container
        const bgColor = getComputedStyle($el[0]).backgroundColor || "#000";
        yAxisCtx.fillStyle = bgColor;
        yAxisCtx.fillRect(0, 0, yAxisWidth, hVis);
      } else {
        yAxisCanvas.style.display = "none";
      }

      /* — Hi-DPI main canvas — */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (canvas.width !== wDraw * dpr || canvas.height !== hVis * dpr) {
        canvas.width = wDraw * dpr;
        canvas.height = hVis * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, wDraw, hVis);
      ctx.font = `${fontAxis}px sans-serif`;

      /* ===== mode 1 seul point ==================================== */
      if (n === 1) {
        const xText = isDate
          ? (typeof window.formatDate === "function"
              ? window.formatDate(X[0])
              : X[0].toLocaleDateString())
          : String(X[0]);
        const yText = String(Y[0]);

        const blkH = hVis * SINGLE_H;
        const fY = Math.round(blkH * SINGLE_Y_FR);
        const fX = Math.round(blkH * SINGLE_X_FR);

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";

        ctx.textBaseline = "bottom";
        ctx.font = `${fY}px sans-serif`;
        ctx.fillText(yText, wDraw / 2, (hVis - blkH) / 2 + fY);

        ctx.globalAlpha = 0.6;
        ctx.textBaseline = "top";
        ctx.font = `${fX}px sans-serif`;
        ctx.fillText(xText, wDraw / 2, (hVis - blkH) / 2 + fY);
        ctx.globalAlpha = 1;
        return;
      }
      /* ============================================================ */

      /* — mise en nombres — */
      const Xnum = isDate ? X.map(d => d.getTime()) : X.map(Number);

      const margins = {
        left  : opts.showYaxe ? yAxisWidth : 20,
        right : 20,
        top   : opts.showDataTag ? opts.dataTagSize * 3 : 20,
        bottom: opts.showXaxe ? opts.xLabelPad + tickLen + TICK_GAP_X + fontAxis : 20
      };

      const chartW = wDraw - margins.left - margins.right;
      const chartH = hVis - margins.top - margins.bottom;
      if (chartW <= 0 || chartH <= 0) return;

      /* échelle Y (flat series → pad) */
      let yMin = Math.min(...Ynum), yMax = Math.max(...Ynum);
      if (yMin === yMax) { const pad = Math.max(Math.abs(yMin) * 0.1, 1); yMin -= pad; yMax += pad; }
      const y2p = v => margins.top + (1 - (v - yMin) / (yMax - yMin || 1)) * chartH;

      /* échelle X : dépend de absoluteXaxis */
      const xMin = Xnum[0], xMax = Xnum[n - 1];
      const xPos = i => opts.absoluteXaxis
        ? margins.left + (i / ((n - 1) || 1)) * chartW
        : margins.left + ((Xnum[i] - xMin) / (xMax - xMin || 1)) * chartW;

      /* ===== GRILLE ================================================= */
      if (opts.showGrid) {
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const y = margins.top + (i / 5) * chartH + 0.5;
          ctx.beginPath(); 
          ctx.moveTo(margins.left, y); 
          ctx.lineTo(wDraw - margins.right, y); 
          ctx.stroke();
        }
      }

      /* ===== Y-AXIS ================================================ */
      const drawYAxis = (context, xOffset = 0) => {
        context.strokeStyle = "rgba(255,255,255,0.25)";
        context.lineWidth = 1;
        
        // Y-axis line
        const axisX = xOffset + (isScrollable ? yAxisWidth - 1.1 : margins.left);

        context.beginPath(); 
        context.moveTo(axisX, margins.top); 
        context.lineTo(axisX, hVis - margins.bottom); 
        context.stroke();

        // Y-axis ticks and labels
        const stepY = niceStep(yMax - yMin);
        const dec = stepY >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(stepY)));
        const yStepPx = Math.abs(y2p(yMin + stepY) - y2p(yMin));
        const skip = Math.max(1, Math.round(30 / yStepPx));

        context.fillStyle = "rgba(255,255,255,0.65)";
        context.textAlign = "right"; 
        context.textBaseline = "middle";

        let idx = 0;
        for (let v = Math.ceil(yMin / stepY) * stepY; v <= yMax + 1e-9; v += stepY, idx++) {
          if (idx % skip) continue;
          const yy = y2p(v);
          
          context.strokeStyle = "rgba(255,255,255,0.25)";
          context.lineWidth = 1;
          context.beginPath(); 
          context.moveTo(axisX, yy); 
          context.lineTo(axisX - tickLen, yy); 
          context.stroke();
          
          context.fillStyle = "rgba(255,255,255,0.65)";
          context.fillText(v.toFixed(dec), axisX - tickLen - opts.yLabelPad, yy);
        }
      };

      if (opts.showYaxe) {
        if (isScrollable) {
          // Draw Y-axis on separate sticky canvas
          drawYAxis(yAxisCtx, 0);
        } else {
          // Draw Y-axis on main canvas
          drawYAxis(ctx, 0);
        }
      }

      /* ===== X-AXIS =============================================== */
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      if (opts.showXaxe) {
        ctx.beginPath(); 
        ctx.moveTo(margins.left, hVis - margins.bottom); 
        ctx.lineTo(wDraw - margins.right, hVis - margins.bottom); 
        ctx.stroke();
      }

      /* ===== TICKS X & LABELS ====================================== */
      const labelled = new Set();
      if (opts.showXaxe) {
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.textAlign = "center"; ctx.textBaseline = "top";

        let lastR = -Infinity;
        const axisY = hVis - margins.bottom;
        const lLim = margins.left, rLim = wDraw - margins.right;

        for (let i = 0; i < n; i++) {
          const xp = xPos(i);
          const lbl = isDate
            ? (typeof window.formatDate === "function" ? window.formatDate(X[i]) : X[i].toLocaleDateString())
            : String(X[i]);
          const lblW = ctx.measureText(lbl).width;

          let xLbl = xp, half = lblW / 2;
          if (xLbl - half < lLim) xLbl = lLim + half;
          else if (xLbl + half > rLim) xLbl = rLim - half;
          if (xLbl - half < lastR + 15) continue;

          ctx.beginPath(); ctx.moveTo(xp, axisY); ctx.lineTo(xp, axisY + tickLen); ctx.stroke();
          ctx.fillText(lbl, xLbl, axisY + tickLen + TICK_GAP_X + opts.xLabelPad);

          lastR = xLbl + half; labelled.add(i);
        }
      }

      /* ===== POLYLINE ============================================== */
      ctx.lineWidth = opts.lineWidth; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = opts.curveData.color;
      ctx.beginPath(); ctx.moveTo(xPos(0), y2p(Ynum[0]));
      for (let i = 1; i < n; i++) ctx.lineTo(xPos(i), y2p(Ynum[i]));
      ctx.stroke();

      /* ===== GRADIENT FILL ========================================= */
      const gStops = Array.isArray(opts.gradientStops) && opts.gradientStops.length
        ? opts.gradientStops
        : [{ pos: 0, alpha: 0.6 }, { pos: 0.4, alpha: 0.3 }, { pos: 0.85, alpha: 0 }];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xPos(0), y2p(Ynum[0]));
      for (let i = 1; i < n; i++) ctx.lineTo(xPos(i), y2p(Ynum[i]));
      ctx.lineTo(xPos(n - 1), hVis - margins.bottom);
      ctx.lineTo(xPos(0), hVis - margins.bottom);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, margins.top, 0, hVis - margins.bottom);
      gStops.forEach(s => grad.addColorStop(Math.max(0, Math.min(1, s.pos)), rgba(opts.curveData.color, s.alpha)));
      ctx.fillStyle = grad; ctx.fill(); ctx.restore();

      /* ===== DOTS ================================================== */
      if (opts.showDots) {
        const r = Math.max(1, opts.dotSize);
        ctx.fillStyle = opts.dotColor || opts.curveData.color;
        for (let i = 1; i < n; i++) { 
          ctx.beginPath(); 
          ctx.arc(xPos(i), y2p(Ynum[i]), r, 0, Math.PI * 2); 
          ctx.fill(); 
        }
      }

      /* ===== DATA-TAGS ============================================ */
      if (opts.showDataTag) {
        const fPx = opts.dataTagSize;
        ctx.font = `${fPx}px sans-serif`;
        ctx.textBaseline = "middle"; ctx.textAlign = "center";

        const padX = Math.round(fPx * 0.5), padY = Math.round(fPx * 0.35);
        const radius = 4;
        const clearY = Math.max(opts.showDots ? opts.dotSize : 0, opts.lineWidth / 2) + 8;
        const minDX = opts.dataTagSpacing;

        let order = [...labelled].sort((a, b) => b - a)
          .concat([...Array(n).keys()].filter(i => !labelled.has(i)).sort((a, b) => b - a));
        if (opts.hideLastDataTag) order = order.filter(i => i !== n - 1);

        const placed = [];
        for (const i of order) {
          const txt = Ynum[i].toFixed(opts.dataTagPrecision);
          const tW = ctx.measureText(txt).width;
          const boxW = tW + padX * 2, boxH = fPx + padY * 2;

          const cx = xPos(i), cy = y2p(Ynum[i]);
          let tx = cx - boxW / 2, ty = cy - boxH - clearY;

          // Ensure data tags don't go to the left of Y-axis
          const lLim = margins.left + BORDER_GAP;
          const rLim = wDraw - margins.right - BORDER_GAP - boxW;
          const tLim = BORDER_GAP;
          if (tx < lLim) tx = lLim; else if (tx > rLim) tx = rLim;
          if (ty < tLim) ty = tLim;

          const cxDraw = tx + boxW / 2;
          if (placed.some(px => Math.abs(px - cxDraw) < minDX)) continue;
          placed.push(cxDraw);

          ctx.fillStyle = opts.curveData.color;
          ctx.beginPath();
          ctx.moveTo(tx + radius, ty);
          ctx.lineTo(tx + boxW - radius, ty);
          ctx.quadraticCurveTo(tx + boxW, ty, tx + boxW, ty + radius);
          ctx.lineTo(tx + boxW, ty + boxH - radius);
          ctx.quadraticCurveTo(tx + boxW, ty + boxH, tx + boxW - radius, ty + boxH);
          ctx.lineTo(tx + radius, ty + boxH);
          ctx.quadraticCurveTo(tx, ty + boxH, tx, ty + boxH - radius);
          ctx.lineTo(tx, ty + radius);
          ctx.quadraticCurveTo(tx, ty, tx + radius, ty);
          ctx.closePath(); ctx.fill();

          ctx.fillStyle = "#fff"; ctx.fillText(txt, cxDraw, ty + boxH / 2);
        }
      }
    }

    /* ---------- observe & API ------------------------------------- */
    const ro = new ResizeObserver(redraw);
    ro.observe($el[0]);
    $(window).on("resize", redraw);
    redraw();

    const api = {
      redraw,
      destroy() {
        ro.disconnect();
        $(window).off("resize", redraw);
        $(chartContainer).remove();
      }
    };
    $el.data("graph-instance", api);
    return api;
  }

  window.graph = graph;
})(jQuery);