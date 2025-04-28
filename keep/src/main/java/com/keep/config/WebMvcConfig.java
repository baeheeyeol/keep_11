//package com.keep.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//import com.keep.intreceptor.LoginCheckInterceptor;
//
//@Configuration
//public class WebMvcConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(new LoginCheckInterceptor())
//        .addPathPatterns("/**")
//        .excludePathPatterns("/api/members/**","/members","/css/**", "/images/**", "/js/**");
//    }
//
//}