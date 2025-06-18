package com.keep.share.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SCHEDULE_SHARE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleShareEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "schedule_share_seq_gen")
	@SequenceGenerator(name = "schedule_share_seq_gen", sequenceName = "SCHEDULE_SHARE_SEQ", allocationSize = 1)
	@Column(name = "SCHEDULE_SHARE_ID")
	private Long id;

	// The actual column name in the database is SCHEDULE_ID.
	// Using SCHEDULES_ID results in ORA-00904 during queries.

	@Column(name = "SHARER_ID", nullable = false)
	private Long sharerId;

	@Column(name = "RECEIVER_ID", nullable = false)
	private Long receiverId;

	@Column(name = "CAN_EDIT")
	private String canEdit;

        @Column(name = "ACCEPT_YN")
        private String acceptYn;

        @Column(name = "SCHEDULE_SHARE")
        private String scheduleShare;
	
	@Lob
	@Column(name = "MESSAGE")
	private String message;
	
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
