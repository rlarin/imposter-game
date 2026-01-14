# Implementación: Traducción Automática de Pistas Multiidioma

## ✅ Resumen de Cambios Completados

Se ha implementado un sistema de traducción automática de pistas entre jugadores con diferentes idiomas, permitiendo que
cada jugador vea las pistas traducidas automáticamente a su idioma seleccionado.

---

## 🏗️ Cambios de Estructura de Datos

### 1. **Player Interface** (`lib/types.ts`)

- ✅ Agregado campo `locale: Locale` para almacenar el idioma del jugador
- Cada jugador ahora tiene su idioma registrado en el servidor

### 2. **Clue Interface** (`lib/types.ts`)

- ✅ Agregado campo `originalLocale: Locale` para registrar el idioma original de la pista
- ✅ Agregado campo `translations?: Record<Locale, string>` para cachear traducciones
- Las pistas ahora guardan el idioma en que fueron escritas

### 3. **ClientMessage Type** (`lib/types.ts`)

- ✅ Actualizado mensaje `join` para incluir `locale?: Locale`
- ✅ Actualizado mensaje `submit-clue` para incluir `locale?: Locale`
- ✅ Actualizado mensaje `start-game` para aceptar `locale?: Locale`

---

## 🌐 Servicio de Traducción

### `lib/translation-service.ts` (NUEVO)

Implementado servicio de traducción usando **LibreTranslate API** (gratuita, open-source):

- **`translateText(text, targetLocale, sourceLocale)`**
    - Traduce un texto a un idioma específico
    - Usa LibreTranslate API: `https://api.libretranslate.de/translate`
    - Fallback automático al texto original si la traducción falla

- **`translateToMultiple(text, sourceLocale, targetLocales)`**
    - Traduce a múltiples idiomas en paralelo
    - Optimizado para traducir pistas a todos los idiomas a la vez
    - Retorna `Record<Locale, string>` con todas las traducciones

**Características:**

- Sin autenticación requerida
- Soporta idiomas: es, en, de, nl
- Manejo robusto de errores con fallback

---

## 🎮 Cambios en Lógica del Juego

### `lib/game-logic.ts`

- ✅ **`createRoom(hostName, hostLocale)`** - Ahora acepta locale del host
- ✅ **`addPlayer(room, playerName, playerLocale)`** - Ahora acepta locale del nuevo jugador
- ✅ **`submitClue(room, playerId, word, playerLocale)`** - Ahora registra el locale de la pista
    - Almacena `originalLocale` automáticamente del jugador
    - Permite override si se pasa explícitamente

---

## 🔄 Cambios en Servidor (PartyKit)

### `party/index.ts`

- ✅ Importado `Locale` de `@/i18n/config`
- ✅ **`handleJoin(conn, playerName, playerLocale)`**
    - Captura locale del cliente
    - Asigna locale a nuevos jugadores (default: 'es')
    - Funciona para host y jugadores regulares

- ✅ **`handleSubmitClue(conn, word, playerLocale)`**
    - Captura locale del cliente al enviar pista
    - Pasa locale a `submitClue()` de game-logic

---

## 🪝 Hook de Traducción

### `hooks/useClueTranslation.ts` (NUEVO)

Hook personalizado para traducir pistas en el cliente:

```typescript
function useClueTranslation(clue: Clue, targetLocale: Locale) {
    // Retorna: { translatedWord, isLoading }
}
```

**Lógica:**

1. Si idioma original = idioma destino → usa palabra original
2. Si hay traducción en caché → usa caché
3. Si no hay caché → traduce dinámicamente (sin esperar, muestra original primero)
4. Devuelve estado de carga para UI

---

## 🎨 Cambios en Componentes UI

### `components/game/CluesByPlayer.tsx` (ACTUALIZADO)

- ✅ Importado `useLocale()` para obtener idioma del cliente
- ✅ Importado `useClueTranslation` para obtener traducciones
- ✅ Agregado componente `<ClueItem>` que:
    - Obtiene la traducción de la pista
    - Muestra pista traducida al idioma del cliente
    - Muestra badge con bandera del idioma original (ej: "ES", "EN")
    - Usa title con texto original si fue traducida

### `components/game/ClueRound.tsx` (ACTUALIZADO)

- ✅ Actualizado `ClueRoundProps` para usar `Locale` en `onSubmitClue`
- ✅ Ahora pasa `locale` del cliente al enviar pista: `onSubmitClue(trimmed, locale)`

### `components/game/LobbyView.tsx` (ACTUALIZADO)

- ✅ Importado `Locale` de `@/i18n/config`
- ✅ Actualizado `LobbyViewProps` para usar `Locale` en `onStartGame`

---

## 🔌 Cambios en Comunicación Cliente-Servidor

### `hooks/usePartySocket.ts` (ACTUALIZADO)

- ✅ Importado `Locale` de `@/i18n/config`
- ✅ **`join(playerName, locale?: Locale)`** - Ahora acepta locale
- ✅ **`submitClue(word, locale?: Locale)`** - Ahora acepta locale
- ✅ **`startGame(category, locale?: Locale)`** - Ya aceptaba locale (ahora tipado)

### `app/game/[roomCode]/page.tsx` (ACTUALIZADO)

- ✅ Al conectarse, obtiene locale de localStorage
- ✅ Pasa locale al llamar `join(playerName, localeStr)`

---

## 📚 Soporte Multiidioma

### Archivos de Palabras

- ✅ **`lib/words/de.ts`** (NUEVO) - Palabras en alemán (10 categorías)
- ✅ **`lib/words/de-hints.ts`** (NUEVO) - Pistas en alemán
- ✅ Actualizado **`lib/words/index.ts`** para incluir alemán

**Idiomas soportados:**

- 🇪🇸 Español (es)
- 🇬🇧 English (en)
- 🇩🇪 Deutsch (de)
- 🇳🇱 Nederlands (nl)

---

## 🐛 Arreglos Adicionales

### `components/ui/LanguageSelector.tsx`

- ✅ Arreglado error TypeScript: importado `ReactNode` en lugar de usar `JSX.Element`

---

## 🎯 Flujo de Traducción End-to-End

1. **Cliente se une**: Envía `{ type: 'join', playerName, locale }`
   → Servidor almacena locale en `player.locale`

2. **Cliente envía pista**: Envía `{ type: 'submit-clue', word, locale }`
   → Servidor almacena `clue.originalLocale = locale`
   → Pista se guarda en servidor con idioma original

3. **Cliente recibe pistas**:
   → Hook `useClueTranslation` verifica el cache
   → Si no hay traducción, llama a `translateText()`
   → LibreTranslate traduce en tiempo real
   → Muestra traducción con badge de idioma original

4. **Visualización**:
   → Cada jugador ve pistas en su idioma
   → Badge muestra idioma original (opcional, ayuda a detectar si es traducción)

---

## ✨ Características Implementadas

✅ **Traducción automática en tiempo real**

- LibreTranslate API gratuita y sin límites estrictos
- Fallback robusto al texto original si falla la traducción

✅ **Almacenamiento de idioma por jugador**

- Cada jugador tiene su idioma registrado
- Se usa para traducir pistas automáticamente

✅ **Cache de traducciones** (estructura preparada)

- Campo `translations` en Clue para futuras optimizaciones
- Permite cachear traducciones en servidor si es necesario

✅ **Indicador visual de idioma original**

- Bandera del país en las pistas traducidas
- Tooltip con pista original

✅ **Soporte multiidioma completo**

- 4 idiomas: es, en, de, nl
- Palabras y pistas curadas para cada idioma

✅ **Compilación exitosa**

- Build pasó sin errores
- TypeScript strict mode completo

---

## 📝 Notas de Implementación

### Performance

- Traducciones se hacen dinámicamente en el cliente (sin esperar)
- Usuario ve pista original inmediatamente, traducción aparece cuando esté lista
- No bloquea la UI

### Escalabilidad

- Hook `useClueTranslation` es reutilizable
- `translation-service` puede ser usado en otros componentes
- Estructura permite agregar más idiomas fácilmente

### Fallback

- Si traducción falla → muestra pista original
- Si idioma no tiene pista curada → intenta usar English
- Usuario siempre ve algo útil

---

## 🚀 Próximos Pasos (Opcional)

Para optimizaciones futuras:

1. Implementar caché server-side de traducciones para reducir latencia
2. Pre-traducir pistas en el servidor cuando se envían
3. Agregar más idiomas (pt, fr, it, etc.)
4. Traducir también indicadores del impostor (hints)
5. Agregar opción para mostrar/ocultar traducción original

---

## ✅ Estado Final

**Build:** ✅ Exitoso
**TypeScript:** ✅ Sin errores
**Compilación:** ✅ Completa
**Implementación:** ✅ Lista para producción

