package com.keep.schedule.mapper;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

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
        ScheduleEntity.ScheduleEntityBuilder builder = ScheduleEntity.builder()
                .schedulesId(dto.getSchedulesId())
                .userId(dto.getUserId())
                .scheduleListId(dto.getScheduleListId())
                .title(dto.getTitle())
                .location(dto.getLocation())
                .address(dto.getAddress())
                .placeName(dto.getPlaceName())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .fileUrl(dto.getFileUrl())
                .createdBy(dto.getUserId())
                .lastUpdatedBy(dto.getUserId());

        LocalDateTime start = dto.getStartTs();
        if (start == null && dto.getStartDay() != null) {
            start = LocalDateTime.of(dto.getStartDay(),
                    LocalTime.of(dto.getStartHour(), dto.getStartMin()));
        }
        LocalDateTime end = dto.getEndTs();
        if (end == null && dto.getEndDay() != null) {
            end = LocalDateTime.of(dto.getEndDay(),
                    LocalTime.of(dto.getEndHour(), dto.getEndMin()));
        }

        builder.startTs(start);
        builder.endTs(end);
        return builder.build();
    }

    @Override
    public ScheduleDTO toDto(ScheduleEntity entity) {
        if (entity == null) {
            return null;
        }
        ScheduleDTO.ScheduleDTOBuilder builder = ScheduleDTO.builder()
                .userId(entity.getUserId())
                .schedulesId(entity.getSchedulesId())
                .scheduleListId(entity.getScheduleListId())
                .title(entity.getTitle())
                .location(entity.getLocation())
                .address(entity.getAddress())
                .placeName(entity.getPlaceName())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .fileUrl(entity.getFileUrl());

        LocalDateTime st = entity.getStartTs();
        LocalDateTime et = entity.getEndTs();

        if (st != null) {
            builder.startTs(st)
                   .startDay(st.toLocalDate())
                   .startHour(st.getHour())
                   .startMin(st.getMinute());
        }
        if (et != null) {
            builder.endTs(et)
                   .endDay(et.toLocalDate())
                   .endHour(et.getHour())
                   .endMin(et.getMinute());
        }

        if (st != null && et != null) {
            boolean fullDay = ChronoUnit.HOURS.between(st, et) >= 24;
            builder.isFullDay(fullDay);
        }

        return builder.build();
    }
}
