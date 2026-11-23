'use client';

import { useTranslations } from 'next-intl';
import { GameRoom } from '@/lib/types';
import {
  ActionBar,
  ActionBarSpacer,
  Avatar,
  Button,
  Card,
  Icon,
  Segmented,
  Switch,
} from '@/components/ui';
import { useLocale } from '@/lib/i18n-context';
import { Locale } from '@/i18n/config';
import { getWordCategories } from '@/lib/words/index';
import { InvitePanel } from './SidePanels';

interface LobbyViewProps {
  room: GameRoom;
  playerId: string;
  onStartGame: (category: string, locale?: Locale) => void;
  onKickPlayer: (playerId: string) => void;
  onUpdateSettings: (settings: Partial<GameRoom['settings']>) => void;
  onCopied?: (message: string) => void;
}

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 15;

export default function LobbyView({
  room,
  playerId,
  onStartGame,
  onKickPlayer,
  onUpdateSettings,
  onCopied,
}: LobbyViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const selectedCategory = room.settings.category;

  const isHost = playerId === room.hostId;
  const host = room.players.find((p) => p.id === room.hostId);
  const connectedPlayers = room.players.filter((p) => p.isConnected);
  const canStart = connectedPlayers.length >= MIN_PLAYERS;
  const wordCategories = getWordCategories(locale);
  const timerEnabled = room.settings.timerEnabled ?? true;
  const currentTimeMinutes = Math.round((room.settings.clueTimeLimit || 180) / 60);
  const imposterHintEnabled = room.settings.imposterHintEnabled ?? false;
  const trollModeEnabled = room.settings.trollModeEnabled ?? false;
  const currentClueRounds = room.settings.clueRounds ?? 2;
  const categoryName =
    wordCategories.find((c) => c.id === selectedCategory)?.name ?? selectedCategory;

  const timeOptions = [1, 2, 3, 5]; // Minutes
  const roundOptions = [2, 3, 5]; // Number of rounds before voting

  const update = (settings: Partial<GameRoom['settings']>) => {
    if (isHost) onUpdateSettings(settings);
  };

  const summary = [
    categoryName,
    timerEnabled ? t('ui.settingsSummaryTimer', { minutes: currentTimeMinutes }) : t('ui.noTimer'),
    t('ui.settingsSummaryRounds', { count: currentClueRounds }),
    imposterHintEnabled ? t('ui.hintOn') : t('ui.hintOff'),
    ...(trollModeEnabled ? [t('ui.trollOn')] : []),
  ];

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="hidden lg:block">
        <h1 className="font-display text-3xl font-bold">{t('ui.lobbyTitle')}</h1>
        <p className="mt-1 text-[15px] text-muted">
          {isHost ? t('ui.lobbyHostSub') : t('ui.lobbyGuestSub', { name: host?.name ?? '' })}
        </p>
      </div>

      <div className="xl:hidden">
        <InvitePanel roomCode={room.roomCode} compact onCopied={onCopied} />
      </div>

      {/* Players (mobile/tablet; desktop shows the side panel) */}
      <section className="lg:hidden">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">{t('lobby.players')}</h2>
          <span className="text-[13px] text-muted">
            {t('ui.playersOf', { count: connectedPlayers.length, max: MAX_PLAYERS })}
          </span>
        </div>
        <ul className="grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-6">
          {connectedPlayers.map((player) => {
            const isSelf = player.id === playerId;
            return (
              <li key={player.id} className="relative flex flex-col items-center gap-1.5">
                <div className="relative">
                  <Avatar name={player.name} color={player.avatarColor} size="lg" isSelf={isSelf} />
                  {player.id === room.hostId && (
                    <span
                      title={t('player.host')}
                      className="absolute -right-1 -top-1 flex size-5.5 items-center justify-center rounded-full border-2 border-ink bg-amber-400 text-ink"
                    >
                      <Icon name="crown" className="size-3" />
                    </span>
                  )}
                  {isHost && !isSelf && (
                    <button
                      type="button"
                      onClick={() => onKickPlayer(player.id)}
                      aria-label={`${t('player.kick')}: ${player.name}`}
                      className="absolute -left-2 -top-2 flex size-7 items-center justify-center rounded-full border-2 border-ink bg-surface-3 text-muted transition-colors hover:bg-danger hover:text-white"
                    >
                      <Icon name="x" className="size-3.5" />
                    </button>
                  )}
                </div>
                <span className="max-w-full truncate text-xs font-medium text-fg-soft">
                  {isSelf ? t('player.you') : player.name}
                </span>
              </li>
            );
          })}
        </ul>
        {!canStart && (
          <p className="mt-3 text-center text-xs font-medium text-hint">{t('lobby.minPlayers')}</p>
        )}
      </section>

      {/* Settings */}
      {isHost ? (
        <Card className="flex flex-col gap-5">
          <h2 className="font-display text-lg font-semibold">{t('ui.settingsTitle')}</h2>

          <div className="flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold text-muted">{t('lobby.categoryTitle')}</span>
            <div
              role="radiogroup"
              aria-label={t('lobby.categoryTitle')}
              className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 sm:-mx-5 sm:px-5 lg:mx-0 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] lg:overflow-visible lg:px-0"
            >
              {wordCategories.map((category) => {
                const selected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update({ category: category.id })}
                    className={`flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors lg:h-12 lg:rounded-2xl ${
                      selected
                        ? 'border-accent-soft bg-accent/24 text-fg'
                        : 'border-white/10 bg-white/4 text-gray-300 hover:bg-white/8'
                    }`}
                  >
                    <span aria-hidden="true">{category.emoji}</span>
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SettingTile
              title={t('lobby.timerSettings')}
              description={t('ui.timerDescription')}
              control={
                <Switch
                  checked={timerEnabled}
                  onChange={(v) => update({ timerEnabled: v })}
                  label={t('lobby.timerSettings')}
                />
              }
            >
              {timerEnabled && (
                <Segmented
                  label={t('lobby.timeLimit')}
                  value={currentTimeMinutes}
                  onChange={(minutes) =>
                    update({ clueTimeLimit: minutes * 60, voteTimeLimit: minutes * 60 })
                  }
                  options={timeOptions.map((m) => ({
                    value: m,
                    label: `${m} ${t('lobby.minutes')}`,
                  }))}
                />
              )}
            </SettingTile>

            <SettingTile
              title={t('lobby.clueRoundsSettings')}
              description={t('lobby.clueRoundsDescription')}
            >
              <Segmented
                label={t('lobby.clueRoundsSettings')}
                value={currentClueRounds}
                onChange={(rounds) => update({ clueRounds: rounds })}
                options={roundOptions.map((r) => ({ value: r, label: String(r) }))}
              />
            </SettingTile>

            <SettingTile
              title={t('lobby.imposterHintSettings')}
              description={t('lobby.imposterHintDescription')}
              control={
                <Switch
                  checked={imposterHintEnabled}
                  onChange={(v) => update({ imposterHintEnabled: v })}
                  label={t('lobby.imposterHintSettings')}
                />
              }
            />

            <SettingTile
              title={t('lobby.trollModeSettings')}
              description={t('lobby.trollModeDescription')}
              control={
                <Switch
                  checked={trollModeEnabled}
                  onChange={(v) => update({ trollModeEnabled: v })}
                  label={t('lobby.trollModeSettings')}
                />
              }
            />
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">{t('ui.settingsTitle')}</h2>
            <span className="text-xs text-muted">
              {t('ui.settingsBy', { name: host?.name ?? '' })}
            </span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {summary.map((item) => (
              <li
                key={item}
                className="flex h-8 items-center rounded-full bg-white/6 px-3 text-[13px] font-medium text-fg-soft"
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ActionBar>
        {isHost ? (
          <div className="flex items-center gap-4 lg:rounded-[20px] lg:border lg:border-line lg:bg-surface lg:p-4">
            <p className="hidden flex-1 text-sm text-muted lg:block">
              {canStart ? summary.join(' · ') : t('lobby.minPlayers')}
            </p>
            <Button
              onClick={() => onStartGame(selectedCategory, locale)}
              disabled={!canStart}
              size="lg"
              className="w-full lg:w-auto"
            >
              {canStart
                ? t('lobby.startGame')
                : t('lobby.waitingPlayers', { current: connectedPlayers.length })}
            </Button>
          </div>
        ) : (
          <div className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-white/5 text-[15px] text-fg-soft lg:border lg:border-line">
            <span className="size-2 animate-pulse rounded-full bg-accent-soft" />
            {t('lobby.waitingHost')}
          </div>
        )}
      </ActionBar>
      <ActionBarSpacer />
    </div>
  );
}

function SettingTile({
  title,
  description,
  control,
  children,
}: {
  title: string;
  description?: string;
  control?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/6 bg-white/3 p-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[15px] font-semibold">{title}</span>
          {description && (
            <span className="text-[13px] leading-snug text-muted">{description}</span>
          )}
        </div>
        {control}
      </div>
      {children}
    </div>
  );
}
