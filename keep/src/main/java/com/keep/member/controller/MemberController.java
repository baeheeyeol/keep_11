package com.keep.member.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import com.keep.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MemberController {
	private final MemberService memberService;

	// 회원가입 페이지 출력 요청
	@GetMapping("/members")
	public String saveForm() {
		return "/member/login"; 
	}

}
