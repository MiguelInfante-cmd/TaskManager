/**
 * EVENTS SERVICE (Patrón Observador & Custom Events)
 * Proporciona un canal desacoplado basado en la API nativa CustomEvent de JS.
 * Notifica a los distintos componentes cuando el estado de las tareas o la red cambia,
 * desencadenando la actualización reactiva del Dashboard de métricas.
 * 
 * @module events
 */

export const TaskEvents = {
  TASKS_UPDATED: 'taskmanager:tasksUpdated',
  NETWORK_STATUS_CHANGED: 'taskmanager:networkStatusChanged',
  TASK_ACTION_PERFORMED: 'taskmanager:action'
};

/**
 * Emite un CustomEvent para notificar cambios en las tareas
 * @param {Object} detail - Información del cambio (tareas, acción, métricas)
 */
export function emitTasksUpdated(detail = {}) {
  const event = new CustomEvent(TaskEvents.TASKS_UPDATED, {
    bubbles: true,
    detail: detail
  });
  document.dispatchEvent(event);
}

/**
 * Suscribe un manejador al evento de tareas actualizadas
 * @param {Function} handler - Función a ejecutar con el detalle del evento
 */
export function onTasksUpdated(handler) {
  document.addEventListener(TaskEvents.TASKS_UPDATED, (event) => {
    handler(event.detail);
  });
}

/**
 * Emite un CustomEvent sobre el cambio de estado de conexión
 * @param {boolean} isOnline - true si el navegador tiene internet
 */
export function emitNetworkStatus(isOnline) {
  const event = new CustomEvent(TaskEvents.NETWORK_STATUS_CHANGED, {
    bubbles: true,
    detail: { isOnline }
  });
  document.dispatchEvent(event);
}

/**
 * Suscribe un manejador al evento de cambio de conexión
 * @param {Function} handler 
 */
export function onNetworkStatusChanged(handler) {
  document.addEventListener(TaskEvents.NETWORK_STATUS_CHANGED, (event) => {
    handler(event.detail);
  });
}
