const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `${response.status} ${response.statusText}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  baseUrl: API_BASE,

  async getMovies() {
    return request('/movie');
  },
  async getMovie(id) {
    return request(`/movie/${id}`);
  },
  async createMovie(movie) {
    return request('/movie', { method: 'POST', body: JSON.stringify(movie) });
  },
  async updateMovie(id, movie) {
    return request(`/movie/${id}`, { method: 'PATCH', body: JSON.stringify(movie) });
  },
  async deleteMovie(id) {
    return request(`/movie/${id}`, { method: 'DELETE' });
  },

  async getShow(id) {
    return request(`/show/${id}`);
  },
  async createShow(show) {
    return request('/show', { method: 'POST', body: JSON.stringify(show) });
  },
  async updateShow(id, show) {
    return request(`/show/${id}`, { method: 'PATCH', body: JSON.stringify(show) });
  },
  async deleteShow(id) {
    return request(`/show/${id}`, { method: 'DELETE' });
  },

  async getVenue(id) {
    return request(`/venue/${id}`);
  },
  async createVenue(venue) {
    return request('/venue', { method: 'POST', body: JSON.stringify(venue) });
  },
  async updateVenue(id, venue) {
    return request(`/venue/${id}`, { method: 'PATCH', body: JSON.stringify(venue) });
  },
  async deleteVenue(id) {
    return request(`/venue/${id}`, { method: 'DELETE' });
  },

  async getScreen(id) {
    return request(`/screen/${id}`);
  },
  async createScreen(screen) {
    return request('/screen', { method: 'POST', body: JSON.stringify(screen) });
  },
  async updateScreen(id, screen) {
    return request(`/screen/${id}`, { method: 'PATCH', body: JSON.stringify(screen) });
  },
  async deleteScreen(id) {
    return request(`/screen/${id}`, { method: 'DELETE' });
  },

  async getSeat(id) {
    return request(`/seat/${id}`);
  },
  async createSeat(seat) {
    return request('/seat', { method: 'POST', body: JSON.stringify(seat) });
  },
  async updateSeat(id, seat) {
    return request(`/seat/${id}`, { method: 'PATCH', body: JSON.stringify(seat) });
  },
  async deleteSeat(id) {
    return request(`/seat/${id}`, { method: 'DELETE' });
  },

  async getUser(id) {
    return request(`/${id}`);
  },
  async createUser(user) {
    return request('/', { method: 'POST', body: JSON.stringify(user) });
  },
  async updateUser(id, user) {
    return request(`/${id}`, { method: 'PATCH', body: JSON.stringify(user) });
  },
  async deleteUser(id) {
    return request(`/${id}`, { method: 'DELETE' });
  },

  async createBooking(booking) {
    return request('/booking', { method: 'POST', body: JSON.stringify(booking) });
  },
  async getBooking(id) {
    return request(`/booking/${id}`);
  }
};
