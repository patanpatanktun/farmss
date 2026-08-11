package com.farmms.backend.dto.auth;

import lombok.Getter;

@Getter
public class LoginResponse {

    private final String accessToken;
    private final String tokenType;
    private final Long userNum;
    private final String userId;

    public LoginResponse(
            String accessToken,
            Long userNum,
            String userId) {

        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.userNum = userNum;
        this.userId = userId;
    }
}