package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepo extends JpaRepository<Venue, Long> {
}
