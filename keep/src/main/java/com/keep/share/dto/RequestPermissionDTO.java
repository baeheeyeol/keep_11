package com.keep.share.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestPermissionDTO {
    private Long scheduleListId;
    private Long scheduleShareId;
    private Long scheduleId;
    private Long sharerId;
    private Long receiverId;
    private String canEdit;
    private String acceptYn;
    private String message;
    private String actionType;
}
