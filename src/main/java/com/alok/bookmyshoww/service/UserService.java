package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.enums.Role;
import com.alok.bookmyshoww.exceptions.UserNotFoundException;
import com.alok.bookmyshoww.model.User;
import com.alok.bookmyshoww.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User create(User user) {

        user.setRole(Role.USER);

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepo.save(user);
    }

    @Transactional(readOnly = true)
    public User getById(Long id) throws UserNotFoundException {

        return userRepo.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with id " + id + " does not exist"
                        )
                );
    }

    // Used by Spring Security to find the user using email
    @Transactional(readOnly = true)
    public User getByEmail(String email)
            throws UserNotFoundException {

        return userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with email " + email + " does not exist"
                        )
                );
    }

    @Transactional
    public User update(Long id, User user)
            throws UserNotFoundException {

        User existingUser = getById(id);

        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhoneNumber(user.getPhoneNumber());
        existingUser.setDateOfBirth(user.getDateOfBirth());

        if (user.getPassword() != null &&
                !user.getPassword().isBlank()) {

            existingUser.setPassword(
                    passwordEncoder.encode(user.getPassword())
            );
        }

        return userRepo.save(existingUser);
    }

    @Transactional
    public void delete(Long id)
            throws UserNotFoundException {

        getById(id);

        userRepo.deleteById(id);
    }
}