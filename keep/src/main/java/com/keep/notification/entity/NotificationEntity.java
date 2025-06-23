package com.keep.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notification_seq_gen")
    @SequenceGenerator(name = "notification_seq_gen", sequenceName = "NOTIFICATION_SEQ", allocationSize = 1)
    @Column(name = "NOTIFICATION_ID")
    private Long id;

    @Column(name = "ACTOR_ID", nullable = false)
    private Long actorId;

    @Column(name = "RECIPIENT_ID", nullable = false)
    private Long recipientId;

    @Column(name = "ACTION_TYPE", length = 50, nullable = false)
    private String actionType;

    @Column(name = "TITLE", length = 200)
    private String title;

    @Column(name = "TARGET_URL", length = 512)
    private String targetUrl;

    @Lob
    @Column(name = "ARGUMENTS")
    private String arguments;

    @Column(name = "IS_READ", length = 1)
    private String isRead;

    @Column(name = "READ_DATE")
    private LocalDateTime readDate;

    @Column(name = "CREATED_BY", nullable = false)
    private Long createdBy;

    @Column(name = "CREATION_DATE")
    private LocalDateTime creationDate;

    @Column(name = "LAST_UPDATED_BY")
    private Long lastUpdatedBy;

    @Column(name = "LAST_UPDATE_DATE")
    private LocalDateTime lastUpdateDate;

    @Column(name = "LAST_UPDATE_LOGIN")
    private Long lastUpdateLogin;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.creationDate = now;
        this.lastUpdateDate = now;
        if (this.isRead == null) {
            this.isRead = "N";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastUpdateDate = LocalDateTime.now();
    }
}
