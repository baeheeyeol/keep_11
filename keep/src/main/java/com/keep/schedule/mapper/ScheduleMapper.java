package com.keep.schedule.mapper;

import com.keep.schedule.dto.ScheduleDTO;
import com.keep.schedule.entity.ScheduleEntity;

/**
 * Mapper for converting between {@link ScheduleEntity} and
 * {@link ScheduleDTO} without using MapStruct.
 */
public interface ScheduleMapper {

    /** Convert DTO to entity. */
    ScheduleEntity toEntity(ScheduleDTO dto);

    /** Convert entity to DTO. */
    ScheduleDTO toDto(ScheduleEntity entity);
}
