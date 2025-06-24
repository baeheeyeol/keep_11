package com.keep.schedulelist.service;

import com.keep.schedulelist.dto.ScheduleListDTO;
import com.keep.schedulelist.entity.ScheduleListEntity;
import com.keep.schedulelist.mapper.ScheduleListMapper;
import com.keep.schedulelist.repository.ScheduleListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleListService {
    private final ScheduleListRepository repository;
    private final ScheduleListMapper mapper;

    @Transactional
    public Long createDefaultList(Long userId) {
        ScheduleListEntity entity = ScheduleListEntity.builder()
                .title("기본")
                .userId(userId)
                .createdBy(userId)
                .lastUpdatedBy(userId)
                .lastUpdateLogin(userId)
                .build();
        repository.save(entity);
        return entity.getScheduleListId();
    }

    @Transactional
    public ScheduleListDTO createList(ScheduleListDTO dto) {
        ScheduleListEntity entity = repository.save(mapper.toEntity(dto));
        return mapper.toDto(entity);
    }

    public List<ScheduleListDTO> getLists(Long userId) {
        return repository.findByUserId(userId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}
