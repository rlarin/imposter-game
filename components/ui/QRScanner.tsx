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

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      const startScanner = async () => {
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
          const readerElement = document.getElementById('qr-reader');
          console.log('QR reader element:', readerElement);
          if (!readerElement) {
            console.error('QR reader element not found');
            setError(t('qrScanner.cameraError'));
            setIsStarting(false);
            return;
          }

          const scanner = new Html5Qrcode('qr-reader');
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
            },
            (decodedText) => {
              // Extract room code from URL or use as-is
              let roomCode = decodedText;

              // Check if it's a URL with room code
              const urlMatch = decodedText.match(/\/game\/([A-Z0-9]{6})/i);
              if (urlMatch) {
                roomCode = urlMatch[1].toUpperCase();
              } else if (/^[A-Z0-9]{6}$/i.test(decodedText)) {
                roomCode = decodedText.toUpperCase();
              } else {
                setError(t('qrScanner.invalidCode'));
                return;
              }

              // Stop scanner and return result
              scanner.stop().then(() => {
                onScan(roomCode);
                onClose();
              });
            },
            (errorMessage) => {
              // Ignore scan errors (no QR found)
              console.debug('QR scan error:', errorMessage);
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

      startScanner();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, onClose, onScan, t]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
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
        <div className="p-4">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
            <div id="qr-reader" className="w-full h-full" />

            {/* Scanning overlay */}
            {isStarting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <div className="animate-spin text-3xl mb-2">📷</div>
                  <p className="text-sm">{t('qrScanner.starting')}</p>
                </div>
              </div>
            )}

            {/* Scanning frame */}
            {!isStarting && !error && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Instructions */}
          <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('qrScanner.instructions')}
          </p>
        </div>
      </div>
    </div>
  );
}
