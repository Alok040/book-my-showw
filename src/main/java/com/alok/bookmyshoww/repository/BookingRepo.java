package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepo extends JpaRepository<Booking,Long> {
    List<Booking> findByUserId(Long userId);
}
