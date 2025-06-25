package com.keep.share.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestUserDTO {
    private Long id;
    private String hname;
    private List<RequestUserScheduleDTO> schedules;
}
