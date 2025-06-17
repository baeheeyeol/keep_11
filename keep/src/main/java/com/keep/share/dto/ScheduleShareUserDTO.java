package com.keep.share.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleShareUserDTO {
    private Long sharerId;
    private Long receiverId;
    private String canEdit;
    private String acceptYn;
    private Long id;
    private String hname;
    private Boolean invitable;
}
