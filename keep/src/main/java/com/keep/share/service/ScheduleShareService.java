package com.keep.share.service;

import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.entity.ScheduleShareEntity;
import com.keep.share.repository.ScheduleShareRepository;
import com.keep.share.mapper.ShareMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleShareService {
	private final ScheduleShareRepository repository;
	private final ShareMapper mapper;

        public void invite(Long sharerId, Long receiverId, String canEdit) {
                ScheduleShareEntity entity = ScheduleShareEntity.builder()
                                .sharerId(sharerId)
                                .receiverId(receiverId)
                                .canEdit(canEdit)
                                .acceptYn("N")
                                .actionType("I")
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
                                .actionType("R")
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

	public List<ScheduleShareUserDTO> searchReceivedRequests(Long shareId) {
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

        // ------------------------------------------------------------------
        // Manage requests and invitations
        // ------------------------------------------------------------------

        @Transactional
        public void acceptRequest(Long sharerId, Long receiverId, String canEdit) {
                repository.acceptRequest(sharerId, receiverId, canEdit);
        }

        @Transactional
        public void rejectRequest(Long sharerId, Long receiverId) {
                repository.rejectRequest(sharerId, receiverId);
        }

        @Transactional
        public void acceptInvitation(Long sharerId, Long receiverId) {
                repository.acceptInvitation(sharerId, receiverId);
        }

        @Transactional
        public void rejectInvitation(Long sharerId, Long receiverId) {
                repository.rejectInvitation(sharerId, receiverId);
        }

        @Transactional
        public void acceptAllRequests(Long sharerId) {
                repository.acceptAllRequests(sharerId);
        }

        @Transactional
        public void rejectAllRequests(Long sharerId) {
                repository.rejectAllRequests(sharerId);
        }

        @Transactional
        public void acceptAllInvitations(Long receiverId) {
                repository.acceptAllInvitations(receiverId);
        }

        @Transactional
        public void rejectAllInvitations(Long receiverId) {
                repository.rejectAllInvitations(receiverId);
        }

}
