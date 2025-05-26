package com.keep.schedule.mapper;

import org.mapstruct.Mapper;

import org.mapstruct.Mapping;

import com.keep.schedule.dto.ScheduleDTO;
import com.keep.schedule.entity.ScheduleEntity;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {

	// 예: DTO → Entity 매핑
	@Mapping(target ="lastUpdatedBy",source ="userId")
	@Mapping(target ="createdBy",source ="userId")
  @Mapping(target ="category",source ="color")
	ScheduleEntity toEntity(ScheduleDTO dto);

	// Entity → DTO 매핑
  @Mapping(target ="color",source ="category")
	ScheduleDTO toDto(ScheduleEntity entity);
}
