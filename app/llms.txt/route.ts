import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

// llms.txt (https://llmstxt.org): a plain-markdown summary of the site for AI agents and LLMs.
export const dynamic = 'force-static';

export function GET() {
  const body = `# ${SITE_NAME} (The Imposter)

> ${SITE_DESCRIPTION}

${SITE_NAME} is a free, browser-based multiplayer party game. It needs no account and no download,
and works on iPhone, Android, tablets and desktop browsers (installable as a PWA).

## Key facts

- Genre: social deduction / word / party game
- Players: 3 to 15 per room (best with 4 to 8)
- Price: free
- Languages: Spanish, English, German, Dutch
- Play in person or remotely; includes a built-in group video call
- Join a room with a 6-character room code, an invite link or a QR code
- Word categories: animals, food, places, professions, movies, sports, objects, nature, or all mixed
- Host options: word category, number of clue rounds, timer per phase, hint for the imposter,
  and "troll mode" (occasionally everyone is the imposter)

## How to play

1. One player creates a room at ${SITE_URL} and shares the code, link or QR code.
2. Everyone privately sees the same secret word, except the imposter, who doesn't know it.
3. Each round, every player gives a one-word clue related to the secret word.
4. Players vote for who they think the imposter is; the most-voted player is eliminated.
5. If the imposter is caught, they get one last chance to guess the word.

The group wins by eliminating the imposter before they guess the word. The imposter wins by
surviving the vote, or by being caught and still guessing the secret word.

## Links

- [Play ${SITE_NAME}](${SITE_URL}/): create or join a game room
- [How to play, rules and FAQ](${SITE_URL}/about): full rules, tips and frequently asked questions
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
