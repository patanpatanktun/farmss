package com.farmms.backend.service.auth;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.user.User;
import com.farmms.backend.domain.user.UserRepository;
import com.farmms.backend.dto.auth.LoginRequest;
import com.farmms.backend.dto.auth.LoginResponse;
import com.farmms.backend.dto.auth.SignUpRequest;
import com.farmms.backend.security.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 회원가입
     */
    @Transactional
    public Long signUp(SignUpRequest request) {

        String userId = request.getUserId().trim();

        String email = request
                .getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException(
                    "이미 사용 중인 아이디입니다."
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "이미 사용 중인 이메일입니다."
            );
        }

        String encodedPassword = passwordEncoder.encode(
                request.getPassword()
        );

        User user = User.create(
                userId,
                encodedPassword,
                email,
                request.getName().trim(),
                request.getGender()
                        .trim()
                        .toUpperCase(Locale.ROOT),
                request.getAge(),
                request.getPhone().trim()
        );

        User savedUser = userRepository.save(user);

        return savedUser.getUserNum();
    }

    /**
     * 로그인
     */
    public LoginResponse login(LoginRequest request) {

        String userId = request.getUserId().trim();

        User user = userRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "아이디 또는 비밀번호가 올바르지 않습니다."
                        )
                );

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new IllegalArgumentException(
                    "아이디 또는 비밀번호가 올바르지 않습니다."
            );
        }

        String accessToken =
                jwtTokenProvider.createAccessToken(
                        user.getUserNum(),
                        user.getUserId(),
                        user.getRole()
                );

        return new LoginResponse(
                accessToken,
                user.getUserNum(),
                user.getUserId()
        );
    }
}