package com.farmms.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.contactgroup.ContactGroupCreateRequest;
import com.farmms.backend.dto.contactgroup.ContactGroupResponse;
import com.farmms.backend.dto.contactgroup.ContactGroupUpdateRequest;
import com.farmms.backend.service.contactgroup.ContactGroupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contact-groups")
@RequiredArgsConstructor
public class ContactGroupController {

    private final ContactGroupService contactGroupService;

    /**
     * 고객 그룹을 등록합니다.
     */
    @PostMapping
    public ResponseEntity<ContactGroupResponse> create(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody ContactGroupCreateRequest request
    ) {
        ContactGroupResponse response =
                contactGroupService.create(userNum, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 고객 그룹 목록을 조회합니다.
     */
    @GetMapping
    public ResponseEntity<List<ContactGroupResponse>> findAll(
            @AuthenticationPrincipal Long userNum
    ) {
        return ResponseEntity.ok(
                contactGroupService.findAll(userNum)
        );
    }

    /**
     * 고객 그룹 한 개를 조회합니다.
     */
    @GetMapping("/{groupNum}")
    public ResponseEntity<ContactGroupResponse> findOne(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long groupNum
    ) {
        return ResponseEntity.ok(
                contactGroupService.findOne(userNum, groupNum)
        );
    }

    /**
     * 고객 그룹을 수정합니다.
     */
    @PatchMapping("/{groupNum}")
    public ResponseEntity<ContactGroupResponse> update(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long groupNum,
            @Valid @RequestBody ContactGroupUpdateRequest request
    ) {
        return ResponseEntity.ok(
                contactGroupService.update(
                        userNum,
                        groupNum,
                        request
                )
        );
    }

    /**
     * 고객 그룹을 삭제합니다.
     */
    @DeleteMapping("/{groupNum}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long groupNum
    ) {
        contactGroupService.delete(userNum, groupNum);

        return ResponseEntity.noContent().build();
    }
}