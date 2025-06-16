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
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class ScheduleShareApiController {
	private final MemberService memberService;
	private final ScheduleShareService shareService;

	@GetMapping(path = "/invite")
	public List<MemberDTO> search(@RequestParam("name") String name, Authentication authentication) {
		Long sharerId = Long.valueOf(authentication.getName());
		return memberService.searchAvailableForShare(sharerId, name);
	}
	@PostMapping("/invite")
	public ResponseEntity<?> invite(Authentication authentication,@RequestBody ScheduleShareDTO scheduleShareDTO	) {
		shareService.invite(Long.parseLong(authentication.getName()), scheduleShareDTO.getReceiverId());
		return ResponseEntity.ok().build();
	}
}
