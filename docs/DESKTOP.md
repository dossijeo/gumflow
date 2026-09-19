# GUMFLOW 6.1.1 — Tauri, mandos y publicación

## Qué contiene esta entrega

El juego aprobado sigue siendo la 6.1. El empaquetado 6.1.1 añade una capa de
mando a las versiones web y escritorio, y un proyecto Tauri 2 en
`desktop/tauri/`. No cambia la física ni recomprime los MP3 o las imágenes.

Objetivos de esta primera compilación:

- Windows x64: instalador NSIS `.exe`, por usuario.
- Linux x64: `.AppImage` y `.deb`, compilados en Ubuntu 22.04.
- Web: HTML autocontenido, ZIP para itch.io y ZIP de archivos separados.

No se generan APK, AAB, IPA ni versiones ARM/macOS en estos workflows. Eso
queda para una ampliación, no es una capacidad ya verificada en esta entrega.

**Importante:** el parche contiene fuentes y automatización, no ejecutables
precompilados. Se han ejecutado las pruebas de Node y Chromium; Rust/Tauri,
los instaladores y los mandos físicos se validan en la primera compilación y
prueba de escritorio. Un workflow correcto sigue necesitando esa ejecución.

## 1. Aplicar el parche desde Termux

Base comprobada del repositorio:
`f811343191c9082d8a3c5b25851b04fc1b95c5cb` (`main`, «Version 6.1»).
El parche es incremental sobre esa refactorización, no sobre el HTML suelto.

Sitúate en tu clon. `~/gumflow` es un ejemplo; utiliza su ubicación real.
Comprueba primero que no tengas cambios pendientes con `git status`.

```sh
cd ~/gumflow
# Debe mostrar el árbol de trabajo limpio:
git status --short

git switch main &&
git pull --ff-only &&
git apply --check "$HOME/storage/downloads/gumflow-6.1.1-tauri-gamepad.patch" &&
git apply --index --whitespace=nowarn "$HOME/storage/downloads/gumflow-6.1.1-tauri-gamepad.patch"
```

Si tu enlace `storage/downloads` no funciona, utiliza la ruta que ya comprobaste:
`/storage/emulated/0/Download/gumflow-6.1.1-tauri-gamepad.patch`.

Revisa `git diff --cached --stat` y después:

```sh
git commit -m "Add Tauri desktop builds, gamepad input and release workflows" &&
git push origin main
```

Es un parche Git con iconos binarios: usa **git apply**, no el comando `patch`.
Si `--check` falla, no fuerces la aplicación: podría haber cambios nuevos en los
archivos afectados. El parche no cambia LICENSE ni la Release `Release-web`.

No necesitas Node, Rust ni Visual Studio en Termux para aplicar/subir el parche.
Para ejecutar únicamente las pruebas web localmente sí necesitas Node 22+.

## 2. Hacer la primera compilación de prueba sin publicar

En GitHub, abre el repositorio → **Actions → Build desktop packages → Run
workflow**, selecciona `main` y ejecútalo.

Si es la primera vez que utilizas Actions, habilítalo en el repositorio. Las
políticas de tu cuenta/repositorio deben permitir los actions utilizados.
No tienes que crear ni compartir un PAT: los trabajos de compilación solo
requieren lectura; el trabajo final de publicación usa `GITHUB_TOKEN` con
`contents: write`.

El workflow:

1. comprueba fuentes, versiones, recursos y mandos simulados en Chromium;
2. resuelve las dependencias una vez y comparte los mismos lockfiles;
3. compila Windows y Linux en runners separados, sobre el mismo commit;
4. adjunta los resultados a la **ejecución de Actions**, sin publicarlos.

Al finalizar correctamente, en **Artifacts** estarán:

```text
gumflow-release-windows
gumflow-release-linux
gumflow-release-web
dependency-locks
desktop-browser-tests
```

Dentro de los tres primeros están los paquetes reales. GitHub envuelve cada
artifact en un ZIP para descargarlo; descomprímelo para ver el `.exe`,
`.AppImage`, `.deb`, etc. No hay que confundir Artifacts con Releases.

Los paquetes se conservan 14 días en esta configuración; los lockfiles, 30.
No son un sustituto permanente de la Release pública.

### Guardar los lockfiles de la primera ejecución

No se han inventado archivos de bloqueo sin resolver las dependencias. Las
versiones directas de Tauri y gilrs están fijadas en los manifiestos; en la
primera ejecución que no encuentre locks, Actions resuelve npm/Cargo **una sola
vez**, y pasa el resultado a ambos runners. Las dependencias transitivas no
quedan fijadas entre distintas ejecuciones hasta guardar esos locks en Git.

Descarga el artifact `dependency-locks`. Contiene:

```text
package-lock.json
src-tauri/Cargo.lock
```

Descomprímelo dentro de `desktop/tauri/`, conservando esas rutas. Por ejemplo:

```sh
unzip "$HOME/storage/downloads/dependency-locks.zip" -d desktop/tauri
git add desktop/tauri/package-lock.json desktop/tauri/src-tauri/Cargo.lock
git commit -m "Lock tested desktop dependencies"
git push origin main
```

O con GitHub CLI, el ID de esa ejecución y su artifact:

```sh
gh run download ID_DE_EJECUCION -n dependency-locks -D desktop/tauri
```

A partir de ahí se usa `npm ci` y Cargo `--locked`. Las Releases también adjuntan
una copia de ambos locks para documentar qué dependencias se utilizaron.
No se promete reproducibilidad binaria bit a bit: el runner y Rust estable
pueden cambiar. Los locks sí fijan las dependencias de esa compilación.

## 3. Crear la Release en borrador

Después de subir los archivos y probar la compilación inicial, crea un tag NUEVO:

```sh
git switch main &&
git pull --ff-only &&
git tag -a v6.1.1 -m "GUMFLOW 6.1.1 — desktop and gamepad" &&
git push origin v6.1.1
```

No reutilices ni borres `Release-web`: tu HTML publicado anteriormente queda
intacto. La versión del tag debe coincidir con los manifiestos; `release:check`
lo comprueba y detiene la publicación si hay discrepancias.

**Draft release** ejecuta las pruebas y ambas compilaciones. Solo si terminan
bien, reúne todos los archivos y crea un borrador. No publica automáticamente.
No se intenta adjuntar parcialmente Windows si Linux ha fallado.

También puedes ejecutarlo desde **Actions → Draft release → Run workflow**,
indicando el tag existente `v6.1.1`. Esto es útil para reintentar una ejecución;
NO crea el tag por ti. Los workflows deben estar ya en la rama predeterminada
para aparecer como ejecutables manualmente.

Los archivos esperados en el borrador son:

```text
GUMFLOW-v6.1.1-windows-x64-setup.exe
GUMFLOW-v6.1.1-linux-x64.AppImage
GUMFLOW-v6.1.1-linux-amd64.deb
GUMFLOW-v6.1.1-standalone.html
GUMFLOW-v6.1.1-itch.zip
GUMFLOW-v6.1.1-web.zip
GUMFLOW-v6.1.1-Cargo.lock
GUMFLOW-v6.1.1-desktop-package-lock.json
GUMFLOW-v6.1.1-build-info.json
SHA256SUMS
```

El script permite completar un borrador, pero rechaza sobrescribir una Release
que ya sea pública. Para corregir una versión publicada, crea otra versión/tag.

**Publicación final:** Releases → abrir el borrador → descargar y probar →
ajustar las notas → **Publish release**. El borrador no está visible para
jugadores anónimos. El token de la integración de ChatGPT no participa aquí.

## 4. Mandos

El mismo `src/platform/` se ensambla en el HTML autocontenido, el build web y
Tauri. Se conserva la aceleración del juego: el stick se convierte en dirección,
no altera la física para introducir otra aceleración analógica.

| Acción | Xbox / disposición estándar | PlayStation / equivalente |
|---|---|---|
| Moverse y menús | Stick izquierdo / cruceta | Stick izquierdo / cruceta |
| Saltar / confirmar | A | Cross / ✕ |
| Chicle / volver en menú | B | Circle / ○ |
| Chicle alternativo | X, RB o RT | Square / □, R1 o R2 |
| Pausa | Start / Menu | Options |
| Pantalla completa | Y | Triangle / △ |
| Cambiar pestaña | LB / RB | L1 / R1 |

**Opciones → Controles → Mando** permite desactivarlo, ajustar la zona muerta y
escoger Auto / Gamepad API / Native (esta última solo aparece en Tauri).
Las etiquetas están en español e inglés. Hay navegación de botones y ajuste de
sliders, pero escribir la semilla sigue requiriendo teclado o teclado en pantalla.

Auto utiliza la API web si devuelve un mando con mapping `standard`; de lo
contrario prueba el puente nativo `gilrs` en Windows/Linux. No se adivina una
configuración de botones para mandos que el navegador marca sin mapping.
Si el controlador se detecta mal en la WebView, prueba **Native** en Opciones.

El backend nativo lee el mando en Rust y envía snapshots; no simula pulsaciones
de teclado del sistema. Soporta un jugador, conexión/desconexión y pausa al
perder el mando usado. No incluye vibración ni una interfaz de remapeado libre.
Los nombres Xbox/PlayStation describen disposiciones: no garantizan que todos
los modelos y drivers funcionen sin prueba física.

En navegador, prueba HTTPS o localhost y pulsa un botón del mando para que se
exponga. El iframe de itch.io y las políticas del navegador pueden limitar esa
API. Una pulsación sintética de mando no equivale necesariamente a un gesto de
usuario para desbloquear audio; el botón «Activar audio» sigue disponible.

## 5. Primera prueba de los paquetes

### Windows

Ejecuta el instalador x64. Es NSIS por usuario, no un `.exe` portable. Utiliza
Microsoft WebView2. Si falta el runtime, el instalador necesita Internet para
descargarlo; el juego y los recursos funcionan localmente después.

El paquete **no está firmado**: Windows puede mostrar avisos de reputación o
SmartScreen. No desactives la protección global para jugar. Comprueba el origen
del archivo y su hash; la firma comercial no forma parte de esta entrega.

### Linux

Prueba en un escritorio x64 compatible. Para AppImage:

```sh
chmod +x GUMFLOW-v6.1.1-linux-x64.AppImage
./GUMFLOW-v6.1.1-linux-x64.AppImage
```

Si falla por FUSE, prueba el modo de extracción que proporciona AppImage:

```sh
./GUMFLOW-v6.1.1-linux-x64.AppImage --appimage-extract-and-run
```

Para una distribución Debian/Ubuntu compatible:

```sh
sudo apt install ./GUMFLOW-v6.1.1-linux-amd64.deb
```

Se compila en Ubuntu 22.04, lo que no garantiza todas las distribuciones. El
AppImage activa `bundleMediaFramework` para incluir el framework multimedia de
GStreamer; el `.deb` declara dependencias para reproducir MP3 y leer mandos.
No ejecutes el juego como root ni cambies permisos globales de `/dev/input`.
Si gilrs no detecta el mando, revisa conexión, sesión de escritorio y reglas de
dispositivo de la distribución antes de tocar permisos.

### Lista mínima antes de hacer pública la Release

Comprueba arranque, menú completo, cambio ES/EN, pantalla completa desde título,
HD Everyday/Epic/Claustrophobic y chiptune, un nivel con loop, un jefe,
Endless, mando real por USB/Bluetooth, desconexión, pausa, guardar/cerrar/reabrir
y una partida algo más larga para comprobar fluidez.

El guardado es local a cada origen/instalación: no se copia automáticamente el
progreso del navegador o del HTML a la WebView de escritorio. Las actualizaciones
mantienen el identificador de aplicación; cambiarlo o cambiar el esquema de URL
puede crear otro espacio de almacenamiento. No hay sincronización en la nube.

## 6. Compilar localmente — opcional

Necesitas Node 22+, Rust y las dependencias nativas de Tauri. En Windows,
Microsoft C++ Build Tools y WebView2; en Linux, WebKitGTK, GTK y librerías de
compilación. Consulta las instrucciones oficiales de tu plataforma.

Desde la raíz:

```sh
npm run desktop:install
npm run desktop:dev
# Windows:
npm run desktop:build -- --bundles nsis
# Linux:
npm run desktop:build -- --bundles appimage,deb
```

Los bundles quedan en `desktop/tauri/src-tauri/target/release/bundle/`.
El comando `desktop:info` ayuda a diagnosticar el entorno. `dev` utiliza un
servidor local; el binario de producción no lo necesita.

La CLI está aislada en `desktop/tauri/package.json`; no convierte el proyecto
web en dependiente de npm. Las versiones directas fijadas son CLI 2.11.4,
Tauri 2.11.5, tauri-build 2.6.3 y gilrs 0.11.2.

## 7. Próximas publicaciones

No cambies archivos de versión a mano en cinco sitios:

```sh
npm run version:set -- 6.1.2
npm run release:check
npm test
git add package.json config/project.json desktop/tauri
git commit -m "Prepare packaging release 6.1.2"
git push origin main
git tag -a v6.1.2 -m "GUMFLOW 6.1.2"
git push origin v6.1.2
```

El script cambia los metadatos y la entrada raíz de los locks existentes, no las
dependencias ni los textos del juego. Cuando cambies realmente contenido, revisa
también su versión visible deliberadamente. `verify:core` detendrá cambios fuera
de la extensión marcada mientras el contrato siga siendo «conservar la 6.1»;
no actualices la referencia solo para ocultar una regresión.

## 8. Diagnóstico y seguridad

- **No aparece el workflow:** comprueba que los YAML estén en `.github/workflows/`
  de `main` y que Actions esté habilitado.
- **No se crea una Release:** `Build desktop packages` solo genera artifacts.
  Para el borrador, usa el tag o `Draft release`.
- **403 al crear el borrador:** el job `draft` declara `contents: write`; revisa
  políticas de Actions del repositorio/organización. No pegues un token en el código.
- **Git rechaza subir `.github/workflows`:** comprueba los permisos de tu método
  de autenticación. Un PAT clásico utilizado para subir workflows necesita el
  alcance correspondiente; la sesión de GitHub CLI puede requerir autorizarlo.
- **Error de versión:** `npm run release:check`; el tag debe ser `v` + versión.
- **Error de Rust/dependencias/NSIS/AppImage:** abre el job fallido, conserva el
  primer error completo. Reintentar no arregla automáticamente un error de código.
- **La versión publicada ya existe:** crea una nueva; el script no la sobrescribe.
- **Pantalla negra/audio ausente:** prueba primero la salida web; en Linux revisa
  WebKit/GStreamer y los logs de la ejecución. No declares compatible una distro
  solo porque el bundle se haya generado.

Se usa una política CSP local, solo dos permisos nativos de ventana y un comando
propio de lectura de mando. Se bloquea navegación a sitios externos. No hay
plugins de shell, red o sistema de archivos, auto-updater ni secretos embebidos.
Las dependencias descargadas para compilar y los runtimes del sistema siguen
siendo parte del perímetro de confianza.

## Documentación consultada

- Tauri, prerrequisitos: https://v2.tauri.app/start/prerequisites/
- Tauri, GitHub Actions: https://v2.tauri.app/distribute/pipelines/github/
- Tauri, configuración: https://v2.tauri.app/reference/config/
- Tauri, firma Windows: https://v2.tauri.app/distribute/sign/windows/
- Gamepad API: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
- gilrs 0.11.2: https://docs.rs/gilrs/0.11.2/gilrs/
- GitHub, GITHUB_TOKEN: https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication

Fuentes consultadas el 19 de septiembre de 2026. Las comprobaciones ejecutadas
localmente están resumidas en `docs/DESKTOP-VALIDATION.md`.
