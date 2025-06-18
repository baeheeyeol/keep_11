package com.keep.share.repository;

import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.entity.ScheduleShareEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleShareRepository extends JpaRepository<ScheduleShareEntity, Long> {

	@Query("""
			select new com.keep.share.dto.ScheduleShareUserDTO(
			    s.sharerId,
			    s.receiverId,
			    s.canEdit,
			    s.acceptYn,
			    m.id,
			    m.hname,
			    case when s.id is null then true else false end
			)
			from MemberEntity m
                        left join ScheduleShareEntity s
                          on s.sharerId = :sharerId
                         and s.receiverId = m.id
                         and s.actionType = 'I'
			where lower(m.hname) like lower(concat('%', :name, '%'))
			order by m.hname
			""")
	List<ScheduleShareUserDTO> searchAvailableForInvite(@Param("sharerId") Long sharerId, @Param("name") String name);
	
	@Query("""
			select new com.keep.share.dto.ScheduleShareUserDTO(
			    s.sharerId,
			    s.receiverId,
			    s.canEdit,
			    s.acceptYn,
			    m.id,
			    m.hname,
			    case when s.id is null then true else false end
			)
			from MemberEntity m
                        left join ScheduleShareEntity s
                          on s.receiverId = :sharerId
                         and s.sharerId = m.id
                         and s.actionType = 'R'
			where lower(m.hname) like lower(concat('%', :name, '%'))
			order by m.hname
			""")
        List<ScheduleShareUserDTO> searchAvailableForRequest(@Param("sharerId") Long sharerId, @Param("name") String name);

        @Query("""
                        select new com.keep.share.dto.ScheduleShareUserDTO(
                            s.sharerId,
                            s.receiverId,
                            s.canEdit,
                            s.acceptYn,
                            m.id,
                            m.hname,
                            false
                        )
                        from ScheduleShareEntity s
                        join MemberEntity m on m.id = s.sharerId
                        where s.receiverId = :receiverId
                          and s.acceptYn = 'N'
                          and s.actionType = 'I'
                        order by m.hname
                        """)
        List<ScheduleShareUserDTO> findPendingInvites(@Param("receiverId") Long receiverId);

        @Query("""
                        select new com.keep.share.dto.ScheduleShareUserDTO(
                            s.sharerId,
                            s.receiverId,
                            s.canEdit,
                            s.acceptYn,
                            m.id,
                            m.hname,
                            false
                        )
                        from ScheduleShareEntity s
                        join MemberEntity m on m.id = s.receiverId
                        where s.sharerId = :sharerId
                          and s.acceptYn = 'N'
                          and s.actionType = 'R'
                        order by m.hname
                        """)
        List<ScheduleShareUserDTO> findPendingRequests(@Param("sharerId") Long sharerId);
}
