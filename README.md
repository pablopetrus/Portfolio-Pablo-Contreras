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

El workflow de GitHub Actions regenera los tres PDFs cuando cambian las fuentes pertinentes, o manualmente. Compara páginas renderizadas y texto para omitir cambios que solo afectan a los metadatos del PDF y evitar un segundo despliegue innecesario cuando los PDF ya se incluyen en la misma entrega. Revisa visualmente los cambios de diseño antes de fusionar.

## Contenido e idiomas

`index.html` e `ig.html` conservan una estructura estática en inglés, utilizable también por el generador PDF. `portfolio-content.js` centraliza sus traducciones compartidas. Al añadir contenido, actualizar ambas estructuras y las claves EN/ES; las variantes comparten el mismo diccionario. Las páginas editoriales usan `editorial-language.js`, con el mismo almacenamiento `portfolio-language`, inglés por defecto y preferencia persistente.

`/recursos` es la ruta estable del QR. El Starter ZIP, la guía de ocho páginas y el QR se sirven desde `public/descargas/`, conservando los originales proporcionados por el propietario. La demo es ficticia y local; no envía mensajes ni llama a modelos. El arranque incluye un mensaje editable para adaptar el kit a una carpeta existente sin sobrescribir instrucciones. El kit y la guía están en español; la web ofrece instrucciones EN/ES. La descarga no depende de un repositorio independiente: solo añadir ese enlace cuando exista y se haya verificado. `/reflexiones` conserva el artículo original y enlaces a su historial público. Para un nuevo artículo, crear una página con título, firma, fecha real y enlaces a su archivo/historial, sin cambiar las fechas del anterior.

Vite declara las seis páginas públicas; `public/_redirects` admite las rutas principales con y sin barra final. Las variantes del CV y sus URLs existentes se conservan.
