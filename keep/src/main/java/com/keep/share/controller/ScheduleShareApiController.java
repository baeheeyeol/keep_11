package com.keep.share.controller;

import com.keep.member.dto.MemberDTO;
import com.keep.member.service.MemberService;
import com.keep.share.dto.ScheduleShareDTO;
import com.keep.share.service.ScheduleShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules/{scheduleId}/share")
@RequiredArgsConstructor
public class ScheduleShareApiController {
	private final MemberService memberService;
	private final ScheduleShareService shareService;

	@GetMapping("/search")
	public List<MemberDTO> search(@RequestParam("name") String name, Authentication authentication) {
		Long scheduleId = Long.valueOf(authentication.getName());
		return memberService.searchAvailableForShare(scheduleId, name);
	}

	@PostMapping("/invite")
        public ResponseEntity<?> invite(Authentication authentication, @PathVariable Long scheduleId, @RequestBody ScheduleShareDTO dto) {
                Long sharerId = Long.valueOf(authentication.getName());
                Long receiverId = dto.getReceiverId();
                shareService.invite(sharerId, receiverId);
                return ResponseEntity.ok().build();
        }
}
