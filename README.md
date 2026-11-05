# Portfolio de Pablo

Sitio estático con Vite. `index.html` y `ig.html` comparten el contenido del CV; `lab.html` es una demo de producto. Netlify publica `dist/` desde la rama `main` y sirve `pablopetrus.com`.

## Desarrollo

Se necesita Node.js 24 o superior.

```bash
npm ci
npm run dev
npm run build
```

La vista previa de desarrollo escucha sólo en `127.0.0.1:3000`. El sitio no necesita claves de API ni variables de entorno para compilarse. No añadas credenciales al repositorio ni a los archivos cliente.

## CV

`onepage-cv.html` genera el PDF principal enlazado desde ambas portadas. `index.html` genera el PDF largo. Puppeteer se instala sólo al generar PDFs para que el build de Netlify siga siendo ligero. Tras cambiar las fuentes, regenera y revisa los PDFs:

```bash
npm install --no-save --package-lock=false puppeteer@25.16.0
npm run generate-onepage-cv
npm run generate-pdf
```

El workflow de GitHub Actions regenera ambos PDFs cuando cambian las fuentes pertinentes. Los tres HTML públicos se definen en `vite.config.ts`; `public/_redirects` y `public/_headers` se copian a `dist/`.
