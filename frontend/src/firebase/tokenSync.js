import { generateToken } from "./generateToken";
import api from "../api/axios";

export async function syncTokenIfGranted() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    try {
        const token = await generateToken();

        if (token) {
            await api.post("/tokens/register", { token });
        }
    } catch (error) {
        console.log(error);
    }
}

export async function removeCurrentToken() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    try {
        const token = await generateToken();

        if (token) {
            await api.delete("/tokens/unregister", { data: { token } });
        }
    } catch (error) {
        console.log(error);
    }
}
