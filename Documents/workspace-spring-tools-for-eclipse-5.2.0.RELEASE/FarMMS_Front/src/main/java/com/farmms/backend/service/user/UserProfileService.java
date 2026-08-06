package com.farmms.backend.service.user;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.common.util.PhoneNumberUtils;
import com.farmms.backend.domain.user.User;
import com.farmms.backend.domain.user.UserRepository;
import com.farmms.backend.dto.user.PasswordChangeRequest;
import com.farmms.backend.dto.user.UserProfileResponse;
import com.farmms.backend.dto.user.UserProfileUpdateRequest;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 로그인한 사용자의 회원정보를 조회합니다.
     */
    public UserProfileResponse findMyProfile(Long userNum) {

        User user = findUser(userNum);

        return UserProfileResponse.from(user);
    }

    /**
     * 로그인한 사용자의 기본정보를 수정합니다.
     */
    @Transactional
    public UserProfileResponse updateProfile(
            Long userNum,
            UserProfileUpdateRequest request
    ) {
        User user = findUser(userNum);

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        // 현재 사용자를 제외한 다른 회원의 이메일과 중복되는지 확인합니다.
        if (userRepository.existsByEmailAndUserNumNot(
                email,
                userNum
        )) {
            throw new IllegalArgumentException(
                    "이미 사용 중인 이메일입니다."
            );
        }

        String normalizedPhone =
                PhoneNumberUtils.normalize(
                        request.phone()
                );

        user.updateProfile(
                email,
                request.name().trim(),
                request.gender()
                        .trim()
                        .toUpperCase(Locale.ROOT),
                request.age(),
                normalizedPhone
        );

        return UserProfileResponse.from(user);
    }

    /**
     * 현재 비밀번호를 확인한 후 새 비밀번호로 변경합니다.
     */
    @Transactional
    public void changePassword(
            Long userNum,
            PasswordChangeRequest request
    ) {
        User user = findUser(userNum);

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "현재 비밀번호가 일치하지 않습니다."
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "새 비밀번호는 현재 비밀번호와 달라야 합니다."
            );
        }

        String encodedPassword =
                passwordEncoder.encode(
                        request.newPassword()
                );

        user.changePassword(encodedPassword);
    }

    /**
     * 회원번호로 사용자를 조회합니다.
     */
    private User findUser(Long userNum) {

        return userRepository
                .findById(userNum)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "회원 정보를 찾을 수 없습니다."
                        ));
    }
}