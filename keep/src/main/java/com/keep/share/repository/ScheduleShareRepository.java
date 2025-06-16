package com.keep.share.repository;

import com.keep.share.entity.ScheduleShareEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduleShareRepository extends JpaRepository<ScheduleShareEntity, Long> {
    List<ScheduleShareEntity> findBySharerId(Long sharerId);
    List<ScheduleShareEntity> findBySharerIdAndAcceptYn(Long sharerId, String acceptYn);
    List<ScheduleShareEntity> findByReceiverIdAndAcceptYn(Long receiverId, String acceptYn);
    boolean existsBySharerIdAndReceiverId(Long sharerId, Long receiverId);
}
