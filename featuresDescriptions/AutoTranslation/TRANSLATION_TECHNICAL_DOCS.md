# Documentación Técnica: Sistema de Traducción Multiidioma

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Flujo de Datos](#flujo-de-datos)
3. [Estructura de Tipos](#estructura-de-tipos)
4. [API de Traducción](#api-de-traducción)
5. [Integración con Componentes](#integración-con-componentes)
6. [Mantenimiento y Extensión](#mantenimiento-y-extensión)

---

## 🏛️ Arquitectura General

### Capas del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE (React)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ useClueTranslation Hook                          │   │
│  │ (Obtiene traducciones en tiempo real)           │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ translation-service.ts                           │   │
│  │ (Llama a LibreTranslate API)                     │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ LibreTranslate API (Gratuita)                    │   │
│  │ https://api.libretranslate.de/translate          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↑↓
┌─────────────────────────────────────────────────────────┐
│              SERVIDOR (PartyKit)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ party/index.ts                                   │   │
│  │ - Almacena locale de cada jugador               │   │
│  │ - Almacena originalLocale de cada pista          │   │
│  │ - Envía pistas al cliente con idioma original    │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↑↓                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ lib/game-logic.ts                                │   │
│  │ - submitClue() almacena locale de pista          │   │
│  │ - Funciones helper con parámetros de locale      │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↑↓                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ lib/types.ts                                     │   │
│  │ - Player.locale                                  │   │
│  │ - Clue.originalLocale                            │   │
│  │ - Clue.translations (cache)                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### 1. Cliente se Une a Partida

```
Cliente (con locale seleccionado)
  ↓ 
  sends: { type: 'join', playerName, locale: 'es' }
  ↓
Party Server (handleJoin)
  ↓
  Crea/Actualiza Player { id, name, locale: 'es', ... }
  ↓
  Broadcast state a todos los clientes
  ↓
Clientes reciben: { type: 'room-state', room: {...} }
  ↓
  LocalState actualiza con nuevo jugador y su locale
```

### 2. Cliente Envía Pista

```
Cliente (idioma: 'es')
  ↓
  [Usuario escribe pista: "Madrid"]
  ↓
  sends: { type: 'submit-clue', word: 'madrid', locale: 'es' }
  ↓
Party Server (handleSubmitClue)
  ↓
  game-logic.submitClue(room, playerId, 'madrid', 'es')
  ↓
  Crea Clue {
    playerId,
    playerName,
    word: 'madrid',
    originalLocale: 'es',
    round: 1
  }
  ↓
  Agrega a room.clues[]
  ↓
  Broadcast state a todos los clientes
  ↓
Todos los clientes reciben: Clue con word='madrid', originalLocale='es'
```

### 3. Cliente Renderiza Pista Traducida

```
Cliente (idioma seleccionado: 'en')
  ↓
  Recibe Clue { word: 'madrid', originalLocale: 'es' }
  ↓
  CluesByPlayer component se renderiza
  ↓
  Para cada clue, llama: <ClueItem clue={clue} currentRound={1} />
  ↓
  ClueItem llama: useClueTranslation(clue, 'en')
  ↓
  Hook verifica:
    - ¿originalLocale == 'en'? → Usa word original ('madrid')
    - ¿Hay clue.translations['en']? → Usa caché ('madrid' en inglés)
    - Si no → Llama translateText('madrid', 'en', 'es')
  ↓
  translation-service.translateText('madrid', 'en', 'es')
  ↓
  POST a https://api.libretranslate.de/translate {
    q: 'madrid',
    source_language: 'es',
    target_language: 'en'
  }
  ↓
  API retorna: { translatedText: 'Madrid' }
  ↓
  Hook actualiza estado: translatedWord = 'Madrid'
  ↓
  ClueItem renderiza: <span>Madrid</span> + <span>ES</span> (bandera)
```

---

## 📊 Estructura de Tipos

### Player

```typescript
interface Player {
    id: string;
    name: string;
    avatarColor: string;
    locale: Locale;  // ← NUEVO: idioma del jugador
    isHost: boolean;
    isImposter: boolean;
    isEliminated: boolean;
    isConnected: boolean;
    hasSubmittedClue: boolean;
    hasVoted: boolean;
    hasVotedWordChange: boolean;
}
```

### Clue

```typescript
interface Clue {
    playerId: string;
    playerName: string;
    word: string;  // Palabra original en su idioma
    originalLocale: Locale;  // ← NUEVO: idioma original
    translations?: Record<Locale, string>;  // ← NUEVO: caché de traducciones
    round: number;
}
```

### Locale

```typescript
type Locale = 'es' | 'en' | 'de' | 'nl';
```

### ClientMessage

```typescript
|
{
    type: 'join';
    playerName: string;
    locale ? : Locale
}
|
{
    type: 'submit-clue';
    word: string;
    locale ? : Locale
}
|
{
    type: 'start-game';
    category: string;
    locale ? : Locale
}
```

---

## 🌐 API de Traducción

### LibreTranslate

**Endpoint:** `https://api.libretranslate.de/translate`
**Método:** POST
**Autenticación:** Ninguna (público)
**Rate Limit:** Suficiente para uso casual (no hay límites estrictos)

#### Request

```json
{
  "q": "texto a traducir",
  "source_language": "es",
  "target_language": "en"
}
```

#### Response

```json
{
  "translatedText": "text to translate",
  "detectedLanguage": {
    "confidence": 1,
    "language": "es"
  }
}
```

#### Mapeo de Idiomas

```typescript
const LOCALE_TO_LANG_CODE: Record<Locale, string> = {
    es: 'es',
    en: 'en',
    de: 'de',
    nl: 'nl',
};
```

### Funciones del Servicio

#### `translateText(text, targetLocale, sourceLocale = 'en')`

- Traduce un texto a un idioma específico
- **Parámetros:**
    - `text: string` - Texto a traducir
    - `targetLocale: Locale` - Idioma destino
    - `sourceLocale: Locale` - Idioma origen (default: 'en')
- **Retorna:** `Promise<string>` - Texto traducido o original si falla
- **Manejo de errores:** Log en consola + fallback automático

#### `translateToMultiple(text, sourceLocale, targetLocales = locales)`

- Traduce a múltiples idiomas en paralelo
- **Parámetros:**
    - `text: string` - Texto a traducir
    - `sourceLocale: Locale` - Idioma origen
    - `targetLocales: Locale[]` - Array de idiomas destino
- **Retorna:** `Promise<Record<Locale, string>>` - Todas las traducciones
- **Uso:** Para pre-traducir pistas a todos los idiomas

---

## 🎨 Integración con Componentes

### Hook: useClueTranslation

```typescript
function useClueTranslation(clue: Clue, targetLocale: Locale) {
    // Estado
    const [translatedWord, setTranslatedWord] = useState<string>(clue.word);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Lógica de traducción
        // 1. Si mismo idioma → original
        // 2. Si en caché → caché
        // 3. Si no → traducir dinámicamente
    }, [clue, targetLocale]);

    return {translatedWord, isLoading};
}
```

### Uso en Component

```typescript
function ClueItem({clue, currentRound}: Props) {
    const {locale} = useLocale();
    const {translatedWord, isLoading} = useClueTranslation(clue, locale);

    return (
        <span className = "..." >
            <span>R
    {
        clue.round
    }
    </span>
    < span > {isLoading ? clue.word : translatedWord} < /span>
    {
        clue.originalLocale !== locale && (
            <span>{localeFlags[clue.originalLocale]} < /span>
        )
    }
    </span>
)
    ;
}
```

### Componentes Actualizados

1. **CluesByPlayer.tsx** - Renderiza pistas con traducciones
2. **ClueRound.tsx** - Pasa locale al enviar pista
3. **LobbyView.tsx** - Acepta locale en onStartGame

---

## 🔧 Mantenimiento y Extensión

### Agregar Nuevo Idioma

**1. Actualizar `i18n/config.ts`**

```typescript
export const locales = ['es', 'en', 'de', 'nl', 'pt'] as const;
```

**2. Crear palabras en `lib/words/pt.ts`**

```typescript
export const ptWordCategories: WordCategory[] = [
    {id: 'animals', name: 'Animais', emoji: '🐾', words: [...]},
    // ...
];
```

**3. Crear pistas en `lib/words/pt-hints.ts`**

```typescript
export const ptWordHints: WordHintsMap = {
    palavra: ['pista1', 'pista2', ...],
    // ...
};
```

**4. Importar en `lib/words/index.ts`**

```typescript
import {ptWordCategories} from './pt';
import {ptWordHints} from './pt-hints';

const wordsByLocale = {..., pt: ptWordCategories};
const hintsByLocale = {..., pt: ptWordHints};
```

**5. Agregar nombre en allCategoryNames**

```typescript
const allCategoryNames = {..., pt: 'Tudo'};
```

### Optimizaciones Futuras

#### 1. Pre-traducir en Servidor

```typescript
// party/index.ts - handleSubmitClue
async function handleSubmitClue(conn, word, playerLocale) {
    // Pre-traducir a todos los idiomas
    const translations = await translateToMultiple(
        word,
        playerLocale,
        locales
    );

    const clue: Clue = {
        word,
        originalLocale: playerLocale,
        translations, // ← Caché completo
    };
}
```

#### 2. Cache Persistente

```typescript
// Guardar traducciones en Redis/KV
await kv.set(
    `translations:${clue.word}:${sourceLocale}:${targetLocale}`,
    translatedText
);
```

#### 3. Batch Translations

```typescript
// Si hay múltiples pistas, traducir en lotes
const clues = [...];
const uniqueWords = [...new Set(clues.map(c => c.word))];
const translations = await Promise.all(
    uniqueWords.map(word => translateText(word, locale))
);
```

---

## 🚀 Performance

### Métricas Actuales

- **Traducción de 1 palabra:** ~1-3 segundos
- **No bloquea UI:** Estado original se muestra inmediatamente
- **Uso de memoria:** Minimal (un hook por clue renderizado)

### Optimizaciones Implementadas

✅ Traducción dinámica en cliente (no espera)
✅ Estado original visible mientras se traduce
✅ Hook optimizado con dependencias correctas
✅ Caché preparado en estructura Clue

### Futuras Optimizaciones

- [ ] Server-side pre-translation
- [ ] Redis cache para traducciones frecuentes
- [ ] Batch API requests
- [ ] WebSocket subscriptions para traducciones en tiempo real

---

## 📚 Referencias

- **LibreTranslate:** https://www.libretranslate.com/
- **Locale en i18n:** `@/i18n/config.ts`
- **Translation Service:** `lib/translation-service.ts`
- **Hook:** `hooks/useClueTranslation.ts`
- **Tipos:** `lib/types.ts`

---

## ✅ Checklist de Desarrollo

Si necesitas hacer cambios:

- [ ] Cambios en `types.ts` requieren actualizar tests
- [ ] Cambios en `translation-service.ts` no requieren cambios en cliente
- [ ] Cambios en `useClueTranslation.ts` requieren verificar renderizado
- [ ] Agregar idioma requiere palabras Y pistas curadas
- [ ] Server-side changes requieren actualizar TypeScript types
- [ ] Nuevos endpoints requieren documentación

---

## 📞 Soporte

**Errores comunes:**

1. **"Cannot find module 'translation-service'"**
    - Verifica ruta de importación: `@/lib/translation-service`

2. **"Property 'locale' is missing"**
    - Asegúrate de que Player siempre tenga locale (default: 'es')

3. **"Translation returns original text"**
    - Verifica conexión a internet
    - LibreTranslate API podría estar caída
    - Revisa console para errores específicos

4. **"Hook dependency warnings"**
    - useClueTranslation está correctamente optimizado
    - No agregar variables al useEffect sin incluir en dependencias

