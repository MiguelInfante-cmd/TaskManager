# Declaración de Uso de Inteligencia Artificial (AI_DECLARATION.md)

**Materia:** Sistemas Web / Desarrollo Web  
**Institución:** Universidad / ECOTEC  
**Estudiante:** Miguel Ángel Infante Mejía  
**Proyecto:** TaskManager Pro (Vanilla JavaScript ES6+ & LocalStorage Offline)  
**Fecha:** Octubre 2026  

---

### a. ¿Qué herramientas de IA utilizó y en qué momentos?

Durante el ciclo de desarrollo de la aplicación **TaskManager Pro**, se utilizó como asistente de Inteligencia Artificial a **Google DeepMind Antigravity / Gemini 3.8 Flash** en los siguientes momentos específicos:

1. **Fase de Análisis y Arquitectura Inicial:**  
   Se utilizó la IA para estructurar el árbol de carpetas modular basado en la especificación nativa de ES6 (`import`/`export`), asegurando una estricta separación de responsabilidades entre el servicio de persistencia (`storageService.js`), el consumo asíncrono de la API REST (`apiService.js`), la lógica de negocio y ordenamiento (`taskManager.js`) y la capa visual (`ui.js`).

2. **Fase de Consumo Asíncrono de API y Detección Offline:**  
   Se consultó a la IA para el diseño del bloque de consumo con `fetch()` y `async/await` de JSONPlaceholder (`/todos`), asegurando un mapeo de datos homogéneo y el manejo preventivo de fallos de red (`try/catch`) junto con los eventos del navegador `window.addEventListener('online')` y `window.addEventListener('offline')`.

3. **Fase de Refactorización y Patrón Observador (Custom Events):**  
   Se aprovechó la IA para diseñar la emisión de eventos personalizados mediante la API nativa `CustomEvent`, garantizando que cada mutación en el arreglo de tareas desencadene la re-renderización reactiva del Dashboard de métricas sin acoplar directamente el modelo con el DOM.

---

### b. Prompts (instrucciones) clave utilizados durante el desarrollo

#### Prompt Clave 1 (Arquitectura Modular y Consumo de API sin Duplicados):
> *"Actúa como un arquitecto frontend senior en JavaScript Vanilla. Necesito estructurar un TaskManager sin frameworks ni librerías externas. La aplicación debe consumir `https://jsonplaceholder.typicode.com/todos` únicamente si `localStorage` se encuentra vacío. Si el usuario ya tiene datos locales, no debe sobrescribir ni duplicar registros al sincronizar. Genera el módulo `apiService.js` con `fetch` y `async/await`, y el módulo `storageService.js` manejando serialización JSON y excepciones de cuota en Web Storage."*

#### Prompt Clave 2 (Lógica de Negocio, Filtros y Ordenamiento Multidimensional):
> *"Escribe una clase `TaskManager` en ES6 puro que implemente un CRUD completo. Debe incluir validación estricta en JS para no permitir títulos vacíos o menores a 3 caracteres, un método para filtrar por estado ('all', 'pending', 'completed'), búsqueda dinámica en tiempo real por título insensible a mayúsculas (`toLowerCase`, `includes`), y ordenamiento con `sort()` según fecha de creación (ascendente/descendente) y prioridad (Alta > Media > Baja). Además, debe despachar un `CustomEvent` cada vez que el estado cambie para actualizar un panel de métricas reactivo."*

---

### c. ¿Qué partes del código sugerido por la IA contenían errores o requirieron ajustes manuales?

1. **Ajuste en la prevención de duplicados al sincronizar con JSONPlaceholder:**  
   * **Problema inicial:** El código inicial sugerido por la IA comparaba únicamente por `task.id`. Dado que la API externa genera IDs numéricos (`1, 2, 3...`) y las tareas creadas por el usuario utilizaban IDs alfanuméricos (`task_169...`), al sincronizar de nuevo se volvían a insertar tareas con el mismo título si el ID no coincidía.
   * **Corrección manual:** Se modificó la función `importTasksWithoutDuplicates` en `taskManager.js` para crear dos conjuntos (`Set`): uno para IDs y otro para títulos normalizados en minúsculas (`title.toLowerCase().trim()`). De este modo, se garantiza una prevención estricta de tareas duplicadas independientemente del formato de ID.

2. **Ajuste en el ordenamiento por prioridad con fechas secundarias:**  
   * **Problema inicial:** La función comparadora de `Array.prototype.sort()` sugerida inicialmente ordenaba solo por peso de prioridad (`Alta: 3, Media: 2, Baja: 1`). Sin embargo, cuando varias tareas tenían la misma prioridad, el orden entre ellas resultaba impredecible o inconsistente según el motor V8 del navegador.
   * **Corrección manual:** Se añadió un criterio de desempate en la función comparadora: si la diferencia de pesos de prioridad es cero (`weightDiff === 0`), se aplica una comparación secundaria basada en el timestamp de `createdAt` (`new Date(b.createdAt) - new Date(a.createdAt)`), garantizando una presentación cronológica coherente dentro de cada nivel de prioridad.

3. **Manejo de CORS y Rutas en Módulos ES6 en Entorno Local:**  
   * **Problema inicial:** Al utilizar módulos nativos (`<script type="module">`), la IA sugirió inicialmente abrir el archivo directamente con el protocolo `file://`, lo cual es bloqueado por las políticas de seguridad (CORS) de los navegadores modernos.
   * **Corrección manual:** Se documentó y configuró la ejecución mediante un servidor HTTP local ligero (`python -m http.server` o `npx serve`), y se validaron las rutas relativas explícitas con extensión `.js` en todos los `import` para cumplir al 100% con el estándar ECMAScript oficial.
