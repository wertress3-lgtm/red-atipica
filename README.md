# RED ATÍPICA — Prototipo Final V6

Prototipo local mobile-first en Python + Flask, construido con la estructura final del proyecto RED ATÍPICA.

## Incluye

- Inicio con proyectos destacados y talentos destacados.
- Filtro por región obligatorio y funcional.
- Explorar por proyecto, talento, profesión, ciudad y región.
- Proyectos del PDF: Editorial de Moda, Modelo/Actriz para Comercial, Búsqueda de Stylist y Maquillador(a), DOSLOBOS Campaña Futurista.
- Perfil profesional tipo Muriel Galindo con portafolio y calificaciones.
- Formulario de postulación completo.
- Historial de postulaciones enviadas guardado en localStorage.
- Mensajería y match.
- Publicación de proyectos para marcas.
- Planes para profesionales y marcas/productoras, incluyendo Essential, Premium y Estudiante.
- Servicios RED ATÍPICA con precios actualizados.
- Sistema de sanciones y seguridad.
- Página de código QR local: genera un QR hacia la URL local de red. Cuando se aloje en internet, el QR puede apuntar a la URL publicada.

## Correr en Mac

```bash
cd ~/Downloads/RED_ATIPICA_PROTOTIPO_V6
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -c 'from app import app; app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False)'
```

Luego abre:

```txt
http://127.0.0.1:5001
```

## Ver desde celular en la misma WiFi

Abre la pantalla **QR** dentro de la app. El QR usará la IP local del computador.

Si el teléfono no abre la app, revisa que computador y teléfono estén en la misma red WiFi y que el firewall permita conexiones locales.
