# RED ATÍPICA - versión lista para GitHub + Render

Esta carpeta ya viene preparada para subir directo a GitHub y desplegar en Render.

## Archivos importantes

- `app.py`: aplicación Flask.
- `requirements.txt`: dependencias del proyecto, incluye `gunicorn`.
- `Procfile`: comando de inicio para Render.
- `render.yaml`: configuración opcional para Render Blueprint.
- `.gitignore`: evita subir `.venv`, cachés y archivos locales.
- `static/`, `templates/`, `data/`: interfaz, imágenes y datos de la app.

## Subir a GitHub desde VS Code

1. Abre esta carpeta en VS Code.
2. Revisa que NO exista una carpeta `.venv` dentro del proyecto.
3. Abre una terminal y ejecuta:

```bash
git init
git add .
git commit -m "Deploy RED ATIPICA"
```

4. Crea un repositorio nuevo en GitHub.
5. Conecta el repo local con GitHub usando los comandos que GitHub te mostrará, por ejemplo:

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/red-atipica.git
git push -u origin main
```

## Deploy en Render

1. Entra a Render.
2. New + → Web Service.
3. Conecta tu repositorio de GitHub.
4. Usa estos valores:

```txt
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

5. Render entregará una URL pública parecida a:

```txt
https://red-atipica.onrender.com
```

## Código QR

La app ya incluye pantalla/endpoint QR. En local el QR apunta a la red local. Cuando esté en Render, usa la URL pública en el QR.

Endpoint QR:

```txt
/qr.png?url=https://TU-LINK-DE-RENDER.onrender.com
```

Ejemplo:

```txt
https://red-atipica.onrender.com/qr.png?url=https://red-atipica.onrender.com
```


## Versión estable para Render
Esta versión integra el CSS y JavaScript directamente en `templates/index.html` para evitar cargas parciales o inconsistentes de archivos estáticos. También desactiva y elimina service workers anteriores.
