'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Icon } from '@/components/ui';

interface WordChangeResultProps {
  passed: boolean;
  newHintsCount: number;
  onClose: () => void;
}

export default function WordChangeResult({
  passed,
  newHintsCount,
  onClose,
}: WordChangeResultProps) {
  const t = useTranslations();
  const [visible, setVisible] = useState(true);

  // Auto-cerrar después de 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full shadow-[0_24px_60px_rgba(0,0,0,0.55)] animate-rise">
        <div className="text-center space-y-4">
          {passed ? (
            <>
              {/* Votación aprobada */}
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/16 text-success">
                <Icon name="check" className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
                {t('wordChange.resultPassed')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('wordChange.newWordSelected')}
              </p>

              {/* Aviso de pistas extras para el impostor */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t('wordChange.imposterGotHints', { count: newHintsCount })}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Votación rechazada */}
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-danger/18 text-danger-fg">
                <Icon name="x" className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                {t('wordChange.resultFailed')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('wordChange.continueWithWord')}
              </p>
            </>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500">{t('wordChange.autoClose')}</p>
        </div>
      </Card>
    </div>
  );
}
