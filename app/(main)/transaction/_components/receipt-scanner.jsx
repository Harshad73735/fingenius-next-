"use client";

import { scanReceipt } from '@/actions/transaction';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Camera, CheckCircle2, Crop, ImageIcon, Loader2, ScanLine, Sparkles, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import CropModal from './crop-modal';

const SCAN_STEPS = [
  "Uploading receipt...",
  "Detecting text...",
  "Extracting line items...",
  "Analyzing with AI...",
  "Finalizing results...",
];

// Unique IDs for the two file inputs so <label htmlFor> works
const CAMERA_INPUT_ID = "fg-camera-input";
const GALLERY_INPUT_ID = "fg-gallery-input";

const ReceiptScanner = ({ onScanComplete }) => {
  // Two separate inputs: camera (capture) and gallery (no capture)
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const lastProcessedRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);  // custom popover state

  const [preview, setPreview] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const stepIntervalRef = useRef(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  useEffect(() => {
    if (scanReceiptLoading) {
      setScanStep(0);
      stepIntervalRef.current = setInterval(() => {
        setScanStep(s => (s + 1) % SCAN_STEPS.length);
      }, 900);
    } else {
      clearInterval(stepIntervalRef.current);
    }
    return () => clearInterval(stepIntervalRef.current);
  }, [scanReceiptLoading]);

  const handleFileSelected = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setRawFile(file);
    setShowCrop(true);
  };

  const handleCropDone = async (croppedBlob) => {
    setShowCrop(false);
    const croppedFile = new File([croppedBlob], rawFile?.name || "receipt.jpg", { type: "image/jpeg" });
    setPreview(URL.createObjectURL(croppedBlob));
    await scanReceiptFn(croppedFile);
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    handleClearPreview();
  };

  const handleClearPreview = () => {
    setPreview(null);
    setRawFile(null);
    lastProcessedRef.current = null;
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading && scannedData !== lastProcessedRef.current) {
      lastProcessedRef.current = scannedData;
      onScanComplete(scannedData);
      toast.success("Receipt scanned! Fields have been auto-filled.");
    }
  }, [scannedData, scanReceiptLoading]);

  return (
    <div className="space-y-3">
      {/* Camera input — opens camera directly on mobile */}
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelected(f); }}
      />
      {/* Gallery input — opens photo library on mobile, file picker on desktop */}
      <input
        type="file"
        ref={galleryInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelected(f); }}
      />


      {/* Crop modal */}
      {showCrop && preview && (
        <CropModal
          imageSrc={preview}
          onCrop={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}

      {/*
        WHY <label htmlFor> instead of onClick + inputRef.click():
        On mobile, calling inputRef.click() programmatically after a
        dropdown closes is NOT a direct user gesture — the browser blocks it.
        A <label htmlFor="input-id"> click is ALWAYS a direct gesture.
      */}

      {/* Camera input  (capture=environment opens back camera on mobile) */}
      <input
        id={CAMERA_INPUT_ID}
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleFileSelected(f); setShowMenu(false); } }}
      />
      {/* Gallery input (no capture — opens photo library on mobile) */}
      <input
        id={GALLERY_INPUT_ID}
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleFileSelected(f); setShowMenu(false); } }}
      />

      {/* ── Trigger button + custom label-based popover ── */}
      {!preview && (
        <div className="relative">
          {/* Main gradient button with animated glowing backdrop */}
          <div className="relative group">
            {/* Glowing orb behind button */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse" />
            
            <Button
              type="button"
              className="w-full h-14 relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 border-0 text-white font-bold shadow-xl shadow-purple-900/20 hover:shadow-purple-900/40 active:scale-[0.98] transition-all duration-300 touch-manipulation rounded-xl"
              onClick={() => setShowMenu((s) => !s)}
            >
              {/* Subtle glass inner ring */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
              <Sparkles className="mr-2.5 h-5 w-5 animate-pulse text-pink-300" />
              <Camera className="mr-2 h-5 w-5" />
              <span className="text-base tracking-wide">Scan Receipt with AI</span>
            </Button>
          </div>

          {/* Menu: shown above the button */}
          {showMenu && (
            <>
              {/* Invisible backdrop: tap anywhere outside to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />

              {/* Action sheet anchored above-right of the button */}
              <div className="absolute bottom-[calc(100%+10px)] right-0 z-50 w-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/30 dark:shadow-black/60 border border-white/20 dark:border-slate-700/60 bg-white/[0.97] dark:bg-slate-900/97 backdrop-blur-xl">
                {/* Take Photo */}
                <label
                  htmlFor={CAMERA_INPUT_ID}
                  className="flex items-center gap-3.5 px-4 py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 active:bg-purple-100 dark:active:bg-purple-900/40 transition-colors touch-manipulation select-none"
                  onClick={() => setTimeout(() => setShowMenu(false), 200)}
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shrink-0">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground dark:text-white leading-tight">Take Photo</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Open camera</p>
                  </div>
                </label>

                {/* Divider */}
                <div className="h-px bg-border/50 dark:bg-slate-700/60 mx-4" />

                {/* Choose from Gallery */}
                <label
                  htmlFor={GALLERY_INPUT_ID}
                  className="flex items-center gap-3.5 px-4 py-4 cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/30 active:bg-pink-100 dark:active:bg-pink-900/40 transition-colors touch-manipulation select-none"
                  onClick={() => setTimeout(() => setShowMenu(false), 200)}
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-md shrink-0">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground dark:text-white leading-tight">Choose from Gallery</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Pick from your photos</p>
                  </div>
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* Preview card with laser scan overlay */}
      {preview && (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-purple-500/40 shadow-xl shadow-purple-500/20 bg-black">
            {/* Receipt Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full max-h-56 sm:max-h-64 object-contain opacity-80"
            />

            {/* Animated scan overlay */}
            {scanReceiptLoading && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-black/30" />
                <div className="scan-laser" />
                {/* Corner brackets */}
                {[["top-3 left-3", "border-t-2 border-l-2 rounded-tl"],
                  ["top-3 right-3", "border-t-2 border-r-2 rounded-tr"],
                  ["bottom-3 left-3", "border-b-2 border-l-2 rounded-bl"],
                  ["bottom-3 right-3", "border-b-2 border-r-2 rounded-br"]
                ].map(([pos, borders], i) => (
                  <div key={i} className={`absolute ${pos} w-6 h-6 ${borders} border-cyan-400`} />
                ))}
                {/* Status bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin shrink-0" />
                  <span className="text-xs font-mono text-cyan-300 tracking-wider">
                    {SCAN_STEPS[scanStep]}
                  </span>
                </div>
              </div>
            )}

            {/* Success state */}
            {scannedData && !scanReceiptLoading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
                <span className="text-sm font-semibold text-white">Scan Complete!</span>
              </div>
            )}

            {/* Close button */}
            {!scanReceiptLoading && (
              <button
                type="button"
                onClick={handleClearPreview}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors touch-manipulation z-10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons under preview */}
          {!scanReceiptLoading && !scannedData && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 touch-manipulation"
                onClick={() => setShowCrop(true)}
              >
                <Crop className="mr-1.5 h-3.5 w-3.5" />
                Crop First
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 touch-manipulation"
                onClick={() => rawFile && scanReceiptFn(rawFile)}
              >
                <ScanLine className="mr-1.5 h-3.5 w-3.5" />
                Scan Now
              </Button>
            </div>
          )}

          {/* Re-scan option after success */}
          {!scanReceiptLoading && scannedData && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 touch-manipulation"
              onClick={() => {
                handleClearPreview();
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
            >
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              Scan a Different Receipt
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;