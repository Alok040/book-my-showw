package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShowRepo extends JpaRepository<Show,Long> {
    @Query("""
        SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
        FROM Show s
        WHERE s.screen.id = :screenId
          AND s.showDate = :showDate
          AND s.startTime < :endTime
          AND s.endTime > :startTime
    """)
    boolean existsOverlappingShow(
            @Param("screenId") Long screenId,
            @Param("showDate") LocalDate showDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("""
        SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
        FROM Show s
        WHERE s.id <> :showId
          AND s.screen.id = :screenId
          AND s.showDate = :showDate
          AND s.startTime < :endTime
          AND s.endTime > :startTime
    """)
    boolean existsOverlappingShowExcept(
            @Param("showId") Long showId,
            @Param("screenId") Long screenId,
            @Param("showDate") LocalDate showDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
    boolean existsByMovieId(Long movieId);
    List<Show> findByScreenVenueCityIgnoreCase(String city);
    boolean existsByScreenId(Long screenId);
}
