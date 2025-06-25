package com.keep.schedulelist.repository;

import com.keep.schedulelist.entity.ScheduleListEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleListRepository extends JpaRepository<ScheduleListEntity, Long> {
    List<ScheduleListEntity> findByUserId(Long userId);

    List<ScheduleListEntity> findByUserIdAndIsShareable(Long userId, String isShareable);

    List<ScheduleListEntity> findByUserIdInAndIsShareable(List<Long> userIds, String isShareable);
}
