"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Users,
  Clock,
  Shield,
  BadgeX,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getProducts } from "@/services/productService";
import { createBooking } from "@/services/bookingService";
import { Product } from "@/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CreditCard, Banknote, DollarSign } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

export default function BookingForm() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("");
  const [numTurnos, setNumTurnos] = useState<string>("1");
  const [numPeople, setNumPeople] = useState<string>("1");
  const [paymentMethod, setPaymentMethod] = useState<string>("efectivo");
  const [stormInsurance, setStormInsurance] = useState<boolean>(false);
  const [formStep, setFormStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Get products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts();
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("No se pudieron cargar los productos");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Cargando productos...</p>
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
              setLoading(true);
              setError(null);
              getProducts()
                .then((data) => {
                  setProducts(data);
                  setLoading(false);
                })
                .catch((err) => {
                  console.error("Error retrying products fetch:", err);
                  setError("No se pudieron cargar los productos");
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

  const calculateTotal = () => {
    let total = 0;
    let safetyDevicesCount: { [key: string]: number } = {};

    selectedProducts.forEach((productId) => {
      const product = products.find((p) => p._id === productId);
      if (product) {
        total += product.precio_por_turno;
        if (
          product.requiere_seguridad &&
          product.dispositivos_seguridad.length > 0
        ) {
          product.dispositivos_seguridad.forEach((device) => {
            safetyDevicesCount[device] =
              (safetyDevicesCount[device] || 0) + Number.parseInt(numPeople);
          });
        }
      }
    });

    total *= Number.parseInt(numTurnos);
    if (selectedProducts.length > 1) {
      total *= 0.9; // 10% discount
    }
    if (stormInsurance) {
      total *= 1.1; // 10% insurance
    }

    return {
      subtotal: total,
      safetyDevicesCount,
    };
  };

  const { subtotal, safetyDevicesCount } = calculateTotal();

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleNextStep = () => {
    setFormStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setFormStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!name || !email || !phone) {
        throw new Error("Por favor, completa todos los campos personales.");
      }
      if (!date || !startTime) {
        throw new Error("Por favor, selecciona una fecha y hora.");
      }
      if (selectedProducts.length === 0) {
        throw new Error("Por favor, selecciona al menos un producto.");
      }

      // Get and decode token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Debes iniciar sesión para crear una reserva.");
      }
      const decoded: { id?: string; userId?: string; sub?: string } =
        jwtDecode(token);
      console.log("Decoded token:", decoded);
      const clienteId = decoded.id;
      console.log("Cliente ID:", clienteId);
      if (!clienteId) {
        throw new Error("No se pudo obtener el ID del cliente desde el token.");
      }

      // Calculate fecha_inicio and fecha_fin
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);
      const endDateTime = addMinutes(
        startDateTime,
        Number.parseInt(numTurnos) * 30
      );

      // Prepare safety devices
      const allSafetyDevices = Array.from(
        new Set(
          selectedProducts
            .map((id) => products.find((p) => p._id === id))
            .filter((p): p is Product => !!p)
            .flatMap((p) =>
              p.requiere_seguridad ? p.dispositivos_seguridad : []
            )
        )
      );

      // Prepare booking data
      const bookingData = {
        cliente: clienteId,
        productos: selectedProducts.map((productId) => ({
          producto: productId,
          cantidad: 1,
        })),
        fecha_inicio: startDateTime.toISOString(),
        fecha_fin: endDateTime.toISOString(),
        seguridad_incluida: allSafetyDevices.length > 0,
        dispositivos_seguridad_seleccionados:
          allSafetyDevices.length > 0 ? allSafetyDevices : undefined,
      };

      await createBooking(bookingData);

      toast("¡Reserva realizada con éxito!");
      setSelectedProducts([]);
      setDate(undefined);
      setStartTime("");
      setNumTurnos("1");
      setNumPeople("1");
      setPaymentMethod("efectivo");
      setStormInsurance(false);
      setName("");
      setEmail("");
      setPhone("");
      setFormStep(0);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      setSubmitError(error.message || "No se pudo crear la reserva");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h3 className="text-xl font-semibold text-blue-700 mb-6">
        Reserva tu Equipo
      </h3>

      <form onSubmit={handleSubmit}>
        {formStep === 0 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-2 block">
                Selecciona los productos que deseas alquilar
              </Label>
              {products.length === 0 ? (
                <p className="text-gray-500 italic">
                  No hay productos disponibles en este momento.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-lg">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-start space-x-3 p-4 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Checkbox
                        id={`product-${product._id}`}
                        checked={selectedProducts.includes(product._id)}
                        onCheckedChange={() => handleProductToggle(product._id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Label
                            htmlFor={`product-${product._id}`}
                            className="font-medium text-gray-800 cursor-pointer"
                          >
                            {product.nombre}
                          </Label>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-3 py-1 bg-green-200"
                          >
                            <span className="font-medium text-black-800">
                              ${product.precio_por_turno.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500">
                              por turno
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 m-2">
                          {product.descripcion}
                        </p>

                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="h-5 w-5 text-cyan-600" />
                          <span>
                            Capacidad máxima:{" "}
                            <strong>
                              {product.capacidad_maxima}{" "}
                              {product.capacidad_maxima === 1
                                ? "persona"
                                : "personas"}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Shield className="h-5 w-5 text-cyan-600" />
                          <span>
                            {product.requiere_seguridad &&
                            product.dispositivos_seguridad.length > 0 ? (
                              <p className="text-md font-bold text-black-800 mt-1">
                                Requiere:{" "}
                                {product.dispositivos_seguridad.join(", ")}
                              </p>
                            ) : (
                              <div className="flex items-center">
                                <BadgeX className="h-5 w-5  font-medium text-red-500 " />
                                <p className="text-md font-medium text-gray-700 ml-1">
                                  No requiere dispositivos de seguridad
                                </p>
                              </div>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-5 w-5 text-cyan-600" />
                          <span>
                            Duración: <strong>30 minutos</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numPeople">Número de personas</Label>
                <Select value={numPeople} onValueChange={setNumPeople}>
                  <SelectTrigger id="numPeople">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 persona</SelectItem>
                    <SelectItem value="2">2 personas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numTurnos">Número de turnos consecutivos</Label>
                <Select value={numTurnos} onValueChange={setNumTurnos}>
                  <SelectTrigger id="numTurnos">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 turno (30 min)</SelectItem>
                    <SelectItem value="2">2 turnos (1 hora)</SelectItem>
                    <SelectItem value="3">3 turnos (1.5 horas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleNextStep}
              disabled={selectedProducts.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Continuar
            </Button>
          </div>
        )}

        {formStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Fecha de reserva</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date
                        ? format(date, "PPP", { locale: es })
                        : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => {
                        const now = new Date();
                        const maxDate = new Date();
                        maxDate.setHours(maxDate.getHours() + 48);
                        return date < now || date > maxDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Método de pago</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="efectivo" id="efectivo" />
                    <Label
                      htmlFor="efectivo"
                      className="flex items-center gap-2"
                    >
                      <Banknote className="h-4 w-4" /> Efectivo (moneda local)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="efectivo-extranjera"
                      id="efectivo-extranjera"
                    />
                    <Label
                      htmlFor="efectivo-extranjera"
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" /> Efectivo (moneda
                      extranjera)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tarjeta" id="tarjeta" />
                    <Label
                      htmlFor="tarjeta"
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" /> Tarjeta
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              {paymentMethod === "efectivo" ||
              paymentMethod === "efectivo-extranjera" ? (
                <p className="text-sm text-amber-600 mt-2">
                  Recuerda que el pago en efectivo debe realizarse 2 horas antes
                  del turno.
                </p>
              ) : null}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="stormInsurance"
                checked={stormInsurance}
                onCheckedChange={(checked) =>
                  setStormInsurance(checked === true)
                }
              />
              <div className="grid gap-1.5">
                <Label htmlFor="stormInsurance">
                  Agregar seguro de tormenta (+10%)
                </Label>
                <p className="text-sm text-gray-500">
                  En caso de tormenta imprevista, se te devolverá el 50% del
                  valor abonado.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="flex-1"
              >
                Atrás
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!date || !startTime}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-lg mb-4">
                  Resumen de tu reserva
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">Productos:</div>
                    <div>
                      {selectedProducts.length === 0 ? (
                        <span className="text-gray-500">Ninguno</span>
                      ) : (
                        selectedProducts.map((productId) => {
                          const product = products.find(
                            (p) => p._id === productId
                          );
                          return product ? (
                            <div key={productId} className="text-gray-800">
                              {product.nombre} ({product.tipo})
                            </div>
                          ) : null;
                        })
                      )}
                    </div>

                    <div className="text-gray-500">Fecha:</div>
                    <div>
                      {date
                        ? format(date, "PPP", { locale: es })
                        : "No seleccionada"}
                    </div>

                    <div className="text-gray-500">Hora:</div>
                    <div>{startTime || "No seleccionada"}</div>

                    <div className="text-gray-500">Duración:</div>
                    <div>
                      {numTurnos}{" "}
                      {Number.parseInt(numTurnos) === 1 ? "turno" : "turnos"} (
                      {Number.parseInt(numTurnos) * 30} min)
                    </div>

                    <div className="text-gray-500">Personas:</div>
                    <div>{numPeople}</div>

                    {Object.keys(safetyDevicesCount).length > 0 && (
                      <>
                        <div className="text-gray-500">
                          Dispositivos de seguridad:
                        </div>
                        <div>
                          {Object.entries(safetyDevicesCount).map(
                            ([device, count]) => (
                              <div key={device}>
                                {device}: {count}
                              </div>
                            )
                          )}
                        </div>
                      </>
                    )}

                    <div className="text-gray-500">Método de pago:</div>
                    <div>
                      {paymentMethod === "efectivo" &&
                        "Efectivo (moneda local)"}
                      {paymentMethod === "efectivo-extranjera" &&
                        "Efectivo (moneda extranjera)"}
                      {paymentMethod === "tarjeta" && "Tarjeta"}
                    </div>

                    <div className="text-gray-500">Seguro de tormenta:</div>
                    <div>{stormInsurance ? "Sí" : "No"}</div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-medium">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {selectedProducts.length > 1 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento (10%):</span>
                        <span>
                          -$
                          {(
                            (subtotal / (stormInsurance ? 1.1 : 1) / 0.9) *
                            0.1
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {stormInsurance && (
                      <div className="flex justify-between">
                        <span>Seguro de tormenta:</span>
                        <span>
                          +$
                          {(
                            (subtotal / (stormInsurance ? 1.1 : 1)) *
                            0.1
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Total:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="flex-1"
                disabled={submitLoading}
              >
                Atrás
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  "Confirmar Reserva"
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
