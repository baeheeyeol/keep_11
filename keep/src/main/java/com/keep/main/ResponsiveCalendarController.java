package com.keep.main;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/responsive")
public class ResponsiveCalendarController {

    @GetMapping
    public String calendar() {
        return "responsive/calendar";
    }
}
