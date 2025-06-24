package com.keep.schedulelist.mapper;

import com.keep.schedulelist.dto.ScheduleListDTO;
import com.keep.schedulelist.entity.ScheduleListEntity;

public interface ScheduleListMapper {
    ScheduleListEntity toEntity(ScheduleListDTO dto);
    ScheduleListDTO toDto(ScheduleListEntity entity);
}
