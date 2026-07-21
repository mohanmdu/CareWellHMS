package com.pms.common;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Local-disk file storage (see app.upload-dir in application.properties),
 * shared by every upload feature in this codebase (Consultant photo, CMS
 * images, Patient Report documents). store() is image-only, used by the
 * original photo/image callers; storeDocument() additionally allows PDF for
 * the Patient Report upload flow, which isn't limited to images.
 */
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_DOCUMENT_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "application/pdf");

    private final Path root;

    public FileStorageService(@Value("${app.upload-dir}") String uploadDir) {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    /** Saves the file under {@code subDirectory} and returns its "/uploads/..." relative path. */
    public String store(MultipartFile file, String subDirectory) {
        if (!ALLOWED_IMAGE_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG, PNG or WEBP images are allowed");
        }
        String extension = switch (file.getContentType()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
        return storeAs(file, subDirectory, extension);
    }

    /** Same as store(), but also allows PDF - for document/report uploads that aren't limited to images. */
    public String storeDocument(MultipartFile file, String subDirectory) {
        if (!ALLOWED_DOCUMENT_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG, PNG or PDF files are allowed");
        }
        String extension = switch (file.getContentType()) {
            case "image/png" -> ".png";
            case "application/pdf" -> ".pdf";
            default -> ".jpg";
        };
        return storeAs(file, subDirectory, extension);
    }

    /** Removes a file previously returned by store()/storeDocument() (a "/uploads/..." relative path). No-op if it's already gone. */
    public void delete(String relativePath) {
        if (relativePath == null || !relativePath.startsWith("/uploads/")) {
            return;
        }
        Path target = root.resolve(relativePath.substring("/uploads/".length())).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Refusing to delete a path outside the upload directory");
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to delete stored file", e);
        }
    }

    private String storeAs(MultipartFile file, String subDirectory, String extension) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        try {
            Path directory = root.resolve(subDirectory).normalize();
            Files.createDirectories(directory);
            String filename = UUID.randomUUID() + extension;
            Path target = directory.resolve(filename);
            file.transferTo(target);
            return "/uploads/" + subDirectory + "/" + filename;
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store uploaded file", e);
        }
    }
}
