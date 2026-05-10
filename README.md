# InvestTrack — Expo (React Native)
## Guía completa para obtener el APK en tu Android

---

## Lo que necesitas (solo cuentas, sin instalar nada en el Mac)

1. Cuenta en **expo.dev** (gratis) → https://expo.dev/signup
2. Cuenta en **GitHub** (gratis) → https://github.com
3. Proyecto subido a **Replit** → https://replit.com

---

## PASO 1 — Subir el proyecto a Replit

1. Ve a https://replit.com → "Create Repl" → elige **Node.js**
2. Nombre: `investtrack-expo`
3. En el panel de archivos, crea la misma estructura de carpetas que tiene este ZIP
4. Copia el contenido de cada archivo

---

## PASO 2 — Instalar dependencias en Replit

Abre la Shell de Replit y ejecuta:

```bash
npm install
```

Espera a que termine (2-3 minutos).

---

## PASO 3 — Instalar EAS CLI

En la Shell de Replit:

```bash
npm install -g eas-cli
```

---

## PASO 4 — Login en Expo

```bash
eas login
```

Te pedirá tu email y contraseña de expo.dev.

---

## PASO 5 — Configurar el proyecto

```bash
eas build:configure
```

Si te pregunta por el ID del proyecto, acepta crear uno nuevo.

---

## PASO 6 — Compilar el APK en la nube

```bash
eas build -p android --profile preview
```

Esto sube el código a los servidores de Expo y compila el APK.
Tarda entre **5 y 15 minutos**.

Cuando termine, Expo te da una **URL de descarga**.

---

## PASO 7 — Instalar el APK en el móvil

1. Abre esa URL desde tu móvil Android
2. Descarga el archivo `.apk`
3. Android te pedirá permitir instalación de fuentes desconocidas → Permitir
4. Instala el APK
5. ¡La app aparece en tu cajón de aplicaciones!

---

## ⚠️ Notas importantes

- La cuenta gratuita de Expo tiene **30 builds/mes** (más que suficiente)
- El APK se puede instalar directamente, sin pasar por Play Store
- Los datos se guardan en AsyncStorage (almacenamiento local del dispositivo)
- Para actualizar la app, edita el código y repite el Paso 6

---

## Estructura del proyecto

```
investtrack-expo/
├── app/
│   ├── _layout.tsx          ← Navegación y tabs
│   ├── dashboard/index.tsx  ← Pantalla inicio
│   ├── investments/
│   │   ├── index.tsx        ← Lista de inversiones
│   │   └── [id].tsx         ← Detalle de inversión
│   ├── metrics/index.tsx    ← Métricas y análisis
│   ├── calendar/index.tsx   ← Calendario financiero
│   └── settings/index.tsx   ← Configuración
├── components/
│   ├── ui/                  ← Componentes base
│   ├── charts/              ← Gráficos
│   └── investments/         ← Formularios
├── store/index.ts           ← Estado global (Zustand)
├── types/index.ts           ← Tipos TypeScript
├── utils/
│   ├── index.ts             ← Cálculos financieros
│   └── theme.ts             ← Colores y estilos
├── app.json                 ← Config de la app
└── eas.json                 ← Config del build
```

---

## Si algo falla

Dile a Claude exactamente qué error aparece en la Shell de Replit
y te lo soluciona al momento.
