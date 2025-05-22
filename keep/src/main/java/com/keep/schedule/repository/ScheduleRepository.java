package com.keep.schedule.repository;

import com.keep.schedule.entity.ScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Long> {

    /**
     * 특정 사용자의 startTs가 주어진 기간(start ~ end) 사이에 속하는 일정들을
     * 시작 시각 순으로 모두 조회합니다.
     */
    List<ScheduleEntity> findAllByUserIdAndStartTsBetweenOrderByStartTs(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );
}
