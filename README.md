# 🚀 TaskManager Pro — Gestor de Tareas Offline (Vanilla JavaScript ES6+)

Aplicación web profesional para la gestión interactiva de tareas (**TaskManager**) desarrollada exclusivamente con **JavaScript Vanilla (ES6+)**, sin frameworks ni dependencias externas. Incorpora consumo asíncrono de APIs REST (`JSONPlaceholder`), persistencia completa de datos en el cliente mediante **LocalStorage** (`Web Storage API`), arquitectura modular y funcionamiento offline ininterrumpido.

[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?logo=javascript&logoColor=black)](#)
[![Storage](https://img.shields.io/badge/Storage-LocalStorage%20Offline-4F46E5)](#)
[![Architecture](https://img.shields.io/badge/Architecture-ES6%20Modules-6366F1)](#)
[![Pattern](https://img.shields.io/badge/Pattern-Custom%20Events%20Observer-10B981)](#)

---

## 📋 Características Principales

### 1. Gestión CRUD Completa con Validación Estricta
* **Creación de Tareas:** Formulario modal accesible para añadir tareas con título, descripción y nivel de prioridad (**Alta**, **Media**, **Baja**).
* **Validación en JS:** Validación rigurosa desde código para prevenir campos vacíos o con longitud menor a 3 caracteres con feedback visual instantáneo.
* **Edición y Actualización:** Posibilidad de modificar título, prioridad y detalles en cualquier momento.
* **Eliminación Segura:** Modal de confirmación para evitar borrados accidentales.
* **Toggle de Estado:** Marcado reactivo entre pendiente y completada con efectos visuales tachados.

### 2. Filtros Dinámicos, Búsqueda y Ordenamiento
* **Filtros por Estado:** Botones interactivos con contadores en tiempo real (*Todas*, *Pendientes*, *Completadas*).
* **Búsqueda en Tiempo Real:** Búsqueda dinámica por título insensible a mayúsculas y acentos (`toLowerCase`, `includes`).
* **Ordenamiento Multidimensional:** Algoritmos basados en `Array.prototype.sort()` para ordenar por:
  * Fecha de creación (más recientes / más antiguas).
  * Nivel de prioridad (Alta a Baja / Baja a Alta).
  * Título alfabético (A - Z).

### 3. Dashboard y Métricas Reactivas
* Panel con 4 tarjetas de indicadores en vivo:
  * **Total de Tareas**.
  * **Tareas Pendientes**.
  * **Tareas Completadas**.
  * **Tasa de Progreso (%)** con barra de llenado animada.
* Actualización reactiva instantánea ante cualquier mutación de datos.

### 4. Consumo de API REST y Persistencia Offline
* **API Externa:** Integración con `https://jsonplaceholder.typicode.com/todos` mediante `fetch()` y `async/await`.
* **Carga Inicial Inteligente:** Si `localStorage` está vacío, importa tareas de prueba serializándolas con `JSON.stringify()`. Si ya existen datos previos, los conserva sin duplicar registros.
* **Modo Offline:** Detección en vivo de la conexión con `window.addEventListener('online')` y `'offline'` con badge animado en el header.
* **Manejo Amigable de Errores:** Bloques `try/catch` acompañados de un sistema moderno de notificaciones flotantes (*Toast*).

---

## 🏛️ Estructura del Proyecto y Arquitectura Modular (Opción A)

El proyecto implementa la **Opción A — Arquitectura Modular ES6**, desacoplando responsabilidades mediante módulos nativos (`import`/`export`):

```
TaskManager/
├── index.html               # Estructura semántica HTML5 y modales accesibles
├── css/
│   └── styles.css           # Sistema de diseño moderno, dark theme y animaciones
├── js/
│   ├── app.js               # Controlador y orquestador principal
│   ├── apiService.js        # Consumo asíncrono de API REST (fetch / async-await)
│   ├── storageService.js    # Gestor de persistencia en LocalStorage
│   ├── taskManager.js       # Lógica de negocio (CRUD, filtros, ordenamiento, métricas)
│   ├── ui.js                # Manipulación reactiva del DOM, modales y notificaciones Toast
│   └── events.js            # Sistema de eventos personalizados (CustomEvent / Observador)
├── AI_DECLARATION.md        # Declaración ética de uso de Inteligencia Artificial
├── INFORME_FINAL.html       # Informe académico maquetado para exportación a PDF
└── README.md                # Documentación del proyecto
```

---

## 🛠️ Ejecución Local

Dado que la aplicación hace uso de módulos nativos de JavaScript (`<script type="module">`), se debe ejecutar mediante un servidor HTTP local para cumplir con las políticas de seguridad de los navegadores:

### Opción 1: Con Python (Cualquier versión)
```bash
python -m http.server 8080
```
Luego abre en tu navegador: [http://localhost:8080](http://localhost:8080)

### Opción 2: Con Node.js / npx
```bash
npx serve .
```

### Opción 3: Con VS Code Live Server
Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.

---

## 📡 Demostración de Persistencia en DevTools

Para comprobar la persistencia local de datos:
1. Abre la aplicación en Google Chrome, Edge o Firefox.
2. Presiona `F12` (o `Ctrl + Shift + I`) para abrir las herramientas de desarrollador.
3. Dirígete a la pestaña **Application** (o *Almacenamiento* en Firefox).
4. En el panel izquierdo, despliega **Storage > Local Storage** y haz clic sobre el dominio (`http://localhost...`).
5. Observa la clave `taskmanager_tasks_v1` con todas las tareas serializadas en formato JSON.

---

## 👤 Autor

* **Estudiante:** Miguel Ángel Infante Mejía
* **GitHub:** [@MiguelInfante-cmd](https://github.com/MiguelInfante-cmd)
* **Repositorio:** [https://github.com/MiguelInfante-cmd/TaskManager](https://github.com/MiguelInfante-cmd/TaskManager)
