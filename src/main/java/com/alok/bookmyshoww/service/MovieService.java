package com.alok.bookmyshoww.service;

import com.alok.bookmyshoww.exceptions.MovieNotFoundException;
import com.alok.bookmyshoww.model.Movie;
import com.alok.bookmyshoww.repository.MovieRepo;
import com.alok.bookmyshoww.repository.ShowRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@AllArgsConstructor
public class MovieService {

    private final MovieRepo movieRepo;
    private final FileStorageService fileStorageService;
    private final ShowRepo showRepo;

    @Transactional
    public Movie create (Movie movie, MultipartFile poster) throws IOException {
        String posterUrl = fileStorageService.savePoster(poster);
        movie.setPosterUrl(posterUrl);
        movieRepo.save(movie);
        return movie;
    }

    @Transactional(readOnly = true)
    public Movie getById(Long id) throws MovieNotFoundException {
        return movieRepo.findById(id).
                orElseThrow(()-> new MovieNotFoundException("Movie with id "+id+" not exist"));
    }

    @Transactional(readOnly = true)
    public List<Movie> getAll()
    {
        return movieRepo.findAll();
    }

    @Transactional
    public Movie update(Long id,Movie movie,MultipartFile poster) throws MovieNotFoundException, IOException {
        Movie m = getById(id);
        m.setCast(movie.getCast());
        m.setGenres(movie.getGenres());
        m.setLanguages(movie.getLanguages());
        m.setTitle(movie.getTitle());
        m.setDurationMinutes(movie.getDurationMinutes());
        m.setReleaseDate(movie.getReleaseDate());
        if (poster != null && !poster.isEmpty()) {
            String posterUrl = fileStorageService.savePoster(poster);
            m.setPosterUrl(posterUrl);
        }
        movieRepo.save(m);
        return movie;
    }

    @Transactional
    public void delete(Long id) throws MovieNotFoundException {
        Movie movie = movieRepo.findById(id)
                .orElseThrow(() ->
                        new MovieNotFoundException("Movie not found with id: " + id)
                );
        if (showRepo.existsByMovieId(id)) {
            throw new IllegalStateException(
                    "Cannot delete movie because shows are scheduled for this movie."
            );
        }
        movieRepo.delete(movie);
    }
}
