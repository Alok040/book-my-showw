package com.alok.bookmyshoww.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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

    @ManyToOne
    @JoinColumn(name = "venue_id", referencedColumnName = "id")
    @JsonBackReference("venue-screens")
    private Venue venue;

    @OneToMany(mappedBy = "screen")
    @JsonManagedReference("screen-seats")
    private List<Seat> seatList;
}