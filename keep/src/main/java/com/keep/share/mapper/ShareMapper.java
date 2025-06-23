package com.keep.share.mapper;

import com.keep.share.dto.RequestPermissionDTO;
import com.keep.share.entity.ScheduleShareEntity;

/**
 * Mapper for converting between {@link ScheduleShareEntity} and
 * {@link RequestPermissionDTO} without using MapStruct.
 */
public interface ShareMapper {

    /** Convert entity to DTO. */
    RequestPermissionDTO toDto(ScheduleShareEntity entity);

    /** Convert DTO to entity. */
    ScheduleShareEntity toEntity(RequestPermissionDTO dto);
}
