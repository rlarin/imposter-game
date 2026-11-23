'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import Icon from './Icon';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const READER_ID = 'qr-reader';

type ZoomRange = { min: number; max: number; step: number };

/** Extracts a room code from a scanned value (join URL, /game/CODE URL or bare code). */
function parseRoomCode(text: string): string | null {
  const match =
    text.match(/[?&]room=([A-Z0-9]{6})/i) ||
    text.match(/\/game\/([A-Z0-9]{6})/i) ||
    text.match(/^([A-Z0-9]{6})$/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Video constraints for scanning. `facingMode: environment` lets the OS pick the *main* back
 * camera (on multi-lens phones it can also switch lenses automatically for close focus),
 * instead of an arbitrary lens such as the ultra-wide or telephoto, which can't focus up close.
 */
function buildConstraints(deviceId?: string, minimal = false): MediaTrackConstraints {
  const source = deviceId
    ? { deviceId: { exact: deviceId } }
    : { facingMode: { ideal: 'environment' } };
  // 720p is plenty for QR codes and is the most widely supported back-camera mode on iOS.
  return minimal ? source : { ...source, width: { ideal: 1280 }, height: { ideal: 720 } };
}

/**
 * Lists cameras WITHOUT opening a new capture. (Html5Qrcode.getCameras() calls getUserMedia,
 * which on iOS opens the default front camera and silently blacks out the running back camera,
 * because iOS only allows one active camera capture at a time.)
 */
async function listCameras(): Promise<{ id: string; label: string }[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((d) => d.kind === 'videoinput' && d.deviceId)
    .map((d) => ({ id: d.deviceId, label: d.label }));
}

/** True once the video element inside the reader is actually rendering frames. */
function isVideoLive(): boolean {
  const video = document.querySelector<HTMLVideoElement>(`#${READER_ID} video`);
  return !!video && video.readyState >= 2 && video.videoWidth > 0;
}

export default function QRScanner({ isOpen, onClose }: QRScannerProps) {
  const t = useTranslations();
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [zoomRange, setZoomRange] = useState<ZoomRange | null>(null);
  const [zoom, setZoom] = useState(1);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [cameraIndex, setCameraIndex] = useState<number | null>(null);

  const stopScanner = useCallback(async () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner && runningRef.current) {
      runningRef.current = false;
      await scanner.stop().catch(() => {});
    }
  }, []);

  const handleDecoded = useCallback(
    (decodedText: string) => {
      const roomCode = parseRoomCode(decodedText);
      if (!roomCode) {
        // Keep scanning; just tell the user this QR is not a room invite.
        if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
        setNotice(t('qrScanner.invalidCode'));
        noticeTimerRef.current = setTimeout(() => setNotice(null), 2000);
        return;
      }
      if ('vibrate' in navigator) navigator.vibrate?.(60);
      stopScanner().then(() => {
        router.push(`/?room=${roomCode}`);
        onClose();
      });
    },
    [onClose, router, stopScanner, t]
  );

  const startScanner = useCallback(
    async (deviceId?: string, minimal = false): Promise<void> => {
      if (!window.isSecureContext) {
        setError('Camera access requires HTTPS (or localhost for development)');
        return;
      }

      setIsStarting(true);
      setError(null);
      setZoomRange(null);
      setTorchSupported(false);
      setTorchOn(false);

      try {
        await stopScanner();

        const scanner = new Html5Qrcode(READER_ID, {
          verbose: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          // Native BarcodeDetector (Android Chrome & others) is faster and more robust.
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        });
        scannerRef.current = scanner;

        const constraints = buildConstraints(deviceId, minimal);
        await scanner.start(
          deviceId ?? { facingMode: 'environment' },
          {
            fps: 12,
            // Scan the whole frame: works at any distance and lets the user hold the phone
            // further away (where it can focus) instead of fitting the code in a small box.
            videoConstraints: constraints,
          },
          handleDecoded,
          () => {
            // No QR in this frame: ignore.
          }
        );
        runningRef.current = true;

        // Zoom & torch controls (supported on most Android devices).
        const cameraCaps = scanner.getRunningTrackCameraCapabilities();
        const zoomFeature = cameraCaps.zoomFeature();
        if (zoomFeature.isSupported() && zoomFeature.max() > zoomFeature.min()) {
          setZoomRange({
            min: zoomFeature.min(),
            max: Math.min(zoomFeature.max(), 5),
            step: zoomFeature.step() || 0.1,
          });
          setZoom(zoomFeature.value() ?? zoomFeature.min());
        }
        setTorchSupported(cameraCaps.torchFeature().isSupported());

        // Camera list (labels are available once permission is granted) for manual switching.
        listCameras()
          .then((list) => setCameras(list))
          .catch(() => {});

        // Fallback: if no frames arrive (black preview), restart with minimal constraints.
        if (!minimal) {
          watchdogRef.current = setTimeout(() => {
            if (scannerRef.current === scanner && runningRef.current && !isVideoLive()) {
              startScanner(deviceId, true);
            }
          }, 3000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (/Permission|NotAllowed/i.test(message)) {
          setError(t('qrScanner.permissionDenied'));
        } else {
          setError(t('qrScanner.cameraError'));
        }
      } finally {
        setIsStarting(false);
      }
    },
    [handleDecoded, stopScanner, t]
  );

  useEffect(() => {
    if (!isOpen) return;
    const cameraId = cameraIndex !== null ? cameras[cameraIndex]?.id : undefined;
    // Small delay to ensure the reader element is in the DOM.
    const timeoutId = setTimeout(() => startScanner(cameraId), 50);
    return () => {
      clearTimeout(timeoutId);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when opened or the camera changes
  }, [isOpen, cameraIndex]);

  const applyZoom = async (value: number) => {
    setZoom(value);
    const scanner = scannerRef.current;
    if (!scanner || !runningRef.current) return;
    await scanner
      .getRunningTrackCameraCapabilities()
      .zoomFeature()
      .apply(value)
      .catch(() => {});
  };

  const toggleTorch = async () => {
    const scanner = scannerRef.current;
    if (!scanner || !runningRef.current) return;
    const next = !torchOn;
    await scanner
      .getRunningTrackCameraCapabilities()
      .torchFeature()
      .apply(next)
      .then(() => setTorchOn(next))
      .catch(() => {});
  };

  const switchCamera = () => {
    if (cameras.length < 2) return;
    setCameraIndex((i) => (i === null ? 0 : (i + 1) % cameras.length));
  };

  const handleClose = () => {
    stopScanner();
    setCameraIndex(null);
    onClose();
  };

  if (!isOpen) return null;

  const zoomPresets = zoomRange
    ? [1, 2, 3].filter((z) => z >= zoomRange.min && z <= zoomRange.max)
    : [];
  const controlButton =
    'flex size-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/70';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('qrScanner.title')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black sm:bg-black/80 sm:p-4 sm:backdrop-blur-sm"
    >
      <div className="relative flex size-full flex-col overflow-hidden bg-black sm:h-auto sm:max-h-[90dvh] sm:max-w-md sm:rounded-[20px] sm:border sm:border-line">
        {/* Camera viewport */}
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden sm:aspect-square sm:flex-none"
          style={{ containerType: 'size' }}
        >
          <div
            id={READER_ID}
            className="w-full [&_video]:mx-auto [&_video]:block [&_video]:max-h-full"
          />

          {/* Viewfinder (decorative: the whole frame is scanned) */}
          {!isStarting && !error && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="relative aspect-square rounded-3xl shadow-[0_0_0_200vmax_rgba(0,0,0,0.35)]"
                style={{ width: 'min(72cqw, 72cqh)' }}
              >
                <span className="absolute left-0 top-0 size-8 rounded-tl-3xl border-l-4 border-t-4 border-accent-soft" />
                <span className="absolute right-0 top-0 size-8 rounded-tr-3xl border-r-4 border-t-4 border-accent-soft" />
                <span className="absolute bottom-0 left-0 size-8 rounded-bl-3xl border-b-4 border-l-4 border-accent-soft" />
                <span className="absolute bottom-0 right-0 size-8 rounded-br-3xl border-b-4 border-r-4 border-accent-soft" />
              </div>
            </div>
          )}

          {isStarting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              <div className="size-10 animate-spin rounded-full border-4 border-white/25 border-t-white" />
              <p className="text-sm">{t('qrScanner.starting')}</p>
            </div>
          )}

          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <span className="rounded-full bg-black/55 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              {t('qrScanner.title')}
            </span>
            <button
              type="button"
              onClick={handleClose}
              aria-label={t('ui.close')}
              className={controlButton}
            >
              <Icon name="x" />
            </button>
          </div>

          {/* Camera controls */}
          {!isStarting && !error && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-4">
              {zoomPresets.length > 1 && (
                <div
                  role="radiogroup"
                  aria-label="Zoom"
                  className="flex gap-1 rounded-full bg-black/55 p-1 backdrop-blur"
                >
                  {zoomPresets.map((z) => {
                    const selected = Math.abs(zoom - z) < 0.25;
                    return (
                      <button
                        key={z}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => applyZoom(z)}
                        className={`flex size-11 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                          selected ? 'bg-white text-black' : 'text-white hover:bg-white/15'
                        }`}
                      >
                        {z}×
                      </button>
                    );
                  })}
                </div>
              )}
              {zoomRange && (
                <input
                  type="range"
                  aria-label="Zoom"
                  min={zoomRange.min}
                  max={zoomRange.max}
                  step={zoomRange.step}
                  value={zoom}
                  onChange={(e) => applyZoom(Number(e.target.value))}
                  className="w-56 accent-accent-soft"
                />
              )}
              <div className="flex gap-3">
                {torchSupported && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    aria-pressed={torchOn}
                    aria-label={t('ui.flashlight')}
                    className={`${controlButton} ${torchOn ? 'bg-hint! text-black!' : ''}`}
                  >
                    <Icon name="flashlight" />
                  </button>
                )}
                {cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    aria-label={t('ui.switchCamera')}
                    className={controlButton}
                  >
                    <Icon name="switchCamera" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer: error / instructions */}
        <div className="shrink-0 bg-surface px-4 pt-3 pb-safe text-center sm:pb-4">
          {error ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-2xl border border-danger-fg/40 bg-danger/12 p-3 text-sm text-danger-fg"
            >
              {error}
              <button
                type="button"
                onClick={() => {
                  const id = cameraIndex !== null ? cameras[cameraIndex]?.id : undefined;
                  startScanner(id);
                }}
                className="font-semibold text-fg underline underline-offset-4"
              >
                {t('ui.retry')}
              </button>
            </div>
          ) : notice ? (
            <p role="status" className="text-sm font-semibold text-hint">
              {notice}
            </p>
          ) : (
            <p className="text-sm text-muted">{t('qrScanner.instructions')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
