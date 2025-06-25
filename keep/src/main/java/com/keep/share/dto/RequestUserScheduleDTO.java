package com.keep.share.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestUserScheduleDTO {
    private Long scheduleListId;
    private String title;
    private boolean requested;
}
