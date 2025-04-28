//package com.keep.intreceptor;
//
//import org.springframework.web.servlet.HandlerInterceptor;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import jakarta.servlet.http.HttpSession;
//
//public class LoginCheckInterceptor implements HandlerInterceptor {
//	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//		//	기존 세션이 없거나, 세션에 memberId가 없으면 로그인 페이지로
//		HttpSession session = request.getSession(false);
//		if (session == null || session.getAttribute("memberId") == null) {
//			// contextPath를 붙여서 절대 경로로 리다이렉트
//			System.out.println("!@#!@#!#@!");
//			String loginPage = request.getContextPath() + "/member";
//			response.sendRedirect(loginPage);
//			return false; // 더 이상 컨트롤러 진입하지 않음
//		}
//		// 세션에 memberId가 있으면 정상 요청 처리 계속
//		return true;
//	}
//
//}