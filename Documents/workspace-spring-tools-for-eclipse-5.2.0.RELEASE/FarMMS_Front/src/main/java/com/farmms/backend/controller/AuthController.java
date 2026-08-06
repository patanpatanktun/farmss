package com.farmms.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;

import com.farmms.backend.dto.auth.LoginResponse;
import com.farmms.backend.dto.auth.LoginRequest;
import com.farmms.backend.dto.auth.SignUpRequest;
import com.farmms.backend.service.auth.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signUp(
            @Valid @RequestBody SignUpRequest request) {

        Long userNum = authService.signUp(request);

        Map<String, Object> response = Map.of(
                "message", "회원가입이 완료되었습니다.",
                "userNum", userNum
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal Long userNum) {

        Map<String, Object> response = Map.of(
                "message", "인증된 사용자입니다.",
                "userNum", userNum
        );

        return ResponseEntity.ok(response);
    }
    
}