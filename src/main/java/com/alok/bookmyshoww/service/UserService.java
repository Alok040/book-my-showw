package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.exceptions.UserNotFoundException;
import com.alok.bookmyshoww.model.User;
import com.alok.bookmyshoww.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private UserRepo userRepo;

    @Transactional
    public User create(User user)
    {
        userRepo.save(user);
        return user;
    }

    @Transactional(readOnly = true)
    public User getById(Long id) throws UserNotFoundException {
       return userRepo.findById(id)
               .orElseThrow(()-> new UserNotFoundException("User with id "+id+" does not exist"));
    }

    @Transactional
    public User update(Long id,User user) throws UserNotFoundException {
        User u = getById(id);
        u.setName(user.getName());
        u.setEmail(user.getEmail());
        u.setPassword(user.getPassword());
        u.setPhoneNumber(user.getPhoneNumber());
        u.setDateOfBirth(user.getDateOfBirth());
        userRepo.save(u);
        return user;
    }
    @Transactional
    public void delete(Long id) throws UserNotFoundException {
        getById(id);
        userRepo.deleteById(id);
    }
}
