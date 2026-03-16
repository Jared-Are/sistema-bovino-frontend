const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const potrerosApi = {
  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/parametros/potreros`, {  
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar potreros');
    }

    return response.json();
  },

  getById: async (id: number, token: string) => {
    const response = await fetch(`${API_URL}/parametros/potreros/${id}`, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar potrero');
    }

    return response.json();
  },

  create: async (data: { nombre: string; ubicacion?: string }, token: string) => {
    const response = await fetch(`${API_URL}/parametros/potreros`, { 
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
      throw new Error(error.message || 'Error al crear potrero');
    }

    return response.json();
  },

  update: async (id: number, data: { nombre: string; ubicacion?: string }, token: string) => {
    const response = await fetch(`${API_URL}/parametros/potreros/${id}`, {  
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
      throw new Error(error.message || 'Error al actualizar potrero');
    }

    return response.json();
  },

  delete: async (id: number, token: string) => {
    const response = await fetch(`${API_URL}/parametros/potreros/${id}`, {  
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al eliminar potrero');
    }

    return response.json();
  },
};