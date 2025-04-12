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
