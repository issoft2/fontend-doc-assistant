let navigate: (path: string) => void;

export function setNavigator(fn: (path: string) => void) {
    navigate = fn;
}

export function navigateToLogin() {
    navigate?.("/login");
}