/* eslint-disable no-unused-vars */
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(ACCESS_TOKEN);
		console.log(`Token: ${token}`); // Debugging line
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			// Try to refresh the token
			const refreshToken = localStorage.getItem(REFRESH_TOKEN);
			if (refreshToken) {
				try {
					const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/token/refresh/`, {
						refresh: refreshToken,
					});
					const { access } = response.data;

					// Save new access token
					localStorage.setItem(ACCESS_TOKEN, access);
					api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

					// Retry the original request
					return api(originalRequest);
				} catch (err) {
					// Handle token refresh failure (e.g., logout user)
					localStorage.removeItem(ACCESS_TOKEN);
					localStorage.removeItem(REFRESH_TOKEN);
					window.location.href = "/login";
				}
			}
		}
		return Promise.reject(error);
	}
);

export default api;
