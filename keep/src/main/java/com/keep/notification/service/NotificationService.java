package com.keep.notification.service;

import com.keep.notification.dto.NotificationDTO;
import com.keep.notification.entity.NotificationEntity;
import com.keep.notification.mapper.NotificationMapper;
import com.keep.notification.repository.NotificationRepository;
import com.keep.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repository;
    private final MemberService memberService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationMapper mapper;

    @Transactional
    public void create(Long actorId, Long recipientId, String actionType, String title, String targetUrl, String args) {
        if (title == null) {
            String name = memberService.findHnameById(actorId);
            switch (actionType) {
                case "INVITE" -> title = name + "님이 초대했습니다.";
                case "INVITE_ACCEPT" -> title = name + "님이 초대를 수락했습니다.";
                case "INVITE_REJECT" -> title = name + "님이 초대를 거절했습니다.";
                case "REQUEST" -> title = name + "님이 요청했습니다.";
                case "REQUEST_ACCEPT" -> title = name + "님이 요청을 수락했습니다.";
                case "REQUEST_REJECT" -> title = name + "님이 요청을 거절했습니다.";
                default -> title = name + "님의 알림";
            }
        }
        NotificationEntity entity = NotificationEntity.builder()
                .actorId(actorId)
                .recipientId(recipientId)
                .actionType(actionType)
                .title(title)
                .targetUrl(targetUrl)
                .arguments(args)
                .createdBy(actorId)
                .lastUpdatedBy(actorId)
                .lastUpdateLogin(actorId)
                .build();
        repository.save(entity);
        NotificationDTO dto = mapper.toDto(entity);
        messagingTemplate.convertAndSend("/topic/notifications/" + recipientId, dto);
    }

    public List<NotificationDTO> list(Long recipientId) {
        return repository.findByRecipientIdOrderByCreationDateDesc(recipientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markRead(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setIsRead("Y");
            n.setReadDate(java.time.LocalDateTime.now());
        });
    }
}
