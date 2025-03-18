export interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  precio_por_turno: number;
  requiere_seguridad: boolean;
  dispositivos_seguridad: string[];
  capacidad_maxima: number;
}
