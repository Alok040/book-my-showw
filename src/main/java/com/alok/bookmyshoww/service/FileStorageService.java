package com.alok.bookmyshoww.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath = Paths.get("uploads/movies");

    public String savePoster(MultipartFile poster) throws IOException {

        if (poster.isEmpty()) {
            throw new IllegalArgumentException("Poster file is empty");
        }

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = poster.getOriginalFilename();

        String filename = UUID.randomUUID() + "_" + originalFilename;

        Path filePath = uploadPath.resolve(filename);

        Files.copy(
                poster.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        return "/uploads/movies/" + filename;
    }
}