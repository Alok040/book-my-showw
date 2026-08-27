package com.alok.bookmyshoww.controller;

import com.alok.bookmyshoww.exceptions.UserNotFoundException;
import com.alok.bookmyshoww.model.User;
import com.alok.bookmyshoww.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class UserController {

    private UserService userService;

    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) throws UserNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id,@RequestBody User user) throws UserNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(userService.update(id,user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws UserNotFoundException {
        userService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
