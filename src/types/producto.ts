export interface Producto {
  id: number;
  titulo: string;
  categoria: string;
  descripcion: string | null;
  imagen: string | null;
  acabados: string[];
  destacado: boolean;
  activo?: boolean;
  orden?: number;
}
