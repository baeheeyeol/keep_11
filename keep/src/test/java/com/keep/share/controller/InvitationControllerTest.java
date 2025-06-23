package com.keep.share.controller;

import com.keep.share.service.ScheduleShareService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InvitationController.class)
@AutoConfigureMockMvc(addFilters = false)
class InvitationControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    ScheduleShareService service;

    @Test
    @WithMockUser
    void listReceivedInvitations_returnsOk() throws Exception {
        when(service.searchReceivedInvitations(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/invitations/received"))
                .andExpect(status().isOk());
    }
}
