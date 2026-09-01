package com.alok.bookmyshoww.controller;


import com.alok.bookmyshoww.exceptions.MovieNotFoundException;
import com.alok.bookmyshoww.model.Movie;
import com.alok.bookmyshoww.service.MovieService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/movie")
@AllArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Movie> create(@RequestPart("movie") Movie movie, @RequestPart("poster") MultipartFile poster) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.create(movie,poster));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getById(@PathVariable Long id) throws MovieNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(movieService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Movie>> getall()
    {
        return ResponseEntity.status(HttpStatus.OK).body(movieService.getAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(value = "/{id}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Movie> update(@PathVariable Long id,@RequestPart("movie")
                                Movie movie,@RequestPart(value = "poster",required = false) MultipartFile poster) throws MovieNotFoundException, IOException {
        return ResponseEntity.status(HttpStatus.OK).body(movieService.update(id,movie,poster));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws MovieNotFoundException {
        movieService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
