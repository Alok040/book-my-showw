package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.enums.BookingStatus;
import com.alok.bookmyshoww.model.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingSeatRepo extends JpaRepository<BookingSeat, Long> {

    @Query("""
        SELECT bs
        FROM BookingSeat bs
        WHERE bs.booking.show.id = :showId
        AND bs.seat.id IN :seatIds
        AND bs.booking.bookingStatus = :status
    """)
    List<BookingSeat> findBookedSeats(
            @Param("showId") Long showId,
            @Param("seatIds") List<Long> seatIds,
            @Param("status") BookingStatus status
    );

    @Query("SELECT bs.seat.id FROM BookingSeat bs WHERE bs.show.id = :showId AND bs.booking.bookingStatus = :status")
    List<Long> findBookedSeatIds(
            @Param("showId") Long showId,
            @Param("status") BookingStatus status
    );
}
