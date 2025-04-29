package com.keep.main;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/main")
public class DashBoardController {

    // 메인 대시보드 (초기 로드: daily fragment 로딩)
    @GetMapping("/dashboard")
    public String dashboard() {
        // 예시 데이터
        return "main/dashboard";  // -> templates/main/dashboard.html
    }

    // AJAX 용 fragment 반환 예시
    @GetMapping("/dashboard/{period}")
    public String dashboardPeriod(@PathVariable String period) {
        switch(period) {
            case "daily":
                break;
            case "weekly":
                break;
        }
        return "main/components/" + period;
    }
}
