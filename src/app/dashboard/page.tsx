import { Waves } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductList from "@/components/dashboard/ProductList";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-8 w-8 text-black" />
            <h1 className="text-2xl font-bold text-black">Blue Holidays</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4 flex flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-blue-800 mb-2">
            Alquiler de Equipos de Playa
          </h2>
          <p className="text-blue-600 max-w-2xl mx-auto">
            Disfruta de nuestros productos de alquiler para maximizar tu
            experiencia en la playa. Reserva con anticipación y asegura tu
            diversión.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full max-w-5xl">
          <TabsList className="grid w-full grid-cols-2 sm:flex sm:justify-center">
            <TabsTrigger value="products" className="w-full sm:w-auto">
              Productos Disponibles
            </TabsTrigger>
            <TabsTrigger value="reservation" className="w-full sm:w-auto">
              Hacer Reserva
            </TabsTrigger>
            <TabsTrigger value="bookings" className="w-full sm:w-auto">
              Mis reservas
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="products"
            className="p-4 bg-white rounded-lg shadow-lg mt-4 w-full"
          >
            <ProductList />
          </TabsContent>
          <TabsContent
            value="reservation"
            className="p-4 bg-white rounded-lg shadow-lg mt-4 w-full"
          >
            <p className="text-gray-600">Formulario de reserva...</p>
          </TabsContent>
          <TabsContent
            value="bookings"
            className="p-4 bg-white rounded-lg shadow-lg mt-4 w-full"
          >
            <p className="text-gray-600">Reservas...</p>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-yellow-700 text-white p-6">
        <div className="container mx-auto text-center">
          <p>© 2025 Blue Holidays - Todos los derechos reservados</p>
          <p className="mt-2 text-sm text-blue-200">
            Horario de atención: 8:00 AM - 6:00 PM | Contacto:
            info@blueholidays.com
          </p>
        </div>
      </footer>
    </div>
  );
}
