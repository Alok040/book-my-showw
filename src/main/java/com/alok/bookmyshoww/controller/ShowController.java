package com.alok.bookmyshoww.controller;

import com.alok.bookmyshoww.exceptions.MovieNotFoundException;
import com.alok.bookmyshoww.exceptions.ScreenNotFoundException;
import com.alok.bookmyshoww.exceptions.ShowNotFoundException;
import com.alok.bookmyshoww.exceptions.ShowSchedulingConflictException;
import com.alok.bookmyshoww.model.Show;
import com.alok.bookmyshoww.service.ShowService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/show")
@AllArgsConstructor
public class ShowController {

    private final ShowService showService;

    @PostMapping
    public ResponseEntity<Show> create(@RequestBody Show show) throws ShowSchedulingConflictException, ScreenNotFoundException, MovieNotFoundException {
        return ResponseEntity.status(HttpStatus.CREATED).body(showService.create(show));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Show> getById(@PathVariable Long id) throws ShowNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(showService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Show> update(@PathVariable Long id,@RequestBody Show show) throws ShowNotFoundException, ShowSchedulingConflictException, ScreenNotFoundException, MovieNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(showService.update(id,show));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws ShowNotFoundException {
        showService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
