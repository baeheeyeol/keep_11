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

    public List<Long> findReceiverIds(Long sharerId) {
        return repository.findBySharerId(sharerId).stream()
                .map(ScheduleShareEntity::getReceiverId)
                .collect(Collectors.toList());
    }

    public void invite(Long sharerId, Long receiverId) {
        if (!repository.existsBySharerIdAndReceiverId(sharerId, receiverId)) {
            ScheduleShareEntity entity = ScheduleShareEntity.builder()
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

    public void request(Long sharerId, Long receiverId, String message) {
        if (!repository.existsBySharerIdAndReceiverId(sharerId, receiverId)) {
            ScheduleShareEntity entity = ScheduleShareEntity.builder()
                    .sharerId(sharerId)
                    .receiverId(receiverId)
                    .canEdit("N")
                    .acceptYn("N")
                    .message(message)
                    .createdBy(receiverId)
                    .lastUpdatedBy(receiverId)
                    .lastUpdateLogin(receiverId)
                    .build();
            repository.save(entity);
        }
    }

    public List<ScheduleShareEntity> findRequests(Long sharerId) {
        return repository.findBySharerIdAndAcceptYn(sharerId, "N");
    }

    public List<ScheduleShareEntity> findInvites(Long receiverId) {
        return repository.findByReceiverIdAndAcceptYn(receiverId, "N");
    }
}
