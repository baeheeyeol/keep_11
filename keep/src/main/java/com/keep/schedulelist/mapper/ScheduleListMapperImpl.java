package com.keep.schedulelist.mapper;

import com.keep.schedulelist.dto.ScheduleListDTO;
import com.keep.schedulelist.entity.ScheduleListEntity;
import org.springframework.stereotype.Component;

@Component
public class ScheduleListMapperImpl implements ScheduleListMapper {
    @Override
    public ScheduleListEntity toEntity(ScheduleListDTO dto) {
        if (dto == null) return null;
        return ScheduleListEntity.builder()
                .scheduleListId(dto.getScheduleListId())
                .title(dto.getTitle())
                .isShareable(dto.getIsShareable())
                .userId(dto.getUserId())
                .createdBy(dto.getUserId())
                .lastUpdatedBy(dto.getUserId())
                .lastUpdateLogin(dto.getUserId())
                .build();
    }

    @Override
    public ScheduleListDTO toDto(ScheduleListEntity entity) {
        if (entity == null) return null;
        return ScheduleListDTO.builder()
                .scheduleListId(entity.getScheduleListId())
                .title(entity.getTitle())
                .isShareable(entity.getIsShareable())
                .userId(entity.getUserId())
                .hname(null)
                .canEdit(null)
                .build();
    }
}
