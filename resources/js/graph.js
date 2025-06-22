/* graph.js – version 11.4  (2025-06-22)
 * -----------------------------------------------------------------------
 * Responsive, collision‑free line‑chart — jQuery + Canvas
 * -----------------------------------------------------------------------
 *  NEW IN v11.4
 *  ------------
 *  • **Removed** `BORDER_GAP`, `xLabelPad`, and `yLabelPad` (margins now cover edge spacing)
 *  • Y‑axis label offset now controlled by `TICK_GAP_Y`
 *  • X‑axis label offset now controlled by `TICK_GAP_X`
 *  • Data‑tag bounding now uses chart margins instead of the old border gap
 *  • Simplified margin calculation logic
 *  • **FIXED** Canvas overflow on high-DPI mobile devices in PWA
 *
 *  PREVIOUS CHANGES … see earlier changelog entries
 * ----------------------------------------------------------------------*/

(function ($) {
  "use strict";

  /* ======= CONFIGURABLE CONSTANTS ================================= */
  const TICK_GAP_Y  = 8; // distance tick ↔︎ Y‑label
  const TICK_GAP_X  = 8;  // distance tick ↔︎ X‑label

  /* -- single‑value fallback sizes (1‑point mode) ------------------ */
  const SINGLE_H    = 0.60; /* block 60 % height */
  const SINGLE_Y_FR = 0.80; /* 80 % block for Y */
  const SINGLE_X_FR = 0.20; /* 20 % block for X */
  /* ================================================================= */

  function graph(optsIn) {
    /* ---------- default options ----------------------------------- */
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
      pxPerWidth        : null,   // max points in one visible width
      scrollable        : false,  // enable horizontal scroll
      absoluteXaxis     : false,
      nbPoints          : null,
      hideLastDataTag   : false,
      paddings : { 
        t: undefined, 
        b: undefined, 
        l: undefined, 
        r: undefined, 
        v: undefined, 
        h: undefined
      }
    }, optsIn);

    if (optsIn && optsIn.showAxes) opts.showXaxe = opts.showYaxe = true;

    /* ---------- DOM target --------------------------------------- */
    if (!opts.target || !opts.target.length)
      throw new Error("graph(): target missing");
    const $el = opts.target.eq(0);

    const prev = $el.data("graph-instance");
    if (prev) prev.destroy();

    /* ---------- container setup ---------------------------------- */
    const chartContainer = document.createElement("div");
    Object.assign(chartContainer.style, {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      boxSizing: "border-box" // Ensure proper box model
    });

    const scrollContainer = document.createElement("div");
    Object.assign(scrollContainer.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      overflowX: "hidden",
      overflowY: "hidden",
      boxSizing: "border-box" // Ensure proper box model
    });

    /* ---------- canvas setup ------------------------------------- */
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { 
      width: "100%", 
      height: "100%", 
      display: "block",
      boxSizing: "border-box", // Ensure proper box model
      maxWidth: "100%",        // Prevent overflow
      maxHeight: "100%"        // Prevent overflow
    });
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // Y‑axis canvas with true sticky positioning
    const yAxisCanvas = document.createElement("canvas");
    Object.assign(yAxisCanvas.style, {
      position: "absolute",
      left: "0",
      top: "0",
      height: "100%",
      pointerEvents: "none",
      zIndex: "10",
      display: "none", // Initially hidden
      boxSizing: "border-box", // Ensure proper box model
      maxHeight: "100%"        // Prevent overflow
    });
    const yAxisCtx = yAxisCanvas.getContext("2d");

    scrollContainer.appendChild(canvas);
    chartContainer.appendChild(scrollContainer);
    chartContainer.appendChild(yAxisCanvas);

    $el.empty().append(chartContainer);
    if ($el.css("position") === "static") $el.css("position", "relative");

    /* ---------- utilities ---------------------------------------- */
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

    /* ---------- main render -------------------------------------- */
    function redraw() {
      /* — visible dimensions with proper constraint handling — */
      const rect = $el[0].getBoundingClientRect();
      // Ensure we respect the container's actual available space
      const containerRect = chartContainer.getBoundingClientRect();
      const wVis = Math.floor(Math.min(rect.width, containerRect.width));
      const hVis = Math.floor(Math.min(rect.height, containerRect.height));
      
      if (!wVis || !hVis) return;

      /* — full data — */
      const Xsrc = opts.curveData.X, Ysrc = opts.curveData.Y;
      if (!Array.isArray(Xsrc) || Xsrc.length !== Ysrc.length || !Xsrc.length) return;

      let X = Xsrc.slice(), Y = Ysrc.slice(), n = X.length;

      /* clip by nbPoints */
      if (opts.nbPoints && n > opts.nbPoints) {
        X = X.slice(n - opts.nbPoints);
        Y = Y.slice(n - opts.nbPoints);
        n = X.length;
      }

      /* — compute additional paddings first — */
      let extraPaddingLeft = 0;
      let extraPaddingRight = 0;

      if(opts.paddings.v){
        extraPaddingLeft += opts.paddings.v;
        extraPaddingRight += opts.paddings.v;
      } else {
        extraPaddingLeft += opts.paddings.l === undefined ? 0 : opts.paddings.l;
        extraPaddingRight += opts.paddings.r === undefined ? 0 : opts.paddings.r;
      }

      /* — compute Y‑axis width including paddings — */
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
        // width = extra padding + label width + tick gap + tick + base padding
        yAxisWidth = extraPaddingLeft + 2 + TICK_GAP_Y + maxYw + tickLen;
      }

      /* — width / scroll handling — */
      let wDraw = wVis;
      let isScrollable = false;
      if (opts.pxPerWidth && opts.pxPerWidth > 0) {
        const maxVis = opts.pxPerWidth;
        if (n > maxVis) {
          if (opts.scrollable) {
            const pxPt = (wVis - yAxisWidth) / maxVis;
            wDraw = Math.round(pxPt * n) + yAxisWidth;
            
            // Ensure canvas CSS width is properly constrained
            canvas.style.width = Math.max(wDraw, wVis) + "px";
            canvas.style.maxWidth = "none"; // Allow horizontal scrolling
            
            scrollContainer.style.overflowX = "auto";
            scrollContainer.style.scrollbarWidth = "none";
            scrollContainer.style.msOverflowStyle = "none";
            scrollContainer.style.overscrollBehaviorX = 'none';
            scrollContainer.style.webkitOverflowScrolling = 'auto'; 

            scrollContainer.scrollLeft = wDraw; // stick to latest
            isScrollable = true;
          } else {
            X = X.slice(n - maxVis);
            Y = Y.slice(n - maxVis);
            n = X.length;
          }
        } else {
          canvas.style.width = "100%";
          canvas.style.maxWidth = "100%"; // Restore constraint
          scrollContainer.style.overflowX = "hidden";
        }
      } else {
        canvas.style.width = "100%";
        canvas.style.maxWidth = "100%"; // Restore constraint
        scrollContainer.style.overflowX = "hidden";
      }

      /* — Y‑axis sticky canvas ------------------------------------ */
      if (opts.showYaxe && isScrollable) {
        yAxisCanvas.style.width = yAxisWidth + "px";
        yAxisCanvas.style.display = "block";

        // Constrained device‑pixel‑ratio aware size
        const actualYAxisWidth = Math.min(yAxisWidth, wVis);
        const actualHeight = Math.min(hVis, containerRect.height);
        
        yAxisCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (yAxisCanvas.width !== actualYAxisWidth * dpr || yAxisCanvas.height !== actualHeight * dpr) {
          yAxisCanvas.width  = actualYAxisWidth * dpr;
          yAxisCanvas.height = actualHeight * dpr;
          yAxisCanvas.style.width = actualYAxisWidth + "px";
          yAxisCanvas.style.height = actualHeight + "px";
          yAxisCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        yAxisCtx.clearRect(0, 0, actualYAxisWidth, actualHeight);
        yAxisCtx.font = `${fontAxis}px sans-serif`;

        // match background color
        const bgColor = getComputedStyle($el[0]).backgroundColor || "#000";
        yAxisCtx.fillStyle = bgColor;
        yAxisCtx.fillRect(0, 0, actualYAxisWidth, actualHeight);
      } else {
        yAxisCanvas.style.display = "none";
      }

      /* — Hi‑DPI main canvas with proper constraints --------------- */
      const actualDrawWidth = isScrollable ? wDraw : Math.min(wDraw, wVis);
      const actualDrawHeight = Math.min(hVis, containerRect.height);
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (canvas.width !== actualDrawWidth * dpr || canvas.height !== actualDrawHeight * dpr) {
        canvas.width  = actualDrawWidth * dpr;
        canvas.height = actualDrawHeight * dpr;
        
        // Ensure CSS dimensions match the constrained size
        if (!isScrollable) {
          canvas.style.width = actualDrawWidth + "px";
        }
        canvas.style.height = actualDrawHeight + "px";
        
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, actualDrawWidth, actualDrawHeight);
      ctx.font = `${fontAxis}px sans-serif`;

      /* ===== single‑point mode ================================== */
      if (n === 1) {
        const xText = isDate
          ? (typeof window.formatDate === "function" ? window.formatDate(X[0]) : X[0].toLocaleDateString())
          : String(X[0]);
        const yText = String(Y[0]);

        const blkH = actualDrawHeight * SINGLE_H;
        const fY   = Math.round(blkH * SINGLE_Y_FR);
        const fX   = Math.round(blkH * SINGLE_X_FR);

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";

        ctx.textBaseline = "bottom";
        ctx.font = `${fY}px sans-serif`;
        ctx.fillText(yText, actualDrawWidth / 2, (actualDrawHeight - blkH) / 2 + fY);

        ctx.globalAlpha = 0.6;
        ctx.textBaseline = "top";
        ctx.font = `${fX}px sans-serif`;
        ctx.fillText(xText, actualDrawWidth / 2, (actualDrawHeight - blkH) / 2 + fY);
        ctx.globalAlpha = 1;
        return;
      }
      /* ============================================================ */

      /* — convert X values to numbers — */
      const Xnum = isDate ? X.map(d => d.getTime()) : X.map(Number);

      /* — margins -------------------------------------------------- */
      const margins = {
        l : opts.showYaxe ? yAxisWidth : (20 + extraPaddingLeft),
        r : 20 + extraPaddingRight,
        t : opts.showDataTag ? opts.dataTagSize * 3 : 20,
        b : opts.showXaxe ? tickLen + TICK_GAP_X + fontAxis : 20
      };

      // Apply vertical/horizontal paddings
      if(opts.paddings.h){
        margins.t += opts.paddings.h;
        margins.b += opts.paddings.h;
      } else {
        margins.t += opts.paddings.t === undefined ? 0 : opts.paddings.t;
        margins.b += opts.paddings.b === undefined ? 0 : opts.paddings.b;
      }

      const chartW = actualDrawWidth - margins.l - margins.r;
      const chartH = actualDrawHeight - margins.t  - margins.b;
      if (chartW <= 0 || chartH <= 0) return;

      /* — Y scale (flat series → pad) ----------------------------- */
      let yMin = Math.min(...Ynum), yMax = Math.max(...Ynum);
      if (yMin === yMax) { const pad = Math.max(Math.abs(yMin) * 0.1, 1); yMin -= pad; yMax += pad; }
      const y2p = v => margins.t + (1 - (v - yMin) / (yMax - yMin || 1)) * chartH;

      /* — X scale -------------------------------------------------- */
      const xMin = Xnum[0], xMax = Xnum[n - 1];
      const xPos = i => opts.absoluteXaxis
        ? margins.l + (i / ((n - 1) || 1)) * chartW
        : margins.l + ((Xnum[i] - xMin) / (xMax - xMin || 1)) * chartW;

      /* ===== GRID ================================================= */
      if (opts.showGrid) {
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const y = margins.t + (i / 5) * chartH + 0.5;
          ctx.beginPath(); ctx.moveTo(margins.l, y); ctx.lineTo(actualDrawWidth - margins.r, y); ctx.stroke();
        }
      }

      /* ===== Y‑AXIS ============================================== */
      const drawYAxis = (context, xOffset = 0) => {
        context.strokeStyle = "rgba(255,255,255,0.25)";
        context.lineWidth = 1;

        // Y‑axis line - account for padding in sticky canvas
        const axisX = xOffset + (isScrollable ? yAxisWidth - 1.1 : margins.l);
        context.beginPath(); context.moveTo(axisX, margins.t); context.lineTo(axisX, actualDrawHeight - margins.b); context.stroke();

        // ticks & labels
        const stepY = niceStep(yMax - yMin);
        const dec   = stepY >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(stepY)));
        const yStepPx = Math.abs(y2p(yMin + stepY) - y2p(yMin));
        const skip    = Math.max(1, Math.round(30 / yStepPx));

        context.fillStyle = "rgba(255,255,255,0.65)";
        context.textAlign = "right"; context.textBaseline = "middle";

        let idx = 0;
        for (let v = Math.ceil(yMin / stepY) * stepY; v <= yMax + 1e-9; v += stepY, idx++) {
          if (idx % skip) continue;
          const yy = y2p(v);

          context.strokeStyle = "rgba(255,255,255,0.25)";
          context.beginPath(); context.moveTo(axisX, yy); context.lineTo(axisX - tickLen, yy); context.stroke();

          context.fillText(v.toFixed(dec), axisX - tickLen - TICK_GAP_Y, yy);
        }
      };

      if (opts.showYaxe) {
        if (isScrollable) {
          drawYAxis(yAxisCtx, 0); // sticky canvas
        } else {
          drawYAxis(ctx, 0);      // main canvas
        }
      }

      /* ===== X‑AXIS ============================================= */
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      if (opts.showXaxe) {
        ctx.beginPath(); ctx.moveTo(margins.l, actualDrawHeight - margins.b); ctx.lineTo(actualDrawWidth - margins.r, actualDrawHeight - margins.b); ctx.stroke();
      }

      /* ===== X ticks & labels =================================== */
      const labelled = new Set();
      if (opts.showXaxe) {
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.textAlign = "center"; ctx.textBaseline = "top";

        let lastR = -Infinity;
        const axisY = actualDrawHeight - margins.b;
        const lLim = margins.l, rLim = actualDrawWidth - margins.r;

        for (let i = 0; i < n; i++) {
          const xp  = xPos(i);
          const lbl = isDate
            ? (typeof window.formatDate === "function" ? window.formatDate(X[i]) : X[i].toLocaleDateString())
            : String(X[i]);
          const lblW = ctx.measureText(lbl).width;

          let xLbl = xp, half = lblW / 2;
          if (xLbl - half < lLim) xLbl = lLim + half;
          else if (xLbl + half > rLim) xLbl = rLim - half;
          if (xLbl - half < lastR + 15) continue; // avoid overlap

          ctx.beginPath(); ctx.moveTo(xp, axisY); ctx.lineTo(xp, axisY + tickLen); ctx.stroke();
          ctx.fillText(lbl, xLbl, axisY + tickLen + TICK_GAP_X);

          lastR = xLbl + half; labelled.add(i);
        }
      }

      /* ===== POLYLINE =========================================== */
      ctx.lineWidth = opts.lineWidth; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = opts.curveData.color;
      ctx.beginPath(); ctx.moveTo(xPos(0), y2p(Ynum[0]));
      for (let i = 1; i < n; i++) ctx.lineTo(xPos(i), y2p(Ynum[i]));
      ctx.stroke();

      /* ===== GRADIENT FILL ====================================== */
      const gStops = Array.isArray(opts.gradientStops) && opts.gradientStops.length
        ? opts.gradientStops
        : [{ pos: 0, alpha: 0.6 }, { pos: 0.4, alpha: 0.3 }, { pos: 0.85, alpha: 0 }];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xPos(0), y2p(Ynum[0]));
      for (let i = 1; i < n; i++) ctx.lineTo(xPos(i), y2p(Ynum[i]));
      ctx.lineTo(xPos(n - 1), actualDrawHeight - margins.b);
      ctx.lineTo(xPos(0), actualDrawHeight - margins.b);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, margins.t, 0, actualDrawHeight - margins.b);
      gStops.forEach(s => grad.addColorStop(Math.max(0, Math.min(1, s.pos)), rgba(opts.curveData.color, s.alpha)));
      ctx.fillStyle = grad; ctx.fill(); ctx.restore();

      /* ===== DOTS =============================================== */
      if (opts.showDots) {
        const r = Math.max(1, opts.dotSize);
        ctx.fillStyle = opts.dotColor || opts.curveData.color;
        for (let i = 1; i < n; i++) {
          ctx.beginPath(); ctx.arc(xPos(i), y2p(Ynum[i]), r, 0, Math.PI * 2); ctx.fill();
        }
      }

      /* ===== DATA TAGS ========================================== */
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

          // keep inside canvas area (allow tags above chart grid)
          const lLim = margins.l;
          const rLim = actualDrawWidth - margins.r - boxW;
          const tLim = 0; // Allow tags to go to the very top of canvas
          if (tx < lLim)       tx = lLim;
          else if (tx > rLim)  tx = rLim;
          if (ty < tLim)       ty = tLim;

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

    /* ---------- observe & API ----------------------------------- */
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