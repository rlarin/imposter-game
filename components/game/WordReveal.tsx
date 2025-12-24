'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';

interface WordRevealProps {
  secretWord: string | null;
  isImposter: boolean;
  category: string;
}

export default function WordReveal({ secretWord, isImposter, category }: WordRevealProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card variant="elevated" padding="lg" className="text-center max-w-md w-full">
        {isImposter ? (
          <>
            <div className="text-6xl mb-6">🕵️</div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              ¡ERES EL IMPOSTOR!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No conoces la palabra secreta.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Intenta descubrirla con las pistas de los demás sin que te descubran.
            </p>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Categoría</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {category}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">🤫</div>
            <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              La palabra secreta es:
            </h2>
            <div className="p-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl mb-6">
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                {secretWord}
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              ¡No la digas en voz alta! Da pistas sutiles.
            </p>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            La ronda comienza en
          </p>
          <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            {countdown}
          </p>
        </div>
      </Card>
    </div>
  );
}
