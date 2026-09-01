package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VenueRepo extends JpaRepository<Venue, Long> {

    List<Venue> findByCityIgnoreCase(String city);

    @Query("""
        SELECT DISTINCT v.city
        FROM Venue v
        WHERE v.city IS NOT NULL
          AND TRIM(v.city) <> ''
        ORDER BY v.city
    """)
    List<String> findDistinctCities();
}
