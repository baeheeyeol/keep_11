package com.keep.share.repository;

import com.keep.share.entity.ScheduleShareEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduleShareRepository extends JpaRepository<ScheduleShareEntity, Long> {
    List<ScheduleShareEntity> findByScheduleId(Long scheduleId);
    boolean existsByScheduleIdAndReceiverId(Long scheduleId, Long receiverId);
}
