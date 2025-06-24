package com.keep.schedule.mapper;

import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.stereotype.Component;

import com.keep.schedule.dto.ScheduleDTO;
import com.keep.schedule.entity.ScheduleEntity;

@Component
public class ScheduleMapperImpl implements ScheduleMapper {

    @Override
    public ScheduleEntity toEntity(ScheduleDTO dto) {
        if (dto == null) {
            return null;
        }
        ScheduleEntity.ScheduleEntityBuilder builder = ScheduleEntity.builder();
        builder.schedulesId(dto.getSchedulesId());
        builder.userId(dto.getUserId());
        builder.scheduleListId(dto.getScheduleListId());
        builder.title(dto.getTitle());
        builder.location(dto.getLocation());
        builder.description(dto.getDescription());
        builder.category(dto.getCategory());
        builder.fileUrl(dto.getFileUrl());
        builder.lastUpdatedBy(dto.getUserId());
        builder.createdBy(dto.getUserId());
        builder.startTs(LocalDateTime.of(dto.getStartDay(), LocalTime.of(dto.getStartHour(), dto.getStartMin())));
        builder.endTs(LocalDateTime.of(dto.getEndDay(), LocalTime.of(dto.getEndHour(), dto.getEndMin())));
        return builder.build();
    }

    @Override
    public ScheduleDTO toDto(ScheduleEntity entity) {
        if (entity == null) {
            return null;
        }
        ScheduleDTO.ScheduleDTOBuilder builder = ScheduleDTO.builder();
        builder.userId(entity.getUserId());
        builder.schedulesId(entity.getSchedulesId());
        builder.scheduleListId(entity.getScheduleListId());
        builder.title(entity.getTitle());
        builder.location(entity.getLocation());
        builder.description(entity.getDescription());
        builder.category(entity.getCategory());
        builder.fileUrl(entity.getFileUrl());
        LocalDateTime st = entity.getStartTs();
        LocalDateTime et = entity.getEndTs();
        if (st != null) {
            builder.startDay(st.toLocalDate());
            builder.startHour(st.getHour());
            builder.startMin(st.getMinute());
        }
        if (et != null) {
            builder.endDay(et.toLocalDate());
            builder.endHour(et.getHour());
            builder.endMin(et.getMinute());
        }
        return builder.build();
    }
}
