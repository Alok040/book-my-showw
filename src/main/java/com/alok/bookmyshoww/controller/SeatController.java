package com.alok.bookmyshoww.controller;

import com.alok.bookmyshoww.exceptions.SeatNotFoundException;
import com.alok.bookmyshoww.model.Seat;
import com.alok.bookmyshoww.service.SeatService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seat")
@AllArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Seat> create(@RequestBody Seat seat) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seatService.create(seat));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seat> getById(@PathVariable Long id) throws SeatNotFoundException {
        return ResponseEntity.ok(seatService.getById(id));
    }

    @GetMapping("/screen/{screenId}")
    public ResponseEntity<List<Seat>> getByScreen(@PathVariable Long screenId) {
        return ResponseEntity.ok(seatService.getByScreenId(screenId));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<Seat> update(@PathVariable Long id, @RequestBody Seat seat) throws SeatNotFoundException {
        return ResponseEntity.ok(seatService.update(id, seat));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        seatService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
