package com.keep.schedule.mapper;

import java.time.LocalDateTime;
import java.time.LocalTime;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;

import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.keep.schedule.dto.ScheduleDTO;
import com.keep.schedule.entity.ScheduleEntity;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {

	// 예: DTO → Entity 매핑
	@Mapping(target = "lastUpdatedBy", source = "userId")
	@Mapping(target = "createdBy", source = "userId")
	ScheduleEntity toEntity(ScheduleDTO dto);

	@AfterMapping
	default void afterDtoToEntity(@MappingTarget ScheduleEntity.ScheduleEntityBuilder builder, ScheduleDTO dto) {
		builder.startTs(LocalDateTime.of(dto.getStartDay(), LocalTime.of(dto.getStartHour(), dto.getStartMin())));
		builder.endTs(LocalDateTime.of(dto.getEndDay(), LocalTime.of(dto.getEndHour(), dto.getEndMin())));
	}

	// Entity → DTO 매핑
	@Mapping(target="scheduleId", source="schedulesId")
	ScheduleDTO toDto(ScheduleEntity entity);

	@AfterMapping
	default void afterEntityToDto(ScheduleEntity entity, @MappingTarget ScheduleDTO.ScheduleDTOBuilder builder) {
		var st = entity.getStartTs();
		var et = entity.getEndTs();
		builder.startDay(st.toLocalDate());
		builder.startHour(st.getHour());
		builder.startMin(st.getMinute());
		builder.endDay(et.toLocalDate());
		builder.endHour(et.getHour());
		builder.endMin(et.getMinute());
	}

}
