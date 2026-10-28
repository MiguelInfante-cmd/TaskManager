/**
 * API SERVICE (Servicio de Consumo de API REST Externa)
 * Realiza peticiones asíncronas utilizando fetch() y async/await a JSONPlaceholder.
 * Implementa control de errores estricto con try/catch y normalización a tareas coherentes en español.
 * 
 * @module apiService
 */

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

// Catálogo de tareas académicas y de ingeniería coherentes para ECOTEC / UG
export const COHERENT_TASKS = [
  {
    title: "Implementar arquitectura modular en JavaScript ES6+",
    description: "Desacoplar la interfaz DOM, lógica de negocio y servicios usando import y export nativos sin frameworks."
  },
  {
    title: "Configurar persistencia offline con LocalStorage API",
    description: "Garantizar la serialización JSON y retención permanente de datos en el navegador en modo sin conexión."
  },
  {
    title: "Consumir servicio REST externo con Fetch y Async/Await",
    description: "Sincronizar tareas desde JSONPlaceholder y manejar posibles fallos de red con bloques try/catch amigables."
  },
  {
    title: "Diseñar interfaz visual institucional para Universidad ECOTEC",
    description: "Aplicar sistema de diseño con colores corporativos en tema claro y selector reactivo de vista lista/cuadrícula."
  },
  {
    title: "Programar filtros dinámicos y búsqueda en tiempo real",
    description: "Filtrar por estado (Pendientes/Completadas) y búsqueda instantánea por título insensible a mayúsculas."
  },
  {
    title: "Implementar ordenamiento por prioridad y fecha con sort()",
    description: "Desarrollar funciones comparadoras para clasificar tareas por urgencia (Alta > Media > Baja) y cronología."
  },
  {
    title: "Construir Dashboard de métricas reactivas con Custom Events",
    description: "Emitir eventos personalizados con CustomEvent para recalcular automáticamente total, pendientes y porcentaje."
  },
  {
    title: "Validación estricta de formularios contra campos vacíos",
    description: "Impedir el registro de tareas sin título o con longitud menor a 3 caracteres con retroalimentación visual inmediata."
  },
  {
    title: "Verificación de almacenamiento en DevTools Application",
    description: "Inspeccionar en tiempo real las claves y registros JSON almacenados en el panel Local Storage del navegador."
  },
  {
    title: "Documentar historial de commits escalonados en GitHub",
    description: "Registrar el avance del proyecto por etapas significativas en el repositorio público cumpliendo la rúbrica."
  },
  {
    title: "Elaborar declaración ética de Inteligencia Artificial",
    description: "Completar el archivo AI_DECLARATION.md detallando herramientas, prompts y ajustes manuales realizados."
  },
  {
    title: "Preparar informe académico final para exportación a PDF",
    description: "Redactar documento de 3 páginas con portada institucional, arquitectura de investigación y evidencias técnicas."
  }
];

export const apiService = {
  /**
   * Consulta tareas desde la API REST externa y las normaliza a tareas coherentes en español
   * @param {number} limit - Número máximo de tareas a obtener (por defecto 12)
   * @returns {Promise<Array<Object>>} Lista de tareas normalizadas y coherentes
   */
  async fetchInitialTasks(limit = 12) {
    try {
      if (!navigator.onLine) {
        throw new Error('Sin conexión a internet. No fue posible contactar la API externa.');
      }

      const response = await fetch(`${API_URL}?_limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor de la API: Código de estado HTTP ${response.status}`);
      }

      const rawTasks = await response.json();

      const priorities = ['Alta', 'Media', 'Baja'];
      const now = Date.now();

      return rawTasks.map((item, index) => {
        const coherent = COHERENT_TASKS[index % COHERENT_TASKS.length];
        const priority = priorities[index % priorities.length];
        const createdAt = new Date(now - (index * 3600000 * 4)).toISOString();

        return {
          id: `api_${item.id}`,
          title: coherent.title,
          description: coherent.description,
          completed: Boolean(item.completed),
          priority: priority,
          createdAt: createdAt,
          source: 'api'
        };
      });

    } catch (error) {
      console.error('[apiService] Fallo al consumir API REST:', error);
      throw error;
    }
  }
};
