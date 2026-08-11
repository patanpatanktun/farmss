package com.farmms.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.farmms.backend.security.jwt.JwtAuthenticationFilter;
import com.farmms.backend.security.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        JwtAuthenticationFilter jwtAuthenticationFilter =
                new JwtAuthenticationFilter(
                        jwtTokenProvider
                );

        http
                /*
                 * REST API에서 JWT를 사용하므로
                 * CSRF를 비활성화합니다.
                 */
                .csrf(csrf ->
                        csrf.disable()
                )

                /*
                 * Spring 기본 로그인 화면을 사용하지 않습니다.
                 */
                .formLogin(form ->
                        form.disable()
                )

                /*
                 * HTTP Basic 인증을 사용하지 않습니다.
                 */
                .httpBasic(basic ->
                        basic.disable()
                )

                /*
                 * 서버 세션을 만들지 않고 JWT로 인증합니다.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth ->
                        auth
                                /*
                                 * 정적 프론트엔드 파일은
                                 * 로그인 없이 접근할 수 있습니다.
                                 */
                                .requestMatchers(
                                        "/",
                                        "/*.html",
                                        "/*.js",
                                        "/*.css",
                                        "/pages/**",
                                        "/css/**",
                                        "/js/**",
                                        "/images/**",
                                        "/assets/**",
                                        "/favicon.ico"
                                )
                                .permitAll()

                                /*
                                 * 상품 참고 이미지와
                                 * AI 생성 이미지는 브라우저와
                                 * MMS에서 표시할 수 있도록 허용합니다.
                                 */
                                .requestMatchers(
                                        "/uploads/products/**",
                                        "/uploads/generated/**"
                                )
                                .permitAll()

                                /*
                                 * 회원가입과 로그인 API는
                                 * 토큰 없이 접근할 수 있습니다.
                                 */
                                .requestMatchers(
                                        "/api/auth/signup",
                                        "/api/auth/login"
                                )
                                .permitAll()

                                /*
                                 * Spring 기본 오류 경로를 허용합니다.
                                 */
                                .requestMatchers(
                                        "/error"
                                )
                                .permitAll()

                                /*
                                 * 그 외 요청은 유효한 JWT가 필요합니다.
                                 */
                                .anyRequest()
                                .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}