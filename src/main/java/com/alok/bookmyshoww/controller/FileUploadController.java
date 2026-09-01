package com.alok.bookmyshoww.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/upload")
public class FileUploadController {

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/poster")
    public ResponseEntity<String> uploadPoster(
            @RequestParam("poster") MultipartFile poster) throws IOException {
        String uploadDir = "uploads/movies/";
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
        Path filePath = path.resolve(poster.getOriginalFilename());
        Files.copy(
                poster.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );
        return ResponseEntity.ok("Poster uploaded successfully");
    }
}