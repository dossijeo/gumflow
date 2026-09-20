# GUMFLOW — CrazyGames distribution

Esta integración está preparada para **Basic Launch**, no para anunciar soporte
completo de monetización/cuentas/guardado en nube. No publica nada por sí sola.
No altera la física, los niveles, los archivos de música ni los disparadores
musicales de GUMFLOW. Tampoco cambia la licencia de esos recursos.

## Construir desde Termux / PC

Con Node.js 22 o superior, desde la raíz del repositorio:

```sh
npm run build:crazygames
npm run dev:crazygames
```

No hace falta `npm install`, Rust ni Tauri para esta variante. El servidor usa
`http://127.0.0.1:5173`; al recargar recompone las fuentes editadas. Ctrl+C lo para.
Para escuchar el audio en un navegador que bloquea autoplay, pulsa una vez un
control del juego. La política del navegador sigue siendo aplicable.

Salidas:

```text
dist/
  gumflow-crazygames.zip           # ESTE ZIP es el que se sube al portal
  gumflow-crazygames.zip.sha256
  gumflow-crazygames-build.json    # inventario, tamaño y hashes
  crazygames/
    index.html
    game.js
    styles.css
    crazygames.js                 # adaptador propio, NO una copia del SDK
    assets/
```

Los 24 MP3/WebP originales se copian sin recomprimir. Solo la variante CrazyGames
carga `https://sdk.crazygames.com/crazygames-sdk-v3.js`. Se mantiene remoto como
indica la documentación oficial. El ZIP **no es autocontenido sin conexión**:
el SDK necesita Internet. Los otros productos siguen sin cargarlo.

## GitHub Actions, desde el móvil

1. Sube este parche a `main`.
2. Abre **Actions → Build CrazyGames package → Run workflow → main**.
   Los cambios en código también disparan este workflow automáticamente; no
   necesitas lanzarlo dos veces si ya está ejecutándose por el push.
3. Se ejecutan las pruebas Node, preservación del núcleo, construcción del ZIP y
   pruebas Chromium con SDK simulado. No se compilan Windows/Linux.
4. Descarga el artifact **gumflow-release-crazygames**.
5. Extrae el ZIP exterior de GitHub. Dentro está
   **GUMFLOW-v6.1.2-crazygames.zip**, más el informe y el SHA-256.
6. Sube ese ZIP interior al Developer Portal como juego HTML5. No subas el ZIP
   del artifact ni el instalador Windows ni el paquete de itch.io.

El número procede de `config/project.json`: cambiará al usar `version:set` en
una futura release. Este parche conserva 6.1.2 en los paquetes; no fuerza una
nueva publicación. La pantalla del juego conserva su versión de contenido 6.1.

El workflow **Draft release** incorpora un job CrazyGames paralelo a los builds
existentes y adjunta el paquete a los nuevos borradores. No modifica la Release
v6.1.2 ya publicada. Para una próxima Release utiliza una versión/tag NUEVOS:

```sh
npm run version:set -- 6.1.3
npm run release:check
# Revisa, prueba, haz commit y push antes de crear y subir v6.1.3.
```

## Contrato del SDK v3

- Carga el SDK y espera `await window.CrazyGames.SDK.init()` **antes** de evaluar
  `game.js`. Un fallo de red/init muestra un mensaje de error y Reintentar; no
  finge éxito ni arranca una partida sin seguimiento en el portal.
- Consulta `SDK.environment` después de init. Solo llama a los módulos cuando
  es `local` o `crazygames`. En `disabled` u otro valor no accede a los módulos:
  permite probar el juego sin eventos, sin inventar dominios o sitelocks.
- Emite `game.loadingStart()` antes de cargar el motor; `loadingStop()` cuando
  el menú y las imágenes de mundos/Endless están listos. La música se decodifica
  con la estrategia existente, sin bloquear el menú con las tres pistas enteras.
- `gameplayStart()` solo cuando el estado real del juego pasa a `playing`.
  `gameplayStop()` al pausar, morir, terminar nivel/carrera o entrar en menús.
  Volver a jugar/reaparecer emite un nuevo inicio; no envía un evento por frame.
- Una pausa automática por pérdida de foco/visibilidad **no** emite stop/start
  solo por ese motivo. CrazyGames gestiona el foco. La pausa del juego se
  conserva; si después eliges volver al menú, sí termina el segmento jugable.
- Lee `game.settings.muteAudio` y registra `addSettingsChangeListener`. Un gain
  final reúne música HD, ambiente, chiptune y efectos; silencia también los
  sonidos ya programados. Los ajustes del juego no pueden anular ese mute.
  No se escribe el mute del portal en `localStorage`; al quitarlo se conservan
  las preferencias y volúmenes que el jugador hubiera elegido.
- En idioma **Auto**, usa `SDK.user.systemInfo.locale`: español para `es`,
  `es-ES`, etc.; inglés si falta o no está soportado. La selección manual
  Español/English continúa funcionando y guardándose localmente.
- No muestra ni ejecuta pantalla completa propia desde título, HUD ni mando.
  El control Y/△ no solicita fullscreen en esta variante. F11 del propio
  navegador y el botón fullscreen del portal no se interceptan.

No hay integración de anuncios, User login, Data/cloud saves, compras ni otros
trackers del desarrollador. El acceso a `user.systemInfo` solo consulta el locale
ya disponible; no solicita la cuenta ni sube el progreso del jugador.

## Validación local y Preview Tool

Pruebas sin tráfico real a CrazyGames:

```sh
npm test
npm run verify:core
npm run build:crazygames
python -m pip install playwright==1.55.0
python -m playwright install chromium
python tests/browser_crazygames.py
# --browser /ruta/a/chromium permite usar otro Chromium instalado.
```

Los tests simulan explícitamente el SDK, `localStorage`, mandos y ciertos eventos
de foco. No certifican un portal real ni un mando físico. Incluyen decodificación
y medición de señal real de Web Audio dentro de Chromium.

En localhost con conexión se usa el SDK **real**, en entorno `local`. La URL
`http://127.0.0.1:5173/?muteAudio=true` permite probar el mute mediante el SDK.
Para probar desde otro dispositivo/IP local, el SDK documenta
`?useLocalSdk=true`; sirve el desarrollo explícitamente en tu LAN de confianza.

En el **Preview Tool oficial**, comprobar antes de enviar:

- Menú sin evento gameplayStart prematuro. Inicio al comenzar Historia,
  Free Play, práctica de jefe y Endless; parada al pausar, morir y salir.
- Silencio impuesto por el portal en título, partida y Museo, también al pulsar
  los interruptores del juego. Quitar el mute no debe borrar un silencio manual.
- Sin botones propios de fullscreen ni acciones desde Y/△. El botón del portal
  debe seguir funcionando al redimensionar el iframe.
- Idioma automático según locale del portal y selección manual de idioma.
- Ventanas de 821×462/907×510 y móvil horizontal 800×450, teclas y táctil.
- Audio HD, ambientes, efectos, versión clásica y guardado local al recargar.
- Ningún enlace de promoción a itch.io o a otros portales dentro del juego.

Para diagnosticar, la consola expone:

```js
GumflowCrazyGames.snapshot()       // entorno, init/ready, mute, eventos y errores
GumflowCrazyGames.audioSnapshot()  // gain y RMS de la salida real; no datos personales
```

No debes dar por superado QA únicamente porque el workflow esté verde.
**Full Launch** requerirá revisar requisitos adicionales (por ejemplo guardado
Data SDK cuando aplique, onboarding y monetización), no solo activar una flag.

## Privacidad y distribución

La edición CrazyGames carga un SDK de terceros y envía eventos del juego a esa
plataforma; sus servicios y políticas se aplican. Las afirmaciones de juego
completamente offline corresponden a HTML standalone/itch.io/desktop originales,
no a esta distribución. No añadas una promesa de cero comunicaciones a su ficha.
No se solicita aprobación de SignPath ni se cambia ningún certificado aquí.

## Fuentes oficiales consultadas (20-09-2026)

- SDK/init/entornos: https://docs.crazygames.com/sdk/intro/
- Eventos y muteAudio: https://docs.crazygames.com/sdk/game/
- Locale: https://docs.crazygames.com/sdk/user/#system-info
- Pantalla completa y promoción: https://docs.crazygames.com/requirements/gameplay/
- Tamaño, rutas, Basic Launch: https://docs.crazygames.com/requirements/technical/
- Portal de envío/Preview Tool: https://developer.crazygames.com/

## Comprobaciones de esta entrega

Base revisada: `3b2add38efbd4be587b438f30929c3c2535317e4` (20-09-2026).
Árbol base: `a47f7f18fa17d0a73c3c667fbba2bfeba382b068`.

- `npm test`: 52 pruebas aprobadas (incluidos contrato SDK, payload e aislamiento).
- `npm run verify:core`: núcleo 6.1 y 24 recursos originales sin cambios.
- Se reconstruyó una copia limpia de la base y se compararon sus 31 archivos de
  distribución ordinaria con los del proyecto ampliado: igualdad byte por byte
  en HTML autocontenido, ZIP itch, ZIP web, web desglosada y sus hashes.
- Regresión Chromium original: ambas distribuciones, ES/EN, entrada y movimiento
  en siete escenarios, siete arenas, ambos modos Endless, música, mando simulado
  y ocho casos de arranque de audio/preferencias.
- Regresión CrazyGames: inicialización, ajustes/mute dinámico, silencio de salida
  medido en Web Audio, idioma, partidas/pausas/muerte/reaparición, foco, entrada a
  siete mundos/arenas, ambos Endless, ausencia de fullscreen interno, mando
  simulado y interfaz táctil 800×450. SDK desactivado y fallos de carga también.
- ZIP: 28 archivos, `index.html` en raíz, sin tests/fixtures ni ZIPs anidados.
- Sintaxis YAML revisada. El workflow aún no se ha ejecutado en GitHub Actions;
  su validación efectiva ocurrirá tras subir el parche.

No se ha usado el SDK remoto en las pruebas automatizadas, ni una cuenta del
Developer Portal, ni una sesión del Preview Tool. Los stubs del SDK **solo**
existen dentro de `tests/` y nunca viajan con el juego. No se presenta esta
comprobación como certificación de CrazyGames ni como una prueba de mandos
físicos, una tienda publicada o un nuevo binario nativo.
