package com.alok.bookmyshoww.controller;


import com.alok.bookmyshoww.exceptions.SeatNotFoundException;
import com.alok.bookmyshoww.model.Seat;
import com.alok.bookmyshoww.service.SeatService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/seat")
@AllArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping
    public ResponseEntity<Seat> create(@RequestBody Seat seat)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(seatService.create(seat));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seat> getById(@PathVariable Long id) throws SeatNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(seatService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Seat> update(@PathVariable Long id,@RequestBody Seat seat) throws SeatNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(seatService.update(id,seat));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id)
    {
        seatService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
