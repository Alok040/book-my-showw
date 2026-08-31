# BookMyShow final frontend

This frontend has two separate areas:

- Customer: `/`
- Admin: `/admin/login`

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Current backend assumptions

Backend:
- `GET /movie`
- `GET /movie/{id}`
- `POST /movie` multipart with `movie` JSON + `poster` file
- `PATCH /movie/{id}` multipart
- `DELETE /movie/{id}`
- `GET /show`
- `GET /show/{id}`
- `POST /show`
- `PATCH /show/{id}`
- `DELETE /show/{id}`
- `POST /booking`
- `GET /booking/{id}`

## Two small backend endpoints are required for the complete security/seat experience

### 1. Admin role check

The frontend uses `/admin/check` before showing the admin dashboard.

Example:

```java
@RestController
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/check")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> check() {
        return ResponseEntity.ok().build();
    }
}
```

This is important: the frontend is NOT the security boundary. Your existing `@PreAuthorize("hasRole('ADMIN')")` on movie/show mutations remains the real protection.

### 2. Get bookings for a show

The frontend uses `/booking/show/{showId}` to know which seats are already booked by ANY customer.

Example repository:

```java
@Query("""
    SELECT b
    FROM Booking b
    WHERE b.show.id = :showId
      AND b.bookingStatus = :status
""")
List<Booking> findByShowIdAndStatus(
    @Param("showId") Long showId,
    @Param("status") BookingStatus status
);
```

Then:

```java
@GetMapping("/show/{showId}")
public ResponseEntity<List<Booking>> getShowBookings(@PathVariable Long showId) {
    return ResponseEntity.ok(
        bookingRepo.findByShowIdAndStatus(showId, BookingStatus.CONFIRMED)
    );
}
```

If this endpoint is not added yet, the frontend keeps seats selectable and displays a warning. The actual booking transaction is still protected by your database unique constraint and `BookingService`.

## Important customer-auth note

Your current Spring Security uses **in-memory Basic Auth** (`alok` / `user`), while `/booking` expects a **database User ID**. Therefore this frontend does not pretend those are the same identity. For a production-quality customer flow, the next phase should move authentication to your `User` table and use the authenticated principal rather than trusting a browser-provided `userId`.

## Poster serving

Your movie stores URLs such as:

```text
/uploads/movies/<filename>
```

Spring Boot must expose that directory as a resource if the browser should display the saved poster.
