"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getBookings, deleteBooking } from "@/services/bookingService";
import { Booking } from "@/interfaces";
import { toast } from "sonner";

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelledBookings, setCancelledBookings] = useState(new Set<string>());
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getBookings();
        console.log("Raw bookings data:", data.data);
        setBookings(data.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(err.message || "No se pudieron cargar las reservas");
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    try {
      setCancelError(null);
      await deleteBooking(bookingId);
      setCancelledBookings((prev) => new Set([...prev, bookingId]));
      setBookings((prev) =>
        prev.filter((booking) => booking._id !== bookingId)
      );
      toast.success("Reserva cancelada exitosamente", {
        description: "La reserva ha sido eliminada sin costo alguno.",
      });
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      setCancelError(err.message || "No se pudo cancelar la reserva");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const canCancelWithoutCost = (fechaInicio: string) => {
    const now = new Date();
    const startDate = new Date(fechaInicio);
    const diffMs = startDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 2;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-700">Error</h3>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
              getBookings()
                .then((data) => {
                  setBookings(data.data);
                  setLoading(false);
                })
                .catch((err) => {
                  console.error(err);
                  setError("No se pudieron cargar las reservas");
                  setLoading(false);
                });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Intentar nuevamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-700 mb-4">Mis Reservas</h3>

      {bookings.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">No tienes reservas aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const isCancelled = cancelledBookings.has(booking._id);
            const canCancelFree = canCancelWithoutCost(booking.fecha_inicio);

            return (
              <Card
                key={booking._id}
                className={`w-full max-w-md mx-auto hover:shadow-lg transition ${
                  isCancelled ? "opacity-60" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Calendar className="h-5 w-5" />
                      <span className="text-lg">
                        {formatDate(booking.fecha_inicio)} -{" "}
                        {formatDate(booking.fecha_fin)}
                      </span>
                    </div>
                    {isCancelled && (
                      <Badge variant="destructive" className="ml-auto">
                        Cancelada
                      </Badge>
                    )}
                  </div>
                  {booking.seguridad_incluida && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Incluye seguro</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pb-3">
                  {booking.productos.map((item, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xl font-semibold">
                          {item.producto.nombre}
                        </h3>
                        <span className="text-sm font-medium">
                          x{item.cantidad}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        Tipo: {item.producto.tipo}
                      </p>
                      <p className="font-medium">
                        ${item.producto.precio_por_turno} / turno
                      </p>
                    </div>
                  ))}

                  {booking.dispositivos_seguridad_seleccionados.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium inline-block px-3 py-1 bg-secondary rounded-full mb-2">
                        Dispositivos de Seguridad
                      </h4>
                      <ul className="space-y-1 pl-2">
                        {booking.dispositivos_seguridad_seleccionados.map(
                          (ds, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-muted-foreground"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block"></span>
                              {ds}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between items-center pt-2 border-t">
                  <div className="font-semibold text-lg">
                    Total:{" "}
                    <span className="text-green-600">
                      ${booking.precio_total}
                    </span>
                  </div>
                  {!isCancelled && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="text-sm">
                          Cancelar reserva
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {canCancelFree ? (
                              <>
                                Esta acción no se puede deshacer. La reserva
                                será cancelada sin costo alguno ya que faltan
                                más de 2 horas para el inicio.
                                {cancelError && (
                                  <p className="text-red-500 mt-2">
                                    {cancelError}
                                  </p>
                                )}
                              </>
                            ) : (
                              "No es posible cancelar la reserva en línea porque estás dentro de las 2 horas previas al inicio. Deberás acudir personalmente para cancelarla y podrías enfrentar costos según las condiciones; de lo contrario, tu cuenta podría ser dada de baja."
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          {canCancelFree ? (
                            <>
                              <AlertDialogCancel>Volver</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancel(booking._id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Sí, cancelar reserva
                              </AlertDialogAction>
                            </>
                          ) : (
                            <AlertDialogCancel asChild>
                              <Button variant="outline">Entendido</Button>
                            </AlertDialogCancel>
                          )}
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
