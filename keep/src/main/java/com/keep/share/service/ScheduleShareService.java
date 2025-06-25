package com.keep.share.service;

import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.entity.ScheduleShareEntity;
import com.keep.share.repository.ScheduleShareRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.keep.share.mapper.ShareMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.module.ModuleDescriptor.Builder;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleShareService {
	private final ScheduleShareRepository repository;
	private final ShareMapper mapper;

        public void invite(Long sharerId, Long receiverId, String canEdit, Long scheduleListId) {
                ScheduleShareEntity entity = ScheduleShareEntity.builder().sharerId(sharerId).receiverId(receiverId)
                                .scheduleListId(scheduleListId)
                                .canEdit(canEdit).acceptYn("N").actionType("I").createdBy(sharerId).lastUpdatedBy(sharerId)
                                .lastUpdateLogin(sharerId).build();
                repository.save(entity);
        }

	public void request(Long sharerId, Long receiverId, String message) {
		ScheduleShareEntity entity = ScheduleShareEntity.builder().sharerId(sharerId).receiverId(receiverId).canEdit("N")
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
