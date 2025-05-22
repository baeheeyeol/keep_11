package com.keep.schedule.controller;

import com.keep.schedule.dto.ScheduleDTO;
import com.keep.schedule.entity.ScheduleEntity;
import com.keep.schedule.service.FileStorageService;
import com.keep.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleApiController {

    private final ScheduleService scheduleService;
    private final FileStorageService fileStorageService;

    /**
     * 일정 생성 (REST API)
     * POST /api/schedules
     * Content-Type: multipart/form-data
     */
    @PostMapping(
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> createSchedule(
            Authentication authentication,
            @Valid @ModelAttribute ScheduleDTO dto,
            BindingResult bindingResult
    ) {
        // 1) 유효성 검사
        if (bindingResult.hasErrors()) {
            Map<String,String> errors = bindingResult.getFieldErrors().stream()
                .collect(Collectors.toMap(
                    fe -> fe.getField(),
                    fe -> fe.getDefaultMessage()
                ));
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("errors", errors));
        }

        // 2) 파일 처리
        String fileUrl = null;
        if (dto.getFile() != null && !dto.getFile().isEmpty()) {
            fileUrl = fileStorageService.storeFile(dto.getFile());
        }

        // 3) 인증정보에서 userId 추출 (예: 이름이 숫자 형태)
        Long userId = Long.valueOf(authentication.getName());

        // 4) DTO → Entity 변환
        ScheduleEntity toSave = ScheduleEntity.builder()
                .userId(userId)
                .title(dto.getTitle())
                .startTs(dto.getStartDateTime())
                .endTs(dto.getEndDateTime())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .category(dto.getColor())
                .fileUrl(fileUrl)
                .createdBy(userId)
                .lastUpdatedBy(userId)
                .build();

        // 5) 저장
        ScheduleEntity saved = scheduleService.create(toSave);

        // 6) 생성된 리소스 URI
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getSchedulesId())
                .toUri();

        // 7) 201 Created 응답
        return ResponseEntity
                .created(location)
                .body(Map.of("id", saved.getSchedulesId()));
    }
}
