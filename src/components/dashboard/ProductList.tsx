"use client";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/interfaces";
import { getProducts } from "@/services/productService";
import { useState, useEffect } from "react";
import { FaCircleXmark } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">
          Nuestros Productos
        </h3>
        <p className="text-gray-600">
          Todos los alquileres tienen una duración de 30 minutos por turno.
          Puedes reservar hasta 3 turnos consecutivos.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">
            No hay productos disponibles actualmente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product._id}
              className="overflow-hidden hover:shadow-xl transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle>{product.nombre}</CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-green-700 text-white hover:bg-green-600"
                  >
                    ${product.precio_por_turno} / turno
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <CardDescription>{product.descripcion}</CardDescription>
              </CardContent>

              {/*Requisitos de seguridad */}
              <CardContent className="pb-2">
                <div className="space-y-1">
                  <Badge variant="destructive">Requisitos:</Badge>
                  {product.dispositivos_seguridad &&
                  product.dispositivos_seguridad.length > 0 ? (
                    <ul className="text-sm text-gray-500 list-disc pl-5">
                      {product.dispositivos_seguridad.map(
                        (dispositivo, index) => (
                          <li key={index}>{dispositivo}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCircleXmark className="bg-red" />
                      <span className="ml-2">
                        No se requieren dispositivos de seguridad
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardContent className="pb-2">
                <div className="space-y-1">
                  <Badge className="bg-stone-950">Capacidad máxima: </Badge>
                  <p className="text-sm text-gray-500">
                    {product.capacidad_maxima} personas
                  </p>
                </div>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-700 mb-2">
          Información Importante
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Descuento del 10% al alquilar más de un producto.</li>
          <li>• Reservas con hasta 48 horas de anticipación.</li>
          <li>• Cancelación sin costo hasta 2 horas antes del turno.</li>
          <li>• Pago en efectivo debe realizarse 2 horas antes del turno.</li>
          <li>• Aceptamos moneda local y extranjera.</li>
          <li>
            • Seguro de tormenta: devolución del 50% en caso de condiciones
            climáticas adversas.s
          </li>
        </ul>
      </div>
    </div>
  );
}
