package com.farmms.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.image.GeneratedImageResponse;
import com.farmms.backend.dto.image.ImageDownloadResponse;
import com.farmms.backend.dto.image.ImageGenerateRequest;
import com.farmms.backend.service.image.GeneratedImageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * AI 농자재 홍보 이미지 요청을 처리하는 Controller입니다.
 */
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class GeneratedImageController {

    private final GeneratedImageService generatedImageService;

    /**
     * 로그인한 사용자가 소유한 이미지 목록을 조회합니다.
     */
    @GetMapping
    public ResponseEntity<List<GeneratedImageResponse>> findAll(
            @AuthenticationPrincipal Long userNum
    ) {
        List<GeneratedImageResponse> response =
                generatedImageService.findAll(userNum);

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인한 사용자가 소유한 이미지 한 개를 조회합니다.
     */
    @GetMapping("/{imageId}")
    public ResponseEntity<GeneratedImageResponse> findOne(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long imageId
    ) {
        GeneratedImageResponse response =
                generatedImageService.findOne(
                        userNum,
                        imageId
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 프롬프트를 이용해 AI 홍보 이미지를 생성합니다.
     *
     * 현재는 실제 AI 대신 Mock 이미지 생성기를 사용합니다.
     */
    @PostMapping
    public ResponseEntity<GeneratedImageResponse> generate(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody ImageGenerateRequest request
    ) {
        GeneratedImageResponse response =
                generatedImageService.generate(
                        userNum,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 이미지 다운로드 횟수를 1 증가시키고
     * 다운로드할 이미지 URL을 반환합니다.
     */
    @PostMapping("/{imageId}/download")
    public ResponseEntity<ImageDownloadResponse> download(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long imageId
    ) {
        ImageDownloadResponse response =
                generatedImageService.download(
                        userNum,
                        imageId
                );

        return ResponseEntity.ok(response);
    }
}