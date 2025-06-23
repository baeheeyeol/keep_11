package com.keep.share.controller;

import com.keep.share.dto.RequestPermissionDTO;
import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.service.ScheduleShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
        private final ScheduleShareService shareService;


	// —————————————————————————————————————————————————————————
	// 3) 검색: 내가 요청할 수 있는 유저 목록 조회
	// —————————————————————————————————————————————————————————
    @GetMapping("/users")
        @Operation(summary = "Search users to request")
        public List<ScheduleShareUserDTO> listAvailableRequestUsers(@RequestParam("name") String name,
                        Authentication authentication) {
                Long receiverId = Long.valueOf(authentication.getName());
                return shareService.searchAvailableForRequest(receiverId, name);
        }

	// —————————————————————————————————————————————————————————
	// 4) 실행: 다른 사용자에게 요청 보내기
	// —————————————————————————————————————————————————————————
        @Operation(summary = "Send request")
        @ApiResponse(responseCode = "201")
        @PostMapping
        public ResponseEntity<Void> sendRequest(Authentication authentication, @RequestBody RequestPermissionDTO dto) {
                Long receiverId = Long.valueOf(authentication.getName());
                shareService.request(dto.getSharerId(), receiverId, dto.getMessage());
                return ResponseEntity.status(HttpStatus.CREATED).build();
        }

	// —————————————————————————————————————————————————————————
	// 5) 조회: 내가 받은 요청 목록 조회
	// —————————————————————————————————————————————————————————
        @Operation(summary = "Get received requests")
        @GetMapping("/received")
        public List<ScheduleShareUserDTO> listReceivedRequests(Authentication authentication) {
                Long shareId = Long.valueOf(authentication.getName());
                return shareService.getReceivedRequests(shareId);
        }
	
	// —————————————————————————————————————————————————————————
	// 6) 수정: 수락하기
	// —————————————————————————————————————————————————————————
        /**
         * 요청 수락 및 권한 부여
         */
        @Operation(summary = "Accept request and set permission")
        @PatchMapping("/{id}")
        public ResponseEntity<Void> acceptAndSetPermissions(@PathVariable(value="id") Long scheduleShareId,
                                                            @RequestBody(required = false) RequestPermissionDTO dto) {
                String canEdit = dto == null ? null : dto.getCanEdit();
                if (canEdit != null) {
                        shareService.acceptAndSetPermissions(scheduleShareId, canEdit);
                } else {
                        shareService.acceptRequest(scheduleShareId);
                }
                return ResponseEntity.ok().build();
        }
	// —————————————————————————————————————————————————————————
	// 8) 삭제: 요청 삭제하기
	// —————————————————————————————————————————————————————————
        @Operation(summary = "Reject request")
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> rejectRequest(@PathVariable(value="id") Long scheduleShareId) {
                shareService.deleteRequest(scheduleShareId);
                return ResponseEntity.ok().build();
        }
	

	// —————————————————————————————————————————————————————————
	// 10) 조회: 공유 목록(공유한/공유받은)
	// —————————————————————————————————————————————————————————
        @Operation(summary = "List shares")
        @GetMapping("/shares")
        public List<ScheduleShareUserDTO> listShares(@RequestParam("type") String type, Authentication authentication) {
                Long userId = Long.valueOf(authentication.getName());
                if ("shared".equals(type)) {
                        return shareService.listShared(userId);
                } else {
                        return shareService.listReceived(userId);
                }
        }

}
