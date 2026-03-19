export type RolUsuario = 'PROPIETARIO' | 'OPERARIO' | 'VETERINARIO';
export type EstadoUsuario = 'ACTIVO' | 'INVITADO' | 'BLOQUEADO';

export interface UsuarioBackend {
  usuario_id: string;
  nombre: string;
  email: string | null;
  telefono: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  finca?: { finca_id: number; nombre: string };
  fecha_creacion: string;
  debe_cambiar_contrasena: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string;
  rol: RolUsuario;        
  estado: EstadoUsuario;     
  finca?: string;
  fechaCreacion: string;
  debeCambiarContrasena: boolean;
}