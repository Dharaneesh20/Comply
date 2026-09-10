package com.align.compliance.storage;

import com.align.compliance.dto.DocumentMetadata;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    DocumentMetadata storeFile(MultipartFile file, String organizationId, String subfolder);
    Resource loadFileAsResource(String storageReference);
    void deleteFile(String storageReference);
}
