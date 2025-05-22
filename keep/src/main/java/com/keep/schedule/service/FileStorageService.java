package com.keep.schedule.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path storageRoot;

    public FileStorageService(
    		@Value("${file.storage.location:uploads}") String storageLocation
    ) {
        this.storageRoot = Paths.get(storageLocation).toAbsolutePath().normalize();
    }

    /**
     * 애플리케이션 기동 시점에, storageRoot 디렉토리가 없으면 생성합니다.
     */
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 디렉토리 생성 실패: " + storageRoot, e);
        }
    }

    /**
     * MultipartFile을 받아 storageRoot 아래에 저장하고,
     * 웹에서 접근 가능한 상대경로(또는 URL)를 반환합니다.
     *
     * @param file 업로드된 MultipartFile
     * @return 저장된 파일의 상대 경로(ex: "uploads/uuid-filename.ext")
     */
    public String storeFile(MultipartFile file) {
        // 원본 파일명에서 확장자 분리
        String original = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot > 0) {
            ext = original.substring(dot);
            original = original.substring(0, dot);
        }

        // 충돌 방지를 위해 UUID 접두사 추가
        String filename = UUID.randomUUID() + "-" + original + ext;
        Path target = storageRoot.resolve(filename);

        try {
            // 파일 복사
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + filename, e);
        }

        // 반환값: 웹에서 /uploads/filename 으로 접근한다면 "/uploads/" + filename
        // 앞에 컨텍스트 패스가 자동 붙도록 처리하거나, 필요에 맞게 수정하세요.
        return filename;
    }
}
