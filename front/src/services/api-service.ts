const BASE_URL = import.meta.env.VITE_BACK_URL;
let isRedirecting = false;

class ApiService {
  private async fetchWithConfig(url: string, options: RequestInit = {}): Promise<Response> {
    
    if (!BASE_URL) {
      throw new Error("L'URL de base de l'API n'est pas configurée");
    }
    
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
  
    const response = await fetch(`${BASE_URL}${url}`, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    return response;
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.fetchWithConfig(url);
    return response.json();
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.fetchWithConfig(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async patch<T>(url: string, data: any): Promise<T> {
    const response = await this.fetchWithConfig(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.fetchWithConfig(url, {
      method: 'DELETE',
    });
    return response.json();
  }
}

const api = new ApiService();
export default api;