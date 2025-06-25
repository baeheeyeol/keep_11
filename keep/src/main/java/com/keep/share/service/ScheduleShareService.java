package com.keep.share.service;

import com.keep.share.dto.RequestUserDTO;
import com.keep.share.dto.RequestUserScheduleDTO;
import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.entity.ScheduleShareEntity;
import com.keep.share.repository.ScheduleShareRepository;
import com.keep.member.entity.MemberEntity;
import com.keep.member.repository.MemberRepository;
import com.keep.schedulelist.entity.ScheduleListEntity;
import com.keep.schedulelist.repository.ScheduleListRepository;


import com.keep.share.mapper.ShareMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleShareService {
        private final ScheduleShareRepository repository;
        private final ShareMapper mapper;
        private final MemberRepository memberRepository;
        private final ScheduleListRepository scheduleListRepository;

        public void invite(Long sharerId, Long receiverId, String canEdit, Long scheduleListId) {
                ScheduleShareEntity entity = ScheduleShareEntity.builder().sharerId(sharerId).receiverId(receiverId)
                                .scheduleListId(scheduleListId)
                                .canEdit(canEdit).acceptYn("N").actionType("I").createdBy(sharerId).lastUpdatedBy(sharerId)
                                .lastUpdateLogin(sharerId).build();
                repository.save(entity);
        }

        public void request(Long sharerId, Long receiverId, String message, Long scheduleListId) {
                ScheduleShareEntity entity = ScheduleShareEntity.builder().sharerId(sharerId).receiverId(receiverId).canEdit("N")
                                .scheduleListId(scheduleListId)
                                .acceptYn("N").actionType("R").message(message).createdBy(receiverId).lastUpdatedBy(receiverId)
                                .lastUpdateLogin(receiverId).build();
                repository.save(entity);
        }

        public List<ScheduleShareUserDTO> searchAvailableForInvite(Long sharerId, String name, Long scheduleListId) {
                return repository.searchAvailableForInvite(sharerId, name, scheduleListId);
        }

        public List<ScheduleShareUserDTO> searchAvailableForRequest(Long sharerId, String name) {
                return repository.searchAvailableForRequest(sharerId, name);
        }

        public List<RequestUserDTO> searchRequestableUsersWithSchedules(Long receiverId, String name) {
                List<MemberEntity> members = memberRepository.searchByHname(name);
                List<Long> userIds = members.stream()
                                .map(MemberEntity::getId)
                                .filter(id -> !Objects.equals(id, receiverId))
                                .toList();

                if (userIds.isEmpty()) {
                        return List.of();
                }

                List<ScheduleListEntity> lists = scheduleListRepository.findByUserIdInAndIsShareable(userIds, "Y");
                Map<Long, List<ScheduleListEntity>> listsByUser = lists.stream()
                                .collect(Collectors.groupingBy(ScheduleListEntity::getUserId));

                List<Long> scheduleIds = lists.stream()
                                .map(ScheduleListEntity::getScheduleListId)
                                .toList();

                List<ScheduleShareEntity> shares = repository.findBySharerIdInAndReceiverIdAndScheduleListIdIn(userIds,
                                receiverId, scheduleIds);

                Set<String> requestedKeys = shares.stream()
                                .map(s -> s.getSharerId() + "/" + s.getScheduleListId())
                                .collect(Collectors.toSet());

                List<RequestUserDTO> result = new ArrayList<>();
                for (MemberEntity m : members) {
                        if (Objects.equals(m.getId(), receiverId)) {
                                continue;
                        }

                        List<ScheduleListEntity> userLists = listsByUser.getOrDefault(m.getId(), List.of());
                        List<RequestUserScheduleDTO> schedules = new ArrayList<>();
                        for (ScheduleListEntity l : userLists) {
                                boolean requested = requestedKeys.contains(m.getId() + "/" + l.getScheduleListId());
                                schedules.add(RequestUserScheduleDTO.builder()
                                                .scheduleListId(l.getScheduleListId())
                                                .title(l.getTitle())
                                                .requested(requested)
                                                .build());
                        }

                        if (!schedules.isEmpty()) {
                                result.add(RequestUserDTO.builder()
                                                .id(m.getId())
                                                .hname(m.getHname())
                                                .schedules(schedules)
                                                .build());
                        }
                }

                return result;
        }

        public List<ScheduleShareUserDTO> getReceivedRequests(Long shareId) {
                return repository.findPendingRequests(shareId);
        }

	public List<ScheduleShareUserDTO> searchReceivedInvitations(Long receiverId) {
		return repository.findPendingInvites(receiverId);
	}

	public List<ScheduleShareUserDTO> listShared(Long sharerId) {
		return repository.findAcceptedShares(sharerId);
	}

	public List<ScheduleShareUserDTO> listReceived(Long receiverId) {
		return repository.findAcceptedReceived(receiverId);
	}

	@Transactional
	public void acceptRequest(Long scheduleShareId) {
		repository.markAcceptedById(scheduleShareId);
	}

	@Transactional
	public void deleteRequest(Long scheduleShareId) {
		repository.deleteShareById(scheduleShareId);
	}
	@Transactional
	public void acceptAndSetPermissions(Long scheduleShareId,String canEdit) {
		repository.updateAcceptYnAndCanEditById(scheduleShareId,canEdit);
	}
}
