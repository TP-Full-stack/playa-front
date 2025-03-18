export async function getProducts() {
  try {
    const res = await fetch("http://localhost:3000/dashboard/products", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Asegurar el token
      },
    });
    if (!res.ok) throw new Error("Error al obtener productos");
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
