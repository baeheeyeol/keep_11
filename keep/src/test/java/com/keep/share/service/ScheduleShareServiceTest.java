package com.keep.share.service;

import com.keep.share.dto.ScheduleShareUserDTO;
import com.keep.share.repository.ScheduleShareRepository;
import com.keep.share.mapper.ShareMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleShareServiceTest {

    @Mock
    private ScheduleShareRepository repository;

    @Mock
    private ShareMapper mapper;

    @InjectMocks
    private ScheduleShareService service;

    @Test
    void getReceivedRequests_returnsData() {
        ScheduleShareUserDTO dto = ScheduleShareUserDTO.builder().scheduleShareId(1L).build();
        when(repository.findPendingRequests(1L)).thenReturn(List.of(dto));

        List<ScheduleShareUserDTO> result = service.getReceivedRequests(1L);

        assertThat(result).hasSize(1);
    }
}
