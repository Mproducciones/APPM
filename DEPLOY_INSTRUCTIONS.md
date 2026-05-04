# 🚀 APPM - Instrucciones de Deploy

## 📋 Pasos para GitHub + Vercel

### 1️⃣ Crear Repositorio GitHub
1. Ve a [github.com](https://github.com) y haz login
2. Click en **"New repository"**
3. **Repository name:** `APPM`
4. **Description:** `Music control with Google camouflaged interface`
5. **Public:** ✅
6. Click en **"Create repository"**

### 2️⃣ Subir Código a GitHub
```bash
# Reemplaza TU_USERNAME con tu usuario de GitHub
git remote add origin https://github.com/TU_USERNAME/APPM.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy en Vercel
1. Ve a [vercel.com](https://vercel.com) y haz login
2. Click en **"Add New..."** → **"Project"**
3. **Import Git Repository** → Selecciona **APPM**
4. Vercel detectará automáticamente:
   - Framework: **Other**
   - Root Directory: **./**
   - Build Command: **npm install**
   - Output Directory: **.**
5. Click en **"Deploy"**

### 4️⃣ Configurar Dominio Corto
1. En Vercel dashboard → **Settings** → **Domains**
2. Click en **"Add"** y escribe: `appm`
3. Vercel creará: **appm.vercel.app**

## 🌐 URLs Finales

- **Controlador:** https://appm.vercel.app
- **Espectador:** https://appm.vercel.app/viewer

## 📱 Testing en Smartphones

### iOS Safari:
- Abrir Safari en iPhone
- Ir a appm.vercel.app
- Probar modo secreto: `.nombrecancion`
- Voltear dispositivo para reproducir

### Android Chrome:
- Abrir Chrome en Android
- Ir a appm.vercel.app/viewer
- Probar gestos y controles
- Verificar YouTube embedded

## ✅ Checklist Final

- [ ] Repositorio GitHub creado
- [ ] Código subido correctamente
- [ ] Deploy en Vercel exitoso
- [ ] Dominio appm.vercel.app activo
- [ ] Testing en smartphones funcionando
- [ ] YouTube embedded reproduciendo
- [ ] Control por volteo operativo

## 🔧 Si hay problemas

### Socket.io no conecta:
- Revisar Vercel logs
- Verificar configuración en `vercel.json`

### YouTube no reproduce:
- Verificar DeviceOrientation API
- Probar fallback por click

### Dominio no funciona:
- Esperar propagación DNS (5-10 min)
- Verificar configuración en Vercel

---

**¡APPM listo para producción!** 🎵✨
