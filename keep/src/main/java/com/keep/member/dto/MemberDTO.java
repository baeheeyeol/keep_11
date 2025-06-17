package com.keep.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MemberDTO {
        private Long id;
        private String email;
        private String password;
        private String hname;
        private String hname1;
        // 초대 가능 여부 표시용
        private boolean invitable;
	
}

