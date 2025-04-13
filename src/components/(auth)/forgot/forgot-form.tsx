"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { forgotPassword } from "@/services/authService";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Por favor ingresa un correo electrónico válido." }),
});

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(values.email);

      toast.success("¡Correo enviado!", {
        description:
          response.mensaje ||
          "Se ha enviado un enlace de recuperación a tu correo electrónico.",
        duration: 5000,
        icon: <CheckCircle className="h-4 w-4" />,
      });

      form.reset();
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error. Por favor intenta de nuevo.",
      });

      console.error("Password reset error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden p-0 mt-10">
      <CardContent className="grid p-0">
        <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
              <p className="text-muted-foreground text-balance">
                Te enviaremos un enlace para restablecer tu contraseña
              </p>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                {...form.register("email")}
                required
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>

            <div className="text-center text-sm">
              ¿Recordaste tu contraseña?{" "}
              <Button
                variant="link"
                className="text-blue-500 p-0"
                onClick={() => router.push("/")}
              >
                Iniciar sesión
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ForgotPasswordForm;
