package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepo extends JpaRepository<Seat,Long> {
}
