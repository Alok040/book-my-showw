package com.alok.bookmyshoww.controller;
import com.alok.bookmyshoww.dto.BookingRequestDto;
import com.alok.bookmyshoww.exceptions.SeatAlreadyBookedException;
import com.alok.bookmyshoww.exceptions.ShowNotFoundException;
import com.alok.bookmyshoww.exceptions.UserNotFoundException;
import com.alok.bookmyshoww.model.Booking;
import com.alok.bookmyshoww.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    @PostMapping
    public ResponseEntity<Booking> create(@RequestBody BookingRequestDto request) throws UserNotFoundException, ShowNotFoundException, SeatAlreadyBookedException {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request));
    }
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) throws UserNotFoundException {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancel(id));
    }
}