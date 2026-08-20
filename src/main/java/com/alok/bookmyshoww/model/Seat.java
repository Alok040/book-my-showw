package com.alok.bookmyshoww.model;


import com.alok.bookmyshoww.enums.SeatType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity

@Getter
@Setter
@NoArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String seatNumber;

    @Enumerated(EnumType.STRING)
    private SeatType seatType;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "screen_id",referencedColumnName = "id")
    private Screen screen;
}
