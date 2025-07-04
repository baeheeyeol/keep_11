package com.keep.schedule.service;

import com.keep.schedule.dto.ScheduleDTO;
import com.keep.schedule.entity.ScheduleEntity;
import com.keep.schedule.mapper.ScheduleMapper;
import com.keep.schedule.repository.ScheduleRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import org.hibernate.internal.build.AllowSysOut;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {

        private final ScheduleRepository repository;
        private final ScheduleMapper mapper;
        private final SimpMessagingTemplate messagingTemplate;

	/**
	 * 새로운 일정을 저장합니다.
	 */
        @Transactional
        public Long createAndReturnId(ScheduleDTO dto) {
                ScheduleEntity se = mapper.toEntity(dto);
                ScheduleEntity scheduleEntity = repository.save(se);
                notifyScheduleList(scheduleEntity.getScheduleListId());
                return scheduleEntity.getSchedulesId();
        }

        @Transactional
        public void deleteSchedule(Long scheduleId, Long userId) {
                ScheduleEntity entity = repository.findById(scheduleId)
                                .orElseThrow(() -> new EntityNotFoundException("해당 일정이 존재하지 않습니다: " + scheduleId));

                if (!entity.getUserId().equals(userId)) {
                        throw new AccessDeniedException("본인의 일정만 삭제할 수 있습니다.");
                }

                repository.delete(entity);
                notifyScheduleList(entity.getScheduleListId());
        }

	/**
	 * userId 사용자의 주어진 날짜(date)에 속하는 일정 목록을 반환합니다. (daily 뷰에 사용)
	 */
        public List<ScheduleDTO> getEventsByDate(Long userId, LocalDate date, Long scheduleListId) {
		// 그날 00:00부터 23:59:59까지
		LocalDateTime startOfDay = date.atStartOfDay();
		LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

                List<ScheduleEntity> entities = repository
                                .findAllByUserIdAndScheduleListIdAndStartTsLessThanEqualAndEndTsGreaterThanEqualOrderByStartTs(
                                                userId, // 사용자
                                                scheduleListId,
                                                endOfDay, // startTs ≤ 이 값
                                                startOfDay // endTs ≥ 이 값
                                );
		List<ScheduleDTO> t = entities.stream().map(entity -> {
			ScheduleDTO dto = mapper.toDto(entity);

			long hoursBetween = ChronoUnit.HOURS.between(entity.getStartTs(), entity.getEndTs());
			dto.setFullDay(hoursBetween >= 24);
			return dto;
		}).collect(Collectors.toList());
		return t;
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

                // 5) 저장
                repository.save(event);
                notifyScheduleList(event.getScheduleListId());
        }

	public ScheduleDTO getScheduleById(Long userId, Long scheduleId) {
		// 1) 엔티티 조회
		ScheduleEntity entity = repository.findById(scheduleId)
				.orElseThrow(() -> new EntityNotFoundException("해당 일정이 존재하지 않습니다."));
		// 3) DTO 매핑 후 반환
		return mapper.toDto(entity);
	}

        public List<ScheduleDTO> getEventsByDateRange(Long userId, LocalDate start, LocalDate end, Long scheduleListId) {
		// start 는 00:00:00, end 는 23:59:59 로 설정
		LocalDateTime startDateTime = start.atStartOfDay();
		LocalDateTime endDateTime = end.atTime(LocalTime.MAX);

                List<ScheduleEntity> entitiy = repository
                                .findAllByUserIdAndScheduleListIdAndStartTsLessThanEqualAndEndTsGreaterThanEqualOrderByStartTs(
                                                userId,
                                                scheduleListId,
                                                endDateTime,
                                                startDateTime);

		return entitiy.stream().map(mapper::toDto).collect(Collectors.toList());
	}

	/**
	 * 주간 일정 이동: schedulesId 일정의 startTs/endTs 를 deltaDays, deltaHours 만큼 이동시킵니다.
	 * 
	 * @param schedulesId 이동할 일정의 ID
	 * @param userId      현재 사용자 ID (권한 확인용)
	 * @param deltaDays   이동할 날짜 차이(일 단위, 예: 1.0 = 24시간)
	 * @param deltaHours  이동할 시각 차이(시간 단위, 예: 0.5 = 30분)
	 */
	@Transactional
	public void moveWeeklyEvent(Long schedulesId, Long userId, double deltaDays, double deltaHours) {
		// 1) 일정 조회
		ScheduleEntity event = repository.findById(schedulesId)
				.orElseThrow(() -> new EntityNotFoundException("해당 일정이 존재하지 않습니다: " + schedulesId));

		// 2) 소유자 검증
		if (!event.getUserId().equals(userId)) {
			throw new AccessDeniedException("본인의 일정만 이동할 수 있습니다.");
		}

		// 3) 총 delta 초 계산
		long deltaSecondsFromDays = (long) (deltaDays * 86400); // 1일 = 24*3600초
		long deltaSecondsFromHours = (long) (deltaHours * 3600); // 1시간 = 3600초
		long totalDeltaSeconds = deltaSecondsFromDays + deltaSecondsFromHours;

		// 4) 새 시작/종료 시각 계산
		LocalDateTime newStart = event.getStartTs().plusSeconds(totalDeltaSeconds);
		LocalDateTime newEnd = event.getEndTs().plusSeconds(totalDeltaSeconds);

		// 5) 엔티티에 반영
		event.setStartTs(newStart);
		event.setEndTs(newEnd);

                // 6) 저장
                repository.save(event);
                notifyScheduleList(event.getScheduleListId());
        }

        private void notifyScheduleList(Long scheduleListId) {
                if (messagingTemplate != null && scheduleListId != null) {
                        messagingTemplate.convertAndSend("/topic/schedules/" + scheduleListId, "refresh");
                }
        }

}
