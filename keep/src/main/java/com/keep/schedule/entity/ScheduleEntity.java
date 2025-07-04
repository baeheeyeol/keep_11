package com.keep.schedule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "SCHEDULES")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "schedules_seq_gen")
	@SequenceGenerator(name = "schedules_seq_gen", sequenceName = "SCHEDULES_SEQ", allocationSize = 1)
	@Column(name = "SCHEDULES_ID", nullable = false)
	private Long schedulesId;

        @Column(name = "USER_ID", nullable = false)
        private Long userId;

        @Column(name = "SCHEDULE_LIST_ID")
        private Long scheduleListId;

	@Column(name = "TITLE", length = 30)
	private String title;

	@Column(name = "START_TS", nullable = false)
	private LocalDateTime startTs;

	@Column(name = "END_TS", nullable = false)
	private LocalDateTime endTs;

        @Column(name = "LOCATION", length = 200)
        private String location;

        @Column(name = "ADDRESS", length = 200)
        private String address;

        @Column(name = "PLACE_NAME", length = 100)
        private String placeName;

        @Column(name = "LATITUDE")
        private Double latitude;

        @Column(name = "LONGITUDE")
        private Double longitude;

	@Lob
	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "CATEGORY", length = 50)
	private String category;

	@Column(name = "FILE_URL", length = 4000)
	private String fileUrl;

	@Column(name = "CREATED_BY")
	private Long createdBy;

	@Column(name = "CREATION_DATE")
	private LocalDateTime creationDate;

	@Column(name = "LAST_UPDATED_BY")
	private Long lastUpdatedBy;

	@Column(name = "LAST_UPDATE_DATE")
	private LocalDateTime lastUpdateDate;

	@Column(name = "LAST_UPDATE_LOGIN")
	private Long lastUpdateLogin;

	/**
	 * 생성 직전에 creationDate을 세팅하고, 항상 lastUpdateDate를 갱신합니다.
	 */
	@PrePersist
	protected void onCreate() {
		LocalDateTime now = LocalDateTime.now();
		this.creationDate = now;
		this.lastUpdateDate = now;
	}

	@PreUpdate
	protected void onUpdate() {
		this.lastUpdateDate = LocalDateTime.now();
	}
}
