package com.keep.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private Long actorId;
    private Long recipientId;
    private String actionType;
    private String title;
    private String targetUrl;
    private String arguments;
    private String isRead;
    private LocalDateTime readDate;
    private LocalDateTime creationDate;
}
