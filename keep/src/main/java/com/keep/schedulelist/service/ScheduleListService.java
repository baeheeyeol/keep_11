package com.keep.schedulelist.service;

import com.keep.schedulelist.dto.ScheduleListDTO;
import com.keep.schedulelist.entity.ScheduleListEntity;
import com.keep.schedulelist.mapper.ScheduleListMapper;
import com.keep.schedulelist.repository.ScheduleListRepository;
import com.keep.share.repository.ScheduleShareRepository;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleListService {
    private final ScheduleListRepository repository;
    private final ScheduleListMapper mapper;
    private final ScheduleShareRepository shareRepository;

    @Transactional
    public Long createDefaultList(Long userId) {
        ScheduleListEntity entity = ScheduleListEntity.builder()
                .title("기본")
                .isShareable("Y")
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
        List<ScheduleListDTO> result = repository.findByUserId(userId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        List<Long> sharedIds = shareRepository.findAcceptedScheduleListIdsByReceiverId(userId);
        if (!sharedIds.isEmpty()) {
            repository.findAllById(sharedIds).stream()
                    .map(mapper::toDto)
                    .forEach(result::add);
        }
        return result;
    }

    @Transactional
    public ScheduleListDTO updateList(Long listId, Long userId, ScheduleListDTO dto) {
        ScheduleListEntity entity = repository.findById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        if (!entity.getUserId().equals(userId)) {
            throw new AccessDeniedException("Cannot modify this list");
        }
        entity.setTitle(dto.getTitle());
        entity.setIsShareable(dto.getIsShareable());
        entity.setLastUpdatedBy(userId);
        entity.setLastUpdateLogin(userId);
        repository.save(entity);
        return mapper.toDto(entity);
    }
}
