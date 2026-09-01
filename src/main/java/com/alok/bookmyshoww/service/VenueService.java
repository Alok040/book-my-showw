package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.exceptions.VenueNotFoundException;
import com.alok.bookmyshoww.model.Venue;
import com.alok.bookmyshoww.repository.ScreenRepo;
import com.alok.bookmyshoww.repository.VenueRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class VenueService {

    private final VenueRepo venueRepo;
    private final ScreenRepo screenRepo;

    @Transactional
    public Venue create(Venue venue) {
        return venueRepo.save(venue);
    }

    @Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
    public Venue getById(Long id) throws VenueNotFoundException {
        return venueRepo.findById(id)
                .orElseThrow(() ->
                        new VenueNotFoundException(
                                "Venue with id " + id + " does not exist"
                        ));
    }

    @Transactional(readOnly = true)
    public List<Venue> getAll() {
        return venueRepo.findAll();
    }

    @Transactional
    public Venue update(Long id, Venue venue)
            throws VenueNotFoundException {

        Venue existing = getById(id);

        existing.setCity(venue.getCity());
        existing.setName(venue.getName());
        existing.setAddress(venue.getAddress());

        // Do not replace the relationship collection during an update.
        // Screens should be managed through Screen APIs.
        return existing;
    }

    @Transactional
    public void delete(Long id) throws VenueNotFoundException {

        Venue venue = getById(id);

        if (screenRepo.existsByVenueId(id)) {
            throw new IllegalStateException(
                    "Cannot delete venue because screens exist for this venue."
            );
        }

        venueRepo.delete(venue);
    }

    @Transactional(readOnly = true)
    public List<String> getCities() {
        return venueRepo.findDistinctCities();
    }

    @Transactional(readOnly = true)
    public List<Venue> getByCity(String city) {
        return venueRepo.findByCityIgnoreCase(city);
    }
}
