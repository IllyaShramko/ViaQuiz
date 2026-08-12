// Общий клиент для HTTP-запросов к бэкенду
const BASE_URL = "http://localhost:3000";

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
		...options,
	});

	if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}
