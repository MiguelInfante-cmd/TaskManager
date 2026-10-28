/**
 * STORAGE SERVICE (Módulo Gestor de LocalStorage)
 * Maneja la persistencia de datos localmente en el navegador mediante Web Storage API.
 * Garantiza funcionamiento offline y previene pérdida o corrupción de datos.
 * 
 * @module storageService
 */

const STORAGE_KEY = 'taskmanager_ecotec_tasks_v2';

export const storageService = {
  /**
   * Obtiene todas las tareas guardadas en localStorage
   * @returns {Array<Object>} Lista de tareas parseadas o arreglo vacío
   */
  getTasks() {
    try {
      // Limpiar versiones obsoletas con texto en latín si existen
      if (localStorage.getItem('taskmanager_tasks_v1')) {
        localStorage.removeItem('taskmanager_tasks_v1');
      }

      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) {
        return [];
      }
      const parsed = JSON.parse(rawData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('[storageService] Error al deserializar tareas de localStorage:', error);
      return [];
    }
  },

  /**
   * Guarda la lista completa de tareas en localStorage serializadas como JSON
   * @param {Array<Object>} tasks - Lista de tareas
   * @returns {boolean} true si se guardó exitosamente, false en caso de error
   */
  saveTasks(tasks) {
    try {
      const serialized = JSON.stringify(tasks);
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.error('[storageService] Error al serializar tareas en localStorage:', error);
      return false;
    }
  },

  /**
   * Verifica si ya existen tareas almacenadas en localStorage
   * @returns {boolean} true si existen registros guardados
   */
  hasTasks() {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) return false;
      const parsed = JSON.parse(rawData);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  },

  /**
   * Limpia y asegura que todas las tareas tengan títulos y descripciones coherentes en español
   * Reemplaza cualquier residuo en latín (delectus, quis ut, etc.) con plantillas oficiales
   * @param {Array<Object>} coherentTemplates
   */
  enforceCoherentTasks(coherentTemplates) {
    try {
      // Purgar claves antiguas
      localStorage.removeItem('taskmanager_tasks_v1');

      let currentTasks = this.getTasks();

      // Si no hay tareas en la clave nueva, no hay nada que limpiar aún
      if (!currentTasks || currentTasks.length === 0) return;

      const latinKeywords = [
        'delectus', 'autem', 'quis ut', 'nam facilis', 'molestiae', 'perspiciatis', 
        'illo', 'vero', 'repellendus', 'fugiat', 'ullam', 'dolor', 
        'tempora', 'soluta', 'laboriosam', 'suscipit', 'porro', 'veniam',
        'voluptatem', 'expedita', 'consequatur'
      ];

      let hasLatin = false;
      const sanitized = currentTasks.map((task, index) => {
        const titleLower = (task.title || '').toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        const matchesLatin = latinKeywords.some(kw => titleLower.includes(kw)) || descLower.includes('(id original: #');

        if (matchesLatin || task.source === 'api') {
          hasLatin = true;
          const template = coherentTemplates[index % coherentTemplates.length];
          return {
            ...task,
            title: template.title,
            description: template.description
          };
        }
        return task;
      });

      if (hasLatin) {
        this.saveTasks(sanitized);
        console.log('[storageService] Tareas normalizadas exitosamente a español coherente.');
      }
    } catch (err) {
      console.warn('[storageService] Error al sanitizar tareas:', err);
    }
  },

  /**
   * Borra todas las tareas del localStorage
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('taskmanager_tasks_v1');
      return true;
    } catch (error) {
      console.error('[storageService] Error al limpiar localStorage:', error);
      return false;
    }
  }
};
