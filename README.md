# 🛡️ SOTER – Sistema de Alerta Temprana ante Caídas

**Soter** es una aplicación móvil diseñada para enviar avisos de caídas en personas mayores y alertar a familiares, cuidadores o personas de confianza mediante mensajes de emergencia (SMS) y notificaciones, facilitando así una intervención rápida.

---

## 🚀 Características principales

- 📍 Geolocalización automática al mandar el aviso de una caída.
- 📤 Envío de SMS con la ubicación a los contactos de confianza.
- 👥 Gestión de grupos de cuidadores y protegidos.
- 💬 Chat y registro de accidentes.
- ✅ Interfaz accesible y sencilla.

---

## 🛠️ Tecnologías utilizadas

- **Frontend:** React + Ionic + Capacitor
- **Backend:** Supabase (Auth, DB, Storage)
- **Servicios externos:** Vonage (SMS), Google Maps API, OpenStreetMap (traducción de coordenadas a lenguaje natural)

---

## 📦 Instalación

### 🔧 Requisitos

- Node.js ≥ 18.x
- npm
- Android Studio (para pruebas en Android)
- Cuenta en Supabase + Vonage

### ⚙️ Clonar el repositorio

```bash
git clone https://github.com/pablovegood/soter.git
cd soter
npm install
```


### 📱 Ejecutar en Android

```bash
npx cap sync android
npx cap open android
```

Luego compila desde Android Studio.

---

## 🤝 Colaboración

¿Quieres contribuir al desarrollo de Soter? ¡Eres bienvenido! Aquí te dejamos cómo empezar:

1. Haz un fork del repositorio
2. Crea tu rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios
4. Haz un commit (`git commit -am 'Añadir nueva funcionalidad'`)
5. Sube tu rama (`git push origin feature/nueva-funcionalidad`)
6. Abre un Pull Request

---

## 📘 Licencia

Este proyecto está bajo la licencia MIT.

---

## 📞 Contacto

Creado por **Pablo García Alvarado**  
📧 [pablog.alvarado22@gmail.com]  
📍 Universidad de Granada
