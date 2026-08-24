package com.farmms.backend.service.product;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
public class ProductImageStorageService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    ProductImageStorageService.class
            );

    private static final Map<String, String> ALLOWED_IMAGE_TYPES =
            Map.of(
                    "image/jpeg", "jpg",
                    "image/png", "png",
                    "image/webp", "webp"
            );

    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;

    private static final String ENDPOINT =
            "https://kr.object.ncloudstorage.com";

    private static final String REGION =
            "kr-standard";

    private static final String PRODUCT_PREFIX =
            "products/";

    private final S3Client s3Client;

    private final String bucketName;

    public ProductImageStorageService(
            @Value("${NCP_ACCESS_KEY}")
            String accessKey,

            @Value("${NCP_SECRET_KEY}")
            String secretKey,

            @Value("${NCP_BUCKET_NAME}")
            String bucketName
    ) {

        this.bucketName = bucketName;

        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(
                        accessKey,
                        secretKey
                );

        this.s3Client =
                S3Client.builder()
                        .endpointOverride(
                                URI.create(ENDPOINT)
                        )
                        .region(
                                Region.of(REGION)
                        )
                        .credentialsProvider(
                                StaticCredentialsProvider.create(
                                        credentials
                                )
                        )
                        .forcePathStyle(true)

                        /*
                         * NCP Object Storage와
                         * 최신 AWS SDK의 자동 CRC32 체크섬 사이의
                         * 호환 문제를 방지합니다.
                         */
                        .requestChecksumCalculation(
                                RequestChecksumCalculation.WHEN_REQUIRED
                        )
                        .responseChecksumValidation(
                                ResponseChecksumValidation.WHEN_REQUIRED
                        )
                        .build();
    }

    /**
     * 상품 참고 이미지를 NCP Object Storage에 저장합니다.
     *
     * 신규 상품 참고 이미지는 PRIVATE ACL로 저장하여
     * 외부 URL을 통한 직접 접근을 차단합니다.
     */
    public String store(
            MultipartFile imageFile
    ) {

        validateImageFile(imageFile);

        String contentType =
                imageFile.getContentType();

        String extension =
                ALLOWED_IMAGE_TYPES.get(
                        contentType
                );

        String objectKey =
                PRODUCT_PREFIX
                        + UUID.randomUUID()
                        + "."
                        + extension;

        try {

            PutObjectRequest request =
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .contentType(contentType)
                            .acl(ObjectCannedACL.PRIVATE)
                            .build();

            s3Client.putObject(
                    request,
                    RequestBody.fromInputStream(
                            imageFile.getInputStream(),
                            imageFile.getSize()
                    )
            );

        } catch (S3Exception error) {

            String errorCode = "UNKNOWN";

            if (error.awsErrorDetails() != null) {
                errorCode =
                        error.awsErrorDetails()
                                .errorCode();
            }

            log.error(
                    "NCP Object Storage 업로드 실패."
                            + " statusCode={}, errorCode={}",
                    error.statusCode(),
                    errorCode
            );

            throw new IllegalStateException(
                    "NCP Object Storage에 참고 이미지를 저장하는 중 오류가 발생했습니다.",
                    error
            );

        } catch (Exception error) {

            log.error(
                    "NCP Object Storage 업로드 실패."
                            + " exceptionType={}",
                    error.getClass()
                            .getSimpleName()
            );

            throw new IllegalStateException(
                    "NCP Object Storage에 참고 이미지를 저장하는 중 오류가 발생했습니다.",
                    error
            );
        }

        return ENDPOINT
                + "/"
                + bucketName
                + "/"
                + objectKey;
    }

    /**
     * NCP Object Storage에 저장된
     * 상품 참고 이미지를 서버 권한으로 읽습니다.
     *
     * 객체가 PRIVATE이어도 서버의
     * Access Key / Secret Key를 사용하여 읽을 수 있습니다.
     */
    public ProductImageData read(
            String imageUrl
    ) {

        String objectKey =
                extractObjectKey(
                        imageUrl
                );

        try {

            GetObjectRequest request =
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build();

            ResponseBytes<GetObjectResponse> response =
                    s3Client.getObjectAsBytes(
                            request
                    );

            byte[] imageBytes =
                    response.asByteArray();

            if (
                    imageBytes == null
                            ||
                    imageBytes.length == 0
            ) {
                throw new IllegalStateException(
                        "상품 참고 이미지 파일이 비어 있습니다."
                );
            }

            String fileName =
                    extractFileName(
                            objectKey
                    );

            String contentType =
                    response.response()
                            .contentType();

            if (
                    contentType == null
                            ||
                    contentType.isBlank()
            ) {
                contentType =
                        determineContentType(
                                fileName
                        );
            }

            return new ProductImageData(
                    imageBytes,
                    fileName,
                    contentType
            );

        } catch (IllegalStateException error) {

            throw error;

        } catch (Exception error) {

            throw new IllegalStateException(
                    "NCP Object Storage의 참고 이미지를 읽는 중 오류가 발생했습니다.",
                    error
            );
        }
    }

    /**
     * Object Storage에 저장된 참고 이미지를 삭제합니다.
     */
    public void delete(
            String imageUrl
    ) {

        if (
                imageUrl == null
                        ||
                imageUrl.isBlank()
        ) {
            return;
        }

        /*
         * 과거 로컬 이미지 주소 등
         * 현재 서버가 관리하지 않는 URL은 무시합니다.
         */
        if (!isManagedImageUrl(imageUrl)) {
            return;
        }

        String objectKey =
                extractObjectKey(
                        imageUrl
                );

        try {

            DeleteObjectRequest request =
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build();

            s3Client.deleteObject(
                    request
            );

        } catch (Exception error) {

            throw new IllegalStateException(
                    "NCP Object Storage의 참고 이미지를 삭제하는 중 오류가 발생했습니다.",
                    error
            );
        }
    }

    /**
     * 현재 서버가 관리하는
     * NCP 상품 이미지 URL인지 확인합니다.
     */
    public boolean isManagedImageUrl(
            String imageUrl
    ) {

        if (
                imageUrl == null
                        ||
                imageUrl.isBlank()
        ) {
            return false;
        }

        String prefix =
                ENDPOINT
                        + "/"
                        + bucketName
                        + "/"
                        + PRODUCT_PREFIX;

        return imageUrl.startsWith(
                prefix
        );
    }

    /**
     * 전체 Object Storage URL에서
     * 실제 Object Key를 추출합니다.
     *
     * 예:
     * https://.../bucket/products/abc.png
     *
     * ->
     *
     * products/abc.png
     */
    private String extractObjectKey(
            String imageUrl
    ) {

        if (
                imageUrl == null
                        ||
                imageUrl.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "상품 참고 이미지 주소가 필요합니다."
            );
        }

        String prefix =
                ENDPOINT
                        + "/"
                        + bucketName
                        + "/";

        if (!imageUrl.startsWith(prefix)) {
            throw new IllegalArgumentException(
                    "올바르지 않은 상품 참고 이미지 주소입니다."
            );
        }

        String objectKey =
                imageUrl.substring(
                        prefix.length()
                );

        /*
         * products/ 경로 외의 Object Storage 객체를
         * 임의로 읽지 못하도록 제한합니다.
         */
        if (
                objectKey.isBlank()
                        ||
                !objectKey.startsWith(
                        PRODUCT_PREFIX
                )
        ) {
            throw new IllegalArgumentException(
                    "올바르지 않은 상품 참고 이미지 경로입니다."
            );
        }

        return objectKey;
    }

    /**
     * Object Key에서 파일명만 추출합니다.
     */
    private String extractFileName(
            String objectKey
    ) {

        int lastSlash =
                objectKey.lastIndexOf('/');

        if (
                lastSlash < 0
                        ||
                lastSlash
                        == objectKey.length() - 1
        ) {
            throw new IllegalArgumentException(
                    "상품 참고 이미지 파일명이 올바르지 않습니다."
            );
        }

        return objectKey.substring(
                lastSlash + 1
        );
    }

    /**
     * 파일 확장자를 이용해 Content-Type을 판단합니다.
     */
    private String determineContentType(
            String fileName
    ) {

        String lowerFileName =
                fileName.toLowerCase();

        if (
                lowerFileName.endsWith(".jpg")
                        ||
                lowerFileName.endsWith(".jpeg")
        ) {
            return "image/jpeg";
        }

        if (lowerFileName.endsWith(".png")) {
            return "image/png";
        }

        if (lowerFileName.endsWith(".webp")) {
            return "image/webp";
        }

        throw new IllegalArgumentException(
                "지원하지 않는 상품 참고 이미지 형식입니다."
        );
    }

    /**
     * 업로드 이미지 파일을 검증합니다.
     */
    private void validateImageFile(
            MultipartFile imageFile
    ) {

        if (
                imageFile == null
                        ||
                imageFile.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "참고 이미지 파일을 선택해주세요."
            );
        }

        if (
                imageFile.getSize()
                        > MAX_FILE_SIZE
        ) {
            throw new IllegalArgumentException(
                    "참고 이미지는 10MB 이하만 업로드할 수 있습니다."
            );
        }

        String contentType =
                imageFile.getContentType();

        if (
                contentType == null
                        ||
                !ALLOWED_IMAGE_TYPES.containsKey(
                        contentType
                )
        ) {
            throw new IllegalArgumentException(
                    "JPG, JPEG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다."
            );
        }
    }

    /**
     * NCP에서 읽어온 상품 참고 이미지 정보입니다.
     */
    public record ProductImageData(
            byte[] bytes,
            String fileName,
            String contentType
    ) {
    }
}