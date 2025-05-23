package com.keep.schedule.service;

import com.keep.schedule.entity.ScheduleEntity;
import com.keep.schedule.repository.ScheduleRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {

	private final ScheduleRepository repository;

	/**
	 * 새로운 일정을 저장합니다.
	 */
	@Transactional
	public ScheduleEntity create(ScheduleEntity schedule) {
		return repository.save(schedule);
	}

	/**
	 * userId 사용자의 주어진 날짜(date)에 속하는 일정 목록을 반환합니다. (daily 뷰에 사용)
	 */
	public List<ScheduleEntity> getEventsByDate(Long userId, LocalDate date) {
		// 그날 00:00부터 23:59:59까지
		LocalDateTime startOfDay = date.atStartOfDay();
		LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

		return repository.findAllByUserIdAndStartTsLessThanEqualAndEndTsGreaterThanEqualOrderByStartTs(userId, // 사용자
				endOfDay, // startTs ≤ 이 값
				startOfDay // endTs ≥ 이 값
		);
	}

	/**
	 * 일정 이동: schedulesId 일정의 startTs/endTs 를 deltaHours 만큼 이동시킵니다.
	 * 
	 * @param schedulesId 이동할 일정의 ID
	 * @param userId      현재 사용자 ID (권한 확인용)
	 * @param deltaHours  이동할 시각 차이(시간 단위, 예: 0.5 = 30분)
	 */
	public void moveEvent(Long schedulesId, Long userId, double deltaHours) {
		// 1) 일정 조회
		ScheduleEntity event = repository.findById(schedulesId)
				.orElseThrow(() -> new EntityNotFoundException("해당 일정이 존재하지 않습니다: " + schedulesId));

		// 2) 소유자 검증
		if (!event.getUserId().equals(userId)) {
			throw new AccessDeniedException("본인의 일정만 이동할 수 있습니다.");
		}
		// 3) 시간 이동 계산
		long deltaSeconds = (long) (deltaHours * 3600);
		LocalDateTime newStart = event.getStartTs().plusSeconds(deltaSeconds);
		LocalDateTime newEnd = event.getEndTs().plusSeconds(deltaSeconds);
		// 4) 엔티티에 반영
		event.setStartTs(newStart);
		event.setEndTs(newEnd);
		event.setLastUpdateDate(LocalDateTime.now());
		event.setLastUpdatedBy(userId);

		// 5) 저장
		repository.save(event);
	}
}
