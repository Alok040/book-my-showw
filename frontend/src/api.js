export const API_BASE = 'http://localhost:8080';

let credentials = sessionStorage.getItem('bms-basic-auth') || '';

export function setCredentials(username, password) {
  credentials = btoa(`${username}:${password}`);
  sessionStorage.setItem('bms-basic-auth', credentials);
}

export function clearCredentials() {
  credentials = '';
  sessionStorage.removeItem('bms-basic-auth');
}

export function hasCredentials() {
  return Boolean(credentials);
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (credentials) headers.set('Authorization', `Basic ${credentials}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  getMovies: () => request('/movie'),
  getMovie: (id) => request(`/movie/${id}`),

  createMovie: ({ movie, poster }) => {
    const form = new FormData();
    form.append('movie', new Blob([JSON.stringify(movie)], { type: 'application/json' }));
    form.append('poster', poster);
    return request('/movie', { method: 'POST', body: form });
  },

  updateMovie: ({ id, movie, poster }) => {
    const form = new FormData();
    form.append('movie', new Blob([JSON.stringify(movie)], { type: 'application/json' }));
    if (poster) form.append('poster', poster);
    return request(`/movie/${id}`, { method: 'PATCH', body: form });
  },

  deleteMovie: (id) => request(`/movie/${id}`, { method: 'DELETE' }),

  getShows: () => request('/show'),
  getShow: (id) => request(`/show/${id}`),

  createShow: (show) => request('/show', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(show),
  }),

  updateShow: (id, show) => request(`/show/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(show),
  }),

  deleteShow: (id) => request(`/show/${id}`, { method: 'DELETE' }),

  createBooking: (payload) => request('/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),

  getBooking: (id) => request(`/booking/${id}`),
  getUserBookings: (userId) => request(`/booking/user/${userId}`),

  // This endpoint is intentionally expected from the backend.
  // It lets the UI render ALL seats booked for a show, not only this user's seats.
  getShowBookings: (showId) => request(`/booking/show/${showId}`),

  // Safe admin-only role check. The backend must enforce ADMIN here.
  checkAdmin: () => request('/admin/check'),
};
