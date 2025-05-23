package com.keep.schedule.controller;

import com.keep.schedule.dto.ScheduleDTO;
import com.keep.schedule.entity.ScheduleEntity;
import com.keep.schedule.service.FileStorageService;
import com.keep.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleApiController {

	private final ScheduleService scheduleService;
	private final FileStorageService fileStorageService;

	/**
	 * 일정 생성
	 */
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> createSchedule(Authentication authentication, @Valid @ModelAttribute ScheduleDTO dto,
			BindingResult bindingResult) {
		if (bindingResult.hasErrors()) {
			Map<String, String> errors = bindingResult.getFieldErrors().stream()
					.collect(Collectors.toMap(fe -> fe.getField(), fe -> fe.getDefaultMessage()));
			return ResponseEntity.badRequest().body(Map.of("errors", errors));
		}

		// 파일 저장
		String fileUrl = null;
		if (dto.getFile() != null && !dto.getFile().isEmpty()) {
			fileUrl = fileStorageService.storeFile(dto.getFile());
		}

		// 사용자 ID 추출
		Long userId = Long.valueOf(authentication.getName());

		// DTO → Entity
		ScheduleEntity toSave = ScheduleEntity.builder().userId(userId).title(dto.getTitle())
				.startTs(dto.getStartDateTime()).endTs(dto.getEndDateTime()).location(dto.getLocation())
				.description(dto.getDescription()).category(dto.getColor()).fileUrl(fileUrl).createdBy(userId)
				.lastUpdatedBy(userId).build();

		ScheduleEntity saved = scheduleService.create(toSave);

		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(saved.getSchedulesId())
				.toUri();

		return ResponseEntity.created(location).body(Map.of("id", saved.getSchedulesId()));
	}

	/**
	 * 일간 일정 조회
	 */
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<List<Map<String, Object>>> getSchedulesByDate(Authentication authentication,
			@RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
		Long userId = Long.valueOf(authentication.getName());
		List<ScheduleEntity> list = scheduleService.getEventsByDate(userId, date);

		// HashMap으로 직접 만들어야 타입 불일치 없이 List<Map<String,Object>>에 담을 수 있습니다.
		List<Map<String, Object>> result = list.stream().map(e -> {
			Map<String, Object> m = new HashMap<>();
			m.put("schedulesId", e.getSchedulesId());
			m.put("title", e.getTitle());
			m.put("startTs", e.getStartTs());
			m.put("endTs", e.getEndTs());
			m.put("location", e.getLocation());
			m.put("description", e.getDescription());
			m.put("category", e.getCategory());
			m.put("fileUrl", e.getFileUrl());
			return m;
		}).collect(Collectors.toList());
		return ResponseEntity.ok(result);
	}

	/**
	 * ❸ 일정 시간 이동 (30분 단위 델타)
	 */
	@PatchMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> moveSchedule(Authentication authentication, @PathVariable("id") Long schedulesId,
			@RequestBody Map<String, Double> body) {
		// { "deltaHours": 0.5 } 과 같은 형태로 넘어옵니다.
		Double delta = body.get("deltaHours");
		if (delta == null) {
			return ResponseEntity.badRequest().body(Map.of("error", "deltaHours must be provided"));
		}

		Long userId = Long.valueOf(authentication.getName());
		scheduleService.moveEvent(schedulesId, userId, delta);

		return ResponseEntity.ok().build();
	}
}
