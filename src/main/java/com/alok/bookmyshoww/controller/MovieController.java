package com.alok.bookmyshoww.controller;


import com.alok.bookmyshoww.exceptions.MovieNotFoundException;
import com.alok.bookmyshoww.model.Movie;
import com.alok.bookmyshoww.service.MovieService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/movie")
@AllArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @PostMapping
    public ResponseEntity<Movie> create(@RequestBody Movie movie)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.create(movie));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getById(@PathVariable Long id) throws MovieNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(movieService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Movie> update(@PathVariable Long id,@RequestBody Movie movie) throws MovieNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(movieService.update(id,movie));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws MovieNotFoundException {
        movieService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
