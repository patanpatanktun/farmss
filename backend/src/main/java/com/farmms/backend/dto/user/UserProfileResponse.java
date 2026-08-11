package com.farmms.backend.dto.user;

import java.time.LocalDateTime;

import com.farmms.backend.domain.user.User;

/**
 * 로그인한 사용자의 회원정보를 반환하는 DTO입니다.
 */
public record UserProfileResponse(

        Long userNum,
        String userId,
        String email,
        String name,
        String gender,
        Integer age,
        String phone,
        LocalDateTime joinDate

) {

    /**
     * User Entity를 회원정보 응답 DTO로 변환합니다.
     */
    public static UserProfileResponse from(User user) {

        return new UserProfileResponse(
                user.getUserNum(),
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getGender(),
                user.getAge(),
                user.getPhone(),
                user.getJoinDate()
        );
    }
}