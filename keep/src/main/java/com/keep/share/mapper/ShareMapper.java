package com.keep.share.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.keep.share.dto.ScheduleShareDTO;
import com.keep.share.entity.ScheduleShareEntity;

@Mapper(componentModel = "spring")
public interface ShareMapper {
    @Mapping(target = "scheduleShareId", source = "id")
    @Mapping(target = "actionType", source = "actionType")
    ScheduleShareDTO toDto(ScheduleShareEntity entity);

    @Mapping(target = "id", source = "scheduleShareId")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "creationDate", ignore = true)
    @Mapping(target = "lastUpdatedBy", ignore = true)
    @Mapping(target = "lastUpdateDate", ignore = true)
    @Mapping(target = "lastUpdateLogin", ignore = true)
    @Mapping(target = "actionType", source = "actionType")
    ScheduleShareEntity toEntity(ScheduleShareDTO dto);
}
