export async function loginUser(email: string, password: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  console.log("****");
  console.log(response);

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const data = await response.json();

  if (data.token) {
    localStorage.setItem("token", data.token); //Guardar token
  }

  return data;
}

export async function registerUser(
  nombre: string,
  email: string,
  password: string
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nombre, email, password }),
    credentials: "include",
  });
  console.log(response);

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
}

export async function forgotPassword(email: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.mensaje || "Failed to send password reset email");
  }

  return response.json();
}

export async function resetPassword(
  resetToken: string,
  password: string
): Promise<{
  success: boolean;
  mensaje: string;
  token: string;
  usuario: { id: string; nombre: string; email: string };
}> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reset-password/${resetToken}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.mensaje || "No se pudo restablecer la contraseña"
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
}
