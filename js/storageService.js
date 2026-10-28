/**
 * STORAGE SERVICE (Módulo Gestor de LocalStorage)
 * Maneja la persistencia de datos localmente en el navegador mediante Web Storage API.
 * Garantiza funcionamiento offline y previene pérdida o corrupción de datos.
 * 
 * @module storageService
 */

const STORAGE_KEY = 'taskmanager_tasks_v1';

export const storageService = {
  /**
   * Obtiene todas las tareas guardadas en localStorage
   * @returns {Array<Object>} Lista de tareas parseadas o arreglo vacío
   */
  getTasks() {
    try {
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
   * Limpia y migra tareas que contengan texto en latín a títulos y descripciones coherentes en español
   * @param {Array<Object>} coherentTemplates - Plantillas coherentes de apiService
   */
  migrateLatinTasks(coherentTemplates) {
    try {
      const currentTasks = this.getTasks();
      if (!currentTasks || currentTasks.length === 0) return;

      const latinKeywords = [
        'delectus', 'autem', 'quis ut', 'nam facilis', 'molestiae', 'perspiciatis', 
        'illo est', 'vero rerum', 'ipsa repellendus', 'fugiat', 'ullam', 'dolor', 
        'temporibus', 'soluta', 'laboriosam', 'suscipit'
      ];

      let modified = false;
      const updated = currentTasks.map((task, index) => {
        const titleLower = (task.title || '').toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        const isLatin = latinKeywords.some(kw => titleLower.includes(kw)) || descLower.includes('(id original: #');

        if (isLatin && Array.isArray(coherentTemplates) && coherentTemplates.length > 0) {
          const template = coherentTemplates[index % coherentTemplates.length];
          modified = true;
          return {
            ...task,
            title: template.title,
            description: template.description
          };
        }
        return task;
      });

      if (modified) {
        this.saveTasks(updated);
        console.log('[storageService] Migración exitosa de tareas a títulos y descripciones coherentes en español.');
      }
    } catch (err) {
      console.warn('[storageService] Error durante la migración de tareas:', err);
    }
  },

  /**
   * Borra todas las tareas del localStorage
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('[storageService] Error al limpiar localStorage:', error);
      return false;
    }
  }
};
