# GUMFLOW — CrazyGames cloud / staged-loading edition

Variante **exclusiva de CrazyGames**, revisión de canal 2 sobre GUMFLOW 6.1.2.
No altera las distribuciones normales HTML, itch.io o Tauri. No añade anuncios,
compras ni peticiones de registro. No cambia las licencias de código o recursos.

## Construir / pipeline

```sh
npm run build:crazygames
npm run dev:crazygames
```

Node.js >=22; sin dependencias npm para construir. El servidor local se abre en
`http://127.0.0.1:5173`; el SDK oficial necesita Internet. No exige credenciales
ni secretos de CrazyGames en el repositorio. El workflow **Build CrazyGames
package** hace las comprobaciones de código, construye y prueba esta variante
sin compilar escritorio. Un push de estos cambios a main lo inicia.

Resultado:

```text
dist/gumflow-crazygames.zip              # Subir ESTE ZIP
  index.html                            # Menú mínimo, CSS crítico y adaptadores
  game.js                               # Código del juego, carga diferida
  styles.css                            # CSS del juego, carga diferida
  hd-menu-interlude.mp3                  # Única grabación pedida en el menú
  hd-everyday.mp3                        # Grabaciones pedidas tras empezar a jugar
  hd-claustrophobic.mp3
  hd-epic.mp3
  campaign-01-gum-works.webp             # Fondo del mundo seleccionado
  …                                     # Otros mundos, capas y miniaturas
```

**27 archivos, todos en la raíz.** No hay subcarpetas que se puedan perder al
seleccionar archivos desde Android. Los 24 MP3/WebP originales se conservan byte
por byte: se renombra su ruta de distribución, no su contenido. Se reutiliza
la función que dibuja a Gum en el juego para el pequeño menú de carga.

El artifact de Actions se llama `gumflow-release-crazygames`. Extrae el ZIP
exterior de GitHub y sube el `GUMFLOW-v…-crazygames.zip` interior. Los informes y
SHA256 no son archivos del juego y no se suben. La ejecución añade tamaños
individuales a su resumen. **No hace falta generar una nueva release nativa.**

## Formulario del portal — IMPORTANTE

- Game name: GUMFLOW; engine: HTML5.
- Progress save: **Yes, using the Data Module from the CrazyGames SDK**.
- Mobile: sí. Online multiplayer: no. SDK muteAudio: sí.
- Borra los archivos de la subida anterior y carga el ZIP completo actualizado.

Con esta variante ya NO se elige LocalStorage. Si se mantiene esa selección,
el SDK deshabilita el Data Module y el arranque lo indica expresamente. No se
silencia ese error ni se finge que un guardado local es un guardado cloud.

## Guardado y migración

Después de `await SDK.init()`, el Data Module tiene precargados los datos.
Se validan lecturas antes de iniciar el motor. El identificador `localStorage`
se sustituye **solo dentro del ámbito del juego**, por un proveedor que llama
`SDK.data.getItem`, `setItem` y `removeItem`. **window.localStorage no se modifica**;
el SDK lo necesita para su propio funcionamiento con invitados.

Campaña, continuación, registros, logros, opciones, idioma y récords Endless
usan las mismas claves existentes, pero su fuente de verdad es el SDK. No hay
una segunda copia local que sobrescriba la cuenta al iniciar. CrazyGames guarda
localmente a invitados y sincroniza al iniciar sesión; sin cuenta no hay
sincronización entre dispositivos. El SDK controla el debounce de subida y no
se afirma que cada `setItem()` implique confirmación inmediata del servidor.

La migración importa únicamente cinco claves conocidas del **mismo origen**
y solo si el almacén SDK no contiene ya datos del juego. Valida JSON/idioma,
limita tamaño y deja una marca local para no reimportar el mismo perfil en otra
cuenta. No lee datos de otras aplicaciones, ni puede acceder a partidas de
itch.io, escritorio u otros orígenes. El fichero local antiguo no se borra.

Un error de lectura inicial no crea una partida vacía sobre la nube. Los fallos
de escritura muestran un aviso y no activan un fallback local silencioso. La
campaña hace autosave periódico cada 15 segundos de juego, además de sus puntos
de guardado existentes. Free Play conserva la continuación de Historia y
Endless conserva su política original de récords, no una reanudación del mapa.
El SDK recarga juegos con Data Module al entrar/salir de cuenta; al recibir
login se bloquean escrituras del estado antiguo para proteger la nueva cuenta.

Fuera de un entorno SDK `local`/`crazygames` se indica explícitamente que se trata
de una vista previa local/sin cloud. No se llama a APIs deshabilitadas.

## Carga en etapas

1. `index.html` pinta un menú funcional y el personaje sin fuentes ni texturas
   remotas. El SDK oficial está en el head, con `defer`: no bloquea el primer
   dibujo. Los botones pueden dejar una selección pendiente mientras inicia.
2. Una vez inicializados SDK/datos, se aplican idioma, preferencias y muteAudio.
   Se pide solo el interludio del menú. Si el navegador bloquea autoplay, el
   primer toque/tecla/mando puede desbloquearlo; no se cambia una preferencia de
   silencio guardada. El estilo clásico guardado tampoco fuerza una pista HD.
3. Tras mostrar el menú, se cargan `game.js` y su CSS en segundo plano. Pulsar
   Jugar prioriza ese paso. Los menús originales completos sustituyen a la
   portada mínima, conservando el contexto/buffer y posición musical del menú.
4. Se carga el fondo del escenario elegido (o las seis capas de Endless) antes
   de habilitar su simulación. La espera no consume vidas ni adelanta la física.
5. Con el primer gameplay real, comienza la preparación serial de Everyday,
   Claustrophobic y Epic. El interludio continúa hasta que Everyday está listo,
   y se usa el fundido del motor existente. El resto de imágenes se precarga de
   una en una después, sin bloquear la primera partida. Las miniaturas/galería
   se solicitan cuando sus menús las necesitan.

El menú + MP3 ronda **0,40 MB**, más la transferencia independiente del SDK. El
módulo diferido ronda **0,45 MB**. El informe de cada build tiene las cifras
exactas y los hashes. Esto no convierte todo el juego en 0,40 MB: el ZIP sigue
incluyendo las grabaciones y mundos completos. No se publican promesas de carga
en X segundos, que dependen de red, equipo, caché y SDK.

Los eventos `gameplayStart` solo indican una partida realmente lista y en
marcha, nunca el menú de carga. No se adelanta ese evento para maquillar métricas.
`loadingStart`/`loadingStop` marcan preparación y cargas de escenario; la pérdida
de foco conserva el comportamiento anterior. Todo audio (incluido menú mínimo)
respeta `muteAudio`; el fullscreen es del portal, no del juego.

## Fallos de carga y diagnóstico

La captura antigua no revelaba su causa: el mismo mensaje genérico se mostraba
para SDK, código y recursos. No se debe concluir que era una conexión defectuosa.
Ahora se muestran **etapa + código SDK o nombre de archivo**. Un fichero de
escenario ausente puede reintentarse sin reiniciar la partida. Un error de SDK,
Data Module o del código inicial exige recargar para no arrancar parcialmente.
Un fallo del MP3 de portada no bloquea los menús.

El nuevo paquete elimina la dependencia externa del cargador propio
`crazygames.js`: este pequeño adaptador va dentro de index.html. El SDK oficial
sigue siendo remoto y no se copia dentro del ZIP. Los nombres/rutas son planos.
Esto reduce los errores de subida parcial; aun así deben subirse **todos** los
archivos del ZIP, no solo HTML/JS/CSS.

## Pruebas

```sh
npm test
npm run verify:core
npm run build:crazygames
python tests/browser_crazygames.py
python tests/browser_crazygames_loading.py
```

Los scripts Python usan Playwright/Chromium. El segundo sirve los archivos por
HTTP loopback en Actions, prueba un SDK lento, primer frame, peticiones diferidas,
audio real, guardados entre contextos, cuota, archivos ausentes/reintentos y
excepciones de código. En entornos que bloquean la navegación existe una opción
explícita `--document-harness` (documento y rutas en memoria), reportada en JSON.
No altera el código del juego. Los informes usan `test-results/crazygames-*`.

**Los SDK de las pruebas son simulados.** No se conectan a cuentas reales ni
validan la sincronización de los servidores de CrazyGames. Antes de enviar a QA:
abrir Preview Tool con la opción Data Module, comprobar portada/controles/audio,
completar un checkpoint, salir/volver, y usar otra sesión/dispositivo con la
misma cuenta para comprobar su sincronización. Esperar unos segundos después
de guardar; el SDK agrupa sus escrituras.

## Documentación oficial y alcance

- SDK e inicialización: https://docs.crazygames.com/sdk/intro/
- Data Module: https://docs.crazygames.com/sdk/data/
- Eventos / muteAudio: https://docs.crazygames.com/sdk/game/
- Cambio de cuenta: https://docs.crazygames.com/sdk/user/#auth-listener
- Carga por etapas: https://docs.crazygames.com/resources/getting-to-the-first-frame/

Esta edición web contacta con CrazyGames para inicializar el SDK, informar de
ciclo de juego y persistir datos. No se describe como offline ni libre de red.
Los paquetes normales siguen sin integrar el SDK. No hay anuncios ni cuentas
propias del juego; los servicios de cuenta/almacenamiento pertenecen al portal.
