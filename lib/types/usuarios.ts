export type RolUsuario = 'Propietario' | 'Operario' | 'Veterinario';
export type EstadoUsuario = 'Activo' | 'Invitado' | 'Bloqueado';

export interface UsuarioBackend {
  usuario_id: string;
  nombre: string;
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
  telefono: string;
  rol: RolUsuario;        
  estado: EstadoUsuario;     
  finca?: string;
  fechaCreacion: string;
  debeCambiarContrasena: boolean;
}