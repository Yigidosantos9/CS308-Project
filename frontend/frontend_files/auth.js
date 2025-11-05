export async function registerUser(data) {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      }),
    });
  
    if (!response.ok) throw new Error("Failed to register user");
    return response.json();
  }
  