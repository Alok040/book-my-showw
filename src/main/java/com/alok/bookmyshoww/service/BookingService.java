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
import java.math.BigDecimal;
import java.math.RoundingMode;
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
        BigDecimal ticketTotal = seats.stream()
                .map(seat -> priceFor(show, seat.getSeatType()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal convenienceFee = ticketTotal.multiply(new BigDecimal("0.05"))
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal platformFee = seats.isEmpty() ? BigDecimal.ZERO : new BigDecimal("10");
        BigDecimal total = ticketTotal.add(convenienceFee).add(platformFee);

        Booking booking = new Booking();
        booking.setBookingDate(java.time.LocalDate.now());
        booking.setTotalAmount(total);
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
    private BigDecimal priceFor(Show show, com.alok.bookmyshoww.enums.SeatType type) {
        BigDecimal price = switch (type) {
            case RECLINER -> show.getReclinerPrice();
            case VIP -> show.getVipPrice();
            case COUPLE -> show.getCouplePrice();
            case PREMIUM -> show.getPremiumPrice();
            case REGULAR -> show.getRegularPrice();
        };
        if (price != null) return price;
        return switch (type) {
            case RECLINER -> new BigDecimal("399");
            case VIP -> new BigDecimal("299");
            case COUPLE -> new BigDecimal("349");
            case PREMIUM -> new BigDecimal("239");
            case REGULAR -> new BigDecimal("199");
        };
    }

    @Transactional(readOnly = true)
    public boolean isUserEmail(Long userId, String email) {
        return userRepo.findById(userId)
                .map(user -> user.getEmail().equalsIgnoreCase(email))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isBookingOwner(Long bookingId, String email) {
        return bookingRepo.findById(bookingId)
                .map(booking -> booking.getUser() != null
                        && booking.getUser().getEmail().equalsIgnoreCase(email))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public List<Long> getBookedSeatIds(Long showId) {
        return bookingSeatRepo.findBookedSeatIds(showId, BookingStatus.CONFIRMED);
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