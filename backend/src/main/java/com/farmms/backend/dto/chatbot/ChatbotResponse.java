package com.farmms.backend.dto.chatbot;

public record ChatbotResponse(

        String message,

        String action,

        String buttonText,

        String target
) {
}