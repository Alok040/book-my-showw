package com.alok.bookmyshoww.service;
import com.alok.bookmyshoww.dto.BookingRequestDto;
import com.alok.bookmyshoww.enums.BookingStatus;
import com.alok.bookmyshoww.exceptions.SeatAlreadyBookedException;
import com.alok.bookmyshoww.exceptions.ShowNotFoundException;
import com.alok.bookmyshoww.exceptions.UserNotFoundException;
import com.alok.bookmyshoww.model.*;
import com.alok.bookmyshoww.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
@Service
@RequiredArgsConstructor
public class BookingService {
    private final UserRepo userRepo;
    private final ShowRepo showRepo;
    private final BookingSeatRepo bookingSeatRepo;
    private final BookingRepo bookingRepo;
    private final SeatRepo seatRepo;
    @Transactional
    public Booking create(BookingRequestDto request) throws UserNotFoundException, ShowNotFoundException, SeatAlreadyBookedException {
        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User with id " + request.getUserId() + " does not exist"));
        Show show = showRepo.findById(request.getShowId())
                .orElseThrow(() -> new ShowNotFoundException("Show with id " + request.getShowId() + " does not exist"));
        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new IllegalArgumentException("At least one seat must be selected");
        }
        Set<Long> uniqueSeatIds = new HashSet<>(request.getSeatIds());
        if (uniqueSeatIds.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("Duplicate seats are not allowed");
        }
        List<Seat> seats = seatRepo.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("One or more requested seats do not exist");
        }
        Long screenId = show.getScreen().getId();
        for (Seat seat : seats) {
            if (!seat.getScreen().getId().equals(screenId)) {
                throw new IllegalArgumentException("Seat " + seat.getSeatNumber() + " does not belong to the screen of this show");
            }
        }
        List<BookingSeat> bookedSeats = bookingSeatRepo.findBookedSeats(show.getId(), request.getSeatIds(), BookingStatus.CONFIRMED);
        if (!bookedSeats.isEmpty()) {
            throw new SeatAlreadyBookedException("One or more selected seats are already booked");
        }
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        List<BookingSeat> bookingSeats = seats.stream()
                .map(seat -> {
                    BookingSeat bookingSeat = new BookingSeat();
                    bookingSeat.setBooking(booking);
                    bookingSeat.setShow(show);
                    bookingSeat.setSeat(seat);
                    return bookingSeat;
                })
                .toList();
        booking.setBookingList(bookingSeats);
        try {
            return bookingRepo.saveAndFlush(booking);
        } catch (DataIntegrityViolationException ex) {
            throw new SeatAlreadyBookedException("One or more selected seats are already booked");
        }
    }
    @Transactional(readOnly = true)
    public Booking getById(Long id) {
        return bookingRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking with id " + id + " does not exist"));
    }
    @Transactional(readOnly = true)
    public List<Booking> getUserBookings(Long userId) throws UserNotFoundException {
        userRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with id " + userId + " does not exist"));
        return bookingRepo.findByUserId(userId);
    }
    @Transactional
    public Booking cancel(Long id) {
        Booking booking = bookingRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking with id " + id + " does not exist"));
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }
        booking.setBookingStatus(BookingStatus.CANCELLED);
        return booking;
    }
}