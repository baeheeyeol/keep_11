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

  // 이름 검색 (대소문자 구분 없음)
  @Query("select m from MemberEntity m where lower(m.hname) like lower(concat('%', :name, '%'))")
  java.util.List<MemberEntity> searchByHname(@Param("name") String name);

  @Query("""
      select m from MemberEntity m
      where lower(m.hname) like lower(concat('%', :name, '%'))
        and not exists (
            select 1 from ScheduleShareEntity s
            where s.scheduleId = :scheduleId
              and s.receiverId = m.id
        )
      """)
  java.util.List<MemberEntity> searchAvailableForShare(@Param("scheduleId") Long scheduleId,
                                                      @Param("name") String name);
}
