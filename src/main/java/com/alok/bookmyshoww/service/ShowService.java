package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.enums.BookingStatus;
import com.alok.bookmyshoww.exceptions.*;
import com.alok.bookmyshoww.model.Booking;
import com.alok.bookmyshoww.model.Movie;
import com.alok.bookmyshoww.model.Screen;
import com.alok.bookmyshoww.model.Show;
import com.alok.bookmyshoww.repository.BookingRepo;
import com.alok.bookmyshoww.repository.MovieRepo;
import com.alok.bookmyshoww.repository.ScreenRepo;
import com.alok.bookmyshoww.repository.ShowRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Service
@AllArgsConstructor
public class ShowService {

    private final ShowRepo showRepo;
    private final MovieRepo movieRepo;
    private final ScreenRepo screenRepo;
    private final BookingRepo bookingRepo;

    @Transactional
    public Show create(Show show)
            throws ShowSchedulingConflictException, MovieNotFoundException, ScreenNotFoundException {

        Movie movie = movieRepo.findById(show.getMovie().getId())
                .orElseThrow(() ->
                        new MovieNotFoundException("Movie with id " + show.getMovie().getId() + " does not exist"));

        Screen screen = screenRepo.findById(show.getScreen().getId())
                .orElseThrow(() ->
                        new ScreenNotFoundException("Screen with id " + show.getScreen().getId() + " does not exist"));

        if (!show.getStartTime().isBefore(show.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        boolean conflict = showRepo.existsOverlappingShow(
                screen.getId(),
                show.getShowDate(),
                show.getStartTime(),
                show.getEndTime()
        );

        if (conflict) {
            throw new ShowSchedulingConflictException("Show overlaps with an existing show on this screen");
        }

        validatePrices(show);

        show.setMovie(movie);
        show.setScreen(screen);

        return showRepo.save(show);
    }

    @Transactional(readOnly = true)
    public Show getById(Long id) throws ShowNotFoundException {
        return showRepo.findById(id)
                .orElseThrow(() ->
                        new ShowNotFoundException("Show with id " + id + " does not exist"));
    }

    @Transactional(readOnly = true)
    public List<Show> getAll() {
        return showRepo.findAll();
    }

    @Transactional
    public Show update(Long id, Show show)
            throws ShowNotFoundException,
            ShowSchedulingConflictException,
            MovieNotFoundException,
            ScreenNotFoundException,
            InvalidShowTimeException {

        Movie movie = movieRepo.findById(show.getMovie().getId())
                .orElseThrow(() ->
                        new MovieNotFoundException("Movie with id " + show.getMovie().getId() + " does not exist"));

        Screen screen = screenRepo.findById(show.getScreen().getId())
                .orElseThrow(() ->
                        new ScreenNotFoundException("Screen with id " + show.getScreen().getId() + " does not exist"));
        validateShowTime(show);

        Show existingShow = getById(id);

        boolean conflict = showRepo.existsOverlappingShowExcept(
                id,
                screen.getId(),
                show.getShowDate(),
                show.getStartTime(),
                show.getEndTime()
        );

        if (conflict)
        {
            throw new ShowSchedulingConflictException("Show overlaps with an existing show on this screen");
        }

        validatePrices(show);

        existingShow.setMovie(movie);
        existingShow.setScreen(screen);
        existingShow.setShowDate(show.getShowDate());
        existingShow.setStartTime(show.getStartTime());
        existingShow.setEndTime(show.getEndTime());
        existingShow.setReclinerPrice(show.getReclinerPrice());
        existingShow.setVipPrice(show.getVipPrice());
        existingShow.setCouplePrice(show.getCouplePrice());
        existingShow.setPremiumPrice(show.getPremiumPrice());
        existingShow.setRegularPrice(show.getRegularPrice());

        return existingShow;
    }

    @Transactional
    public void delete(Long id) throws ShowNotFoundException {
        Show show = showRepo.findById(id)
                .orElseThrow(() ->
                        new ShowNotFoundException("Show with id " + id + " does not exist"));
        if (bookingRepo.existsByShowIdAndBookingStatusNot(id, BookingStatus.CANCELLED))
        {
            throw new IllegalStateException("Cannot delete show because an active booking exists for this show.");
        }
        List<Booking> cancelledBookings =
                bookingRepo.findByShowIdAndBookingStatus(id, BookingStatus.CANCELLED
                );

        if (!cancelledBookings.isEmpty())
        {
            bookingRepo.deleteAll(cancelledBookings);
        }
        showRepo.delete(show);
    }

    private void validatePrices(Show show) {
        if (show.getReclinerPrice() == null ||
                show.getVipPrice() == null ||
                show.getCouplePrice() == null ||
                show.getPremiumPrice() == null ||
                show.getRegularPrice() == null) {

            throw new IllegalArgumentException("Price is required for every seat category");
        }
        if (show.getReclinerPrice().compareTo(BigDecimal.ZERO) < 0 ||
                show.getVipPrice().compareTo(BigDecimal.ZERO) < 0 ||
                show.getCouplePrice().compareTo(BigDecimal.ZERO) < 0 ||
                show.getPremiumPrice().compareTo(BigDecimal.ZERO) < 0 ||
                show.getRegularPrice().compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException("Seat prices cannot be negative");
        }
    }

    private void validateShowTime(Show show)
            throws InvalidShowTimeException {

        LocalTime start = show.getStartTime();
        LocalTime end = show.getEndTime();

        if (start == null || end == null)
        {
            throw new InvalidShowTimeException("Start time and end time are required.");
        }

        if (!start.isBefore(end))
        {
            throw new InvalidShowTimeException("Start time must be before end time.");
        }
    }

    @Transactional(readOnly = true)
    public List<Show> getByCity(String city) {
        return showRepo.findByScreenVenueCityIgnoreCase(city);
    }
}
