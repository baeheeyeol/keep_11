package com.keep.share.controller;

import com.keep.member.dto.MemberDTO;
import com.keep.member.service.MemberService;
import com.keep.share.service.ScheduleShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedules/{scheduleId}/share")
@RequiredArgsConstructor
public class ScheduleShareApiController {
    private final MemberService memberService;
    private final ScheduleShareService shareService;

    @GetMapping("/search")
    public List<MemberDTO> search(@PathVariable Long scheduleId, @RequestParam("name") String name) {
        List<MemberDTO> members = memberService.searchByName(name);
        List<Long> invitedIds = shareService.findInviteeIds(scheduleId);
        return members.stream()
                .filter(m -> !invitedIds.contains(m.getId()))
                .toList();
    }

    @PostMapping("/invite")
    public ResponseEntity<?> invite(Authentication authentication,
                                    @PathVariable Long scheduleId,
                                    @RequestBody Map<String, Long> body) {
        Long inviteeId = body.get("inviteeId");
        Long inviterId = Long.valueOf(authentication.getName());
        shareService.invite(scheduleId, inviterId, inviteeId);
        return ResponseEntity.ok().build();
    }
}
