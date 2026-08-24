package com.farmms.backend.security.jwt;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = resolveToken(request);

        /*
         * Bearer Token이 존재하고,
         * JWT 서명 및 만료시간 검증을 통과한 경우에만
         * 인증 정보를 생성합니다.
         */
        if (
                token != null
                && jwtTokenProvider.validateToken(token)
        ) {

            /*
             * JWT에서 로그인 회원 번호를 가져옵니다.
             *
             * 이 값을 AuthenticationPrincipal로 사용하기 때문에
             * 기존 Controller의
             *
             * @AuthenticationPrincipal Long userNum
             *
             * 구조는 그대로 사용할 수 있습니다.
             */
            Long userNum =
                    jwtTokenProvider.getUserNum(token);

            /*
             * JWT에 저장된 사용자 권한을 가져옵니다.
             *
             * DB:
             * USER
             * ADMIN
             */
            String role =
                    jwtTokenProvider.getRole(token);

            /*
             * role 값이 존재하는 JWT만
             * Spring Security 인증 객체로 등록합니다.
             *
             * 예전 JWT에는 role이 없기 때문에
             * 새 로그인으로 발급받은 JWT를 사용해야 합니다.
             */
            if (StringUtils.hasText(role)) {

                /*
                 * USER -> ROLE_USER
                 * ADMIN -> ROLE_ADMIN
                 *
                 * Spring Security의 hasRole("ADMIN")은
                 * 내부적으로 ROLE_ADMIN 권한을 검사합니다.
                 */
                String authorityName =
                        "ROLE_"
                        + role
                                .trim()
                                .toUpperCase(Locale.ROOT);

                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority(
                                authorityName
                        );

                /*
                 * 인증 객체를 생성합니다.
                 *
                 * principal = userNum
                 * credentials = null
                 * authorities = ROLE_USER 또는 ROLE_ADMIN
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userNum,
                                null,
                                List.of(authority)
                        );

                /*
                 * 현재 요청의 SecurityContext에
                 * 인증 정보를 저장합니다.
                 */
                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }
        }

        /*
         * 다음 Security Filter로 요청을 전달합니다.
         */
        filterChain.doFilter(
                request,
                response
        );
    }

    /**
     * Authorization Header에서
     * Bearer Token만 추출합니다.
     */
    private String resolveToken(
            HttpServletRequest request
    ) {

        String authorizationHeader =
                request.getHeader(
                        AUTHORIZATION_HEADER
                );

        if (
                StringUtils.hasText(
                        authorizationHeader
                )
                && authorizationHeader.startsWith(
                        BEARER_PREFIX
                )
        ) {

            return authorizationHeader.substring(
                    BEARER_PREFIX.length()
            );
        }

        return null;
    }
}