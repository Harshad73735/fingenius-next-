"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw, X, ZoomIn, ZoomOut, Move } from "lucide-react";

/**
 * CropModal – a fully client-side canvas image cropper.
 * Props:
 *   imageSrc  – blob/object URL of the image to crop
 *   onCrop    – (croppedBlob: Blob) => void
 *   onCancel  – () => void
 */
const CropModal = ({ imageSrc, onCrop, onCancel }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(new Image());

  const [imgLoaded, setImgLoaded] = useState(false);
  const [dragging, setDragging] = useState(null); // null | 'move' | 'corner'
  const [scaled, setScaled] = useState({ w: 0, h: 0, x: 0, y: 0 }); // rendered image rect
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 }); // selection rect in canvas px
  const dragStart = useRef(null);
  const cropStart = useRef(null);

  // Load image
  useEffect(() => {
    const img = imgRef.current;
    img.onload = () => setImgLoaded(true);
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw canvas whenever crop or image changes
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgLoaded) return;
    const ctx = canvas.getContext("2d");
    const CW = canvas.width;
    const CH = canvas.height;

    const img = imgRef.current;
    // Fit image inside canvas with padding
    const pad = 0;
    const scale = Math.min((CW - pad * 2) / img.width, (CH - pad * 2) / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    const sx = (CW - sw) / 2;
    const sy = (CH - sh) / 2;
    setScaled({ w: sw, h: sh, x: sx, y: sy });

    ctx.clearRect(0, 0, CW, CH);

    // Draw dimmed image
    ctx.globalAlpha = 0.45;
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.globalAlpha = 1;

    // Clip bright part
    const { x, y, w, h } = crop;
    if (w > 4 && h > 4) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.restore();

      // Selection border
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // Draw all 8 handles: 4 corners + 4 mid-edges
      const handles = [
        // Corners
        [x,         y        ],
        [x + w,     y        ],
        [x,         y + h    ],
        [x + w,     y + h    ],
        // Mid-edges
        [x + w / 2, y        ],  // top
        [x + w / 2, y + h    ],  // bottom
        [x,         y + h / 2], // left
        [x + w,     y + h / 2], // right
      ];
      handles.forEach(([hx, hy]) => {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });
    }
  }, [crop, imgLoaded]);

  useEffect(() => {
    if (imgLoaded) {
      // Set default crop to middle 80% of image bounds
      const canvas = canvasRef.current;
      if (!canvas) return;
      const img = imgRef.current;
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = (canvas.width - sw) / 2;
      const sy = (canvas.height - sh) / 2;
      const pad = 10;
      setCrop({ x: sx + pad, y: sy + pad, w: sw - pad * 2, h: sh - pad * 2 });
    }
  }, [imgLoaded]);

  useEffect(() => { draw(); }, [draw]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const hitCorner = (px, py) => {
    const { x, y, w, h } = crop;
    const handles = [
      // Corners
      { name: "tl", cx: x,         cy: y         },
      { name: "tr", cx: x + w,     cy: y         },
      { name: "bl", cx: x,         cy: y + h     },
      { name: "br", cx: x + w,     cy: y + h     },
      // Mid-edges
      { name: "tc", cx: x + w / 2, cy: y         },
      { name: "bc", cx: x + w / 2, cy: y + h     },
      { name: "lc", cx: x,         cy: y + h / 2 },
      { name: "rc", cx: x + w,     cy: y + h / 2 },
    ];
    return handles.find(c => Math.hypot(px - c.cx, py - c.cy) < 16);
  };

  const onPointerDown = (e) => {
    const pos = getPos(e);
    const corner = hitCorner(pos.x, pos.y);
    if (corner) {
      setDragging({ type: "corner", corner: corner.name });
      dragStart.current = pos;
      cropStart.current = { ...crop };
      return;
    }
    const { x, y, w, h } = crop;
    if (pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h) {
      setDragging({ type: "move" });
      dragStart.current = pos;
      cropStart.current = { ...crop };
      return;
    }
    // New selection
    setDragging({ type: "new" });
    dragStart.current = pos;
    setCrop({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getPos(e);
    const dx = pos.x - dragStart.current.x;
    const dy = pos.y - dragStart.current.y;

    if (dragging.type === "move") {
      setCrop(c => ({ ...c, x: cropStart.current.x + dx, y: cropStart.current.y + dy }));
    } else if (dragging.type === "new") {
      const x = Math.min(dragStart.current.x, pos.x);
      const y = Math.min(dragStart.current.y, pos.y);
      setCrop({ x, y, w: Math.abs(dx), h: Math.abs(dy) });
    } else if (dragging.type === "corner") {
      const { x, y, w, h } = cropStart.current;
      const cn = dragging.corner;
      // 4 corners
      if      (cn === "br") setCrop({ x,        y,        w: Math.max(20, w + dx), h: Math.max(20, h + dy) });
      else if (cn === "tr") setCrop({ x,        y: y + dy, w: Math.max(20, w + dx), h: Math.max(20, h - dy) });
      else if (cn === "bl") setCrop({ x: x + dx, y,        w: Math.max(20, w - dx), h: Math.max(20, h + dy) });
      else if (cn === "tl") setCrop({ x: x + dx, y: y + dy, w: Math.max(20, w - dx), h: Math.max(20, h - dy) });
      // 4 mid-edge handles
      else if (cn === "tc") setCrop({ x,        y: y + dy, w,                        h: Math.max(20, h - dy) }); // top  → resize height from top
      else if (cn === "bc") setCrop({ x,        y,         w,                        h: Math.max(20, h + dy) }); // bottom → resize height from bottom
      else if (cn === "lc") setCrop({ x: x + dx, y,        w: Math.max(20, w - dx), h                        }); // left  → resize width from left
      else if (cn === "rc") setCrop({ x,        y,         w: Math.max(20, w + dx), h                        }); // right → resize width from right
    }
  }, [dragging]);

  const onPointerUp = () => setDragging(null);

  const handleCrop = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const { x: cx, y: cy, w: cw, h: ch } = crop;
    const { x: sx, y: sy, w: sw, h: sh } = scaled;
    // Map canvas crop rect to original image px
    const scaleX = img.width / sw;
    const scaleY = img.height / sh;
    const ix = (cx - sx) * scaleX;
    const iy = (cy - sy) * scaleY;
    const iw = cw * scaleX;
    const ih = ch * scaleY;

    const out = document.createElement("canvas");
    out.width = iw;
    out.height = ih;
    out.getContext("2d").drawImage(img, ix, iy, iw, ih, 0, 0, iw, ih);
    out.toBlob(blob => onCrop(blob), "image/jpeg", 0.92);
  };

  const resetCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    const sx = (canvas.width - sw) / 2;
    const sy = (canvas.height - sh) / 2;
    setCrop({ x: sx + 10, y: sy + 10, w: sw - 20, h: sh - 20 });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-lg border border-purple-500/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 dark:border-slate-700">
          <div>
            <h2 className="text-base font-semibold text-foreground dark:text-white">Crop Receipt</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Drag to select • Drag any handle to resize</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="w-full bg-slate-950" style={{ touchAction: "none" }}>
          <canvas
            ref={canvasRef}
            width={480}
            height={320}
            className="w-full h-auto cursor-crosshair select-none"
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border/50 dark:border-slate-700">
          <button
            onClick={resetCrop}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
            <Button
              type="button"
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 hover:opacity-90"
              onClick={handleCrop}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Crop & Scan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
