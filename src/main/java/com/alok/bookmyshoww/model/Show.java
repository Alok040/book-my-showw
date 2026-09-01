package com.alok.bookmyshoww.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "shows")
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @Column(precision = 10, scale = 2)
    private BigDecimal reclinerPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal vipPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal couplePrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal premiumPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal regularPrice;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "screen_id",nullable = false)
    private Screen screen;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "movie_id",nullable = false)
    private Movie movie;
}
