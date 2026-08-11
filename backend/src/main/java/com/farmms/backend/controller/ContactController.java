package com.farmms.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.farmms.backend.dto.contact.ContactUpdateRequest;
import com.farmms.backend.dto.contact.ContactCreateRequest;
import com.farmms.backend.dto.contact.ContactResponse;
import com.farmms.backend.service.contact.ContactService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    /**
     * 로그인한 판매업자의 고객을 등록합니다.
     */
    @PostMapping
    public ResponseEntity<ContactResponse> create(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody ContactCreateRequest request) {

        ContactResponse response =
                contactService.create(userNum, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 로그인한 판매업자의 고객을 지역과 재배 작물로 조회합니다.
     */
    @GetMapping
    public ResponseEntity<List<ContactResponse>> findAll(
            @AuthenticationPrincipal Long userNum,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String crop
    ) {
        List<ContactResponse> response =
                contactService.search(
                        userNum,
                        region,
                        crop
                );

        return ResponseEntity.ok(response);
    }
    
    /**
     * 로그인한 사용자의 고객 정보를 수정합니다.
     */
    @PatchMapping("/{conNum}")
    public ResponseEntity<ContactResponse> update(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long conNum,
            @Valid @RequestBody ContactUpdateRequest request
    ) {
        ContactResponse response =
                contactService.update(userNum, conNum, request);

        return ResponseEntity.ok(response);
    }
    
    /**
     * 로그인한 사용자의 고객 한 명을 조회합니다.
     */
    @GetMapping("/{conNum}")
    public ResponseEntity<ContactResponse> findOne(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long conNum
    ) {
        ContactResponse response =
                contactService.findOne(userNum, conNum);

        return ResponseEntity.ok(response);
    }
    
    /**
     * 로그인한 사용자의 고객을 삭제합니다.
     */
    @DeleteMapping("/{conNum}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long conNum
    ) {
        contactService.delete(userNum, conNum);

        return ResponseEntity.noContent().build();
    }
    
}