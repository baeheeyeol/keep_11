package com.keep.schedulelist.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SCHEDULE_LIST")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleListEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "schedule_list_seq_gen")
    @SequenceGenerator(name = "schedule_list_seq_gen", sequenceName = "SCHEDULE_LIST_SEQ", allocationSize = 1)
    @Column(name = "SCHEDULE_LIST_ID")
    private Long scheduleListId;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "CREATION_DATE")
    private java.time.LocalDateTime creationDate;

    @Column(name = "LAST_UPDATED_BY")
    private Long lastUpdatedBy;

    @Column(name = "LAST_UPDATE_DATE")
    private java.time.LocalDateTime lastUpdateDate;

    @Column(name = "LAST_UPDATE_LOGIN")
    private Long lastUpdateLogin;

    @PrePersist
    protected void onCreate() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        this.creationDate = now;
        this.lastUpdateDate = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastUpdateDate = java.time.LocalDateTime.now();
    }
}
