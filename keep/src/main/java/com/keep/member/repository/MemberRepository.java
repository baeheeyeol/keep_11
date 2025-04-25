package com.keep.member.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.keep.member.entity.MemberEntity;

public interface MemberRepository extends JpaRepository<MemberEntity, Long> {
	//이메일 중복화인
  Optional<MemberEntity> findFirstByEmail(String email);
  //로그인 확인
  Optional<MemberEntity> findByEmail(String email);
}