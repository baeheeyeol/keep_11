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
                case when s.id is null then false else true end
            )
            from MemberEntity m
            left join ScheduleShareEntity s
              on s.sharerId = :sharerId
             and s.receiverId = m.id
            where lower(m.hname) like lower(concat('%', :name, '%'))
            order by m.hname
            """)
    List<ScheduleShareUserDTO> searchAvailableForInvite(
            @Param("sharerId") Long sharerId,
            @Param("name") String name);

    @Query("""
            select new com.keep.share.dto.ScheduleShareUserDTO(
                s.sharerId,
                s.receiverId,
                s.canEdit,
                s.acceptYn,
                m.id,
                m.hname,
                case when s.id is null then false else true end
            )
            from MemberEntity m
            left join ScheduleShareEntity s
              on s.receiverId = :sharerId
             and s.sharerId = m.id
            where lower(m.hname) like lower(concat('%', :name, '%'))
            order by m.hname
            """)
    List<ScheduleShareUserDTO> searchAvailableForRequest(
            @Param("sharerId") Long sharerId,
            @Param("name") String name);
}
