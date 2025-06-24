package com.keep.notification.mapper;

import org.springframework.stereotype.Component;

import com.keep.notification.dto.NotificationDTO;
import com.keep.notification.entity.NotificationEntity;

@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationEntity toEntity(NotificationDTO dto) {
        if (dto == null) {
            return null;
        }
        return NotificationEntity.builder()
                .id(dto.getId())
                .actorId(dto.getActorId())
                .recipientId(dto.getRecipientId())
                .actionType(dto.getActionType())
                .title(dto.getTitle())
                .targetUrl(dto.getTargetUrl())
                .arguments(dto.getArguments())
                .isRead(dto.getIsRead())
                .readDate(dto.getReadDate())
                .creationDate(dto.getCreationDate())
                .build();
    }

    @Override
    public NotificationDTO toDto(NotificationEntity entity) {
        if (entity == null) {
            return null;
        }
        return NotificationDTO.builder()
                .id(entity.getId())
                .actorId(entity.getActorId())
                .recipientId(entity.getRecipientId())
                .actionType(entity.getActionType())
                .title(entity.getTitle())
                .targetUrl(entity.getTargetUrl())
                .arguments(entity.getArguments())
                .isRead(entity.getIsRead())
                .readDate(entity.getReadDate())
                .creationDate(entity.getCreationDate())
                .build();
    }
}
