package com.hrg.agripromomms.controller;

import com.hrg.agripromomms.dto.ContactResponse;
import com.hrg.agripromomms.service.ContactQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** MMS 발송 대상 연락처를 조회하는 API입니다. */
@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactQueryService contactQueryService;

    @GetMapping
    public ResponseEntity<List<ContactResponse>> contacts(
            @RequestHeader("X-USER-NUM") Long userNum) {
        return ResponseEntity.ok(contactQueryService.getContacts(userNum));
    }
}
