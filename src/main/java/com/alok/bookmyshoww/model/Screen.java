package com.alok.bookmyshoww.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity

@Getter
@Setter
@NoArgsConstructor
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String screenName;
    private int totalSeats;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "venue_id",referencedColumnName = "id")
    private Venue venue;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Seat> seatList;
}
