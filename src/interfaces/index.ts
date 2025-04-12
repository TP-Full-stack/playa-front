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

export interface Booking {
  _id: string;
  cliente: string;
  fecha_inicio: string;
  fecha_fin: string;
  seguridad_incluida: boolean;
  dispositivos_seguridad_seleccionados: string[];
  productos: {
    producto: {
      _id: string;
      nombre: string;
      tipo: string;
      precio_por_turno: number;
    };
    cantidad: number;
  }[];
  precio_total: number;
}
