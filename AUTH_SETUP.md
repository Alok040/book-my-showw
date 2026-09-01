# Authentication setup

This project uses Spring Security Basic Authentication backed by the MySQL `User` table. There are no hardcoded in-memory users.

## Customer

1. Start the Spring Boot backend.
2. Start the frontend.
3. Open **Sign In** and choose **Create an account**.
4. Register with name, email, password, phone number and optional date of birth.
5. The backend stores the password as a BCrypt hash and forces the role to `USER`.
6. Sign in using the registered email as the Basic Auth username and the original password.

## Admin

Admin accounts are not created from the public registration form. After registering a user, promote that account explicitly in MySQL:

```sql
UPDATE user
SET role = 'ADMIN'
WHERE email = 'your-admin-email@example.com';
```

Then use that user's email and password at `/admin`.

## Important

- Do not put plaintext passwords in the database.
- Do not add `InMemoryUserDetailsManager` back to `AuthConfig`.
- The customer catalogue GET endpoints are public so the home/movie/show pages can load before login.
- Booking requests are checked against the authenticated user's email so a customer cannot submit another user's ID.
