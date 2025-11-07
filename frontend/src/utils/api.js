// API utility functions
const API_BASE_URL =
	'https://ai-agent-backend-production-fb83.up.railway.app/api';

export const apiCall = async (endpoint, options = {}) => {
	const url = `${API_BASE_URL}${endpoint}`;

	const defaultOptions = {
		headers: {
			'Content-Type': 'application/json',
		},
	};

	const mergedOptions = {
		...defaultOptions,
		...options,
		headers: {
			...defaultOptions.headers,
			...options.headers,
		},
	};

	try {
		const response = await fetch(url, mergedOptions);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('API call failed:', error);
		throw error;
	}
};

export const api = {
	get: (endpoint, options = {}) =>
		apiCall(endpoint, { ...options, method: 'GET' }),
	post: (endpoint, data, options = {}) =>
		apiCall(endpoint, {
			...options,
			method: 'POST',
			body: JSON.stringify(data),
		}),
	put: (endpoint, data, options = {}) =>
		apiCall(endpoint, {
			...options,
			method: 'PUT',
			body: JSON.stringify(data),
		}),
	delete: (endpoint, options = {}) =>
		apiCall(endpoint, { ...options, method: 'DELETE' }),
};
