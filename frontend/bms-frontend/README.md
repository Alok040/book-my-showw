# BookMyShow React Frontend

A dark, BookMyShow-style React/Vite frontend based on the supplied Figma screen recording. It includes the complete customer flow: movie catalogue, movie details, date/venue/show selection, seat selection, booking summary, authentication modal, and booking confirmation.

## Run

```bash
npm install
npm run dev
```

Set your backend URL with:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## API integration

`src/api.js` contains calls for the existing Spring Boot CRUD controllers:

- `/movie`
- `/show`
- `/venue`
- `/screen`
- `/seat`
- `/booking`
- user root endpoints

The UI uses the Figma demo catalogue as a fallback when list/booking endpoints are unavailable. Once your backend exposes the corresponding list/availability endpoints, the same UI can consume them without redesigning the screens.

## Important backend contract

For a fully API-driven production flow, the backend should expose:

- `GET /movie`
- `GET /show?movieId=&date=&city=`
- `GET /show/{showId}/seats`
- `POST /booking`
- `GET /booking/{id}`
- authentication endpoints if Spring Security/JWT is enabled

The current uploaded backend ZIP did not contain a BookingController, so the frontend sends booking creation to `POST /booking`. If your completed backend uses a different path or DTO shape, change only `createBooking()` and the booking payload in `SeatSelectionPage`.


## Backend integration

This frontend is aligned with the latest uploaded Spring Boot backend.

### Booking API
The booking request uses the backend DTO contract:
`POST /booking`
```json
{
  "userId": 1,
  "showId": 1,
  "seatIds": [1, 2]
}
```

### Current backend limitations
The current backend does not yet expose movie/show/venue/seat collection endpoints or show-specific seat-availability endpoints. The frontend therefore uses the Figma catalogue/demo data for browsing and seat availability, while booking uses the real `/booking` controller.

The backend also currently has no authentication endpoint; the sign-in modal therefore uses the existing user-creation endpoint as a temporary identity flow. Replace this with JWT authentication when the auth API is added.

Set `VITE_API_BASE_URL` to your Spring Boot server, e.g. `http://localhost:8080`.
