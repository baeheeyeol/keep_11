package com.keep.share.repository;

import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.entity.ScheduleShareEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
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
                            case when s.id is null then true else false end,
                            case when r.id is not null then true else false end
                        )
                        from MemberEntity m
                        left join ScheduleShareEntity s
                          on s.sharerId = :sharerId
                         and s.receiverId = m.id
                         and s.actionType = 'I'
                        left join ScheduleShareEntity r
                          on r.sharerId = m.id
                         and r.receiverId = :sharerId
                         and r.actionType = 'R'
                         and r.acceptYn = 'N'
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
                            case when s.id is null then true else false end,
                            false
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

        // ------------------------------------------------------------------
        // Update operations for managing requests/invitations
        // ------------------------------------------------------------------

        @Modifying
        @Query("update ScheduleShareEntity s set s.canEdit=:canEdit, s.acceptYn='Y' " +
               "where s.sharerId=:sharerId and s.receiverId=:receiverId " +
               "and s.actionType='R' and s.acceptYn='N'")
        int acceptRequest(@Param("sharerId") Long sharerId,
                          @Param("receiverId") Long receiverId,
                          @Param("canEdit") String canEdit);

        @Modifying
        @Query("update ScheduleShareEntity s set s.acceptYn='R' " +
               "where s.sharerId=:sharerId and s.receiverId=:receiverId " +
               "and s.actionType='R' and s.acceptYn='N'")
        int rejectRequest(@Param("sharerId") Long sharerId,
                          @Param("receiverId") Long receiverId);

        @Modifying
        @Query("update ScheduleShareEntity s set s.acceptYn='Y' " +
               "where s.sharerId=:sharerId and s.receiverId=:receiverId " +
               "and s.actionType='I' and s.acceptYn='N'")
        int acceptInvitation(@Param("sharerId") Long sharerId,
                             @Param("receiverId") Long receiverId);

        @Modifying
        @Query("update ScheduleShareEntity s set s.acceptYn='R' " +
               "where s.sharerId=:sharerId and s.receiverId=:receiverId " +
               "and s.actionType='I' and s.acceptYn='N'")
        int rejectInvitation(@Param("sharerId") Long sharerId,
                             @Param("receiverId") Long receiverId);

        @Modifying
        @Query("update ScheduleShareEntity s set s.acceptYn='Y' " +
               "where s.sharerId=:sharerId and s.actionType='R' and s.acceptYn='N'")
        int acceptAllRequests(@Param("sharerId") Long sharerId);

        @Modifying
        @Query("update ScheduleShareEntity s set s.acceptYn='R' " +
               "where s.sharerId=:sharerId and s.actionType='R' and s.acceptYn='N'")
        int rejectAllRequests(@Param("sharerId") Long sharerId);

        @Modifying
        @Query("update ScheduleShareEntity s set s.acceptYn='Y' " +
               "where s.receiverId=:receiverId and s.actionType='I' and s.acceptYn='N'")
        int acceptAllInvitations(@Param("receiverId") Long receiverId);

        @Modifying
        @Query("update ScheduleShareEntity s set s.acceptYn='R' " +
               "where s.receiverId=:receiverId and s.actionType='I' and s.acceptYn='N'")
        int rejectAllInvitations(@Param("receiverId") Long receiverId);
}
