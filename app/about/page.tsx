import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// Static, server-rendered English page so search engines and AI agents (which often don't run
// JavaScript) can read what the game is and how to play it.

const PAGE_TITLE = 'How to play El Impostor (The Imposter) – rules, tips and FAQ';
const PAGE_DESCRIPTION =
  'Rules of El Impostor (The Imposter), a free online social deduction word game for 3–15 ' +
  'players: secret word, one-word clues, voting, how the imposter wins, tips and FAQ.';

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: { url: '/about', title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  twitter: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

const steps = [
  {
    name: 'Create a room',
    text: 'One player creates a room and shares the 6-character code, the invite link or the QR code. 3 to 15 players can join from any phone or computer, no sign-up needed.',
  },
  {
    name: 'Get your secret role',
    text: 'When the host starts the game, every player privately sees the same secret word, except one player: the imposter, who does not know it (and may get a vague hint).',
  },
  {
    name: 'Give one-word clues',
    text: 'Each round, every player writes a single word related to the secret word. Be specific enough to prove you know it, but not so obvious that the imposter can guess it.',
  },
  {
    name: 'Vote for the imposter',
    text: 'After the clue rounds, everyone votes for who they think the imposter is. The player with the most votes is eliminated.',
  },
  {
    name: 'Last chance',
    text: 'If the imposter is caught, they get one final chance to guess the secret word. Guess it right and the imposter still wins.',
  },
];

const faqs = [
  {
    q: 'What is El Impostor (The Imposter)?',
    a: 'El Impostor is a free multiplayer social deduction word game you play in the browser. Everyone shares a secret word except the imposter, who must blend in while the group tries to unmask them through one-word clues and a vote.',
  },
  {
    q: 'How many players do you need?',
    a: 'Between 3 and 15 players. It works best with 4 to 8.',
  },
  {
    q: 'Is it free? Do I need an account or an app?',
    a: 'It is completely free and needs no account or download. It runs in any modern browser on iPhone, Android, tablets and computers, and can be installed as an app (PWA).',
  },
  {
    q: 'Can we play remotely?',
    a: 'Yes. Each player joins from their own device with the room code or link, and there is a built-in group video call so you can see each other while giving clues. It also works in person, in the same room.',
  },
  {
    q: 'How does the imposter win?',
    a: 'The imposter wins if they are not voted out, or if they are voted out but correctly guess the secret word. The group wins by eliminating the imposter before they can guess the word.',
  },
  {
    q: 'What languages and word categories are available?',
    a: 'The game is available in Spanish, English, German and Dutch, with categories such as animals, food, places, professions, movies, sports, objects and nature, or all of them mixed.',
  },
  {
    q: 'What game options can the host change?',
    a: 'The host picks the word category, the number of clue rounds, an optional timer per phase, whether the imposter receives a hint, and a "troll mode" in which, occasionally, everyone is the imposter.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HowTo',
      name: `How to play ${SITE_NAME} (The Imposter)`,
      description: PAGE_DESCRIPTION,
      totalTime: 'PT10M',
      supply: [{ '@type': 'HowToSupply', name: 'One phone or computer per player' }],
      step: steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'How to play', item: `${SITE_URL}/about` },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden" lang="en">
      <script
        type="application/ld+json"
        // Static data only: safe to inline.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-280px] h-[620px] w-[1200px] max-w-[220vw] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(124,58,237,0.22),rgba(124,58,237,0))]"
      />

      <header className="relative mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            alt=""
            src="/imposter192x192.png"
            width={36}
            height={36}
            className="size-9 rounded-xl"
          />
          <span className="font-display text-lg font-bold">{SITE_NAME}</span>
        </Link>
        <Link
          href="/"
          className="flex h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Play now
        </Link>
      </header>

      <main className="relative mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 lg:pt-12">
        <article className="flex flex-col gap-12">
          <section>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-fg">
              Free online party game
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">
              El Impostor (The Imposter): the word game where one player doesn&apos;t know the
              secret
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-fg-soft">
              <strong>El Impostor</strong> is a free multiplayer social deduction word game for 3 to
              15 players. Everyone receives the same secret word except the imposter, who has to
              bluff their way through. Players give one-word clues, then vote to unmask the
              imposter. Play in person or remotely with the built-in video call — no sign-up, no
              download, on any phone or computer.
            </p>
          </section>

          <section aria-labelledby="how-to-play">
            <h2 id="how-to-play" className="font-display text-2xl font-bold sm:text-3xl">
              How to play
            </h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {steps.map((step, i) => (
                <li
                  key={step.name}
                  className="flex gap-4 rounded-[20px] border border-line bg-surface p-5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.name}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="who-wins" className="grid gap-3 sm:grid-cols-2">
            <h2 id="who-wins" className="font-display text-2xl font-bold sm:col-span-2 sm:text-3xl">
              Who wins?
            </h2>
            <div className="rounded-[20px] border border-success/35 bg-success/10 p-5">
              <h3 className="font-semibold text-success">The group wins if…</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-fg-soft">
                they vote out the imposter and the imposter fails to guess the secret word.
              </p>
            </div>
            <div className="rounded-[20px] border border-danger-fg/40 bg-danger/12 p-5">
              <h3 className="font-semibold text-danger-fg">The imposter wins if…</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-fg-soft">
                they survive the vote, or they are caught but correctly guess the secret word.
              </p>
            </div>
          </section>

          <section aria-labelledby="tips">
            <h2 id="tips" className="font-display text-2xl font-bold sm:text-3xl">
              Tips
            </h2>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-fg-soft">
              <li>Regular players: give clues that are specific but not obvious.</li>
              <li>Watch everyone&apos;s clues — vague or off-topic words are suspicious.</li>
              <li>Imposter: listen first, then give a generic clue that fits many words.</li>
              <li>The host can add a timer, more clue rounds, an imposter hint or troll mode.</li>
            </ul>
          </section>

          <section aria-labelledby="faq">
            <h2 id="faq" className="font-display text-2xl font-bold sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-line bg-surface px-5 py-4"
                >
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-center gap-4 rounded-3xl border border-accent-soft/35 bg-accent/16 p-8 text-center">
            <h2 className="font-display text-2xl font-bold">Ready to find the imposter?</h2>
            <p className="text-fg-soft">Create a room in seconds and share the code.</p>
            <Link
              href="/"
              className="flex h-14 items-center rounded-2xl bg-accent px-8 font-semibold text-white shadow-[0_10px_28px_rgba(124,58,237,0.35)] transition-colors hover:bg-accent-hover"
            >
              Play El Impostor free
            </Link>
          </section>
        </article>
      </main>
    </div>
  );
}
