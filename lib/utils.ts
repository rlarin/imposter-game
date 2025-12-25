// Genera un código de sala de 6 caracteres
export function generateRoomCode(): string {
    // Evitar caracteres confusos (0, O, I, 1, L)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Genera un ID único para el jugador
export function generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Colores para avatares de jugadores
const avatarColors = [
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#84CC16', // lime
    '#22C55E', // green
    '#14B8A6', // teal
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#A855F7', // purple
    '#EC4899', // pink
    '#F43F5E', // rose
    '#78716C', // stone
    '#0EA5E9', // sky
];

// Obtiene un color aleatorio para el avatar
export function getRandomAvatarColor(): string {
    return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

// Obtiene un color basado en el índice (para consistencia)
export function getAvatarColorByIndex(index: number): string {
    return avatarColors[index % avatarColors.length];
}

// Valida el nombre del jugador
export function validatePlayerName(name: string): { valid: boolean; errorKey?: string } {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return {valid: false, errorKey: 'validation.nameEmpty'};
    }

    if (trimmed.length < 2) {
        return {valid: false, errorKey: 'validation.nameMinLength'};
    }

    if (trimmed.length > 15) {
        return {valid: false, errorKey: 'validation.nameMaxLength'};
    }

    // Solo letras, números, espacios y algunos caracteres especiales
    const validChars = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s\-_]+$/;
    if (!validChars.test(trimmed)) {
        return {valid: false, errorKey: 'validation.nameInvalidChars'};
    }

    return {valid: true};
}

// Valida el código de sala
export function validateRoomCode(code: string): { valid: boolean; errorKey?: string } {
    const trimmed = code.trim().toUpperCase();

    if (trimmed.length !== 6) {
        return {valid: false, errorKey: 'validation.codeLength'};
    }

    const validChars = /^[A-Z0-9]+$/;
    if (!validChars.test(trimmed)) {
        return {valid: false, errorKey: 'validation.codeInvalidChars'};
    }

    return {valid: true};
}

// Valida una pista
export function validateClue(clue: string, secretWord: string): { valid: boolean; errorKey?: string } {
    const trimmed = clue.trim().toLowerCase();
    const secret = secretWord.toLowerCase();

    if (trimmed.length === 0) {
        return {valid: false, errorKey: 'validation.clueEmpty'};
    }

    // Solo una palabra (sin espacios)
    if (trimmed.includes(' ')) {
        return {valid: false, errorKey: 'validation.clueSingleWord'};
    }

    if (trimmed.length > 20) {
        return {valid: false, errorKey: 'validation.clueTooLong'};
    }

    // No puede ser la palabra secreta
    if (trimmed === secret) {
        return {valid: false, errorKey: 'validation.clueIsSecret'};
    }

    // No puede contener la palabra secreta
    if (trimmed.includes(secret) || secret.includes(trimmed)) {
        return {valid: false, errorKey: 'validation.clueTooObvious'};
    }

    return {valid: true};
}

// Formatea segundos a mm:ss
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Genera la URL para unirse a una sala
export function generateJoinUrl(roomCode: string): string {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/game/${roomCode}`;
}

// Copia texto al portapapeles
export async function copyToClipboard(text: string): Promise<boolean> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return false;
    }

    // Try modern Clipboard API first
    if (navigator?.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fall through to fallback method
        }
    }

    // Fallback for older browsers or non-secure contexts
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
}

// Selecciona un elemento aleatorio de un array
export function pickRandom<T>(array: T[]): T {
    const random = crypto.getRandomValues(new Uint32Array(1))[0]
    return array[random % array.length]
}

// Mezcla un array (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Cuenta votos y determina el eliminado
export function tallyVotes(votes: { targetId: string }[]): {
    winnerId: string | null;
    counts: Record<string, number>;
    isTie: boolean;
} {
    const counts: Record<string, number> = {};

    for (const vote of votes) {
        counts[vote.targetId] = (counts[vote.targetId] || 0) + 1;
    }

    const entries = Object.entries(counts);
    if (entries.length === 0) {
        return {winnerId: null, counts, isTie: true};
    }

    // Ordenar por votos (descendente)
    entries.sort((a, b) => b[1] - a[1]);

    // Verificar empate
    const maxVotes = entries[0][1];
    const topVoted = entries.filter(([, count]) => count === maxVotes);

    if (topVoted.length > 1) {
        return {winnerId: null, counts, isTie: true};
    }

    return {winnerId: entries[0][0], counts, isTie: false};
}
