/**
 * UI SERVICE (Módulo de Manipulación del DOM e Interfaz Visual)
 * Maneja el renderizado reactivo del DOM, modales accesibles, alertas Toast,
 * controles de validación visual estricta, actualización de métricas y vista en lista/cuadrícula.
 * 
 * @module ui
 */

export const ui = {
  // Referencias cacheadas a elementos del DOM
  elements: {
    // Conexión
    connectionStatus: document.getElementById('connectionStatus'),
    connectionStatusText: document.getElementById('connectionStatusText'),
    syncApiBtn: document.getElementById('syncApiBtn'),
    openNewTaskModalBtn: document.getElementById('openNewTaskModalBtn'),

    // Métricas
    metricTotal: document.getElementById('metricTotal'),
    metricPending: document.getElementById('metricPending'),
    metricCompleted: document.getElementById('metricCompleted'),
    metricRate: document.getElementById('metricRate'),
    metricRateBar: document.getElementById('metricRateBar'),

    // Filtros y Búsqueda
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    sortSelect: document.getElementById('sortSelect'),
    badgeAll: document.getElementById('badgeAll'),
    badgePending: document.getElementById('badgePending'),
    badgeCompleted: document.getElementById('badgeCompleted'),

    // Switcher de Vista (Lista / Cuadrícula)
    viewListBtn: document.getElementById('viewListBtn'),
    viewGridBtn: document.getElementById('viewGridBtn'),

    // Lista de tareas
    tasksList: document.getElementById('tasksList'),
    visibleTasksCount: document.getElementById('visibleTasksCount'),
    emptyState: document.getElementById('emptyState'),
    emptyStateMessage: document.getElementById('emptyStateMessage'),
    emptyStateCreateBtn: document.getElementById('emptyStateCreateBtn'),

    // Modal Crear/Editar
    taskModal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    taskForm: document.getElementById('taskForm'),
    taskId: document.getElementById('taskId'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    taskDescInput: document.getElementById('taskDescInput'),
    taskPrioritySelect: document.getElementById('taskPrioritySelect'),
    titleFeedback: document.getElementById('titleValidationFeedback'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),

    // Modal Eliminar
    deleteModal: document.getElementById('deleteModal'),
    deleteTitlePreview: document.getElementById('deleteTaskTitlePreview'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  },

  /**
   * Cambia el modo de visualización entre lista y cuadrícula
   * @param {'list'|'grid'} mode
   */
  setViewMode(mode) {
    const { tasksList, viewListBtn, viewGridBtn } = this.elements;
    if (mode === 'grid') {
      tasksList.classList.remove('view-list');
      tasksList.classList.add('view-grid');
      if (viewGridBtn) viewGridBtn.classList.add('active');
      if (viewListBtn) viewListBtn.classList.remove('active');
    } else {
      tasksList.classList.remove('view-grid');
      tasksList.classList.add('view-list');
      if (viewListBtn) viewListBtn.classList.add('active');
      if (viewGridBtn) viewGridBtn.classList.remove('active');
    }
  },

  /**
   * Renderiza la lista de tareas en el DOM
   * @param {Array<Object>} tasks
   * @param {Object} handlers - Callbacks para eventos de cada tarjeta
   */
  renderTasks(tasks, { onToggle, onEdit, onDelete }) {
    const { tasksList, emptyState, visibleTasksCount } = this.elements;
    tasksList.innerHTML = '';

    visibleTasksCount.textContent = `${tasks.length} visible${tasks.length === 1 ? '' : 's'}`;

    if (!tasks || tasks.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    const fragment = document.createDocumentFragment();

    tasks.forEach(task => {
      const card = document.createElement('article');
      card.className = `task-card priority-${task.priority.toLowerCase()} ${task.completed ? 'completed' : ''}`;
      card.dataset.id = task.id;

      // Formatear fecha
      const dateObj = new Date(task.createdAt);
      const formattedDate = !isNaN(dateObj) 
        ? dateObj.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
        : 'Reciente';

      const priorityClass = `badge-${task.priority.toLowerCase()}`;

      card.innerHTML = `
        <div class="task-top-bar">
          <div class="task-checkbox-wrapper">
            <input 
              type="checkbox" 
              class="custom-checkbox task-check" 
              ${task.completed ? 'checked' : ''} 
              title="${task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}"
              aria-label="Estado de la tarea"
            >
          </div>
          <span class="badge ${priorityClass} badge-top-bar">
            ● Prioridad ${task.priority}
          </span>
        </div>

        <div class="task-content">
          <h3 class="task-title">${this.escapeHTML(task.title)}</h3>
          ${task.description ? `<p class="task-description">${this.escapeHTML(task.description)}</p>` : ''}
          
          <div class="task-meta">
            <span class="badge ${priorityClass} badge-meta-inline">
              ● Prioridad ${task.priority}
            </span>
            <span class="badge-date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${formattedDate}
            </span>
            ${task.source === 'api' ? '<span class="badge badge-source">API REST</span>' : ''}
          </div>
        </div>

        <div class="task-actions">
          <button class="btn-icon btn-edit" title="Editar tarea" aria-label="Editar tarea">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-icon btn-delete" title="Eliminar tarea" aria-label="Eliminar tarea">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;

      // Event Listeners directos
      const checkbox = card.querySelector('.task-check');
      checkbox.addEventListener('change', () => onToggle(task.id));

      const editBtn = card.querySelector('.btn-edit');
      editBtn.addEventListener('click', () => onEdit(task));

      const deleteBtn = card.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', () => onDelete(task));

      fragment.appendChild(card);
    });

    tasksList.appendChild(fragment);
  },

  /**
   * Actualiza el panel de métricas y contadores de los filtros
   * @param {{ total: number, completed: number, pending: number, rate: number }} metrics
   */
  renderMetrics(metrics) {
    const { metricTotal, metricPending, metricCompleted, metricRate, metricRateBar, badgeAll, badgePending, badgeCompleted } = this.elements;

    metricTotal.textContent = metrics.total;
    metricPending.textContent = metrics.pending;
    metricCompleted.textContent = metrics.completed;
    metricRate.textContent = `${metrics.rate}%`;
    metricRateBar.style.width = `${metrics.rate}%`;

    // Filtros badges
    badgeAll.textContent = metrics.total;
    badgePending.textContent = metrics.pending;
    badgeCompleted.textContent = metrics.completed;
  },

  /**
   * Muestra el modal para crear una nueva tarea
   */
  openCreateModal() {
    const { taskModal, modalTitle, taskForm, taskId, taskTitleInput, taskDescInput, taskPrioritySelect, titleFeedback } = this.elements;
    
    taskForm.reset();
    taskId.value = '';
    modalTitle.textContent = 'Nueva Tarea';
    taskPrioritySelect.value = 'Media';
    
    taskTitleInput.classList.remove('is-invalid');
    titleFeedback.classList.remove('show');

    taskModal.classList.add('active');
    taskModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => taskTitleInput.focus(), 100);
  },

  /**
   * Muestra el modal con los datos precargados para editar
   * @param {Object} task
   */
  openEditModal(task) {
    const { taskModal, modalTitle, taskId, taskTitleInput, taskDescInput, taskPrioritySelect, titleFeedback } = this.elements;
    
    taskId.value = task.id;
    taskTitleInput.value = task.title;
    taskDescInput.value = task.description || '';
    taskPrioritySelect.value = task.priority || 'Media';
    modalTitle.textContent = 'Editar Tarea';

    taskTitleInput.classList.remove('is-invalid');
    titleFeedback.classList.remove('show');

    taskModal.classList.add('active');
    taskModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => taskTitleInput.focus(), 100);
  },

  /**
   * Cierra el modal de formulario
   */
  closeModal() {
    const { taskModal } = this.elements;
    taskModal.classList.remove('active');
    taskModal.setAttribute('aria-hidden', 'true');
  },

  /**
   * Muestra el modal de confirmación de eliminación
   * @param {Object} task
   * @param {Function} onConfirmCallback
   */
  openDeleteModal(task, onConfirmCallback) {
    const { deleteModal, deleteTitlePreview, confirmDeleteBtn } = this.elements;
    deleteTitlePreview.textContent = `"${task.title}"`;

    // Limpiar handler anterior para no duplicar acciones
    const newConfirmBtn = confirmDeleteBtn.cloneNode(true);
    confirmDeleteBtn.parentNode.replaceChild(newConfirmBtn, confirmDeleteBtn);
    this.elements.confirmDeleteBtn = newConfirmBtn;

    newConfirmBtn.addEventListener('click', () => {
      onConfirmCallback(task.id);
      this.closeDeleteModal();
    });

    deleteModal.classList.add('active');
    deleteModal.setAttribute('aria-hidden', 'false');
  },

  /**
   * Cierra el modal de eliminación
   */
  closeDeleteModal() {
    const { deleteModal } = this.elements;
    deleteModal.classList.remove('active');
    deleteModal.setAttribute('aria-hidden', 'true');
  },

  /**
   * Muestra una notificación Toast animada y amigable
   * @param {string} title - Título del toast
   * @param {string} message - Mensaje explicativo
   * @param {'success'|'error'|'warning'|'info'} [type='info']
   * @param {number} [duration=3500] - Tiempo visible en milisegundos
   */
  showToast(title, message, type = 'info', duration = 3500) {
    const { toastContainer } = this.elements;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || '•'}</div>
      <div class="toast-content">
        <div class="toast-title">${this.escapeHTML(title)}</div>
        <div class="toast-message">${this.escapeHTML(message)}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  },

  /**
   * Actualiza el badge visual del estado de conexión (Online / Offline)
   * @param {boolean} isOnline
   */
  updateConnectionStatus(isOnline) {
    const { connectionStatus, connectionStatusText } = this.elements;
    if (isOnline) {
      connectionStatus.classList.remove('offline');
      connectionStatusText.textContent = 'En línea';
    } else {
      connectionStatus.classList.add('offline');
      connectionStatusText.textContent = 'Modo Offline';
    }
  },

  /**
   * Muestra u oculta el error de validación en el input de título
   * @param {boolean} isInvalid
   * @param {string} [customMessage]
   */
  setValidationState(isInvalid, customMessage) {
    const { taskTitleInput, titleFeedback } = this.elements;
    if (isInvalid) {
      taskTitleInput.classList.add('is-invalid');
      if (customMessage) titleFeedback.textContent = customMessage;
      titleFeedback.classList.add('show');
    } else {
      taskTitleInput.classList.remove('is-invalid');
      titleFeedback.classList.remove('show');
    }
  },

  /**
   * Sanitiza strings para prevenir vulnerabilidades XSS
   * @param {string} str
   * @returns {string}
   */
  escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
