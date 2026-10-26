/**
 * API SERVICE (Servicio de Consumo de API REST Externa)
 * Realiza peticiones asíncronas utilizando fetch() y async/await a JSONPlaceholder.
 * Implementa control de errores estricto con try/catch y normalización de datos.
 * 
 * @module apiService
 */

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

export const apiService = {
  /**
   * Consulta tareas desde la API REST externa
   * @param {number} limit - Número máximo de tareas a obtener (por defecto 15 para un set balanceado)
   * @returns {Promise<Array<Object>>} Lista de tareas normalizadas
   */
  async fetchInitialTasks(limit = 12) {
    try {
      // Verificación de conectividad de navegador
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

      // Normalización de datos con asignación balanceada de prioridades y fechas
      const priorities = ['Alta', 'Media', 'Baja'];
      const now = Date.now();

      return rawTasks.map((item, index) => {
        // Asignamos prioridades distribuidas y timestamps escalonados
        const priority = priorities[index % 3];
        const createdAt = new Date(now - (index * 3600000 * 4)).toISOString(); // 4 horas de diferencia entre cada tarea

        return {
          id: `api_${item.id}`,
          title: item.title ? item.title.charAt(0).toUpperCase() + item.title.slice(1) : 'Tarea sin título',
          description: `Tarea importada desde JSONPlaceholder REST API (ID original: #${item.id}).`,
          completed: Boolean(item.completed),
          priority: priority,
          createdAt: createdAt,
          source: 'api'
        };
      });

    } catch (error) {
      console.error('[apiService] Fallo al consumir API REST:', error);
      // Re-lanzar para que la UI capture el error y muestre la notificación amigable
      throw error;
    }
  }
};
