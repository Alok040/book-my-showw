package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.enums.BookingStatus;
import com.alok.bookmyshoww.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepo extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    @Query("""
        SELECT bs.seat.id
        FROM BookingSeat bs
        WHERE bs.show.id = :showId
          AND bs.booking.bookingStatus = :status
    """)
    List<Long> findBookedSeatIds(
            @Param("showId") Long showId,
            @Param("status") BookingStatus status
    );

    boolean existsByShowIdAndBookingStatusNot(
            Long showId,
            BookingStatus status
    );

    List<Booking> findByShowIdAndBookingStatus(
            Long showId,
            BookingStatus bookingStatus
    );
}