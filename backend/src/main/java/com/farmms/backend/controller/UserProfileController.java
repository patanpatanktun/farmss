package com.farmms.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.user.AccountDeleteResult;
import com.farmms.backend.dto.user.CurrentPasswordRequest;
import com.farmms.backend.dto.user.DeleteAccountRequest;
import com.farmms.backend.dto.user.PasswordChangeRequest;
import com.farmms.backend.dto.user.UserProfileResponse;
import com.farmms.backend.dto.user.UserProfileUpdateRequest;
import com.farmms.backend.service.image.GeneratedImageStorageService;
import com.farmms.backend.service.product.ProductImageStorageService;
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

    private final UserProfileService
            userProfileService;

    private final ProductImageStorageService
            productImageStorageService;

    private final GeneratedImageStorageService
            generatedImageStorageService;

    /**
     * 내 회원정보를 조회합니다.
     */
    @GetMapping
    public ResponseEntity<UserProfileResponse>
    findMyProfile(
            @AuthenticationPrincipal Long userNum
    ) {
        UserProfileResponse response =
                userProfileService
                        .findMyProfile(
                                userNum
                        );

        return ResponseEntity.ok(response);
    }

    /**
     * 회원정보 수정 전 현재 비밀번호를 확인합니다.
     */
    @PostMapping("/password/verify")
    public ResponseEntity<Void>
    verifyCurrentPassword(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody
            CurrentPasswordRequest request
    ) {
        userProfileService
                .verifyCurrentPassword(
                        userNum,
                        request
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    /**
     * 내 기본정보를 수정합니다.
     */
    @PatchMapping
    public ResponseEntity<UserProfileResponse>
    updateProfile(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody
            UserProfileUpdateRequest request
    ) {
        UserProfileResponse response =
                userProfileService
                        .updateProfile(
                                userNum,
                                request
                        );

        return ResponseEntity.ok(response);
    }

    /**
     * 내 비밀번호를 변경합니다.
     */
    @PatchMapping("/password")
    public ResponseEntity<Void>
    changePassword(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody
            PasswordChangeRequest request
    ) {
        userProfileService.changePassword(
                userNum,
                request
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    /**
     * 현재 비밀번호를 확인한 후 회원과
     * 모든 연관 데이터를 삭제합니다.
     *
     * DB 삭제가 완료되면 서버에 저장된
     * 실제 이미지 파일도 함께 삭제합니다.
     */
    @DeleteMapping
    public ResponseEntity<Void>
    deleteMyAccount(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody
            DeleteAccountRequest request
    ) {
        /*
         * 회원 및 연관 DB 데이터를 먼저 삭제하고
         * 실제 파일 주소 목록을 반환받습니다.
         */
        AccountDeleteResult deleteResult =
                userProfileService
                        .deleteMyAccount(
                                userNum,
                                request
                        );

        /*
         * 회원이 등록했던 상품 참고 이미지를
         * 실제 서버 폴더에서 삭제합니다.
         */
        for (
                String referenceImageUrl :
                deleteResult.referenceImageUrls()
        ) {
            productImageStorageService.delete(
                    referenceImageUrl
            );
        }

        /*
         * 회원이 OpenAI로 생성한 이미지들을
         * 실제 서버 폴더에서 삭제합니다.
         *
         * Mock 외부 이미지 URL은 StorageService에서
         * 자동으로 무시됩니다.
         */
        for (
                String generatedImageUrl :
                deleteResult.generatedImageUrls()
        ) {
            generatedImageStorageService.delete(
                    generatedImageUrl
            );
        }

        return ResponseEntity
                .noContent()
                .build();
    }
}