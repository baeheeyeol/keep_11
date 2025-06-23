package com.keep.notification.controller;

import com.keep.notification.dto.NotificationDTO;
import com.keep.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    @GetMapping
    public List<NotificationDTO> list(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return service.list(userId);
    }

    @PostMapping
    public ResponseEntity<Void> create(Authentication authentication, @RequestBody NotificationDTO dto) {
        Long actorId = Long.valueOf(authentication.getName());
        service.create(actorId, dto.getRecipientId(), dto.getActionType(), dto.getTitle(), dto.getTargetUrl(), dto.getArguments());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        service.markRead(id);
        return ResponseEntity.ok().build();
    }
}
