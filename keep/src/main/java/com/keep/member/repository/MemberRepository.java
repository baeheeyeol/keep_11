package com.keep.member.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.keep.member.entity.MemberEntity;

public interface MemberRepository extends JpaRepository<MemberEntity, Long> {
	//이메일 중복화인
  Optional<MemberEntity> findFirstByEmail(String email);
  //로그인 확인
  Optional<MemberEntity> findByEmail(String email);
  
  @Query("select m.id from MemberEntity m where m.email = :email")
  Long findIdByEmail(@Param("email") String email);
}