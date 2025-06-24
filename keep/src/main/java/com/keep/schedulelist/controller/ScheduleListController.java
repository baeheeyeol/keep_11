package com.keep.schedulelist.controller;

import com.keep.schedulelist.dto.ScheduleListDTO;
import com.keep.schedulelist.service.ScheduleListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule-lists")
@RequiredArgsConstructor
public class ScheduleListController {
    private final ScheduleListService service;

    @GetMapping
    public List<ScheduleListDTO> list(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return service.getLists(userId);
    }

    @PostMapping
    public ResponseEntity<?> create(Authentication authentication, @RequestBody ScheduleListDTO dto) {
        Long userId = Long.valueOf(authentication.getName());
        dto.setUserId(userId);
        ScheduleListDTO saved = service.createList(dto);
        URI location = URI.create("/api/schedule-lists/" + saved.getScheduleListId());
        return ResponseEntity.created(location).body(Map.of("id", saved.getScheduleListId()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(Authentication authentication,
                                    @PathVariable("id") Long id,
                                    @RequestBody ScheduleListDTO dto) {
        Long userId = Long.valueOf(authentication.getName());
        dto.setScheduleListId(id);
        ScheduleListDTO updated = service.updateList(id, userId, dto);
        return ResponseEntity.ok(Map.of("id", updated.getScheduleListId()));
    }
}
