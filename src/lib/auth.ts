import { api, setAuthToken } from "./api";

export async function login(email: string, password: string) {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const res = await api.post("/login", body, {
        headers: {"Content-Type": "application/x-ww-form-urlencoded"},
    });

    if (res.data.access_token) {
        setAuthToken(res.data.access_token)
    }

    return res.data;
}