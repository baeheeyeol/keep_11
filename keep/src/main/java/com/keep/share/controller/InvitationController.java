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
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {
    private final ScheduleShareService shareService;

    @Operation(summary = "Search users to invite")
    @GetMapping("/users")
    public List<ScheduleShareUserDTO> listAvailableInviteUsers(@RequestParam("name") String name,
                                                               Authentication authentication) {
        Long sharerId = Long.valueOf(authentication.getName());
        return shareService.searchAvailableForInvite(sharerId, name);
    }

    @Operation(summary = "Send invitation")
    @ApiResponse(responseCode = "201")
    @PostMapping
    public ResponseEntity<Void> sendInvitation(Authentication authentication,
                                               @RequestBody RequestPermissionDTO dto) {
        Long sharerId = Long.valueOf(authentication.getName());
        String canEdit = dto.getCanEdit() == null ? "N" : dto.getCanEdit();
        shareService.invite(sharerId, dto.getReceiverId(), canEdit);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "Get received invitations")
    @GetMapping("/received")
    public List<ScheduleShareUserDTO> listReceivedInvitations(Authentication authentication) {
        Long receiverId = Long.valueOf(authentication.getName());
        return shareService.searchReceivedInvitations(receiverId);
    }

    @Operation(summary = "Accept invitation")
    @PatchMapping("/{id}")
    public ResponseEntity<Void> acceptInvitation(@PathVariable("id") Long scheduleShareId) {
        shareService.acceptRequest(scheduleShareId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Reject invitation")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> rejectInvitation(@PathVariable("id") Long scheduleShareId) {
        shareService.deleteRequest(scheduleShareId);
        return ResponseEntity.ok().build();
    }
}
