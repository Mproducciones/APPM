# 🎵 Magic-Spotify

Sistema de control de música con interfaz camuflada como Google y reproducción de YouTube por gestos.

## ✨ Características

- 🎭 **Interfaz camuflada** - Se parece exactamente a Google.com
- 🔐 **Modo secreto** - Activa con punto (.) y efecto typewriter
- 📱 **Control por gestos** - Reproduce/pausa al voltear el celular
- 🎥 **YouTube embedded** - Reproducción directa sin salir del espectador
- 🌐 **Socket.io** - Comunicación en tiempo real
- 🔄 **Flujo dual** - Música + búsqueda de tendencias

## 🚀 Demo Online

**Controlador:** [https://magic-spotify.vercel.app](https://magic-spotify.vercel.app)  
**Espectador:** [https://magic-spotify.vercel.app/viewer](https://magic-spotify.vercel.app/viewer)

## 📱 Cómo usar

### Modo Secreto (Magia):
1. Escribe `.nombredelacancion` en el buscador
2. Primer Enter → Envía música al espectador
3. **Voltea el celular** → ▶️ Reproduce video
4. **Vuelve a normal** → ⏸️ Pausa video
5. Segundo Enter → Busca tendencias musicales

### Modo Normal:
1. Escribe cualquier búsqueda
2. Enter → Búsqueda normal en Google

## 🛠️ Instalación Local

```bash
# Clonar repositorio
git clone <repository-url>
cd Magic-Spotify

# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

## 📁 Estructura del Proyecto

```
Magic-Spotify/
├── server.js          # Servidor Express + Socket.io
├── master.html        # Controlador camuflado (Google)
├── viewer.html        # Espectador con YouTube embedded
├── package.json       # Dependencias
├── vercel.json        # Configuración Vercel
└── README.md          # Documentación
```

## 🔧 Tecnologías

- **Backend:** Node.js + Express + Socket.io
- **Frontend:** HTML5 + CSS3 + JavaScript Vanilla
- **Video:** YouTube IFrame API
- **Sensores:** Device Orientation API
- **Deploy:** Vercel

## 🎯 Características Técnicas

### Modo Secreto:
- **Activación:** Tecla `.`
- **Efecto:** Typewriter animado
- **Mensaje:** "Analizando tendencias musicales y frecuencias cerebrales actuales..."
- **Flujo:** 1 Enter = música, 2 Enter = tendencias

### Control por Gestos:
- **Detección:** DeviceOrientation API
- **Umbral:** 45° de inclinación
- **Acciones:** Play/Pausa automático
- **Fallback:** Click para dispositivos sin sensores

### YouTube Integration:
- **API:** YouTube IFrame API
- **Reproducción:** Embedded player
- **Controles:** Play/Pausar + Cerrar
- **Responsive:** Adaptable a pantalla completa

## 🌐 Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📱 Pruebas en Smartphones

### iOS Safari:
- ✅ Device orientation funciona
- ✅ YouTube embedded compatible
- ✅ Socket.io estable

### Android Chrome:
- ✅ Gestos precisos
- ✅ Video fullscreen
- ✅ Conexión estable

## 🔒 Seguridad

- **Sin datos expuestos** - No hay RUT en URLs
- **Conexión segura** - HTTPS en producción
- **CORS configurado** - Solo dominios permitidos

## 🤝 Contribuir

1. Fork del repositorio
2. Feature branch: `git checkout -b nueva-caracteristica`
3. Commit: `git commit -m 'Añadir nueva característica'`
4. Push: `git push origin nueva-caracteristica`
5. Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE

---

**¡Hecho con ❤️ para la magia musical!** 🎵✨
