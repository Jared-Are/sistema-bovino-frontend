const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const lotesApi = {
  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/parametros/lotes`, {  
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar lotes');
    }

    return response.json();
  },

  getById: async (id: number, token: string) => {
    const response = await fetch(`${API_URL}/parametros/lotes/${id}`, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar lote');
    }

    return response.json();
  },

  create: async (data: { nombre: string }, token: string) => {
    const response = await fetch(`${API_URL}/parametros/lotes`, { 
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
      throw new Error(error.message || 'Error al crear lote');
    }

    return response.json();
  },

  update: async (id: number, data: { nombre: string }, token: string) => {
    const response = await fetch(`${API_URL}/parametros/lotes/${id}`, {  
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
      throw new Error(error.message || 'Error al actualizar lote');
    }

    return response.json();
  },

  delete: async (id: number, token: string) => {
    const response = await fetch(`${API_URL}/parametros/lotes/${id}`, {  
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al eliminar lote');
    }

    return response.json();
  },
};