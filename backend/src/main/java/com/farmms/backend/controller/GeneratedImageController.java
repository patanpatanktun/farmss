package com.farmms.backend.controller;

import java.util.List;

import com.farmms.backend.dto.image.ImageGenerateAcceptedResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.image.GeneratedImageResponse;
import com.farmms.backend.dto.image.ImageDownloadResponse;
import com.farmms.backend.dto.image.ImageGenerateRequest;
import com.farmms.backend.dto.image.ImageRegenerateRequest;
import com.farmms.backend.dto.image.ImageRegenerateResponse;
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

    private final GeneratedImageService
            generatedImageService;

    /**
     * 로그인한 사용자가 소유한
     * 이미지 목록을 조회합니다.
     */
    @GetMapping
    public ResponseEntity<List<GeneratedImageResponse>> findAll(
            @AuthenticationPrincipal Long userNum
    ) {

        List<GeneratedImageResponse> response =
                generatedImageService.findAll(
                        userNum
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인한 사용자가 소유한
     * 이미지 한 개를 조회합니다.
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
     * 새로운 AI 홍보 이미지 생성 요청을 접수합니다.
     *
     * 실제 OpenAI 이미지 생성은
     * 백그라운드에서 처리됩니다.
     *
     * 따라서 이미지 생성 완료를 기다리지 않고
     * HTTP 202 Accepted를 즉시 반환합니다.
     */
    @PostMapping
    public ResponseEntity<ImageGenerateAcceptedResponse> generate(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody ImageGenerateRequest request
    ) {

        ImageGenerateAcceptedResponse response =
                generatedImageService.generate(
                        userNum,
                        request
                );

        return ResponseEntity
                .accepted()
                .body(response);
    }

    /**
     * 기존 생성 이미지를 기반으로
     * 사용자가 입력한 수정 요청을 반영하여
     * 새로운 이미지를 재생성합니다.
     *
     * 예:
     *
     * 기존 이미지:
     * 판매가격 35,000원
     *
     * 수정 요청:
     * "35,000원을 25,000원으로 변경해주세요."
     *
     * 결과:
     * 기존 디자인을 최대한 유지하면서
     * 판매가격이 25,000원으로 변경된
     * 새로운 이미지가 생성됩니다.
     *
     * 기존 이미지는 삭제하거나 덮어쓰지 않습니다.
     */
    @PostMapping("/regenerate")
    public ResponseEntity<ImageRegenerateResponse> regenerate(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody ImageRegenerateRequest request
    ) {

        ImageRegenerateResponse response =
                generatedImageService.regenerate(
                        userNum,
                        request
                );

        /*
         * 재생성을 통해 새로운 이미지가 생성되므로
         * HTTP 201 CREATED를 반환합니다.
         */
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

    /**
     * 로그인한 회원이 소유한
     * 생성 이미지를 삭제합니다.
     *
     * MMS 발송 이력이 있는 이미지는
     * 삭제할 수 없습니다.
     */
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long imageId
    ) {

        generatedImageService.delete(
                userNum,
                imageId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}