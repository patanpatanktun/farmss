package com.hrg.agripromomms.config.openai;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

/**
 * OpenAI Responses API 호출에 사용할 RestClient를 등록합니다.
 */
@Configuration
@EnableConfigurationProperties(OpenAiProperties.class)
public class OpenAiConfig {

    /**
     * OpenAI 전용 HTTP 클라이언트를 Spring Bean으로 등록합니다.
     *
     * Authorization 헤더는 Service에서 요청할 때 추가합니다.
     * 이렇게 하면 API Key가 설정되지 않았더라도 서버 자체는 실행할 수 있습니다.
     */
    @Bean
    public RestClient openAiRestClient(
            RestClient.Builder builder,
            OpenAiProperties properties) {

        return builder
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
