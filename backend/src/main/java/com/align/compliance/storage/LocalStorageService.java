package com.align.compliance.storage;

import com.align.compliance.dto.DocumentMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path rootLocation;

    public LocalStorageService(@Value("${storage.location:uploads}") String storageDir) {
        this.rootLocation = Paths.get(storageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
            log.info("Initialized LocalStorageService at: {}", this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory at " + storageDir, e);
        }
    }

    @Override
    public DocumentMetadata storeFile(MultipartFile file, String organizationId, String subfolder) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        if (originalFileName.contains("..")) {
            throw new IllegalArgumentException("Cannot store file with relative path outside current directory: " + originalFileName);
        }

        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i);
        }

        String storedFileName = UUID.randomUUID().toString() + extension;
        Path targetDir = this.rootLocation.resolve(organizationId).resolve(subfolder);

        try {
            Files.createDirectories(targetDir);
            Path destinationFile = targetDir.resolve(storedFileName);

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            try (InputStream is = file.getInputStream();
                 DigestInputStream dis = new DigestInputStream(is, md)) {
                Files.copy(dis, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String checksum = HexFormat.of().formatHex(md.digest());
            String storageRef = organizationId + "/" + subfolder + "/" + storedFileName;

            return new DocumentMetadata(
                    originalFileName,
                    file.getContentType(),
                    file.getSize(),
                    storageRef,
                    checksum
            );
        } catch (IOException | NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to store file " + originalFileName, e);
        }
    }

    @Override
    public Resource loadFileAsResource(String storageReference) {
        try {
            Path file = this.rootLocation.resolve(storageReference).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + storageReference);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + storageReference, e);
        }
    }

    @Override
    public void deleteFile(String storageReference) {
        try {
            Path file = this.rootLocation.resolve(storageReference).normalize();
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.warn("Failed to delete file at reference: {}", storageReference, e);
        }
    }
}
