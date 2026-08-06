package com.farmms.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.user.PasswordChangeRequest;
import com.farmms.backend.dto.user.UserProfileResponse;
import com.farmms.backend.dto.user.UserProfileUpdateRequest;
import com.farmms.backend.service.user.UserProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 로그인한 사용자의 회원정보 요청을 처리합니다.
 */
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * 내 회원정보를 조회합니다.
     */
    @GetMapping
    public ResponseEntity<UserProfileResponse> findMyProfile(
            @AuthenticationPrincipal Long userNum
    ) {
        UserProfileResponse response =
                userProfileService.findMyProfile(userNum);

        return ResponseEntity.ok(response);
    }

    /**
     * 내 기본정보를 수정합니다.
     */
    @PatchMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        UserProfileResponse response =
                userProfileService.updateProfile(
                        userNum,
                        request
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 내 비밀번호를 변경합니다.
     */
    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        userProfileService.changePassword(
                userNum,
                request
        );

        return ResponseEntity.noContent().build();
    }
}