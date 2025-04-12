export async function createBooking(data: {
  cliente: string;
  productos: { producto: string; cantidad: number }[];
  fecha_inicio: string;
  fecha_fin: string;
  seguridad_incluida: boolean;
  dispositivos_seguridad_seleccionados?: string[];
}) {
  const url = `${process.env.NEXT_PUBLIC_API_URL_V2}/bookings`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error details:", error);
    throw new Error(error.message || "Error al crear la reserva");
  }
  return response.json();
}

export async function getBookings() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_V2}/bookings`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("Response:", response);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener las reservas");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error al obtener las reservas:", error.message);
    throw error;
  }
}

export async function deleteBooking(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_V2}/bookings/${id}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al eliminar la reserva");
  }

  return response.json();
}
