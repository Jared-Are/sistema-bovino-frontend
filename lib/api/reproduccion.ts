const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const reproduccionApi = {
  // Obtener todas las montas
  getMontas: async (token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/montas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar registros reproductivos');
    }
    return response.json();
  },

  // Crear una nueva monta
  createMonta: async (data: { numero_monta: string; fecha_programacion: string; tipo_monta: string; animalId: number }, token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/montas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar la monta');
    }
    return response.json();
  },

  // Actualizar una monta
  updateMonta: async (id: string, data: any, token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/montas/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar registro');
    }
    return response.json();
  },

  // Eliminar una monta
  deleteMonta: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/montas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al eliminar registro reproductivo');
    }
    return response.json();
  },
};