/**
 * TASK MANAGER (Módulo de Lógica de Negocio y Estado)
 * Contiene el estado en memoria de las tareas, operaciones CRUD con validaciones estrictas,
 * filtrado por estado, búsqueda dinámica en tiempo real por título, y ordenamiento con sort().
 * 
 * @module taskManager
 */

import { storageService } from './storageService.js';
import { emitTasksUpdated } from './events.js';

export class TaskManager {
  constructor() {
    /** @type {Array<Object>} */
    this.tasks = [];
  }

  /**
   * Inicializa el gestor de tareas cargando desde LocalStorage
   * @param {Array<Object>} [fallbackTasks=[]]
   */
  init(fallbackTasks = []) {
    const saved = storageService.getTasks();
    if (saved && saved.length > 0) {
      this.tasks = saved;
    } else {
      this.tasks = fallbackTasks;
      if (fallbackTasks.length > 0) {
        storageService.saveTasks(this.tasks);
      }
    }

    emitTasksUpdated({
      action: 'init',
      metrics: this.getMetrics()
    });
  }

  /**
   * Obtiene la lista completa de tareas
   * @returns {Array<Object>}
   */
  getAllTasks() {
    return [...this.tasks];
  }

  /**
   * Busca una tarea específica por su ID
   * @param {string} id
   * @returns {Object|null}
   */
  getTaskById(id) {
    return this.tasks.find(t => t.id === id) || null;
  }

  /**
   * Crea una nueva tarea aplicando validación estricta de campos vacíos
   * @param {Object} taskData
   * @param {string} taskData.title
   * @param {string} [taskData.description='']
   * @param {'Alta'|'Media'|'Baja'} [taskData.priority='Media']
   * @returns {Object} Tarea recién creada
   * @throws {Error} Si el título está vacío o es inválido
   */
  createTask({ title, description = '', priority = 'Media' }) {
    const cleanTitle = (title || '').trim();
    if (!cleanTitle || cleanTitle.length < 3) {
      throw new Error('Validación fallida: El título de la tarea es obligatorio y debe tener al menos 3 caracteres.');
    }

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: cleanTitle,
      description: (description || '').trim(),
      priority: ['Alta', 'Media', 'Baja'].includes(priority) ? priority : 'Media',
      completed: false,
      createdAt: new Date().toISOString(),
      source: 'local'
    };

    // Insertar al inicio de la lista
    this.tasks.unshift(newTask);

    // Persistencia inmediata en LocalStorage
    storageService.saveTasks(this.tasks);

    // Notificación reactiva mediante CustomEvent
    emitTasksUpdated({
      action: 'create',
      task: newTask,
      metrics: this.getMetrics()
    });

    return newTask;
  }

  /**
   * Edita una tarea existente aplicando validación
   * @param {string} id
   * @param {Object} updates
   * @returns {Object} Tarea actualizada
   * @throws {Error} Si no existe o si el título no es válido
   */
  updateTask(id, { title, description, priority }) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`No se encontró la tarea con ID ${id}`);
    }

    const cleanTitle = (title || '').trim();
    if (!cleanTitle || cleanTitle.length < 3) {
      throw new Error('Validación fallida: El título de la tarea no puede estar vacío.');
    }

    this.tasks[index] = {
      ...this.tasks[index],
      title: cleanTitle,
      description: typeof description === 'string' ? description.trim() : this.tasks[index].description,
      priority: ['Alta', 'Media', 'Baja'].includes(priority) ? priority : this.tasks[index].priority,
      updatedAt: new Date().toISOString()
    };

    storageService.saveTasks(this.tasks);

    emitTasksUpdated({
      action: 'update',
      task: this.tasks[index],
      metrics: this.getMetrics()
    });

    return this.tasks[index];
  }

  /**
   * Elimina una tarea por ID
   * @param {string} id
   * @returns {boolean}
   */
  deleteTask(id) {
    const prevLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);

    if (this.tasks.length !== prevLength) {
      storageService.saveTasks(this.tasks);

      emitTasksUpdated({
        action: 'delete',
        taskId: id,
        metrics: this.getMetrics()
      });
      return true;
    }
    return false;
  }

  /**
   * Alterna el estado completado/pendiente de una tarea
   * @param {string} id
   * @returns {Object|null}
   */
  toggleTaskStatus(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;

    task.completed = !task.completed;
    storageService.saveTasks(this.tasks);

    emitTasksUpdated({
      action: 'toggle',
      task,
      metrics: this.getMetrics()
    });

    return task;
  }

  /**
   * Importa tareas desde una fuente externa (API) sin duplicar registros
   * @param {Array<Object>} newTasks
   * @returns {number} Cantidad de tareas nuevas agregadas
   */
  importTasksWithoutDuplicates(newTasks) {
    if (!Array.isArray(newTasks) || newTasks.length === 0) return 0;

    let addedCount = 0;
    const existingTitles = new Set(this.tasks.map(t => t.title.toLowerCase().trim()));
    const existingIds = new Set(this.tasks.map(t => t.id));

    newTasks.forEach(item => {
      const existingIndex = this.tasks.findIndex(t => t.id === item.id);
      if (existingIndex !== -1) {
        // Actualizar título y descripción a la versión coherente si venía de la API
        this.tasks[existingIndex].title = item.title;
        this.tasks[existingIndex].description = item.description;
        addedCount++;
      } else {
        const normalizedTitle = (item.title || '').toLowerCase().trim();
        if (!existingTitles.has(normalizedTitle) && !existingIds.has(item.id)) {
          this.tasks.push(item);
          existingTitles.add(normalizedTitle);
          existingIds.add(item.id);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      storageService.saveTasks(this.tasks);
      emitTasksUpdated({
        action: 'import',
        importedCount: addedCount,
        metrics: this.getMetrics()
      });
    }

    return addedCount;
  }

  /**
   * Calcula las métricas del sistema en tiempo real
   * @returns {{ total: number, completed: number, pending: number, rate: number }}
   */
  getMetrics() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, rate };
  }

  /**
   * Obtiene la lista filtrada, buscada y ordenada según los criterios activos
   * @param {Object} options
   * @param {'all'|'pending'|'completed'} [options.filterStatus='all']
   * @param {string} [options.searchQuery='']
   * @param {string} [options.sortBy='date-desc']
   * @returns {Array<Object>} Lista filtrada y ordenada
   */
  getFilteredTasks({ filterStatus = 'all', searchQuery = '', sortBy = 'date-desc' } = {}) {
    let result = [...this.tasks];

    // 1. Filtrado por Estado (filter)
    if (filterStatus === 'pending') {
      result = result.filter(task => !task.completed);
    } else if (filterStatus === 'completed') {
      result = result.filter(task => task.completed);
    }

    // 2. Búsqueda Dinámica en tiempo real por título (includes, toLowerCase)
    const query = (searchQuery || '').trim().toLowerCase();
    if (query) {
      result = result.filter(task => {
        const titleMatch = task.title && task.title.toLowerCase().includes(query);
        const descMatch = task.description && task.description.toLowerCase().includes(query);
        return titleMatch || descMatch;
      });
    }

    // 3. Ordenamiento (sort con funciones comparadoras)
    const priorityWeight = { 'Alta': 3, 'Media': 2, 'Baja': 1 };

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        case 'priority-desc': {
          const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
          if (weightDiff !== 0) return weightDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        case 'priority-asc': {
          const weightDiff = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
          if (weightDiff !== 0) return weightDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        case 'title-asc':
          return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });

        default:
          return 0;
      }
    });

    return result;
  }
}

// Instancia singleton para el módulo
export const taskManager = new TaskManager();
