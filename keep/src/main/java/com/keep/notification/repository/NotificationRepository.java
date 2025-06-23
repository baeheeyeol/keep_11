package com.keep.notification.repository;

import com.keep.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByRecipientIdOrderByCreationDateDesc(Long recipientId);
}
