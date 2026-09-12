# Boda Dariana & Erick · 13.02.2027

Sitio estático (HTML + CSS + JS, sin build) servido con nginx en Coolify quikia.

- Producción: https://darianayerick.automatizeishon.com
- Fotos reales de la pareja (img/foto-*, historia-*, hero*). Sede: Mérida, Yucatán (Iglesia de Santa Ana + Hacienda Teya).
- Datos de ejemplo: padres, padrinos, horarios, hoteles, mesa de regalos; fotos de la pareja reales; iglesia y hacienda de Wikimedia Commons (créditos en el pie de página).

## Invitación personalizada
`https://darianayerick.automatizeishon.com/?invitado=Familia%20López&pases=4`
- `invitado`: nombre que aparece en el sobre, en la invitación y precargado en el RSVP.
- `pases`: lugares reservados (1 a 8). Limita el selector de asistentes.

## Dónde editar
- `index.html`: todos los textos y secciones.
- `js/app.js` (objeto `CONFIG`): fecha/hora, mapas, galería, mensajes demo del libro de firmas.
- `css/styles.css` (`:root`): paleta y tipografías.
- `img/`: fotos (reemplazar con las mismas rutas).

## Pendiente para versión real
- RSVP y libro de firmas guardan en el navegador del invitado (localStorage) + aviso por WhatsApp. Para concentrar respuestas: conectar a n8n / Google Sheets.

## Local
`python -m http.server 8765` y abrir http://127.0.0.1:8765

## Al reemplazar una foto
Si cambias una imagen conservando el nombre, sube `?v=` en `index.html` y `imgVersion` en `js/app.js`; si no, los navegadores muestran la versión vieja en caché.
