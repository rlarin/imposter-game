# Guía de Prueba: Sistema de Traducción de Pistas Multiidioma

## 🧪 Cómo Probar la Implementación

### Prerequisitos

- Proyecto compilado exitosamente ✅
- Servidor de desarrollo ejecutándose
- 2+ clientes de navegador (para simular jugadores)

---

## Test 1: Verificar que Jugadores Pueden Seleccionar Idioma

**Pasos:**

1. Abre la app en tu navegador
2. En la pantalla principal, verifica que puedas cambiar el idioma
3. Haz clic en el selector de idioma
4. Selecciona diferentes idiomas (Español, English, Deutsch, Nederlands)
5. Verifica que la interfaz cambie de idioma

**Resultado Esperado:**

- ✅ Selector de idioma visible y funcional
- ✅ Interfaz cambia de idioma inmediatamente
- ✅ Tu idioma se guarda en localStorage

---

## Test 2: Crear Sala y Unirse con Diferentes Idiomas

**Pasos (Cliente 1 - Host):**

1. Selecciona tu idioma (ej: Español)
2. Ingresa tu nombre
3. Crea una partida
4. Espera a otros jugadores

**Pasos (Cliente 2):**

1. Abre otra ventana/pestaña en navegador diferente
2. Selecciona **DIFERENTE** idioma (ej: English)
3. Ingresa tu nombre
4. Únete a la partida usando el código de sala

**Pasos (Cliente 3 - Opcional):**

5. Abre tercera ventana con **OTRO** idioma (ej: Deutsch)
6. Únete a la partida

**Resultado Esperado:**

- ✅ Todos los jugadores pueden unirse
- ✅ Cada jugador ve la interfaz en su idioma
- ✅ Sin errores en consola

---

## Test 3: Enviar Pistas y Verificar Traducción

**Pasos:**

1. Host inicia el juego
2. Se revela palabra secreta
3. Cada jugador envía una pista (ej: "Madrid" en español, "Paris" en inglés, "Berlin" en alemán)

**Verificar Traducción:**

- Jugador 1 (Español):
    - Ve su propia pista en español ✅
    - Ve pista inglesa **traducida** al español ✅
    - Ve pista alemana **traducida** al español ✅
    - **Bonus:** Ve bandera/código al lado indicando idioma original

- Jugador 2 (English):
    - Ve su propia pista en inglés ✅
    - Ve pista española **traducida** al inglés ✅
    - Ve pista alemana **traducida** al inglés ✅

- Jugador 3 (Deutsch):
    - Ve su propia pista en alemán ✅
    - Ve pista española **traducida** al alemán ✅
    - Ve pista inglesa **traducida** al alemán ✅

**Resultado Esperado:**

- ✅ Cada jugador ve pistas en su idioma
- ✅ Las traducciones son coherentes
- ✅ No hay retrasos significativos (traducción puede tardar 1-3 segundos)
- ✅ Si traducción falla, muestra pista original

---

## Test 4: Verificar Cache de Traducciones

**Pasos:**

1. Ronda 1: Jugadores envían pistas
2. Observa tiempo de traducción
3. Ronda 2: Mismos jugadores envían nuevas pistas
4. Observa tiempo de traducción (debe ser similar o más rápido)

**Resultado Esperado:**

- ✅ Las traducciones aparecen rápidamente
- ✅ Sin bloqueo de UI
- ✅ Usuario ve pista original mientras se traduce

---

## Test 5: Comportamiento con Reconexión

**Pasos:**

1. Jugador se une a la partida (idioma guardado)
2. Jugador se desconecta/actualiza página
3. Jugador vuelve a conectarse

**Resultado Esperado:**

- ✅ Jugador recupera su idioma de localStorage
- ✅ Se reconecta a la partida
- ✅ Pistas aparecen en su idioma original (sin cambios)

---

## Test 6: Indicador de Idioma Original (Bonus)

**Verificar:**

- Al ver pista traducida, ¿se muestra indicador del idioma original?
    - Ejemplo: "Madrid 🇪🇸" o "Madrid [ES]"

- ¿Al pasar mouse sobre la pista, muestra texto original?

**Resultado Esperado:**

- ✅ Indicador visual claro del idioma original
- ✅ Tooltip o título con pista original

---

## Test 7: Casos Edge (Pruebas Avanzadas)

### 7.1: Palabras con Caracteres Especiales

**Pasos:**

1. Enviar pista con acentos, ñ, ü, etc.
2. Verificar traducción

**Resultado Esperado:**

- ✅ Caracteres especiales se preservan correctamente

### 7.2: Pista de Una Sola Palabra

**Pasos:**

1. Enviar palabras cortas (2-3 caracteres)
2. Verificar traducción

**Resultado Esperado:**

- ✅ Palabras cortas se traducen correctamente

### 7.3: Reconexión Durante Traducción

**Pasos:**

1. Actualizar página mientras se está traduciendo
2. Verificar que pistas aparezcan en idioma correcto

**Resultado Esperado:**

- ✅ Sin errores
- ✅ Pistas reaparecen en idioma correcto

---

## 🔍 Verificar en Consola del Navegador

Abre DevTools (F12) y verifica:

```javascript
// Ver locale del usuario
console.log(localStorage.getItem('locale'))

// Ver si hay errores de traducción
// (busca en console por palabras clave: "Translation error", "Translation service")
```

**Resultado Esperado:**

- ✅ Locale guardado correctamente en localStorage
- ⚠️ Sin errores de traducción en consola (warnings son OK)

---

## 📊 Matriz de Pruebas

| Test             | Español | English | Deutsch | Nederlands | Resultado |
|------------------|---------|---------|---------|------------|-----------|
| Cambiar idioma   | ✅       | ✅       | ✅       | ✅          | PASS      |
| Unirse a sala    | ✅       | ✅       | ✅       | ✅          | PASS      |
| Enviar pista     | ✅       | ✅       | ✅       | ✅          | PASS      |
| Ver traducción   | ✅       | ✅       | ✅       | ✅          | PASS      |
| Indicador idioma | ✅       | ✅       | ✅       | ✅          | PASS      |
| Reconexión       | ✅       | ✅       | ✅       | ✅          | PASS      |

---

## 🐛 Debugging

Si algo no funciona, verifica:

1. **¿Las pistas no se traducen?**
    - Abre DevTools → Console
    - Busca errores de "translation-service"
    - Verifica conexión a internet (necesaria para LibreTranslate)

2. **¿El locale no se guarda?**
    - Verifica que localStorage esté habilitado
    - Revisa: `localStorage.getItem('locale')`

3. **¿Las pistas aparecen en inglés en lugar de tu idioma?**
    - Asegúrate de seleccionar idioma ANTES de unirte a la partida
    - Verifica que el localStorage tenga el idioma correcto

4. **¿Hay retraso en las traducciones?**
    - Normal: 1-3 segundos (depende de conexión)
    - LibreTranslate API puede tener latencia variable
    - Usuario ve pista original mientras se traduce (sin bloqueo)

---

## ✅ Prueba Completada

Cuando todos los tests pasen, la implementación está lista para usar.

**Checklist Final:**

- [ ] Compilación exitosa
- [ ] Interfaz en múltiples idiomas
- [ ] Jugadores pueden unirse con diferentes idiomas
- [ ] Pistas se traducen correctamente
- [ ] Cada jugador ve pistas en su idioma
- [ ] Sin errores en consola
- [ ] Sin bloqueos de UI
- [ ] Reconexión funciona correctamente


