package com.alok.bookmyshoww.model;


import com.alok.bookmyshoww.enums.Genre;
import com.alok.bookmyshoww.enums.Language;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @NotBlank
    private String title;
    @Positive
    private int durationMinutes;

    @ElementCollection
    @NotEmpty
    @Enumerated(EnumType.STRING)
    private List<Language> languages;

    @ElementCollection
    @NotEmpty
    @Enumerated(EnumType.STRING)
    private List<Genre> genres;

    @ElementCollection
    private List<String> cast;
    private LocalDate releaseDate;

    @Column(nullable = false,unique = true)
    private String posterUrl;
}
