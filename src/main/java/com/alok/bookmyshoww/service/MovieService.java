package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.exceptions.MovieNotFoundException;
import com.alok.bookmyshoww.model.Movie;
import com.alok.bookmyshoww.repository.MovieRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class MovieService {

    private final MovieRepo movieRepo;

    @Transactional
    public Movie create (Movie movie)
    {
        movieRepo.save(movie);
        return movie;
    }

    @Transactional(readOnly = true)
    public Movie getById(Long id) throws MovieNotFoundException {
        return movieRepo.findById(id).
                orElseThrow(()-> new MovieNotFoundException("Movie with id "+id+" not exist"));
    }

    @Transactional
    public Movie update(Long id,Movie movie) throws MovieNotFoundException {
        Movie m = getById(id);
        m.setCast(movie.getCast());
        m.setGenres(movie.getGenres());
        m.setLanguages(movie.getLanguages());
        m.setTitle(movie.getTitle());
        m.setDurationMinutes(movie.getDurationMinutes());
        m.setReleaseDate(movie.getReleaseDate());
        movieRepo.save(m);
        return movie;
    }

    @Transactional
    public void delete(Long id) throws MovieNotFoundException {
        getById(id);
        movieRepo.deleteById(id);
    }
}
