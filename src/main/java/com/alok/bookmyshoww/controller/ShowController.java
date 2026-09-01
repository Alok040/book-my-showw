package com.alok.bookmyshoww.controller;

import com.alok.bookmyshoww.exceptions.*;
import com.alok.bookmyshoww.model.Show;
import com.alok.bookmyshoww.service.ShowService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/show")
@AllArgsConstructor
public class ShowController {

    private final ShowService showService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Show> create(@RequestBody Show show) throws ShowSchedulingConflictException, ScreenNotFoundException, MovieNotFoundException {
        return ResponseEntity.status(HttpStatus.CREATED).body(showService.create(show));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Show> getById(@PathVariable Long id) throws ShowNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(showService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Show>> getAll()
    {
        return ResponseEntity.status(HttpStatus.OK).body(showService.getAll());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Show>> getByCity(@PathVariable String city) {
        return ResponseEntity.ok(showService.getByCity(city));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<Show> update(@PathVariable Long id,@RequestBody Show show) throws ShowNotFoundException, ShowSchedulingConflictException, ScreenNotFoundException, MovieNotFoundException, InvalidShowTimeException {
        return ResponseEntity.status(HttpStatus.OK).body(showService.update(id,show));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws ShowNotFoundException {
        showService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
