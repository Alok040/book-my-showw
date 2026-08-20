package com.alok.bookmyshoww.controller;

import com.alok.bookmyshoww.exceptions.VenueNotFoundException;
import com.alok.bookmyshoww.model.Venue;
import com.alok.bookmyshoww.service.VenueService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/venue")
@AllArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @PostMapping
    public ResponseEntity<Venue> create(@RequestBody Venue venue)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(venueService.create(venue));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getById(@PathVariable Long id) throws VenueNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(venueService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Venue> update(@PathVariable Long id,@RequestBody Venue venue) throws VenueNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(venueService.update(id,venue));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws VenueNotFoundException {
        venueService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
