package com.keep.schedule.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Max;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleDTO {

        private Long userId;

        private Long schedulesId;

        private Long scheduleListId;

	private String fileUrl;

	@NotBlank(message = "제목은 반드시 입력해야 합니다.")
	@Size(max = 30, message = "최대 10자까지 입력 가능합니다")
	@Column(name = "title", length = 30)
	private String title;

	@NotNull(message = "시작 일자는 반드시 입력해야 합니다.")
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private LocalDate startDay;

	@NotNull(message = "시작 시(hour)는 반드시 입력해야 합니다.")
	@Min(value = 0, message = "시(hour)는 0~23 사이여야 합니다.")
	@Max(value = 23, message = "시(hour)는 0~23 사이여야 합니다.")
	private int startHour;

	@NotNull(message = "시작 분(minute)는 반드시 입력해야 합니다.")
	@Min(value = 0, message = "분(minute)는 0~59 사이여야 합니다.")
	@Max(value = 59, message = "분(minute)는 0~59 사이여야 합니다.")
	private int startMin;

	@NotNull(message = "종료 일자는 반드시 입력해야 합니다.")
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private LocalDate endDay;

	@NotNull(message = "종료 시(hour)는 반드시 입력해야 합니다.")
	@Min(value = 0, message = "시(hour)는 0~23 사이여야 합니다.")
	@Max(value = 23, message = "시(hour)는 0~23 사이여야 합니다.")
	private int endHour;

	@NotNull(message = "종료 분(minute)는 반드시 입력해야 합니다.")
	@Min(value = 0, message = "분(minute)는 0~59 사이여야 합니다.")
	@Max(value = 59, message = "분(minute)는 0~59 사이여야 합니다.")
	private int endMin;

	private String location;

	private String description;

	@NotBlank(message = "범주(색상)를 선택하세요.")
	private String category;

	private MultipartFile file;

	/**
	 * 편의 메서드: 시작 일시 조합
	 */
	public LocalDateTime startTs;

	/**
	 * 편의 메서드: 종료 일시 조합
	 */
	public LocalDateTime endTs;

	public boolean isFullDay;
}
