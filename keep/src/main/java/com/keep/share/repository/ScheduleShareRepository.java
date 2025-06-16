package com.keep.share.repository;

import com.keep.share.entity.ScheduleShareEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduleShareRepository extends JpaRepository<ScheduleShareEntity, Long> {
    List<ScheduleShareEntity> findBySharerId(Long sharerId);
    boolean existsBySharerIdAndReceiverId(Long sharerId, Long receiverId);
}
