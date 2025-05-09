package com.keep.member.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.keep.member.dto.MemberDTO;
import com.keep.member.entity.MemberEntity;
import com.keep.member.service.MemberService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/members")
public class MemberApiController {
	private final MemberService memberService;

	// 이메일 중복 확인
	@GetMapping("/existsEmail")
	public ResponseEntity<Map<String, Boolean>> countByEmail(@RequestParam("email") String email) {
		boolean exists = memberService.existsByEmail(email);
		return ResponseEntity.ok(Map.of("exists", exists));
	}
	// 로그인
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody MemberDTO memberDTO, HttpSession session) {
		// 1) 이메일 존재 여부
		if (!memberService.existsByEmail(memberDTO.getEmail())) {
			// HTTP 404로 이메일 미존재 알림
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "EMAIL_NOT_FOUND"));
		}
		// 2) 비밀번호 검사
		if (!memberService.authenticate(memberDTO.getEmail(), memberDTO.getPassword())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "WRONG_PASSWORD"));
		}
    // 3) 로그인 성공한 사용자 정보(Member 엔티티) 조회
		Long memberId = memberService.findIdByEmail(memberDTO.getEmail());  

    // 4) 세션에 MemberDTO 대신 Member 엔티티(또는 id)만 저장해도 OK
    session.setAttribute("memberId", memberId); 

    UsernamePasswordAuthenticationToken authToken =
        new UsernamePasswordAuthenticationToken(
            memberId,
            null,    
            List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    
    // 인증 정보 등록
    SecurityContextHolder.getContext().setAuthentication(authToken);
    
    session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());
    
    //authToken.eraseCredentials();
    
    return ResponseEntity.ok(Map.of("message", "SUCCESS"));
	}

	// 회원가입
	@PostMapping("/signup")
	public ResponseEntity<?> save(@RequestBody MemberDTO memberDTO) {
		Long newId = memberService.save(memberDTO);
		URI location = URI.create("/api/members/" + newId);
		return ResponseEntity.created(location).body(Map.of("message", "SUCCESS"));
	}
}
