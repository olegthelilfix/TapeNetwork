import simpleRestProvider from "@refinedev/simple-rest";
import axios from "axios";
import { getStoredString } from "@/utils/storage";
import { apiUrl, sessionStorageKeys } from "../apiConfig";

export const apiClient = axios.create({
    baseURL: apiUrl,
});

apiClient.interceptors.request.use((config) => {
    const token = getStoredString(sessionStorageKeys.token);

    if (token !== null) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
});

export const dataProvider = simpleRestProvider(apiUrl, apiClient);
