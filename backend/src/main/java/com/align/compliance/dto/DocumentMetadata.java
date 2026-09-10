package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "Uploaded Document File Metadata")
public class DocumentMetadata {

    @Schema(description = "Original filename", example = "SOP-001-Safety.pdf")
    private String originalFileName;

    @Schema(description = "MIME content type", example = "application/pdf")
    private String contentType;

    @Schema(description = "File size in bytes", example = "2048500")
    private long fileSizeBytes;

    @Schema(description = "Abstract storage reference path", example = "org_60d5/sops/abc-123.pdf")
    private String storageReference;

    @Schema(description = "SHA-256 checksum", example = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
    private String checksumSha256;

    @Schema(description = "Upload timestamp")
    private Instant uploadedAt = Instant.now();

    public DocumentMetadata() {
    }

    public DocumentMetadata(String originalFileName, String contentType, long fileSizeBytes, String storageReference, String checksumSha256) {
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
        this.storageReference = storageReference;
        this.checksumSha256 = checksumSha256;
        this.uploadedAt = Instant.now();
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public String getStorageReference() {
        return storageReference;
    }

    public void setStorageReference(String storageReference) {
        this.storageReference = storageReference;
    }

    public String getChecksumSha256() {
        return checksumSha256;
    }

    public void setChecksumSha256(String checksumSha256) {
        this.checksumSha256 = checksumSha256;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
