import axios, { AxiosError } from "axios";
// import { navigateToLogin } from "./navigation";

export const api = axios.create({
    baseURL: "/api", // relative path; Nginx proxy
    withCredentials: false, // set to true if you move to HttpOnly cookies
});


// -- Auth token helper ----
export function setAuthToken(token: string | null) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        localStorage.setItem("access_token", token)
    } else  {
        delete api.defaults.headers.common.Authorization;
        localStorage.removeItem("access_token");
    }
}

// Retore token on startup
const saved = localStorage.getItem("access_token");
if(saved){
    api.defaults.headers.common.Authorization = `Bearer ${saved}`;
}


// ---- Global 402/403 interceptor ---
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;
        if(status === 401 || status == 403) {
            setAuthToken(null);
            // display message/banner to the user instead of taking the user back to login page
        }
        return Promise.reject(error);
    }
)

// ---- Endpoint helper ---

export function me() {
    return api.get("/auth/me");
}

