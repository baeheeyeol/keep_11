package com.keep.share.mapper;

import org.springframework.stereotype.Component;

import com.keep.share.dto.ScheduleShareDTO;
import com.keep.share.entity.ScheduleShareEntity;

@Component
public class ShareMapperImpl implements ShareMapper {
    @Override
    public ScheduleShareDTO toDto(ScheduleShareEntity entity) {
        if (entity == null) {
            return null;
        }
        return ScheduleShareDTO.builder()
                .scheduleShareId(entity.getId())
                .sharerId(entity.getSharerId())
                .receiverId(entity.getReceiverId())
                .canEdit(entity.getCanEdit())
                .acceptYn(entity.getAcceptYn())
                .message(entity.getMessage())
                .actionType(entity.getActionType())
                .build();
    }

    @Override
    public ScheduleShareEntity toEntity(ScheduleShareDTO dto) {
        if (dto == null) {
            return null;
        }
        return ScheduleShareEntity.builder()
                .id(dto.getScheduleShareId())
                .sharerId(dto.getSharerId())
                .receiverId(dto.getReceiverId())
                .canEdit(dto.getCanEdit())
                .acceptYn(dto.getAcceptYn())
                .message(dto.getMessage())
                .actionType(dto.getActionType())
                .build();
    }
}
