export const API_BASE = 'http://localhost:8080';

let credentials =
    sessionStorage.getItem('bms-basic-auth') || '';


export function setCredentials(username, password) {

    credentials =
        btoa(`${username}:${password}`);

    sessionStorage.setItem(
        'bms-basic-auth',
        credentials
    );
}


export function clearCredentials() {

    credentials = '';

    sessionStorage.removeItem(
        'bms-basic-auth'
    );
}


export function hasCredentials() {

    return Boolean(credentials);
}


async function request(path, options = {}) {

    const headers =
        new Headers(options.headers || {});


    if (credentials) {

        headers.set(
            'Authorization',
            `Basic ${credentials}`
        );

    }


    const response =
        await fetch(
            `${API_BASE}${path}`,
            {
                ...options,
                headers
            }
        );


    if (!response.ok) {

        let message =
            `Request failed (${response.status})`;


        try {

            const text =
                await response.text();


            if (text) {

                try {

                    const json =
                        JSON.parse(text);

                    message =
                        json.message ||
                        json.error ||
                        text;

                } catch {

                    message = text;

                }

            }

        } catch {}


        const error =
            new Error(message);

        error.status =
            response.status;

        throw error;
    }


    if (response.status === 204) {
        return null;
    }


    const text =
        await response.text();


    if (!text) {
        return null;
    }


    try {

        return JSON.parse(text);

    } catch {

        return text;

    }
}


export const api = {

    /* =========================
       MOVIES
    ========================= */

    getMovies: () =>
        request('/movie'),


    getMovie: (id) =>
        request(`/movie/${id}`),


    createMovie: ({ movie, poster }) => {

        const form =
            new FormData();


        form.append(
            'movie',
            new Blob(
                [JSON.stringify(movie)],
                {
                    type: 'application/json'
                }
            )
        );


        form.append(
            'poster',
            poster
        );


        return request(
            '/movie',
            {
                method: 'POST',
                body: form
            }
        );
    },


    updateMovie: ({ id, movie, poster }) => {

        const form =
            new FormData();


        form.append(
            'movie',
            new Blob(
                [JSON.stringify(movie)],
                {
                    type: 'application/json'
                }
            )
        );


        if (poster) {

            form.append(
                'poster',
                poster
            );

        }


        return request(
            `/movie/${id}`,
            {
                method: 'PATCH',
                body: form
            }
        );
    },


    deleteMovie: (id) =>
        request(
            `/movie/${id}`,
            {
                method: 'DELETE'
            }
        ),


    /* =========================
       SHOWS
    ========================= */

    getShows: () =>
        request('/show'),


    getShow: (id) =>
        request(`/show/${id}`),


    getShowsByCity: (city) =>
        request(`/show/city/${encodeURIComponent(city)}`),


    createShow: (show) =>
        request(
            '/show',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(show)
            }
        ),


    updateShow: (id, show) =>
        request(
            `/show/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(show)
            }
        ),


    deleteShow: (id) =>
        request(
            `/show/${id}`,
            {
                method: 'DELETE'
            }
        ),


    /* =========================
       VENUES
    ========================= */

    getVenues: () =>
        request('/venue'),


    getCities: () =>
        request('/venue/cities'),


    getVenuesByCity: (city) =>
        request(`/venue/city/${encodeURIComponent(city)}`),


    getVenue: (id) =>
        request(`/venue/${id}`),


    createVenue: (venue) =>
        request(
            '/venue',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(venue)
            }
        ),


    updateVenue: (id, venue) =>
        request(
            `/venue/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(venue)
            }
        ),


    deleteVenue: (id) =>
        request(
            `/venue/${id}`,
            {
                method: 'DELETE'
            }
        ),


    /* =========================
       SCREENS
    ========================= */

    getScreens: () =>
        request('/screen'),


    getScreen: (id) =>
        request(`/screen/${id}`),


    createScreen: (screen) =>
        request(
            '/screen',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(screen)
            }
        ),


    updateScreen: (id, screen) =>
        request(
            `/screen/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(screen)
            }
        ),


    deleteScreen: (id) =>
        request(
            `/screen/${id}`,
            {
                method: 'DELETE'
            }
        ),


    /* =========================
       SEATS
    ========================= */

    createSeat: (seat) =>
        request(
            '/seat',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(seat)
            }
        ),


    deleteSeat: (id) =>
        request(
            `/seat/${id}`,
            {
                method: 'DELETE'
            }
        ),


    /* =========================
       BOOKINGS
    ========================= */

    createBooking: (payload) =>
        request(
            '/booking',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(payload)
            }
        ),


    getBooking: (id) =>
        request(`/booking/${id}`),


    getUserBookings: (userId) =>
        request(`/booking/user/${userId}`),


    getShowBookings: (showId) =>
        request(`/booking/show/${showId}`),


    cancelBooking: (id) =>
        request(`/booking/${id}/cancel`, {
            method: 'PATCH'
        }),


    getBookedSeatIds: (showId) =>
        request(
            `/booking/show/${showId}/booked-seats`
        ),


    /* =========================
       SECURITY
    ========================= */

    checkAdmin: () =>
        request('/admin/check'),


    /* =========================
       USERS
    ========================= */

    createUser: (user) =>
        request(
            '/',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body:
                    JSON.stringify(user)
            }
        ),


    getUser: (id) =>
        request(`/${id}`),


    getCurrentUser: () =>
        request('/me')
};