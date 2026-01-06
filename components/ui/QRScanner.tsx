'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (roomCode: string) => void;
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const t = useTranslations();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const startScannerInElement = async (elementId: string) => {
    // Check if HTTPS or localhost
    const isSecureContext =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!isSecureContext) {
      setError('Camera access requires HTTPS (or localhost for development)');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      // Check if the element exists
      const readerElement = document.getElementById(elementId);
      console.log('QR reader element:', readerElement);
      if (!readerElement) {
        console.error('QR reader element not found');
        setError(t('qrScanner.cameraError'));
        setIsStarting(false);
        return;
      }

      // Stop existing scanner if any
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
      }

      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();
      console.log('Available cameras:', cameras);

      if (!cameras || cameras.length === 0) {
        setError(t('qrScanner.cameraError'));
        setIsStarting(false);
        return;
      }

      // Use the back camera if available
      const cameraId = cameras.length > 1 ? cameras[cameras.length - 1].id : cameras[0].id;
      console.log('Using camera:', cameraId);

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          console.log('QR Code detected:', decodedText);

          // Extract room code from URL or use as-is
          let roomCode = decodedText;

          // Check if it's a URL with room code
          const urlMatch = decodedText.match(/\/game\/([A-Z0-9]{6})/i);
          setError(urlMatch?.toString() || 'empty');
          if (urlMatch) {
            roomCode = urlMatch[1].toUpperCase();
          } else if (/^[A-Z0-9]{6}$/i.test(decodedText)) {
            roomCode = decodedText.toUpperCase();
          } else {
            console.warn('Invalid QR code format:', decodedText);
            setError(t('qrScanner.invalidCode'));
            return;
          }

          console.log('Valid room code extracted:', roomCode);
          // Stop scanner and return result
          scanner
            .stop()
            .then(() => {
              onScan(roomCode);
              onClose();
            })
            .catch((err) => {
              console.error('Error stopping scanner:', err);
            });
        },
        (errorMessage) => {
          // Ignore scan errors (no QR found)
          console.debug('QR scan attempt:', errorMessage);
        }
      );

      console.log('Scanner started successfully');
      setIsStarting(false);
    } catch (err) {
      setIsStarting(false);
      console.error('Scanner error:', err);
      if (err instanceof Error) {
        if (err.message.includes('Permission') || err.message.includes('NotAllowedError')) {
          setError(t('qrScanner.permissionDenied'));
        } else if (err.message.includes('NotFoundError') || err.message.includes('no camera')) {
          setError(t('qrScanner.cameraError'));
        } else {
          setError(`${t('qrScanner.cameraError')}: ${err.message}`);
        }
      } else {
        setError(t('qrScanner.cameraError'));
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Determine which element to use based on fullscreen state
    const elementId = isFullscreen ? 'qr-reader-fullscreen' : 'qr-reader';

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      startScannerInElement(elementId);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, isFullscreen, onClose, onScan, t]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  // Fullscreen preview
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
          title="Exit fullscreen"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="w-full h-full max-w-full max-h-full">
          <div id="qr-reader-fullscreen" className="w-full h-full" />
        </div>
      </div>
    );
  }

  // Normal modal view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('qrScanner.title')}
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scanner area */}
        <div className="p-3 sm:p-4 flex-1 overflow-hidden flex flex-col">
          <button
            onClick={() => setIsFullscreen(true)}
            className="relative bg-black rounded-xl overflow-hidden aspect-square flex-1 cursor-pointer hover:opacity-90 transition-opacity group"
            title="Click to expand"
          >
            <div id="qr-reader" className="w-full h-full" />

            {/* Scanning overlay */}
            {isStarting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-white text-center">
                  <div className="animate-spin text-3xl mb-2">📷</div>
                  <p className="text-sm">{t('qrScanner.starting')}</p>
                </div>
              </div>
            )}

            {/* Scanning frame - only show when not starting and no error */}
            {!isStarting && !error && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className="w-56 h-56 border-2 border-white/60 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400" />
                </div>
              </div>
            )}
          </button>

          {/* Error message */}
          {error && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Instructions */}
          <p className="mt-3 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('qrScanner.instructions')}
          </p>
        </div>
      </div>
    </div>
  );
}
