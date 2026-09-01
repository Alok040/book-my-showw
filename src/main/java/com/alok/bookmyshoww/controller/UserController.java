package com.alok.bookmyshoww.controller;

import com.alok.bookmyshoww.exceptions.UserNotFoundException;
import com.alok.bookmyshoww.model.User;
import com.alok.bookmyshoww.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<User> create(
            @RequestBody User user) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.create(user));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(
            Authentication authentication)
            throws UserNotFoundException {

        String email = authentication.getName();

        return ResponseEntity.ok(
                userService.getByEmail(email)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(
            @PathVariable Long id)
            throws UserNotFoundException {

        return ResponseEntity.ok(
                userService.getById(id)
        );
    }

    @PatchMapping("/{id}")
    public ResponseEntity<User> update(
            @PathVariable Long id,
            @RequestBody User user)
            throws UserNotFoundException {

        return ResponseEntity.ok(
                userService.update(id, user)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id)
            throws UserNotFoundException {

        userService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}