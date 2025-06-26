package com.keep.schedulelist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleListDTO {
    private Long scheduleListId;
    private String title;
    private String isShareable;
    private Long userId;
    private String hname;
    private String canEdit;
}
