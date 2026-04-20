# App de Dieta — Alejandro Delgado Lucero
**Nutrióloga:** Lic. Angélica Palacio Escalante — NUTRE Nutrición Funcional

## Qué es esto
PWA (Progressive Web App) de checklist de dieta semanal con 3 vistas:
- **Hoy** — checklist con las 5 comidas del día con horario
- **Semana** — calendario visual con puntos de progreso por día
- **Avances** — historial de consultas y subida de archivos

## Estructura del proyecto
```
alejandro-dieta/
├── index.html          ← entrada principal
├── manifest.json       ← hace la app instalable en celular
├── public/
│   ├── icon-192.png    ← ícono app (necesitas crearlo)
│   └── icon-512.png    ← ícono app grande (necesitas crearlo)
└── src/
    ├── styles.css      ← todos los estilos
    ├── app.js          ← lógica principal y render
    └── data/
        └── diet.js     ← dieta completa por día + datos evolución
```

## Cómo correr localmente
```bash
# Opción 1: servidor simple con Python
cd alejandro-dieta
python3 -m http.server 3000
# Abre: http://localhost:3000

# Opción 2: con Node
npx serve .
# Abre la URL que te dé
```

## Cómo desplegar (para tener URL propia en tu celular)

### Opción A — Netlify (más fácil, gratis)
1. Ve a https://app.netlify.com/drop
2. Arrastra la carpeta `alejandro-dieta`
3. Obtienes una URL tipo `https://tu-nombre.netlify.app`
4. Abre esa URL en tu celular → "Agregar a pantalla de inicio"

### Opción B — Vercel
```bash
npm i -g vercel
cd alejandro-dieta
vercel
```

### Opción C — GitHub Pages
1. Sube la carpeta a un repositorio de GitHub
2. Settings → Pages → Deploy from branch (main)

## Íconos (necesarios para instalar como app)
Necesitas dos imágenes PNG con el ícono de la app:
- `public/icon-192.png` — 192×192 px
- `public/icon-512.png` — 512×512 px

Puedes pedirle a Claude Code que los genere o usar cualquier imagen verde/nutricional.

## Datos que guarda (localStorage)
- `alex_checked_v1` — qué comidas has marcado por día
- `alex_avances_v1` — archivos de avances que subes

Los datos viven en el navegador del dispositivo. Para no perderlos:
- Usa siempre el mismo navegador
- No borres datos del navegador
- Para hacer backup: Claude Code puede agregar una función de exportar/importar JSON

## Qué pedirle a Claude Code para mejorar la app
- "Agrega notificaciones push para recordarme mis comidas"
- "Agrega un campo para registrar mi peso cada semana"
- "Agrega una función de exportar mi progreso a PDF"
- "Conecta con una base de datos para que funcione en cualquier dispositivo"
- "Agrega las medidas del shake de proteína"
- "Cambia los horarios de las comidas"
