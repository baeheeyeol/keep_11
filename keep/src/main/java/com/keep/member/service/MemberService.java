package com.keep.member.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.keep.member.dto.MemberDTO;
import com.keep.member.entity.MemberEntity;
import com.keep.member.repository.MemberRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {
        private final MemberRepository memberRepository;
        private final PasswordEncoder passwordEncoder;

	// 회원가입
	@Transactional
	public long save(MemberDTO memberDTO) {
		// 1. DTO → Entity 변환 (비밀번호 해시 적용)
		MemberEntity entity = MemberEntity.builder().email(memberDTO.getEmail())
				// raw 비밀번호를 해시하여 저장
				.password(passwordEncoder.encode(memberDTO.getPassword()))
				// 나머지 필드…
				.hname(memberDTO.getHname()).build();

		// 2. 저장 + 즉시 flush
		MemberEntity saved = memberRepository.saveAndFlush(entity);

		// 3. 저장된 ID 반환
		return saved.getId();
	}

	// 이메일 중복검증
	public boolean existsByEmail(String email) {
		return memberRepository.findFirstByEmail(email).isPresent();
	}

	// 이메일/비밀번호 조합이 유효한지 검증
	public boolean authenticate(String email, String password) {
		return memberRepository.findByEmail(email).map(member -> passwordEncoder.matches(password, member.getPassword()))
				.orElse(false);
	}

        public Long findIdByEmail(String email) {
                return memberRepository.findIdByEmail(email);
        }

        public String findHnameById(Long id) {
                return memberRepository.findById(id)
                                .map(MemberEntity::getHname)
                                .orElse(null);
        }
}
