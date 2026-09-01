package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepo extends JpaRepository<Seat, Long> {
    List<Seat> findByScreenId(Long screenId);
    List<Seat> findByScreenIdAndSeatNumberIn(Long screenId, List<String> seatNumbers);
}
