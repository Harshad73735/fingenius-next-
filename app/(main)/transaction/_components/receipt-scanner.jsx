"use client";

import { scanReceipt } from '@/actions/transaction';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

const ReceiptScanner = ({ onScanComplete }) => {
  // Two separate inputs: camera (capture) and gallery (no capture)
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const lastProcessedRef = useRef(null);

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

  const handleCropCancel = async () => {
    setShowCrop(false);
    if (rawFile) await scanReceiptFn(rawFile);
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

      {/* Single button with dropdown menu — like WhatsApp/Instagram */}
      {!preview && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="w-full h-12 relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 animate-gradient border-0 text-white font-semibold shadow-lg hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 touch-manipulation"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity rounded-[inherit]" />
              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              <Camera className="mr-2 h-4 w-4" />
              <span>Scan Receipt with AI</span>
            </Button>
          </DropdownMenuTrigger>

          {/* Popup menu — appears above the button, like app attachment pickers */}
          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={8}
            className="w-52 p-1.5 rounded-xl shadow-xl shadow-black/20 dark:shadow-black/50 border border-border/60 dark:border-slate-700/60 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95"
          >
            {/* Take Photo option */}
            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30 group"
              onClick={() => cameraInputRef.current?.click()}
            >
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground dark:text-white">Take Photo</p>
                <p className="text-[11px] text-muted-foreground">Use your camera</p>
              </div>
            </DropdownMenuItem>

            {/* Choose from Gallery option */}
            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/30 focus:bg-pink-50 dark:focus:bg-pink-900/30 group"
              onClick={() => galleryInputRef.current?.click()}
            >
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-sm">
                <ImageIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground dark:text-white">Choose from Gallery</p>
                <p className="text-[11px] text-muted-foreground">Pick from your photos</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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