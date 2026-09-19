# GUMFLOW 6.1 — fuentes separados

Esta entrega guarda el juego que ya funciona. No añade mecánicas ni cambia el
aspecto de Gum, los menús, los idiomas, los guardados o los disparadores musicales.
La versión que aparece dentro del juego sigue siendo **6.1**, intencionadamente.

## Construir el juego

Desde la raíz del repositorio, con **Node.js 22 o posterior**:

```sh
npm run build
```

El resultado es `dist/gumflow.html`. En este commit tiene exactamente los mismos
11.224.996 bytes y el mismo SHA-256 que `gumflow_v6_1_ambient.html`.
No requiere `npm install`, internet, Python ni herramientas de audio.

```sh
npm run verify:baseline
npm test
```

La primera orden compara el resultado y los 24 recursos con los hashes originales.
La segunda ejecuta diez pruebas de construcción y empaquetado.

Para trabajar y probar cambios:

```sh
npm run dev
```

Abre `http://127.0.0.1:5173` y recarga después de editar. El servidor reconstruye
los archivos modificados al refrescar la página. Se para con Ctrl+C. Si cambias
`config/` o el propio constructor, reinicia el servidor.

Para empaquetar todo:

```sh
npm run build:release
```

Se generan `dist/gumflow.html`, `dist/gumflow-itch.zip` (un único `index.html`
autocontenido), `dist/gumflow-web.zip` (con recursos externos) y `dist/SHA256SUMS`.
El constructor no sube nada a GitHub ni a itch.io.

## Aplicar el parche Git

El parche se preparó contra `dossijeo/gumflow`, rama `main`, commit
`8f8cb5ef607718d65a0f57a7ee0578b428d26c2f`, que contenía README y LICENSE.
Actualiza el README y añade los fuentes. **No modifica LICENSE**.

Es un parche Git completo, con bloques binarios para imágenes y música. No es
un archivo que se deba copiar como texto en el editor web de GitHub ni aplicar
con la utilidad POSIX `patch`.

Ejemplo desde Termux, con el repo en `~/gumflow` y el archivo en Descargas:

```sh
cd ~/gumflow
git status --short
git pull --ff-only
PATCH="$HOME/storage/downloads/gumflow-6.1-source-refactor.patch"
git apply --check "$PATCH"
git apply --index --whitespace=nowarn "$PATCH"
git status --short
git commit -m "Extract GUMFLOW 6.1 into structured sources and reproducible builds"
git push
```

Antes de aplicarlo, guarda tus cambios locales y comprueba que `git status`
esté limpio. Si `git apply --check` falla, no fuerces la aplicación ni uses
`--reject`: revisa si ya se aplicó o si cambió algún archivo de la base.

El script `gumflow-patch` que ya uses puede aplicar este archivo siempre que
emplee `git apply` y no modifique su contenido. La opción `--whitespace=nowarn`
evita avisos sobre espacios ya presentes en la versión original **sin cambiarlos**.
No uses `--whitespace=fix` ni un formateador masivo para esta conservación exacta.

El parche deja todos los recursos dentro del repositorio. No depende de rutas
`/mnt/data`, de enlaces del chat ni de descargas externas.

## Editar sin volver a tener un HTML gigante

El archivo `src/index.js` declara el orden de ensamblado. Cada línea incluye un
archivo por subsistema. `src/ui/index.js` hace lo mismo dentro del ámbito de menús.
Las imágenes están en `assets/images/` y los cuatro MP3 recortados en
`assets/audio/hd/`. Puedes abrirlos con sus herramientas habituales.

La extracción conserva el ámbito compartido de JavaScript; todavía **no** es
una migración a módulos `import/export`. Las capas de integración heredadas
siguen siendo necesarias. Esta decisión permite certificar la identidad exacta
del HTML reconstruido. Véase `ARCHITECTURE.md` para detalles y rutas de edición.

Los textos originales en español se mantienen donde estaban. El diccionario
de equivalencias inglés se ha extraído a `src/i18n/en.json`. Se conserva el
sistema de localización existente, no se sustituye por otro durante este paso.

`verify:baseline` deja de pasar cuando cambias voluntariamente el producto:
es precisamente su finalidad. Eso no impide usar `build` o `build:web` para
construir tu siguiente versión. Conserva el fingerprint 6.1 como referencia.

No se compila un ejecutable Windows en este parche. La salida web separada
puede alimentar el wrapper en un paso posterior sin portar el juego.
