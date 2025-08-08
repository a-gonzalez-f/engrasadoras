export async function enviarFormularioGateway(data) {
  try {
    const response = await fetch("/api/gateways", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error al enviar el formulario:", error.message);
    throw error;
  }
}
