package com.keep.notification.mapper;

import com.keep.notification.dto.NotificationDTO;
import com.keep.notification.entity.NotificationEntity;

/**
 * Mapper for converting between {@link NotificationEntity} and
 * {@link NotificationDTO} without using MapStruct.
 */
public interface NotificationMapper {

    /** Convert DTO to entity. */
    NotificationEntity toEntity(NotificationDTO dto);

    /** Convert entity to DTO. */
    NotificationDTO toDto(NotificationEntity entity);
}
