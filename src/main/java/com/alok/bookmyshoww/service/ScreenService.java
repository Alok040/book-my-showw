package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.exceptions.ScreenNotFoundException;
import com.alok.bookmyshoww.exceptions.VenueNotFoundException;
import com.alok.bookmyshoww.model.Screen;
import com.alok.bookmyshoww.model.Venue;
import com.alok.bookmyshoww.repository.ScreenRepo;
import com.alok.bookmyshoww.repository.VenueRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ScreenService {

    private final ScreenRepo screenRepo;
    private final VenueRepo venueRepo;

    @Transactional
    public Screen create(Screen screen) throws VenueNotFoundException {
        Venue venue = venueRepo.findById(screen.getVenue().getId())
                .orElseThrow(()->new VenueNotFoundException("Venue with id "+screen.getVenue().getId()+" is not exist"));
        screen.setVenue(venue);
        screenRepo.save(screen);
        return screen;
    }

    @Transactional(propagation = Propagation.SUPPORTS,readOnly = true)
    public Screen getById(Long id) throws ScreenNotFoundException {
        return screenRepo.findById(id).
                orElseThrow(()->new ScreenNotFoundException("Screen with id "+id+" is not exist"));
    }

    @Transactional
    public Screen update(Long id, Screen screen) throws ScreenNotFoundException, VenueNotFoundException {
        venueRepo.findById(screen.getVenue().getId())
                .orElseThrow(()->new VenueNotFoundException("Venue with id "+screen.getVenue().getId()+" is not exist"));
        Screen s1 = getById(id);
        s1.setScreenName(screen.getScreenName());
        s1.setVenue(screen.getVenue());
        s1.setTotalSeats(screen.getTotalSeats());
        return screen;
    }

    @Transactional
    public void delete(Long id)
    {
        screenRepo.deleteById(id);
    }

}
