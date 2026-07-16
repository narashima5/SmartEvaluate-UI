const API_URL = import.meta.env.VITE_API_URL || "";

interface RequestOptions extends RequestInit {
  body?: any;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const token = localStorage.getItem("token");
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: headers as HeadersInit,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    // Delete Content-Type header so the browser sets it automatically with the boundary
    delete (headers as any)["Content-Type"];
    config.body = options.body;
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401 || response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === "Your account is pending admin approval.") {
      throw new Error(errorData.error);
    }
    // Session expired or invalid
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error(errorData.error || "Session expired. Please log in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  // Handle binary responses (e.g., file downloads for Excel template/reports)
  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("spreadsheetml") || contentType.includes("octet-stream") || contentType.includes("csv"))) {
    return response.blob();
  }

  return response.json();
};

export const api = {
  get: (endpoint: string, options?: RequestOptions) => apiClient(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, body?: any, options?: RequestOptions) => apiClient(endpoint, { ...options, method: "POST", body }),
  put: (endpoint: string, body?: any, options?: RequestOptions) => apiClient(endpoint, { ...options, method: "PUT", body }),
  delete: (endpoint: string, options?: RequestOptions) => apiClient(endpoint, { ...options, method: "DELETE" }),
};
