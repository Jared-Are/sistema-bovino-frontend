const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const animalesApi = {
  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/animales`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar animales');
    }

    return response.json();
  },

  getById: async (id: number, token: string) => {
    const response = await fetch(`${API_URL}/animales/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar animal');
    }

    return response.json();
  },

  create: async (data: FormData, token: string) => {
    const response = await fetch(`${API_URL}/animales`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      const error = await response.json();
      throw new Error(error.message || 'Error al crear animal');
    }

    return response.json();
  },

  update: async (id: number, data: any, token: string) => {
    const response = await fetch(`${API_URL}/animales/${id}`, {
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
      throw new Error(error.message || 'Error al actualizar animal');
    }

    return response.json();
  },

  delete: async (id: number, token: string) => {
    const response = await fetch(`${API_URL}/animales/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al eliminar animal');
    }

    return response.json();
  },
};