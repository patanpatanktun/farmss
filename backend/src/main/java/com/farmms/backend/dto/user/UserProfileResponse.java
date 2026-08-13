package com.farmms.backend.dto.user;

import java.time.LocalDateTime;

import com.farmms.backend.domain.user.User;

public record UserProfileResponse(
        Long userNum,
        String userId,
        String email,
        String name,
        String gender,
        Integer age,
        String phone,
        LocalDateTime joinDate,
        String role
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getUserNum(),
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getGender(),
                user.getAge(),
                user.getPhone(),
                user.getJoinDate(),
                user.getRole()
        );
    }
}
