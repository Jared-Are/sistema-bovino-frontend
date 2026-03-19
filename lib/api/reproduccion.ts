const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const reproduccionApi = {
  // ====== MONTAS ======
  getMontas: async (token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/montas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  createMonta: async (data: any, token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/montas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateMonta: async (id: string, data: any, token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/montas/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteMonta: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/montas/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // ====== DIAGNÓSTICOS ======
  createDiagnostico: async (data: { monta_id: number; resultado: string; metodo: string; fecha_programacion: string }, token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/diagnosticos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar el diagnóstico');
    }
    return response.json();
  },

  // ====== PARTOS ======
  createParto: async (data: { diagnostico_prenez_id: number; tipo_parto: string; numero_parto: string }, token: string) => {
    const response = await fetch(`${API_URL}/reproduccion/partos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar el parto');
    }
    return response.json();
  }
};