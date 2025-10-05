/* script.js - corrected version
   Fix: ensure we create one piece per grid-cell (cols * rows),
   so the entire image is covered. Keep requested count visible
   and show actual pieces used separately.
*/

(() => {
  // DOM nodes
  const boardEl = document.getElementById('board');
  const stagingEl = document.getElementById('staging');
  const imgFile = document.getElementById('imgfile');
  const sampleBtn = document.getElementById('sampleBtn');
  const createBtn = document.getElementById('createBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const showBtn = document.getElementById('showBtn');
  const hintBtn = document.getElementById('hintBtn');
  const snapToggle = document.getElementById('snapToggle');
  const difficulty = document.getElementById('difficulty');
  const reqPiecesEl = document.getElementById('reqPieces');
  const actualPiecesEl = document.getElementById('actualPieces');
  const placedEl = document.getElementById('placed');
  const topHelper = document.getElementById('topHelper');
  const dismissHelper = document.getElementById('dismissHelper');
  const completeBanner = document.getElementById('completeBanner');

  // state
  let boardCanvasOff = null;
  let boardW = 600, boardH = 400;
  let pieces = [];
  let piecesLayer = null;
  let placedCount = 0;
  let snap = true;
  let hintVisible = true;
  let dragging = null;
  let currentImage = null;

  const SAMPLE_URL = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop';

  function ensurePiecesLayer() {
    if (!piecesLayer) {
      piecesLayer = boardEl.querySelector('.pieces-layer');
      if (!piecesLayer) {
        piecesLayer = document.createElement('div');
        piecesLayer.className = 'pieces-layer';
        piecesLayer.style.pointerEvents = 'none';
        boardEl.appendChild(piecesLayer);
      }
    }
    return piecesLayer;
  }

  function renderHint() {
    boardEl.innerHTML = '';
    const hint = document.createElement('canvas');
    hint.className = 'board-hint';
    hint.width = boardW;
    hint.height = boardH;
    hint.style.width = boardW + 'px';
    hint.style.height = boardH + 'px';
    const hctx = hint.getContext('2d');
    hctx.drawImage(boardCanvasOff, 0, 0);
    hint.style.opacity = hintVisible ? 0.20 : 0;
    boardEl.appendChild(hint);

    const layer = ensurePiecesLayer();
    layer.style.width = boardW + 'px';
    layer.style.height = boardH + 'px';
    boardEl.appendChild(layer);

    boardEl.style.width = boardW + 'px';
    boardEl.style.height = boardH + 'px';
  }

  // Keep grid computation unchanged (attempts to choose good cols/rows)
  function computeGrid(n) {
    const aspect = boardW / boardH;
    let cols = Math.max(1, Math.round(Math.sqrt(n * aspect)));
    let rows = Math.ceil(n / cols);
    while (cols * rows < n) cols++;
    return { cols, rows };
  }

  // IMPORTANT FIX:
  // Create pieces for every grid cell (total = cols * rows),
  // even if total != requested n. This ensures entire image is covered.
  function createPieces(nRequested) {
    pieces = [];
    const { cols, rows } = computeGrid(nRequested);

    const total = cols * rows; // actual pieces to create (fixed)
    const tileW = Math.floor(boardW / cols);
    const tileH = Math.floor(boardH / rows);

    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // create canvas with exact slice
        const pc = document.createElement('canvas');
        pc.width = tileW;
        pc.height = tileH;
        const pctx = pc.getContext('2d');
        pctx.drawImage(boardCanvasOff, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);

        pieces.push({
          id: index,
          canvas: pc,
          w: tileW,
          h: tileH,
          row: r,
          col: c,
          x: c * tileW,
          y: r * tileH,
          snapped: false,
          thumb: null,
          el: null
        });
        index++;
      }
    }

    // Update the UI counters (requested vs actual)
    reqPiecesEl.textContent = nRequested;
    actualPiecesEl.textContent = pieces.length;
    return pieces;
  }

  function populateStaging() {
    stagingEl.innerHTML = '';
    ensurePiecesLayer().innerHTML = '';
    pieces.forEach(p => {
      const thumb = document.createElement('canvas');
      thumb.className = 'piece-thumb';
      thumb.width = p.w;
      thumb.height = p.h;
      thumb.getContext('2d').drawImage(p.canvas, 0, 0);
      thumb.style.pointerEvents = 'auto';
      thumb.style.position = 'relative';
      stagingEl.appendChild(thumb);
      p.thumb = thumb;

      thumb.addEventListener('pointerdown', e => startDragFromThumb(e, p, thumb));
      thumb.addEventListener('dblclick', () => forceSnap(p));
    });

    // ensure staging visible to user (scroll/bring to view)
    stagingEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateInfo();
  }

  function startDragFromThumb(e, piece, thumb) {
    e.preventDefault();
    if (!boardCanvasOff) return;

    const dragCanvas = document.createElement('canvas');
    dragCanvas.className = 'piece';
    dragCanvas.width = piece.w;
    dragCanvas.height = piece.h;
    dragCanvas.style.width = piece.w + 'px';
    dragCanvas.style.height = piece.h + 'px';
    const ctx = dragCanvas.getContext('2d');
    ctx.drawImage(piece.canvas, 0, 0);
    dragCanvas.style.position = 'absolute';
    dragCanvas.style.pointerEvents = 'auto';

    const layer = ensurePiecesLayer();
    layer.appendChild(dragCanvas);

    const thumbRect = thumb.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();
    const initialTx = thumbRect.left - boardRect.left;
    const initialTy = thumbRect.top - boardRect.top;
    dragCanvas.style.transform = `translate(${initialTx}px, ${initialTy}px)`;
    dragCanvas.classList.add('dragging');

    const offsetX = e.clientX - thumbRect.left;
    const offsetY = e.clientY - thumbRect.top;

    dragging = { piece, el: dragCanvas, offsetX, offsetY };

    try { thumb.setPointerCapture(e.pointerId); } catch (_) {}
    const onMove = (ev) => onPointerMove(ev);
    const onUp = (ev) => { onPointerUp(ev); document.removeEventListener('pointermove', onMove, { passive: false }); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
  }

  function onPointerMove(e) {
    if (!dragging || !dragging.el) return;
    e.preventDefault();
    const boardRect = boardEl.getBoundingClientRect();
    const newLeft = e.clientX - boardRect.left - dragging.offsetX;
    const newTop = e.clientY - boardRect.top - dragging.offsetY;
    dragging.el.style.transform = `translate(${newLeft}px, ${newTop}px)`;
  }

  function onPointerUp(e) {
  if (!dragging || !dragging.el) return;
  e.preventDefault();

  const style = dragging.el.style.transform;
  const m = style.match(/translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/);
  let tx = 0, ty = 0;
  if (m) { tx = parseFloat(m[1]); ty = parseFloat(m[2]); }
  const piece = dragging.piece;
  const el = dragging.el;

  const tolerance = Math.max(20, piece.w * 0.18);

  // Only snap if close to correct cell AND cell is not occupied
  const alreadySnapped = pieces.some(
    p =>
      p.snapped &&
      p.row === piece.row &&
      p.col === piece.col &&
      p.id !== piece.id
  );

  if (
    snap &&
    Math.abs(tx - piece.x) < tolerance &&
    Math.abs(ty - piece.y) < tolerance &&
    !alreadySnapped
  ) {
    // Snap into place
    el.style.transform = `translate(${piece.x}px, ${piece.y}px)`;
    el.classList.add('snapped');
    piece.snapped = true;
    piece.el = el;
    piece.el.style.pointerEvents = 'auto';
    el.onpointerdown = null;

    // Remove thumbnail from staging if present
    if (piece.thumb && piece.thumb.parentNode) piece.thumb.parentNode.removeChild(piece.thumb);
    piece.thumb = null;
  } else {
    // Not snapped, return to staging
    if (el.parentNode) el.parentNode.removeChild(el);
    piece.el = null;
    piece.snapped = false;

    // Remove old thumbnail if any
    if (piece.thumb && piece.thumb.parentNode) piece.thumb.parentNode.removeChild(piece.thumb);

    // Create new thumbnail in staging
    const thumb = document.createElement('canvas');
    thumb.className = 'piece-thumb';
    thumb.width = piece.w;
    thumb.height = piece.h;
    thumb.getContext('2d').drawImage(piece.canvas, 0, 0);
    thumb.style.pointerEvents = 'auto';
    thumb.style.position = 'relative';
    stagingEl.appendChild(thumb);
    piece.thumb = thumb;
    thumb.addEventListener('pointerdown', ev => startDragFromThumb(ev, piece, thumb));
    thumb.addEventListener('dblclick', () => forceSnap(piece));
  }

  el.classList.remove('dragging');
  dragging = null;
  updateInfo();
  checkComplete();
}


function startDragFromBoard(e, piece, el) {
  e.preventDefault();
  if (!boardCanvasOff) return;

  el.classList.add('dragging');
  const boardRect = boardEl.getBoundingClientRect();
  const style = el.style.transform;
  const m = style.match(/translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/);
  let tx = 0, ty = 0;
  if (m) { tx = parseFloat(m[1]); ty = parseFloat(m[2]); }
  const offsetX = e.clientX - boardRect.left - tx;
  const offsetY = e.clientY - boardRect.top - ty;

  dragging = { piece, el, offsetX, offsetY };

  try { el.setPointerCapture(e.pointerId); } catch (_) {}
  const onMove = (ev) => onPointerMove(ev);
  const onUp = (ev) => { onPointerUp(ev); document.removeEventListener('pointermove', onMove, { passive: false }); document.removeEventListener('pointerup', onUp); };
  document.addEventListener('pointermove', onMove, { passive: false });
  document.addEventListener('pointerup', onUp);
}

  function forceSnap(piece) {
    if (!piece.el || piece.snapped === false) {
      const layer = ensurePiecesLayer();
      const el = document.createElement('canvas');
      el.width = piece.w; el.height = piece.h;
      el.getContext('2d').drawImage(piece.canvas, 0, 0);
      el.className = 'piece snapped';
      el.style.position = 'absolute';
      el.style.transform = `translate(${piece.x}px, ${piece.y}px)`;
      layer.appendChild(el);
      if (piece.thumb && piece.thumb.parentNode) piece.thumb.parentNode.removeChild(piece.thumb);
      piece.thumb = null;
      piece.el = el;
      piece.snapped = true;
    }
    updateInfo();
    checkComplete();
  }

  function shufflePieces() {
    pieces.forEach(p => {
      if (!p.snapped) {
        if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
        p.el = null;
      }
    });
    populateStaging();
    updateInfo();
  }

  function showComplete() {
    ensurePiecesLayer().innerHTML = '';
    pieces.forEach(p => {
      const el = document.createElement('canvas');
      el.width = p.w; el.height = p.h;
      el.getContext('2d').drawImage(p.canvas, 0, 0);
      el.className = 'piece snapped';
      el.style.position = 'absolute';
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      ensurePiecesLayer().appendChild(el);
      p.el = el;
      p.snapped = true;
      if (p.thumb && p.thumb.parentNode) p.thumb.parentNode.removeChild(p.thumb);
      p.thumb = null;
    });
    updateInfo();
    checkComplete();
  }

  function updateInfo() {
    // reqPiecesEl is set when creating pieces; keep it in sync with the select too
    reqPiecesEl.textContent = difficulty.value;
    actualPiecesEl.textContent = pieces.length;
    placedCount = pieces.filter(p => p.snapped).length;
    placedEl.textContent = placedCount;
  }

  function checkComplete() {
  const done = pieces.length > 0 && pieces.every(p => p.snapped);
  if (done) {
    completeBanner.classList.add('show');
    setTimeout(() => {
      completeBanner.classList.remove('show');
      // Show a popup dialog with congratulations
      showCongratsPopup();
    }, 2000);
  }
}

  function setupBoardImage(img) {
    const container = document.querySelector('.container');
    const aside = document.querySelector('.puzzle-aside');
    const maxW = Math.max(320, Math.min(900, container.clientWidth - (aside ? aside.clientWidth : 360) - 40));
    boardW = Math.min(img.width, maxW);
    boardH = Math.round(boardW * img.height / img.width);
    if (boardH > 720) {
      boardH = 720;
      boardW = Math.round(boardH * img.width / img.height);
    }

    boardCanvasOff = document.createElement('canvas');
    boardCanvasOff.width = boardW;
    boardCanvasOff.height = boardH;
    const ctx = boardCanvasOff.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, boardW, boardH);

    renderHint();
  }

  function createPuzzleFromCurrentImage() {
    if (!currentImage) return;
    const nRequested = parseInt(difficulty.value, 10) || 20;
    setupBoardImage(currentImage);
    createPieces(nRequested);      // will create cols*rows pieces (actualPieces may differ)
    populateStaging();
    updateInfo();
    completeBanner.classList.remove('show');
  }

  function handleFileChange(e) {
    const file = (e.target.files && e.target.files[0]);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      currentImage = img;
      createPuzzleFromCurrentImage();
      URL.revokeObjectURL(url);
    };
    img.onerror = function () { alert('Could not load image'); URL.revokeObjectURL(url); };
    img.src = url;
  }

  function useSampleImage() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      currentImage = img;
      createPuzzleFromCurrentImage();
    };
    img.onerror = function () { alert('Could not load sample image'); };
    img.src = SAMPLE_URL;
  }

  // bindings
  imgFile.addEventListener('change', handleFileChange);
  sampleBtn.addEventListener('click', useSampleImage);
  createBtn.addEventListener('click', createPuzzleFromCurrentImage);
  shuffleBtn.addEventListener('click', shufflePieces);
  showBtn.addEventListener('click', showComplete);
  hintBtn.addEventListener('click', () => {
    hintVisible = !hintVisible;
    const hint = boardEl.querySelector('.board-hint');
    if (hint) hint.style.opacity = hintVisible ? 0.20 : 0;
  });
  snapToggle.addEventListener('click', () => {
    snap = !snap;
    snapToggle.textContent = snap ? 'Toggle Snap' : 'Toggle Snap (off)';
  });
  dismissHelper.addEventListener('click', () => { topHelper.style.display = 'none'; });
  document.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'r') shufflePieces(); });

  // initial sample
  useSampleImage();

})();

function showCongratsPopup() {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.left = '50%';
  popup.style.top = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#fff';
  popup.style.border = '2px solid #16a34a';
  popup.style.borderRadius = '16px';
  popup.style.boxShadow = '0 8px 32px rgba(16,30,62,0.18)';
  popup.style.padding = '32px 40px';
  popup.style.zIndex = '99999';
  popup.style.textAlign = 'center';
  popup.innerHTML = `
    <h2 style="color:#16a34a;margin-bottom:12px;">🎉 Congratulations!</h2>
    <p style="font-size:18px;">You solved the puzzle!</p>
    <button style="margin-top:18px;padding:8px 22px;border-radius:8px;background:#16a34a;color:#fff;font-weight:700;border:none;cursor:pointer;" id="closeCongratsBtn">Close</button>
  `;
  document.body.appendChild(popup);

  document.getElementById('closeCongratsBtn').onclick = () => {
    document.body.removeChild(popup);
  };
}
