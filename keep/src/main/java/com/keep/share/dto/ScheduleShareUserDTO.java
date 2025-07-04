package com.keep.share.dto;

import lombok.Builder;
import lombok.Value;

/**
 * 읽기 전용 DTO: 변경 불가능한(immutable) 속성으로 구성
 */
@Value
@Builder
public class ScheduleShareUserDTO {
    /** 스케줄 공유 ID */
    Long scheduleShareId;

    /** 초대자 ID */
    Long sharerId;

    /** 수신자 ID */
    Long receiverId;

    /** 수정 가능 여부 ("Y"/"N") */
    String canEdit;

    /** 수락 여부 ("Y"/"N") */
    String acceptYn;

    /** 회원 ID */
    Long id;

    /** 회원 이름 (hname) */
    String hname;

    /** 스케줄 목록 제목 */
    String title;

    /** 초대 가능 여부 */
    Boolean invitable;

    /** 나에게 요청 또는 초대 했는지 여부 */
    Boolean pendingShare;
}
