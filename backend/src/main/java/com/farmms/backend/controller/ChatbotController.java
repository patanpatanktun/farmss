package com.farmms.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.chatbot.ChatbotRequest;
import com.farmms.backend.dto.chatbot.ChatbotResponse;
import com.farmms.backend.service.chatbot.ChatbotService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    /**
     * 사용자의 챗봇 질문을 처리합니다.
     */
    @PostMapping
    public ResponseEntity<ChatbotResponse> ask(
            @Valid @RequestBody
            ChatbotRequest request
    ) {

        ChatbotResponse response =
                chatbotService.ask(
                        request.message()
                );

        return ResponseEntity.ok(response);
    }
}