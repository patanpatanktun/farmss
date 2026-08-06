package com.farmms.backend.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.user.User;
import com.farmms.backend.domain.user.UserRepository;
import com.farmms.backend.dto.auth.LoginRequest;
import com.farmms.backend.dto.auth.LoginResponse;
import com.farmms.backend.security.jwt.JwtTokenProvider;
import com.farmms.backend.dto.auth.SignUpRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenProvider jwtTokenProvider;
    

    @Transactional
    public Long signUp(SignUpRequest request) {

        if (userRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String encodedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = User.create(
                request.getUserId(),
                encodedPassword,
                request.getEmail(),
                request.getName(),
                request.getGender(),
                request.getAge(),
                request.getPhone()
        );

        User savedUser = userRepository.save(user);

        return savedUser.getUserNum();
    }
    
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUserId(request.getUserId())
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

        String accessToken = jwtTokenProvider.createAccessToken(
                user.getUserNum(),
                user.getUserId()
        );

        return new LoginResponse(
                accessToken,
                user.getUserNum(),
                user.getUserId()
        );
    }
    
}