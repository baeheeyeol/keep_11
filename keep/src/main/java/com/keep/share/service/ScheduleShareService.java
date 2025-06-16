package com.keep.share.service;

import com.keep.share.entity.ScheduleShareEntity;
import com.keep.share.repository.ScheduleShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleShareService {
    private final ScheduleShareRepository repository;

    public List<Long> findReceiverIds(Long scheduleId) {
        return repository.findByScheduleId(scheduleId).stream()
                .map(ScheduleShareEntity::getReceiverId)
                .collect(Collectors.toList());
    }

    public void invite(Long scheduleId, Long sharerId, Long receiverId) {
        if (!repository.existsByScheduleIdAndReceiverId(scheduleId, receiverId)) {
            ScheduleShareEntity entity = ScheduleShareEntity.builder()
                    .scheduleId(scheduleId)
                    .sharerId(sharerId)
                    .receiverId(receiverId)
                    .canEdit("N")
                    .acceptYn("N")
                    .createdBy(sharerId)
                    .lastUpdatedBy(sharerId)
                    .lastUpdateLogin(sharerId)
                    .build();
            repository.save(entity);
        }
    }
    
}
