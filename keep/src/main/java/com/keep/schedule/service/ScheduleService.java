package com.keep.schedule.service;

import com.keep.schedule.entity.ScheduleEntity;
import com.keep.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
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
     * userId 사용자의 주어진 날짜(date)에 속하는 일정 목록을 반환합니다.
     * (daily 뷰에 사용)
     */
    public List<ScheduleEntity> getEventsByDate(Long userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay   = date.atTime(LocalTime.MAX);
        return repository.findAllByUserIdAndStartTsBetweenOrderByStartTs(
            userId, startOfDay, endOfDay
        );
    }

    /**
     * userId 사용자의 주어진 기간(start ~ end) 사이에 속하는 일정 목록을 반환합니다.
     * (weekly/monthly 뷰에 사용)
     */
    public List<ScheduleEntity> getEventsBetween(Long userId,
                                                 LocalDateTime start,
                                                 LocalDateTime end) {
        return repository.findAllByUserIdAndStartTsBetweenOrderByStartTs(
            userId, start, end
        );
    }
}
