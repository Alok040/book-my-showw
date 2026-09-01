package com.alok.bookmyshoww.repository;

import com.alok.bookmyshoww.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepo extends JpaRepository<Movie,Long> {

}
