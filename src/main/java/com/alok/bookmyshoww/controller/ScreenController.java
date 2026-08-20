package com.alok.bookmyshoww.controller;


import com.alok.bookmyshoww.exceptions.ScreenNotFoundException;
import com.alok.bookmyshoww.model.Screen;
import com.alok.bookmyshoww.service.ScreenService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/screen")
@AllArgsConstructor
public class ScreenController {

    private final ScreenService screenService;

    @PostMapping
    public ResponseEntity<Screen> create(@RequestBody Screen screen)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(screenService.create(screen));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Screen> getById(@PathVariable Long id) throws ScreenNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(screenService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Screen> update(@PathVariable Long id,@RequestBody Screen screen) throws ScreenNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(screenService.update(id,screen));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id)
    {
        screenService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
