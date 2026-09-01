package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.exceptions.SeatNotFoundException;
import com.alok.bookmyshoww.model.Seat;
import com.alok.bookmyshoww.repository.SeatRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class SeatService {

    private final SeatRepo seatRepo;

    @Transactional
    public Seat create(Seat seat)
    {
        seatRepo.save(seat);
        return seat;
    }

    @Transactional(readOnly = true)
    public List<Seat> getByScreenId(Long screenId) {
        return seatRepo.findByScreenId(screenId);
    }

    @Transactional(propagation = Propagation.SUPPORTS,readOnly = true)
    public Seat getById(Long id) throws SeatNotFoundException {
        return seatRepo.findById(id).
                orElseThrow(()->new SeatNotFoundException("Seat with seat id "+id+" is not exist"));
    }

    @Transactional
    public Seat update(Long id,Seat seat) throws SeatNotFoundException {
        Seat s1 = getById(id);
        s1.setSeatNumber(seat.getSeatNumber());
        s1.setSeatType(seat.getSeatType());
        s1.setScreen(seat.getScreen());
        seatRepo.save(s1);
        return seat;
    }

    @Transactional
    public void delete(Long id)
    {
        seatRepo.deleteById(id);
    }

}
