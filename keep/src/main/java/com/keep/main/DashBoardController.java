package com.keep.main;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/dashboard")
public class DashBoardController {

    // 메인 대시보드 (초기 로드: daily fragment 로딩)
    @GetMapping({"/",""})
    public String dashboard() {
        // templates/main/dashboard/dashboard-main.html
        return "main/dashboard/dashboard-main";
    }
    // fragment 만 뽑아 주는 엔드포인트
    @GetMapping("/fragment/{view}")
    public String fragment(@PathVariable("view") String view) {
      return "main/dashboard/components/" + view + " :: content";
    }
}
