# Entrenarme — mockup navegable

Aplicación de demostración para preparar el ENARM, diseñada primero para teléfono y adaptada a computadora. Implementada en esta carpeta con React y Vite. No requiere servidor, cuentas reales ni servicios externos.

## Abrir en tu computadora

Requisitos: Node.js 22 o posterior y npm.

```sh
npm install
npm run dev
```

Abre la dirección que aparece en la terminal. Para revisar la versión de producción:

```sh
npm run build
npm run preview
```

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta a la rama `main` de tu repositorio de GitHub. No subas `node_modules` ni `dist`.
2. En el repositorio abre **Settings → Pages → Build and deployment → Source** y elige **GitHub Actions**.
3. El workflow **Deploy to GitHub Pages** compila y publica cada cambio en `main`. También puede ejecutarse desde **Actions → Deploy to GitHub Pages → Run workflow**.
4. La dirección pública aparecerá en **Settings → Pages** y en el resultado del workflow.

El proyecto está preparado tanto para `usuario.github.io` como para `usuario.github.io/nombre-del-repositorio/`: los archivos se cargan con rutas relativas y la navegación usa `#/ruta`. Las pantallas pueden abrirse directamente y recargarse sin errores 404. `public/.nojekyll` se copia a la publicación.

**Estado:** configuración lista. No se ha creado un repositorio remoto ni publicado un sitio desde esta tarea.

## Recorridos incluidos

- Bienvenida → registro (información, plan y meta) → inicio.
- Inicio de sesión y recuperación de acceso simulados.
- Inicio con misión, promedio, racha, recursos y accesos rápidos.
- Quiz rápido, quiz de repaso y quiz personalizado por área y tema.
- Preguntas con selección de respuesta, anterior/siguiente, marcador, mapa de reactivos y confirmación de salida.
- Resultado, revisión de respuestas y filtros de aciertos/errores.
- Repaso inteligente y flashcards con respuesta revelable y autoevaluación.
- ENARMapa con misiones disponibles, completadas y bloqueadas; al completar una actividad se habilita la siguiente.
- Estadísticas, análisis por área, cambio de periodo e historial.
- Perfil, preguntas marcadas, edición de preferencias, planes y preguntas frecuentes.

## Alcance de la demo

La navegación y las interacciones básicas sí funcionan. La aplicación comienza con datos de ejemplo para que todas las pantallas puedan evaluarse. Los quizzes seleccionan 20, 50 o 100 preguntas en la configuración, pero recorren **hasta cinco preguntas ilustrativas**; las flashcards usan las preguntas marcadas. Los temas y áreas seleccionados filtran esas preguntas de muestra.

No hay autenticación, envío de correos, pagos, suscripciones, consumo de tokens, notificaciones reales ni banco de preguntas validado. Login admite cualquier correo de ejemplo y una contraseña no vacía; registro solicita al menos ocho caracteres para demostrar la validación visual. Usa datos ficticios.

El nombre, el correo de ejemplo, la especialidad, el plan, las preferencias y el avance se conservan **solo en el navegador**, bajo `entrenarme-demo-v1` en `localStorage`. Las contraseñas no se guardan. Los resultados de la demo actualizan el promedio reciente y el historial. La gráfica, la racha y el análisis por áreas son ilustrativos. Una actividad en curso se pierde al recargar; el resto del avance permanece.

Las fuentes y las imágenes se incluyen en el proyecto. La aplicación no necesita llamadas a API para funcionar.

## Referencias de diseño y flujo

- Flujo: [Entrenarme en Netlify](https://entrenarme.netlify.app/).
- Identidad visual y pantallas públicas: [prototipo de Figma](https://www.figma.com/proto/jsXAwqhTzrlInapYCFsOLv/Entrenarme_web?node-id=2-2&scaling=scale-down-width&page-id=0%3A1&starting-point-node-id=194%3A289).
- Se conservaron los tonos morado oscuro, fucsia, cian y lima, la mascota y la idea de entrenamiento progresivo. La composición se adaptó a móvil; la vista de computadora agrega navegación lateral.

## Mascotas

Las cuatro imágenes adjuntas se prepararon con la herramienta integrada **image_gen**, sin usar la API ni una clave externa. Los archivos originales de Descargas no se modificaron. Las versiones con transparencia utilizadas por la aplicación están en:

- `public/assets/hero.png`: mascota con cerebro.
- `public/assets/doctor.png`: mascota de frente.
- `public/assets/welcome.png`: mascota de bienvenida.
- `public/assets/celebrate.png`: celebración al terminar una actividad.

Prompt aplicado individualmente a cada imagen:

> Use case: background-extraction. Edit target: attached mascot illustration. Remove ONLY the entire white or gray checkerboard background and produce a clean genuinely transparent PNG with alpha. Preserve the exact illustration, pose, face, colors, clothing, proportions, full character and all foreground objects. No added shadows, no background, no text, no visual redesign. Keep all character features opaque, including white eyes. Center full cutout with a small transparent margin. This is a project mascot asset to overlay on a deep purple website. Return a saved local image file.

## Archivos principales

- `src/App.jsx`: pantallas, navegación y estado de la demo.
- `src/data.js`: actividades, áreas, misiones y cinco preguntas de muestra.
- `src/styles.css`: identidad visual y adaptación a diferentes tamaños.
- `.github/workflows/deploy.yml`: publicación automática en GitHub Pages.
- `vite.config.js`: rutas relativas para publicar bajo cualquier nombre de repositorio.

## Verificación

Consulta `QA.md` para los recorridos y tamaños revisados durante la implementación.
