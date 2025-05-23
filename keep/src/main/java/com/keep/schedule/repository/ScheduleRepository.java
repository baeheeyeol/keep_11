package com.keep.schedule.repository;

import com.keep.schedule.entity.ScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Long> {

  /**
   * userId 사용자의,
   * startTs ≤ endOfDay  AND  endTs ≥ startOfDay
   * 조건을 만족하는 일정 전체를 시작 시각 순으로 조회
   */
  List<ScheduleEntity> findAllByUserIdAndStartTsLessThanEqualAndEndTsGreaterThanEqualOrderByStartTs(
      Long userId,
      LocalDateTime endOfDay,
      LocalDateTime startOfDay
  );
}
