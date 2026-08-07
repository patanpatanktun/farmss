package com.hrg.agripromomms.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrg.agripromomms.common.exception.OpenAiApiException;
import com.hrg.agripromomms.config.openai.OpenAiProperties;
import com.hrg.agripromomms.domain.user.UserRepository;
import com.hrg.agripromomms.dto.ai.AiPromotionRequest;
import com.hrg.agripromomms.dto.ai.AiPromotionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.NumberFormat;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * OpenAI API를 이용해 농자재 홍보 콘텐츠를 생성합니다.
 *
 * 처리 순서:
 * 1. GPT-4.1로 MMS 제목, 본문, 이미지 프롬프트 생성
 * 2. generateImage가 true이면 OpenAI 이미지 API 호출
 * 3. 이미지 API가 반환한 Base64 데이터를 PNG로 변환
 * 4. uploads/generated 폴더에 실제 이미지 파일 저장
 * 5. 생성된 이미지 URL을 응답에 포함
 */
@Service
@RequiredArgsConstructor
public class OpenAiPromotionService {

    /**
     * OpenAI API 호출에 사용하는 RestClient입니다.
     *
     * OpenAiConfig에서 기본 주소가
     * https://api.openai.com/v1로 설정되어 있어야 합니다.
     */
    private final RestClient openAiRestClient;

    /**
     * application.yml의 app.openai 설정을 읽습니다.
     */
    private final OpenAiProperties openAiProperties;

    /**
     * OpenAI가 반환한 JSON을 Java 객체로 바꿀 때 사용합니다.
     */
    private final ObjectMapper objectMapper;

    /**
     * 요청한 user_num이 실제 회원인지 확인합니다.
     */
    private final UserRepository userRepository;

    /**
     * 홍보 문구와 실제 홍보 이미지를 생성합니다.
     *
     * @param userNum 로그인한 판매업자의 user_num
     * @param request 상품 정보와 이미지 생성 옵션
     * @return MMS 제목, 본문, 프롬프트, 이미지 URL
     */
    @Transactional(readOnly = true)
    public AiPromotionResponse generatePromotion(
            Long userNum,
            AiPromotionRequest request) {

        // 1. 요청한 회원이 DB에 존재하는지 확인합니다.
        if (!userRepository.existsById(userNum)) {
            throw new IllegalArgumentException(
                    "회원 번호 " + userNum + "을 찾을 수 없습니다.");
        }

        // 2. OPENAI_API_KEY가 등록되어 있는지 확인합니다.
        validateApiKey();

        try {
            // 3. GPT-4.1로 제목, 본문, 이미지 프롬프트를 생성합니다.
            PromotionContent content = generateTextContent(request);

            /*
             * generateImage가 false라면 아래 값은 null로 반환됩니다.
             */
            String imageUrl = null;
            String imageFileName = null;
            String imageModel = null;

            // 4. 이미지 생성 요청이 true일 때만 실제 이미지를 만듭니다.
            if (request.shouldGenerateImage()) {

                SavedImage savedImage = generateAndSaveImage(
                        content.imagePrompt(),
                        request.resolvedImageSize());

                // 저장된 실제 파일명
                imageFileName = savedImage.fileName();

                // 브라우저에서 이미지를 확인할 URL
                imageUrl = buildImageUrl(imageFileName);

                // 이미지 생성에 사용한 모델명
                imageModel = openAiProperties.getImageModel();
            }

            // 5. 텍스트 생성 결과와 이미지 결과를 함께 반환합니다.
            return new AiPromotionResponse(
                    content.mmsTitle(),
                    content.mmsContent(),
                    content.imagePrompt(),
                    openAiProperties.getModel(),
                    imageUrl,
                    imageFileName,
                    imageModel);

        } catch (JsonProcessingException ex) {

            // GPT가 반환한 문자열을 PromotionContent로 변환하지 못한 경우
            throw new OpenAiApiException(
                    "OpenAI 텍스트 응답 JSON을 해석하지 못했습니다.",
                    ex);

        } catch (IOException ex) {

            // 생성된 이미지 파일을 컴퓨터에 저장하지 못한 경우
            throw new OpenAiApiException(
                    "생성된 이미지 파일을 서버에 저장하지 못했습니다.",
                    ex);

        } catch (OpenAiApiException ex) {

            // 이미 OpenAI 관련 오류로 변환된 경우 그대로 전달
            throw ex;

        } catch (Exception ex) {

            // 그 외 예상하지 못한 오류
            throw new OpenAiApiException(
                    "OpenAI API 처리 중 예상하지 못한 오류가 발생했습니다.",
                    ex);
        }
    }

    /**
     * 기존 GPT-4.1 Responses API를 호출합니다.
     *
     * 생성 결과:
     * - mmsTitle
     * - mmsContent
     * - imagePrompt
     */
    private PromotionContent generateTextContent(
            AiPromotionRequest request)
            throws JsonProcessingException {

        // 상품 정보를 GPT가 읽을 문자열로 변환합니다.
        String input = buildUserInput(request);

        // Responses API 요청 Body를 생성합니다.
        Map<String, Object> requestBody =
                buildResponsesApiRequest(input);

        try {
            JsonNode apiResponse = openAiRestClient.post()

                    // 실제 주소:
                    // https://api.openai.com/v1/responses
                    .uri("/responses")

                    // OpenAI API Key 전달
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + openAiProperties.getApiKey())

                    // JSON 요청 Body 전달
                    .body(requestBody)

                    // API 호출
                    .retrieve()

                    // 결과를 JsonNode로 받음
                    .body(JsonNode.class);

            // Responses API 결과에서 output_text를 찾습니다.
            String outputText =
                    extractOutputText(apiResponse);

            // JSON 문자열을 PromotionContent record로 변환합니다.
            return objectMapper.readValue(
                    outputText,
                    PromotionContent.class);

        } catch (RestClientResponseException ex) {

            throw convertOpenAiHttpError(
                    ex,
                    "홍보 문구 생성",
                    openAiProperties.getModel());
        }
    }

    /**
     * OpenAI 이미지 API를 호출하고 결과를 PNG 파일로 저장합니다.
     *
     * 실제 요청 주소:
     * POST https://api.openai.com/v1/images/generations
     *
     * @param prompt GPT-4.1이 만든 이미지 프롬프트
     * @param size 생성할 이미지 크기
     * @return 저장된 이미지 파일 정보
     */
    private SavedImage generateAndSaveImage(
            String prompt,
            String size)
            throws IOException {

        // 1. 이미지 API에 전달할 JSON Body를 만듭니다.
        Map<String, Object> requestBody =
                new LinkedHashMap<>();

        // 이미지 생성 모델
        requestBody.put(
                "model",
                openAiProperties.getImageModel());

        // GPT-4.1이 만든 이미지 프롬프트
        requestBody.put(
                "prompt",
                prompt);

        // 이미지 크기
        requestBody.put(
                "size",
                size);

        // 이미지 품질
        requestBody.put(
                "quality",
                openAiProperties.getImageQuality());

        // PNG 형식으로 결과 요청
        requestBody.put(
                "output_format",
                "png");

        final JsonNode apiResponse;

        try {
            // 2. OpenAI 이미지 생성 API를 호출합니다.
            apiResponse = openAiRestClient.post()

                    // 실제 주소:
                    // https://api.openai.com/v1/images/generations
                    .uri("/images/generations")

                    // OpenAI API 인증
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + openAiProperties.getApiKey())

                    // 요청 Body
                    .body(requestBody)

                    // API 호출
                    .retrieve()

                    // JSON 응답
                    .body(JsonNode.class);

        } catch (RestClientResponseException ex) {

            throw convertOpenAiHttpError(
                    ex,
                    "이미지 생성",
                    openAiProperties.getImageModel());
        }

        // 3. 응답의 data[0].b64_json에서 Base64 문자열을 가져옵니다.
        String base64Image =
                extractImageBase64(apiResponse);

        final byte[] imageBytes;

        try {
            // 4. Base64 문자열을 실제 PNG 바이트로 변환합니다.
            imageBytes = Base64
                    .getDecoder()
                    .decode(base64Image);

        } catch (IllegalArgumentException ex) {

            throw new OpenAiApiException(
                    "OpenAI 이미지 데이터를 Base64로 변환하지 못했습니다.",
                    ex);
        }

        // 5. 이미지 저장 폴더 경로를 만듭니다.
        Path outputDirectory = Paths
                .get(openAiProperties.getImageOutputDir())
                .toAbsolutePath()
                .normalize();

        // uploads/generated 폴더가 없다면 자동으로 생성합니다.
        Files.createDirectories(outputDirectory);

        // 6. 중복되지 않는 이미지 파일명을 만듭니다.
        String fileName =
                "promo-" + UUID.randomUUID() + ".png";

        // 7. 전체 파일 저장 경로를 만듭니다.
        Path filePath = outputDirectory
                .resolve(fileName)
                .normalize();

        // 8. 실제 PNG 파일을 컴퓨터에 저장합니다.
        Files.write(
                filePath,
                imageBytes);

        return new SavedImage(
                fileName,
                filePath.toString());
    }

    /**
     * OpenAI 이미지 API 응답에서 Base64 이미지 데이터를 추출합니다.
     *
     * 예상 응답:
     *
     * {
     *   "data": [
     *     {
     *       "b64_json": "Base64 이미지 데이터"
     *     }
     *   ]
     * }
     */
    private String extractImageBase64(
            JsonNode apiResponse) {

        if (apiResponse == null) {
            throw new OpenAiApiException(
                    "OpenAI 이미지 API 응답이 비어 있습니다.");
        }

        JsonNode dataArray =
                apiResponse.path("data");

        if (!dataArray.isArray()
                || dataArray.isEmpty()) {

            throw new OpenAiApiException(
                    "OpenAI 이미지 응답에서 data 배열을 찾을 수 없습니다.");
        }

        String base64Image = dataArray
                .get(0)
                .path("b64_json")
                .asText();

        if (base64Image == null
                || base64Image.isBlank()) {

            throw new OpenAiApiException(
                    "OpenAI 이미지 응답에서 b64_json을 찾을 수 없습니다.");
        }

        return base64Image;
    }

    /**
     * 저장된 이미지를 조회할 URL을 만듭니다.
     *
     * 예:
     * http://localhost:8082/api/ai/images/promo-xxxx.png
     */
    private String buildImageUrl(
            String fileName) {

        String baseUrl =
                openAiProperties.getPublicBaseUrl();

        // 설정값이 비어 있다면 로컬 주소를 사용합니다.
        if (baseUrl == null
                || baseUrl.isBlank()) {

            baseUrl =
                    "http://localhost:8082";
        }

        // 마지막의 /를 제거해 //가 생기지 않도록 합니다.
        while (baseUrl.endsWith("/")) {

            baseUrl = baseUrl.substring(
                    0,
                    baseUrl.length() - 1);
        }

        return baseUrl
                + "/api/ai/images/"
                + fileName;
    }

    /**
     * OpenAI HTTP 오류를 사용자가 이해할 메시지로 변경합니다.
     */
    private OpenAiApiException convertOpenAiHttpError(
            RestClientResponseException ex,
            String operation,
            String model) {

        int statusCode =
                ex.getStatusCode().value();

        String message = switch (statusCode) {

            case 400 ->
                    operation
                            + " 요청값이 올바르지 않습니다. "
                            + "모델명, 프롬프트, 이미지 크기를 확인하세요.";

            case 401 ->
                    "OpenAI API Key가 올바르지 않습니다.";

            case 403 ->
                    "현재 OpenAI 프로젝트에 "
                            + model
                            + " 모델 사용 권한이 없습니다.";

            case 404 ->
                    "요청한 OpenAI 모델을 찾을 수 없습니다: "
                            + model;

            case 429 ->
                    "OpenAI API 사용량 또는 요청 한도를 초과했습니다.";

            default ->
                    operation
                            + " API 호출에 실패했습니다. HTTP 상태: "
                            + statusCode;
        };

        return new OpenAiApiException(
                message,
                ex);
    }

    /**
     * API Key가 환경변수에서 정상적으로 들어왔는지 확인합니다.
     */
    private void validateApiKey() {

        String apiKey =
                openAiProperties.getApiKey();

        if (apiKey == null
                || apiKey.isBlank()) {

            throw new IllegalStateException(
                    "OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
        }
    }

    /**
     * Responses API 요청 본문을 생성합니다.
     *
     * JSON Schema를 이용해 GPT 응답에 반드시
     * mmsTitle, mmsContent, imagePrompt가 포함되도록 합니다.
     */
    private Map<String, Object> buildResponsesApiRequest(
            String input) {

        Map<String, Object> properties =
                new LinkedHashMap<>();

        properties.put(
                "mmsTitle",
                Map.of(
                        "type",
                        "string",

                        "description",
                        "농자재 홍보 MMS 제목. 30자 이내의 자연스러운 한국어"));

        properties.put(
                "mmsContent",
                Map.of(
                        "type",
                        "string",

                        "description",
                        "농가 고객에게 보낼 홍보 본문. 500자 이내의 자연스러운 한국어"));

        properties.put(
                "imagePrompt",
                Map.of(
                        "type",
                        "string",

                        "description",
                        "이미지 생성 모델에 전달할 상세한 한국어 이미지 프롬프트"));

        Map<String, Object> schema =
                new LinkedHashMap<>();

        schema.put(
                "type",
                "object");

        schema.put(
                "properties",
                properties);

        schema.put(
                "required",
                List.of(
                        "mmsTitle",
                        "mmsContent",
                        "imagePrompt"));

        schema.put(
                "additionalProperties",
                false);

        Map<String, Object> format =
                new LinkedHashMap<>();

        format.put(
                "type",
                "json_schema");

        format.put(
                "name",
                "agri_promotion_content");

        format.put(
                "description",
                "농자재 판매점용 MMS 문구와 이미지 프롬프트");

        format.put(
                "strict",
                true);

        format.put(
                "schema",
                schema);

        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(
                "model",
                openAiProperties.getModel());

        body.put(
                "instructions",
                buildInstructions());

        body.put(
                "input",
                input);

        body.put(
                "max_output_tokens",
                openAiProperties.getMaxOutputTokens());

        body.put(
                "store",
                false);

        body.put(
                "text",
                Map.of(
                        "format",
                        format));

        return body;
    }

    /**
     * GPT-4.1이 지켜야 할 홍보 문구 작성 규칙입니다.
     */
    private String buildInstructions() {

        return """
                당신은 한국의 소규모 농자재 판매점을 위한 홍보 콘텐츠 작성 도우미입니다.
                입력된 상품 정보만 사용해 MMS 제목, MMS 본문,
                이미지 생성용 프롬프트를 작성하세요.

                필수 규칙:
                1. 사실로 제공되지 않은 효능, 인증, 할인율, 재고, 행사기간은 만들지 마세요.
                2. 농약·비료 사용법이나 안전수칙을 임의로 추가하지 마세요.
                3. 과장되거나 확정적인 효과 표현을 피하세요.
                4. MMS 제목은 한국어 30자 이내로 작성하세요.
                5. MMS 본문은 한국어 500자 이내로 작성하세요.
                6. 이미지 프롬프트에는 상품명, 대상 작물, 분위기,
                   구도, 배경, 읽기 쉬운 광고 디자인을 포함하세요.
                7. 이미지 안에 정확한 한글 문구를 직접 그리라고 요구하기보다,
                   홍보 문구를 나중에 넣을 수 있는 여백을 포함하세요.
                8. 개인정보, 전화번호, API Key는 결과에 포함하지 마세요.
                9. 농자재 상품이 잘 보이는 깔끔하고 신뢰감 있는 광고 구도를 사용하세요.
                """;
    }

    /**
     * 사용자가 입력한 상품 정보를 GPT가 이해할 문자열로 변환합니다.
     */
    private String buildUserInput(
            AiPromotionRequest request) {

        String formattedPrice =
                request.price() == null

                        ? "미입력"

                        : NumberFormat
                                .getNumberInstance(Locale.KOREA)
                                .format(request.price())
                                + "원";

        return """
                [상품 정보]
                상품명: %s
                카테고리: %s
                가격: %s
                제조사: %s
                대상 작물: %s
                상품 설명: %s

                [홍보 조건]
                대상 고객: %s
                홍보 목적: %s
                원하는 문체: %s
                추가 요청: %s
                """.formatted(

                request.productName(),

                request.category(),

                formattedPrice,

                valueOrDefault(
                        request.company(),
                        "미입력"),

                valueOrDefault(
                        request.crop(),
                        "미입력"),

                valueOrDefault(
                        request.productDescription(),
                        "미입력"),

                request.targetCustomer(),

                request.promotionPurpose(),

                valueOrDefault(
                        request.tone(),
                        "친근하고 신뢰감 있게"),

                valueOrDefault(
                        request.additionalRequest(),
                        "없음"));
    }

    /**
     * null 또는 빈 문자열을 기본값으로 바꿉니다.
     */
    private String valueOrDefault(
            String value,
            String defaultValue) {

        return value == null
                || value.isBlank()

                ? defaultValue
                : value;
    }

    /**
     * Responses API의 output 배열에서 output_text를 추출합니다.
     */
    private String extractOutputText(
            JsonNode apiResponse) {

        if (apiResponse == null) {

            throw new OpenAiApiException(
                    "OpenAI API 응답이 비어 있습니다.");
        }

        JsonNode outputArray =
                apiResponse.path("output");

        if (!outputArray.isArray()) {

            throw new OpenAiApiException(
                    "OpenAI 응답에서 output 배열을 찾을 수 없습니다.");
        }

        for (JsonNode outputItem
                : outputArray) {

            JsonNode contentArray =
                    outputItem.path("content");

            if (!contentArray.isArray()) {
                continue;
            }

            for (JsonNode contentItem
                    : contentArray) {

                if ("output_text".equals(
                        contentItem
                                .path("type")
                                .asText())) {

                    String text =
                            contentItem
                                    .path("text")
                                    .asText();

                    if (!text.isBlank()) {
                        return text;
                    }
                }
            }
        }

        throw new OpenAiApiException(
                "OpenAI 응답에서 생성된 텍스트를 찾을 수 없습니다.");
    }

    /**
     * GPT-4.1의 구조화된 결과를 담는 내부 record입니다.
     */
    private record PromotionContent(
            String mmsTitle,
            String mmsContent,
            String imagePrompt) {
    }

    /**
     * 저장된 이미지 정보를 담는 내부 record입니다.
     */
    private record SavedImage(
            String fileName,
            String fullPath) {
    }
}