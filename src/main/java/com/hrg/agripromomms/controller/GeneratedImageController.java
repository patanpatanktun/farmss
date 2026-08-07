package com.hrg.agripromomms.controller;

import com.hrg.agripromomms.dto.GeneratedImageResponse;
import com.hrg.agripromomms.service.GeneratedImageQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** MMS에 첨부할 AI 생성 이미지 목록을 조회합니다. */
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class GeneratedImageController {

    private final GeneratedImageQueryService generatedImageQueryService;

    @GetMapping
    public ResponseEntity<List<GeneratedImageResponse>> images(
            @RequestHeader("X-USER-NUM") Long userNum) {
        return ResponseEntity.ok(generatedImageQueryService.getImages(userNum));
    }
}
