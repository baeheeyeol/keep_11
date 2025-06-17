package com.keep.share.service;

import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.entity.ScheduleShareEntity;
import com.keep.share.repository.ScheduleShareRepository;
import com.keep.share.mapper.ShareMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleShareService {
    private final ScheduleShareRepository repository;
    private final ShareMapper mapper;

    public void invite(Long sharerId, Long receiverId) {
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

    public void request(Long sharerId, Long receiverId, String message) {
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

    public List<ScheduleShareUserDTO> searchAvailableForInvite(Long sharerId, String name) {
        return repository.searchAvailableForInvite(sharerId, name);
    }

    public List<ScheduleShareUserDTO> searchAvailableForRequest(Long sharerId, String name) {
        return repository.searchAvailableForRequest(sharerId, name);
    }

}
