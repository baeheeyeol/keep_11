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

    public List<Long> findInviteeIds(Long scheduleId) {
        return repository.findByScheduleId(scheduleId).stream()
                .map(ScheduleShareEntity::getInviteeId)
                .collect(Collectors.toList());
    }

    public void invite(Long scheduleId, Long inviterId, Long inviteeId) {
        if (!repository.existsByScheduleIdAndInviteeId(scheduleId, inviteeId)) {
            ScheduleShareEntity entity = ScheduleShareEntity.builder()
                    .scheduleId(scheduleId)
                    .inviterId(inviterId)
                    .inviteeId(inviteeId)
                    .build();
            repository.save(entity);
        }
    }
}
