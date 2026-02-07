const API_BASE_URL  = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string) {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.detail || "Login Failed");
    }
    console.log(data);
    return data
}