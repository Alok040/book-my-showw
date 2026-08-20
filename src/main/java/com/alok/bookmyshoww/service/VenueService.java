package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.exceptions.VenueNotFoundException;
import com.alok.bookmyshoww.model.Venue;
import com.alok.bookmyshoww.repository.VenueRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class VenueService {

    private final VenueRepo venueRepo;

    @Transactional
    public Venue create(Venue venue)
    {
        return venueRepo.save(venue);
    }

    @Transactional(propagation = Propagation.SUPPORTS,readOnly=true)
    public Venue getById(Long id) throws VenueNotFoundException {
        return venueRepo.findById(id).
                orElseThrow(()-> new VenueNotFoundException("Venue with id "+id+" is not exist"));
    }

    @Transactional
    public Venue update(Long id,Venue venue) throws VenueNotFoundException {
        Venue v1 = getById(id);
        v1.setCity(venue.getCity());
        v1.setName(venue.getName());
        v1.setScreens(venue.getScreens());
        v1.setAddress(venue.getAddress());
        venueRepo.save(v1);
        return venue;
    }

    @Transactional
    public void delete(Long id) throws VenueNotFoundException {
        getById(id);
        venueRepo.deleteById(id);
    }

}
