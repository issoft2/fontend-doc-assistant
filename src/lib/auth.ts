import { api, setAuthToken } from "./api";

export async function login(email: string, password: string) {
    const data = new URLSearchParams();

    data.append("username", email);
    data.append("password", password);

    const res = await api.post("/auth/login", data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (res.data.access_token) {
        setAuthToken(res.data.access_token)
    }

    return res.data;
}