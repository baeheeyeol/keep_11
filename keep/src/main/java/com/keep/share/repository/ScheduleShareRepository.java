package com.keep.share.repository;

import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.entity.ScheduleShareEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleShareRepository extends JpaRepository<ScheduleShareEntity, Long> {

	@Query("""
			                     select new com.keep.share.dto.ScheduleShareUserDTO(
			                         r.id,
			                         s.sharerId,
			                         s.receiverId,
			                         s.canEdit,
			                         s.acceptYn,
			                         m.id,
			                         m.hname,
			                         case when s.id is null then true else false end,
			                         case when r.id is not null then true else false end
			                     )
			                     from MemberEntity m
			                     left join ScheduleShareEntity s
			                       on s.sharerId = :sharerId
			                      and s.receiverId = m.id
			                      
			                     left join ScheduleShareEntity r
			                       on r.sharerId = :sharerId
			                      and r.receiverId = m.id
			                      and r.actionType = 'R'
			                      and r.acceptYn = 'N'
			                     where lower(m.hname) like lower(concat('%', :name, '%'))
			                      and m.id <> :sharerId
			                     order by m.hname
			""")
	List<ScheduleShareUserDTO> searchAvailableForInvite(@Param("sharerId") Long sharerId, @Param("name") String name);

	@Query("""
			                     select new com.keep.share.dto.ScheduleShareUserDTO(
			                         r.id,
			                         s.sharerId,
			                         s.receiverId,
			                         s.canEdit,
			                         r.acceptYn,
			                         m.id,
			                         m.hname,
			                         case when s.id is null then true else false end,
			                         case when r.id is not null then true else false end
			                     )
			from MemberEntity m
			                     left join ScheduleShareEntity s
			                       on s.receiverId = :sharerId
			                      and s.sharerId = m.id
			                      
			                     left join ScheduleShareEntity r
			                       on r.sharerId = m.id
			                      and r.receiverId = :sharerId
			                      and r.actionType = 'I'

			where lower(m.hname) like lower(concat('%', :name, '%'))
			      and m.id <> :sharerId
			order by m.hname
			""")
	List<ScheduleShareUserDTO> searchAvailableForRequest(@Param("sharerId") Long sharerId, @Param("name") String name);

	@Query("""
			select new com.keep.share.dto.ScheduleShareUserDTO(
			    s.id,
			    s.sharerId,
			    s.receiverId,
			    s.canEdit,
			    s.acceptYn,
			    m.id,
			    m.hname,
			    false,
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
			    s.id,
			    s.sharerId,
			    s.receiverId,
			    s.canEdit,
			    s.acceptYn,
			    m.id,
			    m.hname,
			    false,
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

	@Query("""
			select new com.keep.share.dto.ScheduleShareUserDTO(
			    s.id,
			    s.sharerId,
			    s.receiverId,
			    s.canEdit,
			    s.acceptYn,
			    m.id,
			    m.hname,
			    false,
			    false
			)
			from ScheduleShareEntity s
			join MemberEntity m on m.id = s.receiverId
			where s.sharerId = :sharerId
			  and s.acceptYn = 'Y'
			order by m.hname
			""")
	List<ScheduleShareUserDTO> findAcceptedShares(@Param("sharerId") Long sharerId);

	@Query("""
			select new com.keep.share.dto.ScheduleShareUserDTO(
			    s.id,
			    s.sharerId,
			    s.receiverId,
			    s.canEdit,
			    s.acceptYn,
			    m.id,
			    m.hname,
			    false,
			    false
			)
			from ScheduleShareEntity s
			join MemberEntity m on m.id = s.sharerId
			where s.receiverId = :receiverId
			  and s.acceptYn = 'Y'
			order by m.hname
			""")
	List<ScheduleShareUserDTO> findAcceptedReceived(@Param("receiverId") Long receiverId);

	@Modifying
	@Query("UPDATE ScheduleShareEntity s SET s.acceptYn = 'Y' WHERE s.id = :id")
	int markAcceptedById(@Param("id") Long id);

	@Modifying
	@Query("DELETE FROM ScheduleShareEntity s WHERE s.id = :id")
	int deleteShareById(@Param("id") Long id);

	java.util.Optional<ScheduleShareEntity> findFirstBySharerIdAndReceiverIdAndActionTypeAndAcceptYn(Long sharerId,
			Long receiverId, String actionType, String acceptYn);

	void deleteBySharerIdAndReceiverIdAndActionType(Long sharerId, Long receiverId, String actionType);

	@Modifying
	@Query("UPDATE ScheduleShareEntity s SET s.acceptYn = 'Y' ,s.canEdit = :canEdit WHERE s.id = :scheduleShareId")
	void updateAcceptYnAndCanEditById(@Param("scheduleShareId") Long scheduleShareId,@Param("canEdit") String canEdit);
}
