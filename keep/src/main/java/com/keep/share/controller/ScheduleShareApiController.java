package com.keep.share.controller;

import com.keep.share.dto.ScheduleShareDTO;
import com.keep.share.dto.ScheduleShareUserDTO;
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
	private final ScheduleShareService shareService;

	// —————————————————————————————————————————————————————————
	// 1) 검색: 내가 초대할 수 있는 유저 목록 조회
	// —————————————————————————————————————————————————————————
	@GetMapping("/invite/users")
	public List<ScheduleShareUserDTO> listAvailableInviteUsers(@RequestParam("name") String name,
			Authentication authentication) {
		Long sharerId = Long.valueOf(authentication.getName());
		return shareService.searchAvailableForInvite(sharerId, name);
	}

	// —————————————————————————————————————————————————————————
	// 2) 실행: 사용자에게 초대 보내기
	// —————————————————————————————————————————————————————————
	@PostMapping("/invite")
	public ResponseEntity<Void> sendInvitation(Authentication authentication, @RequestBody ScheduleShareDTO dto) {
		Long sharerId = Long.valueOf(authentication.getName());
		String canEdit = dto.getCanEdit() == null ? "N" : dto.getCanEdit();
		shareService.invite(sharerId, dto.getReceiverId(), canEdit);
		return ResponseEntity.ok().build();
	}

	// —————————————————————————————————————————————————————————
	// 3) 검색: 내가 요청할 수 있는 유저 목록 조회
	// —————————————————————————————————————————————————————————
	@GetMapping("/request/users")
	public List<ScheduleShareUserDTO> listAvailableRequestUsers(@RequestParam("name") String name,
			Authentication authentication) {
		Long receiverId = Long.valueOf(authentication.getName());
		return shareService.searchAvailableForRequest(receiverId, name);
	}

	// —————————————————————————————————————————————————————————
	// 4) 실행: 다른 사용자에게 요청 보내기
	// —————————————————————————————————————————————————————————
	@PostMapping("/request")
	public ResponseEntity<Void> sendRequest(Authentication authentication, @RequestBody ScheduleShareDTO dto) {
		Long receiverId = Long.valueOf(authentication.getName());
		shareService.request(dto.getSharerId(), receiverId, dto.getMessage());
		return ResponseEntity.ok().build();
	}

	// —————————————————————————————————————————————————————————
	// 5) 조회: 내가 받은 요청 목록 조회
	// —————————————————————————————————————————————————————————
	@GetMapping("/manage/requests")
	public List<ScheduleShareUserDTO> listReceivedRequests(Authentication authentication) {
		Long shareId = Long.valueOf(authentication.getName());
		return shareService.searchReceivedRequests(shareId);
	}
	
	// —————————————————————————————————————————————————————————
	// 6) 수정: 수락하기
	// —————————————————————————————————————————————————————————
	@PatchMapping("/manage/requests/{id}/accept")
	public ResponseEntity<Void> acceptRequest(@PathVariable(value="id") Long scheduleShareId) {
		shareService.acceptRequest(scheduleShareId);
		return ResponseEntity.ok().build();
	}
	// —————————————————————————————————————————————————————————
	// 7) 수정: 수락및 권한부여 하기
	// —————————————————————————————————————————————————————————	
	@PatchMapping("/manage/requests/{id}/permissions")
	public ResponseEntity<Void> acceptAndSetPermissions(@PathVariable(value="id") Long scheduleShareId,@RequestBody  ScheduleShareDTO dto) {
		shareService.acceptAndSetPermissions(scheduleShareId,dto.getCanEdit());
		return ResponseEntity.ok().build();
	}
	// —————————————————————————————————————————————————————————
	// 8) 삭제: 요청 삭제하기
	// —————————————————————————————————————————————————————————
	@DeleteMapping("/manage/requests/{id}")
	public ResponseEntity<Void> rejectRequest(@PathVariable(value="id") Long scheduleShareId) {
		shareService.deleteRequest(scheduleShareId);
		return ResponseEntity.ok().build();
	}
	
	// —————————————————————————————————————————————————————————
	// 9) 조회: 내가 받은 초대(Invitation) 목록 조회
	// —————————————————————————————————————————————————————————
	@GetMapping("/manage/invitations")
	public List<ScheduleShareUserDTO> listReceivedInvitations(Authentication authentication) {
		Long receiverId = Long.valueOf(authentication.getName());
		return shareService.searchReceivedInvitations(receiverId);
	}

	// —————————————————————————————————————————————————————————
	// 10) 조회: 공유 목록(공유한/공유받은)
	// —————————————————————————————————————————————————————————
	@GetMapping("/list")
	public List<ScheduleShareUserDTO> listShares(@RequestParam("type") String type, Authentication authentication) {
		Long userId = Long.valueOf(authentication.getName());
		if ("shared".equals(type)) {
			return shareService.listShared(userId);
		} else {
			return shareService.listReceived(userId);
		}
	}

}
