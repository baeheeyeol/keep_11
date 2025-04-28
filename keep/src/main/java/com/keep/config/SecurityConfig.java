package com.keep.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable()).headers(headers -> headers.frameOptions(FrameOptionsConfig::disable))
				.authorizeHttpRequests(
						auth -> auth.requestMatchers("/members/**", "/api/members/**", "/css/**", "/js/**", "/images/**")
								.permitAll().anyRequest().authenticated())
				.formLogin((form) -> form.disable())
				.exceptionHandling(ex -> ex.authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/members")));

		return http.build();
	}
}