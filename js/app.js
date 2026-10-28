/**
 * APP CONTROLLER (Punto de Entrada Principal)
 * Inicializa la aplicación, enlaza los módulos ES6 (ui, taskManager, apiService, storageService),
 * gestiona eventos de usuario, búsqueda en tiempo real, filtros, y conectividad offline.
 * 
 * @module app
 */

import { taskManager } from './taskManager.js';
import { storageService } from './storageService.js';
import { apiService } from './apiService.js';
import { ui } from './ui.js';
import { onTasksUpdated, emitNetworkStatus } from './events.js';

class App {
  constructor() {
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.currentSort = 'date-desc';
    this.currentViewMode = localStorage.getItem('taskmanager_view_mode') || 'list';
  }

  /**
   * Inicializa todos los componentes de la aplicación
   */
  async init() {
    console.log('[TaskManager Pro] Inicializando aplicación ES6...');

    // 1. Configurar vista inicial (Lista / Cuadrícula)
    ui.setViewMode(this.currentViewMode);

    // 2. Configurar estado de red inicial
    ui.updateConnectionStatus(navigator.onLine);

    // 2. Suscribir listeners a Custom Events (Patrón Observador - Opción B)
    onTasksUpdated((detail) => {
      console.log('[CustomEvent: taskmanager:tasksUpdated]', detail);
      ui.renderMetrics(taskManager.getMetrics());
    });

    // 3. Vincular manejadores de eventos del DOM
    this.bindEvents();

    // 4. Carga inicial de datos (API REST o LocalStorage)
    await this.loadInitialData();

    // 5. Renderizado inicial de vista
    this.refreshView();
  }

  /**
   * Carga inicial según el requerimiento:
   * Si LocalStorage está vacío, consulta la API REST externa (JSONPlaceholder).
   * Si ya existen datos guardados, los carga directamente sin duplicar registros.
   */
  async loadInitialData() {
    try {
      if (storageService.hasTasks()) {
        console.log('[App] Se encontraron datos existentes en LocalStorage.');
        taskManager.init();
        ui.showToast(
          'Persistencia Local Activa',
          'Tus tareas se recuperaron exitosamente desde LocalStorage (funcional offline).',
          'info'
        );
      } else {
        console.log('[App] LocalStorage vacío. Iniciando carga desde API REST externa...');
        ui.showToast('Sincronizando', 'Consultando tareas iniciales desde JSONPlaceholder...', 'info', 2000);

        try {
          const apiTasks = await apiService.fetchInitialTasks(12);
          taskManager.init(apiTasks);
          ui.showToast(
            'Carga Inicial Exitosa',
            `Se importaron ${apiTasks.length} tareas desde la API REST externa.`,
            'success'
          );
        } catch (apiError) {
          console.warn('[App] Falló la carga de la API REST externa:', apiError.message);
          taskManager.init([]);
          ui.showToast(
            'Aviso de Conectividad',
            'No se pudo conectar a la API externa. La aplicación operará en modo local/offline.',
            'warning',
            4500
          );
        }
      }
    } catch (err) {
      console.error('[App] Error general en inicialización de datos:', err);
      taskManager.init([]);
    }
  }

  /**
   * Actualiza el renderizado de la lista de tareas y métricas en pantalla
   */
  refreshView() {
    const filteredTasks = taskManager.getFilteredTasks({
      filterStatus: this.currentFilter,
      searchQuery: this.currentSearch,
      sortBy: this.currentSort
    });

    ui.renderTasks(filteredTasks, {
      onToggle: (id) => this.handleToggleTask(id),
      onEdit: (task) => this.handleOpenEdit(task),
      onDelete: (task) => this.handleOpenDelete(task)
    });

    ui.renderMetrics(taskManager.getMetrics());
  }

  /**
   * Vincula todos los escuchadores de eventos del DOM
   */
  bindEvents() {
    const { 
      openNewTaskModalBtn,
      emptyStateCreateBtn,
      closeModalBtn,
      cancelModalBtn,
      taskForm,
      taskTitleInput,
      searchInput,
      searchClearBtn,
      filterButtons,
      sortSelect,
      syncApiBtn,
      closeDeleteModalBtn,
      cancelDeleteBtn,
      viewListBtn,
      viewGridBtn
    } = ui.elements;

    // --- Modo de visualización (Lista / Cuadrícula) ---
    if (viewListBtn) {
      viewListBtn.addEventListener('click', () => {
        this.currentViewMode = 'list';
        ui.setViewMode('list');
        localStorage.setItem('taskmanager_view_mode', 'list');
      });
    }

    if (viewGridBtn) {
      viewGridBtn.addEventListener('click', () => {
        this.currentViewMode = 'grid';
        ui.setViewMode('grid');
        localStorage.setItem('taskmanager_view_mode', 'grid');
      });
    }

    // --- Apertura y cierre de modales ---
    openNewTaskModalBtn.addEventListener('click', () => ui.openCreateModal());
    emptyStateCreateBtn.addEventListener('click', () => ui.openCreateModal());

    closeModalBtn.addEventListener('click', () => ui.closeModal());
    cancelModalBtn.addEventListener('click', () => ui.closeModal());

    closeDeleteModalBtn.addEventListener('click', () => ui.closeDeleteModal());
    cancelDeleteBtn.addEventListener('click', () => ui.closeDeleteModal());

    // Cerrar modal al presionar ESC o al hacer clic fuera del contenedor
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ui.closeModal();
        ui.closeDeleteModal();
      }
    });

    [ui.elements.taskModal, ui.elements.deleteModal].forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          ui.closeModal();
          ui.closeDeleteModal();
        }
      });
    });

    // --- Validación estricta en tiempo real para el input de título ---
    taskTitleInput.addEventListener('input', () => {
      if (taskTitleInput.value.trim().length >= 3) {
        ui.setValidationState(false);
      }
    });

    // --- Envío del formulario (Crear o Editar Tarea) ---
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // --- Búsqueda dinámica en tiempo real por título ---
    searchInput.addEventListener('input', (e) => {
      this.currentSearch = e.target.value;
      this.refreshView();
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.currentSearch = '';
      this.refreshView();
      searchInput.focus();
    });

    // --- Filtros por estado (Todas, Pendientes, Completadas) ---
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.refreshView();
      });
    });

    // --- Ordenamiento dinámico ---
    sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.refreshView();
    });

    // --- Botón manual de sincronización con API REST ---
    syncApiBtn.addEventListener('click', () => this.handleSyncApi());

    // --- Detección de conectividad Online / Offline en tiempo real ---
    window.addEventListener('online', () => {
      ui.updateConnectionStatus(true);
      emitNetworkStatus(true);
      ui.showToast('Conexión Restaurada', 'El navegador vuelve a estar conectado a internet.', 'success');
    });

    window.addEventListener('offline', () => {
      ui.updateConnectionStatus(false);
      emitNetworkStatus(false);
      ui.showToast('Modo Offline Activo', 'Sin internet. Todos tus cambios se guardan localmente en LocalStorage.', 'warning', 4500);
    });
  }

  /**
   * Procesa la creación o actualización de una tarea tras validar estrictamente
   */
  handleFormSubmit() {
    const { taskId, taskTitleInput, taskDescInput, taskPrioritySelect } = ui.elements;
    const titleVal = taskTitleInput.value.trim();

    // Validación estricta en JS
    if (!titleVal || titleVal.length < 3) {
      ui.setValidationState(true, 'El título es obligatorio y debe tener al menos 3 caracteres.');
      taskTitleInput.focus();
      return;
    }

    try {
      const isEditing = Boolean(taskId.value);

      if (isEditing) {
        taskManager.updateTask(taskId.value, {
          title: titleVal,
          description: taskDescInput.value,
          priority: taskPrioritySelect.value
        });
        ui.showToast('Tarea Actualizada', 'Los cambios se guardaron permanentemente en LocalStorage.', 'success');
      } else {
        taskManager.createTask({
          title: titleVal,
          description: taskDescInput.value,
          priority: taskPrioritySelect.value
        });
        ui.showToast('Tarea Creada', 'La nueva tarea fue añadida y guardada en LocalStorage.', 'success');
      }

      ui.closeModal();
      this.refreshView();
    } catch (error) {
      ui.setValidationState(true, error.message);
    }
  }

  /**
   * Alterna el estado completado de una tarea
   * @param {string} id
   */
  handleToggleTask(id) {
    const updated = taskManager.toggleTaskStatus(id);
    if (updated) {
      const msg = updated.completed ? 'Tarea marcada como completada' : 'Tarea marcada como pendiente';
      ui.showToast('Estado Modificado', msg, 'info', 2000);
      this.refreshView();
    }
  }

  /**
   * Abre modal para edición
   * @param {Object} task
   */
  handleOpenEdit(task) {
    ui.openEditModal(task);
  }

  /**
   * Abre modal de confirmación para eliminar
   * @param {Object} task
   */
  handleOpenDelete(task) {
    ui.openDeleteModal(task, (id) => {
      taskManager.deleteTask(id);
      ui.showToast('Tarea Eliminada', 'La tarea ha sido borrada de LocalStorage.', 'info');
      this.refreshView();
    });
  }

  /**
   * Sincroniza manualmente nuevas tareas desde la API sin duplicar existentes
   */
  async handleSyncApi() {
    const { syncApiBtn } = ui.elements;
    const originalText = syncApiBtn.innerHTML;

    try {
      syncApiBtn.disabled = true;
      syncApiBtn.innerHTML = `<span>Cargando...</span>`;

      const apiTasks = await apiService.fetchInitialTasks(15);
      const importedCount = taskManager.importTasksWithoutDuplicates(apiTasks);

      if (importedCount > 0) {
        ui.showToast(
          'Sincronización Exitosa',
          `Se importaron ${importedCount} tareas nuevas desde JSONPlaceholder sin duplicados.`,
          'success'
        );
      } else {
        ui.showToast(
          'Sin Nuevas Tareas',
          'Todas las tareas de la API ya existen en tu LocalStorage. No se duplicó ningún registro.',
          'info'
        );
      }

      this.refreshView();
    } catch (error) {
      ui.showToast(
        'Error de Sincronización',
        `No se pudo sincronizar con la API: ${error.message}`,
        'error',
        4000
      );
    } finally {
      syncApiBtn.disabled = false;
      syncApiBtn.innerHTML = originalText;
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
