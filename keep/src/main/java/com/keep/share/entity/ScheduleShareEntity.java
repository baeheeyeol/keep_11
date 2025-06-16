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

    @Column(name = "SCHEDULES_ID", nullable = false)
    private Long scheduleId;

    @Column(name = "INVITER_ID", nullable = false)
    private Long inviterId;

    @Column(name = "INVITEE_ID", nullable = false)
    private Long inviteeId;
}
