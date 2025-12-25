'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui';
import {Image} from "next/dist/client/image-component";

interface WordRevealProps {
    secretWord: string | null;
    imposterHint: string | null;
    isImposter: boolean;
    category: string;
}

export default function WordReveal({secretWord, imposterHint, isImposter, category}: WordRevealProps) {
    const t = useTranslations();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
            <Card variant="elevated" padding="lg" className="text-center max-w-md w-full">
                {isImposter ? (
                    <>
                        <div className="mb-4 sm:mb-6 flex justify-center">
                            <Image alt="Imposter" src="/imposter192x192.png" loading="eager" width={100} height={100}
                                   className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"/>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-3 sm:mb-4">
                            {t('game.youAreImposter')}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                            {t('game.imposterHint')}
                        </p>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                            {t('game.imposterTip')}
                        </p>
                        <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4 sm:mb-6">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('game.category')}</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white capitalize">
                                {t(`categories.${category}`)}
                            </p>
                        </div>
                        {imposterHint && (
                            <div
                                className="p-3 sm:p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-xl">
                                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 mb-1">
                                    {t('game.imposterHintLabel')}
                                </p>
                                <p className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-300 uppercase">
                                    {imposterHint}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">🤫</div>
                        <h2 className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                            {t('game.wordIs')}
                        </h2>
                        <div className="p-4 sm:p-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl mb-4 sm:mb-6">
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                {secretWord}
                            </p>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {t('game.dontSayIt')}
                        </p>
                    </>
                )}

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {t('game.startsIn')}
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                        {countdown}
                    </p>
                </div>
            </Card>
        </div>
    );
}
