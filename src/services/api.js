class APIService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getCurrentUser() {
    const response = await fetch(
      `${this.baseURL}/api/method/ledgerctrl.ledgerctrl.api.login_api.get_current_user`,
      {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include"
      }
    );

    if (response.status === 403) {
      throw new Error("SESSION_EXPIRED");
    }

    if (!response.ok) {
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    return await response.json();
  }

  async get(url) {
    return fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include'
    });
  }

  async post(url, body) {
    return fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body)
    });
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
    'X-Frappe-Session-ID': localStorage.getItem("session_id") || ''
    };
  }

}

export default new APIService("http://demo.com:8000");
