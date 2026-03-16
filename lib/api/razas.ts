const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const razasApi = {
  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/parametros/razas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar razas');
    }

    return response.json();
  },

  getById: async (id: number, token: string) => {
    const response = await fetch(`${API_URL}/parametros/razas/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al cargar raza');
    }

    return response.json();
  },

  create: async (data: { nombre: string; descripcion?: string }, token: string) => {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) throw new Error('No hay información de usuario');
    
    const usuario = JSON.parse(usuarioStr);
    const fincaId = usuario.finca?.id;
    
    if (!fincaId) throw new Error('No se encontró la finca del usuario');

    const response = await fetch(`${API_URL}/parametros/razas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nombre: data.nombre, 
        descripcion: data.descripcion || '', 
        fincaId 
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      const error = await response.json();
      throw new Error(error.message || 'Error al crear raza');
    }

    return response.json();
  },

  update: async (id: number, data: { nombre: string; descripcion?: string }, token: string) => {
    const response = await fetch(`${API_URL}/parametros/razas/${id}`, {
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
      throw new Error(error.message || 'Error al actualizar raza');
    }

    return response.json();
  },

  delete: async (id: number, token: string) => {
    const response = await fetch(`${API_URL}/parametros/razas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('No autorizado');
      throw new Error('Error al eliminar raza');
    }

    return response.json();
  },
};