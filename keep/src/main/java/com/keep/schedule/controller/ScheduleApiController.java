package com.keep.schedule.controller;

import com.keep.schedule.dto.ScheduleDTO;

import com.keep.schedule.entity.ScheduleEntity;
import com.keep.schedule.mapper.ScheduleMapper;
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
		dto.setUserId(Long.parseLong(authentication.getName()));
		Long scheduleId = scheduleService.createAndReturnId(dto);

		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(scheduleId).toUri();

		return ResponseEntity.created(location).body(Map.of("id", scheduleId));
	}

	/**
	 * 일간 일정 조회
	 */
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<List<ScheduleDTO>> getSchedulesByDate(Authentication authentication,
			@RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
		Long userId = Long.valueOf(authentication.getName());
		List<ScheduleDTO> list = scheduleService.getEventsByDate(userId, date);

		return ResponseEntity.ok(list);
	}

	/**
	 * 일정 시간 이동 (30분 단위 델타)
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

	/**
	 * 일정 단건 조회
	 */
	@GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ScheduleDTO> getScheduleById(Authentication authentication,
			@PathVariable("id") Long scheduleId) {
		Long userId = Long.valueOf(authentication.getName());
		ScheduleDTO dto = scheduleService.getScheduleById(userId, scheduleId);
		if (dto == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(dto);
	}

	/**
	 * 주간 일정 조회 GET /api/schedules?start=2025-05-25&end=2025-05-31
	 */
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE, params = { "start", "end" })
	public ResponseEntity<List<ScheduleDTO>> getSchedulesByRange(Authentication authentication,
			@RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate start,
			@RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate end) {

		Long userId = Long.valueOf(authentication.getName());
		// ScheduleService 에 getEventsByDateRange 메서드를 구현해야 합니다.
		List<ScheduleDTO> list = scheduleService.getEventsByDateRange(userId, start, end);
		return ResponseEntity.ok(list);
	}
}
