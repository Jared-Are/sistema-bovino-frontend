const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const produccionApi = {
  // ====== LECHE ======
  getLeche: async (token: string) => {
    const response = await fetch(`${API_URL}/produccion/leche`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar registros de leche');
    }

    return response.json();
  },

  createLeche: async (data: { numero_produccion: string; cantidad: number; animalId: number }, token: string) => {
    const response = await fetch(`${API_URL}/produccion/leche`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        numero_produccion: data.numero_produccion,
        cantidad: data.cantidad,
        animalId: data.animalId,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar producción de leche');
    }

    return response.json();
  },

  updateLeche: async (id: string, data: any, token: string) => {
    const response = await fetch(`${API_URL}/produccion/leche/${id}`, {
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
      throw new Error(error.message || 'Error al actualizar registro de leche');
    }

    return response.json();
  },

  deleteLeche: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/produccion/leche/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al eliminar registro de leche');
    }

    return response.json();
  },

  // ====== CARNE ======
  getCarne: async (token: string) => {
    const response = await fetch(`${API_URL}/produccion/carne`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar registros de carne');
    }

    return response.json();
  },

  createCarne: async (data: { peso_canal: number; animalId: number }, token: string) => {
    const response = await fetch(`${API_URL}/produccion/carne`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        peso_canal: data.peso_canal,
        animalId: data.animalId,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar producción de carne');
    }

    return response.json();
  },

  updateCarne: async (id: string, data: any, token: string) => {
    const response = await fetch(`${API_URL}/produccion/carne/${id}`, {
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
      throw new Error(error.message || 'Error al actualizar registro de carne');
    }

    return response.json();
  },

  deleteCarne: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/produccion/carne/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al eliminar registro de carne');
    }

    return response.json();
  },
};
