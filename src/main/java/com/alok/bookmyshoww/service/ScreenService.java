package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.enums.SeatType;
import com.alok.bookmyshoww.exceptions.ScreenNotFoundException;
import com.alok.bookmyshoww.exceptions.VenueNotFoundException;
import com.alok.bookmyshoww.model.Screen;
import com.alok.bookmyshoww.model.Seat;
import com.alok.bookmyshoww.model.Venue;
import com.alok.bookmyshoww.repository.ScreenRepo;
import com.alok.bookmyshoww.repository.SeatRepo;
import com.alok.bookmyshoww.repository.ShowRepo;
import com.alok.bookmyshoww.repository.VenueRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ScreenService {

    private final ScreenRepo screenRepo;
    private final VenueRepo venueRepo;
    private final SeatRepo seatRepo;
    private final ShowRepo showRepo;

    @Transactional
    public Screen create(Screen screen) throws VenueNotFoundException {

        validateTotalSeats(screen);

        Venue venue = venueRepo.findById(screen.getVenue().getId())
                .orElseThrow(() ->
                        new VenueNotFoundException(
                                "Venue with id " + screen.getVenue().getId() + " does not exist"
                        )
                );

        screen.setVenue(venue);

        screenRepo.save(screen);

        generateSeats(screen);

        return screen;
    }

    @Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
    public Screen getById(Long id) throws ScreenNotFoundException {

        return screenRepo.findById(id)
                .orElseThrow(() ->
                        new ScreenNotFoundException(
                                "Screen with id " + id + " does not exist"
                        )
                );
    }

    @Transactional(readOnly = true)
    public List<Screen> getAll() {
        return screenRepo.findAll();
    }

    @Transactional
    public Screen update(Long id, Screen screen)
            throws ScreenNotFoundException, VenueNotFoundException {

        validateTotalSeats(screen);

        Venue venue = venueRepo.findById(screen.getVenue().getId())
                .orElseThrow(() ->
                        new VenueNotFoundException(
                                "Venue with id " + screen.getVenue().getId() + " does not exist"
                        )
                );

        Screen existing = getById(id);

        existing.setScreenName(screen.getScreenName());
        existing.setVenue(venue);

        if (existing.getSeatList() == null || existing.getSeatList().isEmpty()) {

            existing.setTotalSeats(screen.getTotalSeats());
            generateSeats(existing);

        } else if (existing.getTotalSeats() != screen.getTotalSeats()) {

            throw new IllegalArgumentException(
                    "Total seats cannot be changed after seats have been generated"
            );
        }

        return existing;
    }

    @Transactional
    public void delete(Long id) throws ScreenNotFoundException {

        Screen screen = screenRepo.findById(id)
                .orElseThrow(() ->
                        new ScreenNotFoundException(
                                "Screen with id " + id + " does not exist"
                        ));

        if (showRepo.existsByScreenId(id)) {
            throw new IllegalStateException(
                    "Cannot delete screen because shows are scheduled on this screen."
            );
        }

        // Seats are child records of Screen and must be removed first.
        List<Seat> seats = seatRepo.findByScreenId(id);

        if (!seats.isEmpty()) {
            seatRepo.deleteAll(seats);
        }

        screenRepo.delete(screen);
    }

    private void validateTotalSeats(Screen screen) {
        if (screen.getTotalSeats() < 1) {
            throw new IllegalArgumentException(
                    "Total seats must be at least 1"
            );
        }
    }

    private void generateSeats(Screen screen) {

        int totalSeats = screen.getTotalSeats();

        int seatsPerRow =
                totalSeats <= 60
                        ? 6
                        : totalSeats <= 120
                          ? 8
                          : 10;

        int rows = (int) Math.ceil(
                (double) totalSeats / seatsPerRow
        );

        List<Seat> seats = new ArrayList<>();
        int created = 0;

        for (int row = 0; row < rows && created < totalSeats; row++) {

            String rowName = rowLabel(row);

            int seatsInRow = Math.min(
                    seatsPerRow,
                    totalSeats - created
            );

            SeatType type = seatTypeForRow(row, rows);

            for (int number = 1; number <= seatsInRow; number++) {

                Seat seat = new Seat();

                seat.setSeatNumber(
                        rowName + String.format("%02d", number)
                );

                seat.setSeatType(type);
                seat.setScreen(screen);

                seats.add(seat);
                created++;
            }
        }

        seatRepo.saveAll(seats);
        screen.setSeatList(seats);
    }

    private SeatType seatTypeForRow(int row, int totalRows) {

        if (row == 0) {
            return SeatType.RECLINER;
        }

        if (row == 1 && totalRows > 4) {
            return SeatType.VIP;
        }

        if (row < Math.max(2, totalRows / 2)) {
            return SeatType.PREMIUM;
        }

        return SeatType.REGULAR;
    }

    private String rowLabel(int index) {

        StringBuilder label = new StringBuilder();
        int value = index;

        do {
            label.insert(
                    0,
                    (char) ('A' + (value % 26))
            );

            value = value / 26 - 1;

        } while (value >= 0);

        return label.toString();
    }

}
