package com.alok.bookmyshoww.service;


import com.alok.bookmyshoww.exceptions.ShowNotFoundException;
import com.alok.bookmyshoww.exceptions.ShowSchedulingConflictException;
import com.alok.bookmyshoww.model.Show;
import com.alok.bookmyshoww.repository.ShowRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ShowService {

    private final ShowRepo showRepo;

    @Transactional
    public Show create(Show show) throws ShowSchedulingConflictException {
        if (!show.getStartTime().isBefore(show.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        boolean conflict = showRepo.existsOverlappingShow(
                show.getScreen().getId(),
                show.getShowDate(),
                show.getStartTime(),
                show.getEndTime());
        if (conflict) {
            throw new ShowSchedulingConflictException("Show overlaps with an existing show on this screen");
        }
        return showRepo.save(show);

    }

    @Transactional(readOnly = true)
    public Show getById(Long id) throws ShowNotFoundException {
        return showRepo.findById(id)
                .orElseThrow(()->new ShowNotFoundException("Show with id + "+id+" is not exist"));
    }

    @Transactional

    public Show update(Long id, Show show) throws ShowNotFoundException, ShowSchedulingConflictException {
        if (!show.getStartTime().isBefore(show.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        Show existingShow = getById(id);
        boolean conflict = showRepo.existsOverlappingShowExcept(
                id, show.getScreen().getId(),
                show.getShowDate(),
                show.getStartTime(),
                show.getEndTime());
        if (conflict) {
            throw new ShowSchedulingConflictException("Show overlaps with an existing show on this screen");
        }
        existingShow.setMovie(show.getMovie());
        existingShow.setScreen(show.getScreen());
        existingShow.setShowDate(show.getShowDate());
        existingShow.setStartTime(show.getStartTime());
        existingShow.setEndTime(show.getEndTime());
        return show;
    }

    @Transactional
    public void delete(Long id) throws ShowNotFoundException {
        getById(id);
        showRepo.deleteById(id);
    }
}
