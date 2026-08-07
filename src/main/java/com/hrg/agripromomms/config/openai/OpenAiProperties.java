package com.hrg.agripromomms.config.openai;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * application.yml의 app.openai 설정값을 읽는 클래스입니다.
 *
 * API Key는 소스코드에 직접 작성하지 않고
 * Eclipse Run Configurations의 Environment에서 OPENAI_API_KEY로 전달합니다.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.openai")
public class OpenAiProperties {

    /** OpenAI API 기본 주소입니다. */
    private String baseUrl = "https://api.openai.com/v1";

    /**
     * 사용할 모델입니다.
     * 기본값은 사용자가 요청한 GPT-4.1입니다.
     */
    private String model = "gpt-4.1";

    /** Eclipse 환경변수 OPENAI_API_KEY에서 읽습니다. */
    private String apiKey;

    /** 한 번의 응답에서 허용할 최대 출력 토큰 수입니다. */
    private int maxOutputTokens = 1200;
}
