package com.alok.bookmyshoww.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "screen_id",nullable = false)
    private Screen screen;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "movie_id",nullable = false)
    private Movie movie;
}
