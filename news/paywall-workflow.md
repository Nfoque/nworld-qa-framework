# Workflow para artículos de pago (Medium y similares)

El asistente **no puede autenticarse** con tu cuenta de Medium. El RSS sólo da
títulos + excerpts. Para que yo pueda leer el cuerpo completo de un post
member-only, necesitas trasladar el contenido desde tu sesión logueada hasta
un sitio que yo pueda leer.

## Opciones, de mejor a peor

### A. Save-as-markdown (recomendado) ⭐

1. Instala [MarkDownload](https://github.com/deathau/markdownload) en tu navegador (Chrome/Firefox/Edge).
2. Abre el post en Medium (con tu cuenta logueada, sin paywall).
3. Click derecho → "Download Tab as Markdown".
4. Guarda el `.md` en `news/inbox/raw/` (MarkDownload puede crear también una carpeta hermana con imágenes — déjala, yo la limpio).
5. Cuando tengas varios acumulados, me dices: **"procesa el inbox"** y yo:
   - Leo cada `.md`.
   - Creo un resumen estructurado en `news/inbox/YYYY-MM-DD-slug.md`.
   - Registro la entrada en el índice de `news/README.md`.
   - Muevo el crudo a `news/inbox/raw/processed/`.
   - **Borro la carpeta de imágenes hermana** (no la usamos en los resúmenes).

### B. Friend link (para uno suelto urgente)

Medium permite a miembros generar un "friend link" que bypassa el paywall:

1. En el post → botón Share → "Generate Friend Link" (o "Send a story").
2. Me pasas esa URL en el chat.
3. Yo la abro con `WebFetch` directamente.

### C. Copy-paste (lo más rápido, una vez)

Abres el post, ⌘A + ⌘C, lo pegas en el chat. Yo lo proceso al vuelo.

### D. Print to PDF

Si no quieres instalar nada:

1. Print → Save as PDF en el navegador logueado.
2. Guardas en `news/inbox/raw/`.
3. Yo leo el PDF (formato menos limpio que markdown, pero funciona).

## Estructura de `news/inbox/`

```
news/inbox/
├── raw/                     # ← tú dejas aquí los .md/.pdf descargados
│   └── processed/           # ← yo muevo aquí lo ya procesado
└── YYYY-MM-DD-slug.md       # ← mis resúmenes estructurados
```

## Lo que NO funciona

- Pasarme tu usuario de Medium: no me autentico con tu cuenta.
- Pasarme tus cookies de sesión: `WebFetch` no admite headers personalizados.
- Pedirme que "lea tu lista de guardados": esa lista es privada y requiere login.
