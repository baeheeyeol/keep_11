package com.keep.member.entity;

import com.keep.member.dto.MemberDTO;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // JPA가 쓰는 기본 생성자
@AllArgsConstructor                                 // @Builder가 사용하는 all-args 생성자
@Builder     
@SequenceGenerator(
	    name = "memberSeqGen",
	    sequenceName = "member_table_seq",
	    allocationSize = 1    // DB 시퀀스 INCREMENT BY 1 과 일치
	)
@Table(name = "member_table") // 테이블 이름 : member_table
public class MemberEntity {
	@Id // pk 지정
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "memberSeqGen")
	private Long id;

	@Column(unique = true) // unique 제약조건을 추가
	private String email;

	@Column
	private String password;

	@Column
	private String hname;

	// DTO에 담긴 것을 Entity 객체로 넘기는 작업
	public static MemberEntity toMemberEntity(MemberDTO memberDTO) {
		MemberEntity memberEntity = new MemberEntity();
		memberEntity.setEmail(memberDTO.getEmail());
		memberEntity.setPassword(memberDTO.getPassword());
		memberEntity.setHname(memberDTO.getHname());
		return memberEntity;
	}
}