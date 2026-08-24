package com.farmms.backend.gateway.image;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmms.backend.service.image.GeneratedImageStorageService;
import com.farmms.backend.service.product.ProductImageStorageService;

/**
 * OpenAI 이미지 생성 API를 사용하는 실제 구현체입니다.
 *
 * 참고 이미지가 없으면 images/generations API를 사용하고,
 * 참고 이미지가 있으면 images/edits API를 사용합니다.
 *
 * 상품 참고 이미지는 NCP Object Storage에서 서버 권한으로 읽어
 * OpenAI에 multipart 파일로 전달할 수 있습니다.
 */
@Component
@ConditionalOnProperty(
        name = "farmms.image.provider",
        havingValue = "openai"
)
public class OpenAiImageGenerationGateway
        implements ImageGenerationGateway {

    private final String apiKey;
    private final String baseUrl;
    private final String imageModel;
    private final Duration requestTimeout;

    /*
     * 과거 로컬 저장 방식과의 호환성을 위해 유지합니다.
     * 예: /uploads/products/product.png
     */
    private final Path productUploadDirectory;

    private final ObjectMapper objectMapper;

    private final GeneratedImageStorageService
            generatedImageStorageService;

    private final ProductImageStorageService
            productImageStorageService;

    private final HttpClient httpClient;

    public OpenAiImageGenerationGateway(
            @Value("${openai.api-key}")
            String apiKey,

            @Value(
                    "${openai.base-url:"
                    + "https://api.openai.com/v1}"
            )
            String baseUrl,

            @Value(
                    "${openai.image-model:"
                    + "gpt-image-2}"
            )
            String imageModel,

            @Value(
                    "${openai.timeout-seconds:180}"
            )
            long timeoutSeconds,

            @Value(
                    "${app.upload.product-directory:"
                    + "uploads/products}"
            )
            String productUploadDirectory,

            ObjectMapper objectMapper,

            GeneratedImageStorageService
                    generatedImageStorageService,

            ProductImageStorageService
                    productImageStorageService
    ) {
        if (
                apiKey == null ||
                apiKey.isBlank()
        ) {
            throw new IllegalStateException(
                    "OPENAI_API_KEY 환경변수가 설정되지 않았습니다."
            );
        }

        this.apiKey = apiKey.trim();
        this.baseUrl =
                removeTrailingSlash(baseUrl);
        this.imageModel = imageModel.trim();

        this.requestTimeout =
                Duration.ofSeconds(
                        Math.max(timeoutSeconds, 30)
                );

        this.productUploadDirectory =
                Path.of(productUploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        this.objectMapper = objectMapper;

        this.generatedImageStorageService =
                generatedImageStorageService;

        this.productImageStorageService =
                productImageStorageService;

        this.httpClient =
                HttpClient.newBuilder()
                        .connectTimeout(
                                Duration.ofSeconds(30)
                        )
                        .followRedirects(
                                HttpClient.Redirect.NORMAL
                        )
                        .build();
    }

    /**
     * 참고 이미지 존재 여부에 따라
     * 이미지 생성 또는 이미지 편집 API를 호출합니다.
     */
    @Override
    public String generate(
            String promptText,
            String referenceImageUrl
    ) {
        validatePrompt(promptText);

        String base64Image;

        if (
                referenceImageUrl == null ||
                referenceImageUrl.isBlank()
        ) {
            base64Image =
                    generateWithoutReferenceImage(
                            promptText.trim()
                    );

        } else {
            base64Image =
                    generateWithReferenceImage(
                            promptText.trim(),
                            referenceImageUrl.trim()
                    );
        }

        return generatedImageStorageService
                .storeBase64Image(
                        base64Image
                );
    }

    /**
     * 참고 이미지 없이 프롬프트만으로
     * 새로운 이미지를 생성합니다.
     */
    private String generateWithoutReferenceImage(
            String promptText
    ) {
        try {
            String requestBody =
                    objectMapper.writeValueAsString(
                            new ImageGenerationRequest(
                                    imageModel,
                                    promptText,
                                    "1024x1024",
                                    "medium",
                                    "png"
                            )
                    );

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(
                                    URI.create(
                                            baseUrl
                                            + "/images/generations"
                                    )
                            )
                            .timeout(requestTimeout)
                            .header(
                                    "Authorization",
                                    "Bearer " + apiKey
                            )
                            .header(
                                    "Content-Type",
                                    MediaType
                                            .APPLICATION_JSON_VALUE
                            )
                            .POST(
                                    HttpRequest.BodyPublishers
                                            .ofString(
                                                    requestBody,
                                                    StandardCharsets.UTF_8
                                            )
                            )
                            .build();

            return sendRequest(request);

        } catch (IOException error) {
            throw new IllegalStateException(
                    "OpenAI 이미지 생성 요청을 만들 수 없습니다.",
                    error
            );
        }
    }

    /**
     * 상품 참고 이미지를 OpenAI에 전달하여
     * 상품의 형태와 특징을 참고한 이미지를 생성합니다.
     *
     * 참고 이미지는 다음 형식을 모두 지원합니다.
     *
     * 1. NCP Object Storage 상품 참고 이미지
     * 2. 기존 AI 생성 이미지 /uploads/generated/...
     * 3. 과거 로컬 상품 이미지 /uploads/products/...
     */
    private String generateWithReferenceImage(
            String promptText,
            String referenceImageUrl
    ) {
        ReferenceImageData referenceImage =
                resolveReferenceImageData(
                        referenceImageUrl
                );

        String boundary =
                "FarMmsBoundary"
                + UUID.randomUUID();

        byte[] multipartBody =
                createMultipartBody(
                        boundary,
                        promptText,
                        referenceImage
                );

        HttpRequest request =
                HttpRequest.newBuilder()
                        .uri(
                                URI.create(
                                        baseUrl
                                        + "/images/edits"
                                )
                        )
                        .timeout(requestTimeout)
                        .header(
                                "Authorization",
                                "Bearer " + apiKey
                        )
                        .header(
                                "Content-Type",
                                "multipart/form-data; boundary="
                                + boundary
                        )
                        .POST(
                                HttpRequest.BodyPublishers
                                        .ofByteArray(
                                                multipartBody
                                        )
                        )
                        .build();

        return sendRequest(request);
    }

    /**
     * OpenAI API에 HTTP 요청을 보내고
     * 응답의 data[0].b64_json 값을 반환합니다.
     */
    private String sendRequest(
            HttpRequest request
    ) {
        HttpResponse<String> response;

        try {
            response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers
                                    .ofString(
                                            StandardCharsets.UTF_8
                                    )
                    );

        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "OpenAI 이미지 생성 요청이 중단되었습니다.",
                    error
            );

        } catch (IOException error) {
            throw new IllegalStateException(
                    "OpenAI 이미지 생성 API에 연결할 수 없습니다.",
                    error
            );
        }

        if (
                response.statusCode() < 200 ||
                response.statusCode() >= 300
        ) {
            throwOpenAiError(
                    response.statusCode(),
                    response.body()
            );
        }

        try {
            JsonNode responseJson =
                    objectMapper.readTree(
                            response.body()
                    );

            JsonNode base64Node =
                    responseJson.path("data")
                            .path(0)
                            .path("b64_json");

            if (
                    base64Node.isMissingNode() ||
                    base64Node.isNull() ||
                    base64Node.asText().isBlank()
            ) {
                throw new IllegalStateException(
                        "OpenAI 응답에 생성 이미지 데이터가 없습니다."
                );
            }

            return base64Node.asText();

        } catch (IOException error) {
            throw new IllegalStateException(
                    "OpenAI 이미지 생성 응답을 해석할 수 없습니다.",
                    error
            );
        }
    }

    /**
     * OpenAI 오류 응답을 사용자에게 전달할 메시지로 변환합니다.
     */
    private void throwOpenAiError(
            int statusCode,
            String responseBody
    ) {
        String errorMessage =
                "OpenAI 이미지 생성 요청에 실패했습니다.";

        try {
            JsonNode errorJson =
                    objectMapper.readTree(
                            responseBody
                    );

            String openAiMessage =
                    errorJson.path("error")
                            .path("message")
                            .asText();

            if (
                    openAiMessage != null &&
                    !openAiMessage.isBlank()
            ) {
                errorMessage =
                        "OpenAI 이미지 생성 실패: "
                        + openAiMessage;
            }

        } catch (Exception ignored) {
            // 오류 응답이 JSON이 아니면 기본 메시지를 사용합니다.
        }

        throw new IllegalStateException(
                errorMessage
                + " (HTTP "
                + statusCode
                + ")"
        );
    }

    /**
     * images/edits API에 전달할 multipart/form-data 요청 본문을 생성합니다.
     */
    private byte[] createMultipartBody(
            String boundary,
            String promptText,
            ReferenceImageData referenceImage
    ) {
        try {
            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            writeTextPart(
                    output,
                    boundary,
                    "model",
                    imageModel
            );

            writeTextPart(
                    output,
                    boundary,
                    "prompt",
                    promptText
            );

            writeTextPart(
                    output,
                    boundary,
                    "size",
                    "1024x1024"
            );

            writeTextPart(
                    output,
                    boundary,
                    "quality",
                    "medium"
            );

            writeTextPart(
                    output,
                    boundary,
                    "output_format",
                    "png"
            );

            writeFilePart(
                    output,
                    boundary,
                    "image[]",
                    referenceImage
            );

            writeUtf8(
                    output,
                    "--"
                    + boundary
                    + "--\r\n"
            );

            return output.toByteArray();

        } catch (IOException error) {
            throw new IllegalStateException(
                    "참고 이미지 요청 데이터를 만들 수 없습니다.",
                    error
            );
        }
    }

    /**
     * multipart 요청에 일반 문자열 값을 추가합니다.
     */
    private void writeTextPart(
            ByteArrayOutputStream output,
            String boundary,
            String fieldName,
            String value
    ) throws IOException {

        writeUtf8(
                output,
                "--" + boundary + "\r\n"
        );

        writeUtf8(
                output,
                "Content-Disposition: form-data; name=\""
                + fieldName
                + "\"\r\n\r\n"
        );

        writeUtf8(
                output,
                value + "\r\n"
        );
    }

    /**
     * multipart 요청에 참고 이미지 파일을 추가합니다.
     *
     * Path가 아니라 byte[]를 사용하므로
     * NCP Object Storage에서 서버 권한으로 읽은 이미지도 전달할 수 있습니다.
     */
    private void writeFilePart(
            ByteArrayOutputStream output,
            String boundary,
            String fieldName,
            ReferenceImageData image
    ) throws IOException {

        writeUtf8(
                output,
                "--" + boundary + "\r\n"
        );

        writeUtf8(
                output,
                "Content-Disposition: form-data; name=\""
                + fieldName
                + "\"; filename=\""
                + image.fileName()
                + "\"\r\n"
        );

        writeUtf8(
                output,
                "Content-Type: "
                + image.contentType()
                + "\r\n\r\n"
        );

        output.write(
                image.bytes()
        );

        writeUtf8(
                output,
                "\r\n"
        );
    }

    /**
     * 참고 이미지 URL 종류에 따라
     * 실제 이미지 데이터를 확보합니다.
     */
    private ReferenceImageData resolveReferenceImageData(
            String referenceImageUrl
    ) {

        if (
                referenceImageUrl == null ||
                referenceImageUrl.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "참고 이미지 주소가 필요합니다."
            );
        }

        String normalizedUrl =
                referenceImageUrl
                        .trim()
                        .replace("\\", "/");

        /*
         * NCP Object Storage의 상품 참고 이미지
         *
         * 일반 HTTP 요청으로 가져오지 않고,
         * 서버의 NCP Access Key / Secret Key를 이용해서
         * Private Object Storage에서 직접 읽습니다.
         */
        if (
                productImageStorageService
                        .isManagedImageUrl(
                                normalizedUrl
                        )
        ) {

            ProductImageStorageService.ProductImageData image =
                    productImageStorageService.read(
                            normalizedUrl
                    );

            return new ReferenceImageData(
                    image.bytes(),
                    image.fileName(),
                    image.contentType()
            );
        }

        /*
         * 서버가 관리하지 않는 임의의 외부 URL은
         * 보안상 참고 이미지로 허용하지 않습니다.
         *
         * 사용자가 임의 URL을 넣어 서버가 다른 주소로
         * 요청을 보내는 SSRF 위험을 차단합니다.
         */
        if (
                normalizedUrl.startsWith("http://") ||
                normalizedUrl.startsWith("https://")
        ) {
            throw new IllegalArgumentException(
                    "허용되지 않은 외부 참고 이미지 주소입니다."
            );
        }

        /*
         * 기존 AI 생성 이미지를 다시 편집하는 경우
         *
         * 예:
         * /uploads/generated/abc.png
         */
        if (
                normalizedUrl.startsWith(
                        "/uploads/generated/"
                )
        ) {
            Path imagePath =
                    generatedImageStorageService
                            .resolveStoredImagePath(
                                    normalizedUrl
                            );

            return readLocalReferenceImage(
                    imagePath
            );
        }

        /*
         * 과거 로컬 상품 이미지 방식과의 호환성
         *
         * 예:
         * /uploads/products/product.png
         */
        return readLocalReferenceImage(
                resolveProductReferenceImagePath(
                        normalizedUrl
                )
        );
    }

    /**
     * 로컬 파일을 OpenAI 전달용 데이터로 읽습니다.
     */
    private ReferenceImageData readLocalReferenceImage(
            Path imagePath
    ) {

        try {
            byte[] imageBytes =
                    Files.readAllBytes(
                            imagePath
                    );

            if (imageBytes.length == 0) {
                throw new IllegalStateException(
                        "참고 이미지 파일이 비어 있습니다."
                );
            }

            String fileName =
                    imagePath
                            .getFileName()
                            .toString();

            String contentType =
                    determineContentType(
                            imagePath
                    );

            return new ReferenceImageData(
                    imageBytes,
                    fileName,
                    contentType
            );

        } catch (IOException error) {
            throw new IllegalStateException(
                    "참고 이미지 파일을 읽을 수 없습니다.",
                    error
            );
        }
    }

    /**
     * 과거 로컬 저장 방식의 상품 참고 이미지를 찾습니다.
     */
    private Path resolveProductReferenceImagePath(
            String referenceImageUrl
    ) {

        String fileName;

        try {
            fileName =
                    Path.of(referenceImageUrl)
                            .getFileName()
                            .toString();

        } catch (Exception error) {
            throw new IllegalArgumentException(
                    "상품 참고 이미지 주소가 올바르지 않습니다."
            );
        }

        Path imagePath =
                productUploadDirectory
                        .resolve(fileName)
                        .normalize();

        if (
                !imagePath.startsWith(
                        productUploadDirectory
                )
        ) {
            throw new IllegalArgumentException(
                    "상품 참고 이미지 경로가 올바르지 않습니다."
            );
        }

        if (
                !Files.exists(imagePath) ||
                !Files.isRegularFile(imagePath)
        ) {
            throw new IllegalStateException(
                    "등록된 상품 참고 이미지 파일을 찾을 수 없습니다."
            );
        }

        return imagePath;
    }

    /**
     * 로컬 이미지 MIME 타입을 확인합니다.
     */
    private String determineContentType(
            Path imagePath
    ) {

        try {
            String detectedType =
                    Files.probeContentType(
                            imagePath
                    );

            if (
                    detectedType != null &&
                    !detectedType.isBlank()
            ) {
                return detectedType;
            }

        } catch (IOException ignored) {
            // 확장자로 다시 판단합니다.
        }

        return determineContentTypeFromFileName(
                imagePath
                        .getFileName()
                        .toString()
        );
    }

    /**
     * 파일명 확장자로 MIME 타입을 판단합니다.
     */
    private String determineContentTypeFromFileName(
            String fileName
    ) {

        String lowerFileName =
                fileName
                        .toLowerCase();

        if (
                lowerFileName.endsWith(".jpg") ||
                lowerFileName.endsWith(".jpeg")
        ) {
            return MediaType.IMAGE_JPEG_VALUE;
        }

        if (
                lowerFileName.endsWith(".webp")
        ) {
            return "image/webp";
        }

        return MediaType.IMAGE_PNG_VALUE;
    }

    /**
     * 문자열을 UTF-8 바이트로 multipart 본문에 기록합니다.
     */
    private void writeUtf8(
            ByteArrayOutputStream output,
            String value
    ) throws IOException {

        output.write(
                value.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }

    /**
     * 프롬프트가 비어 있지 않은지 확인합니다.
     */
    private void validatePrompt(
            String promptText
    ) {

        if (
                promptText == null ||
                promptText.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "이미지 생성 프롬프트를 입력해주세요."
            );
        }
    }

    /**
     * URL 마지막의 슬래시를 제거합니다.
     */
    private String removeTrailingSlash(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            return "https://api.openai.com/v1";
        }

        String normalized =
                value.trim();

        while (
                normalized.endsWith("/")
        ) {
            normalized =
                    normalized.substring(
                            0,
                            normalized.length() - 1
                    );
        }

        return normalized;
    }

    /**
     * 참고 이미지 없이 생성 요청에 사용하는 JSON DTO입니다.
     */
    private record ImageGenerationRequest(
            String model,
            String prompt,
            String size,
            String quality,
            String output_format
    ) {
    }

    /**
     * OpenAI multipart에 전달할 참고 이미지 데이터입니다.
     */
    private record ReferenceImageData(
            byte[] bytes,
            String fileName,
            String contentType
    ) {
    }
}