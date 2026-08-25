package com.farmms.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.farmms.backend.security.jwt.JwtAuthenticationFilter;
import com.farmms.backend.security.jwt.JwtTokenProvider;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider
            jwtTokenProvider;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        JwtAuthenticationFilter
                jwtAuthenticationFilter =
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
                 * 서버 세션을 생성하지 않고
                 * JWT로 인증합니다.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                /*
                 * 인증 실패와 권한 부족을 구분합니다.
                 *
                 * 인증 실패:
                 * JWT 없음 / 잘못된 JWT -> 401
                 *
                 * 권한 부족:
                 * 인증은 됐지만 권한이 없음 -> 403
                 */
                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint(
                                        (request, response, authException) ->
                                                response.sendError(
                                                        HttpServletResponse.SC_UNAUTHORIZED
                                                )
                                )
                                .accessDeniedHandler(
                                        (request, response, accessDeniedException) ->
                                                response.sendError(
                                                        HttpServletResponse.SC_FORBIDDEN
                                                )
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
                                 * 업로드 파일은 URL을 통한
                                 * 직접 접근을 차단합니다.
                                 */
                                .requestMatchers(
                                        "/uploads/products/**",
                                        "/uploads/generated/**"
                                )
                                .denyAll()

                                /*
                                 * 회원가입 및 로그인은
                                 * 토큰 없이 접근할 수 있습니다.
                                 */
                                .requestMatchers(
                                        "/api/auth/signup",
                                        "/api/auth/login"
                                )
                                .permitAll()

                                /*
                                 * 공지사항 조회는 공개합니다.
                                 */
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/notices",
                                        "/api/notices/**"
                                )
                                .permitAll()

                                /*
                                 * 공지사항 등록은
                                 * ADMIN만 가능합니다.
                                 */
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/notices",
                                        "/api/notices/**"
                                )
                                .hasRole("ADMIN")

                                /*
                                 * 공지사항 수정은
                                 * ADMIN만 가능합니다.
                                 */
                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/notices/**"
                                )
                                .hasRole("ADMIN")

                                /*
                                 * 공지사항 삭제는
                                 * ADMIN만 가능합니다.
                                 */
                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/notices/**"
                                )
                                .hasRole("ADMIN")

                                /*
                                 * Spring 기본 오류 경로입니다.
                                 */
                                .requestMatchers(
                                        "/error"
                                )
                                .permitAll()

                                /*
                                 * 그 외 API는
                                 * 유효한 JWT가 필요합니다.
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