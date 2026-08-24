package com.farmms.backend.service.product;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class ProductImageStorageService {

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
                        .build();
    }

    /**
     * 상품 참고 이미지를 NCP Object Storage에 저장합니다.
     *
     * 상품 참고 이미지는 웹 화면에서 직접 표시해야 하므로
     * public-read ACL을 적용합니다.
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
                "products/"
                        + UUID.randomUUID()
                        + "."
                        + extension;

        try {
            PutObjectRequest request =
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .contentType(contentType)

                            /*
                             * Object Storage에 저장된 이미지를
                             * 브라우저가 인증 없이 읽을 수 있도록
                             * 공개 읽기 권한을 적용합니다.
                             */
                            .acl(
                                    ObjectCannedACL.PUBLIC_READ
                            )
                            .build();

            s3Client.putObject(
                    request,
                    RequestBody.fromInputStream(
                            imageFile.getInputStream(),
                            imageFile.getSize()
                    )
            );

        } catch (Exception error) {
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
     * Object Storage에 저장된 참고 이미지를 삭제합니다.
     */
    public void delete(
            String imageUrl
    ) {
        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {
            return;
        }

        String prefix =
                ENDPOINT
                        + "/"
                        + bucketName
                        + "/";

        /*
         * 과거 서버 로컬 이미지 URL은
         * Object Storage 객체가 아니므로 무시합니다.
         */
        if (!imageUrl.startsWith(prefix)) {
            return;
        }

        String objectKey =
                imageUrl.substring(
                        prefix.length()
                );

        if (objectKey.isBlank()) {
            return;
        }

        try {
            DeleteObjectRequest request =
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build();

            s3Client.deleteObject(request);

        } catch (Exception error) {
            throw new IllegalStateException(
                    "NCP Object Storage의 참고 이미지를 삭제하는 중 오류가 발생했습니다.",
                    error
            );
        }
    }

    /**
     * 업로드할 참고 이미지 파일을 검증합니다.
     */
    private void validateImageFile(
            MultipartFile imageFile
    ) {
        if (
                imageFile == null ||
                imageFile.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "참고 이미지 파일을 선택해주세요."
            );
        }

        if (
                imageFile.getSize() >
                MAX_FILE_SIZE
        ) {
            throw new IllegalArgumentException(
                    "참고 이미지는 10MB 이하만 업로드할 수 있습니다."
            );
        }

        String contentType =
                imageFile.getContentType();

        if (
                contentType == null ||
                !ALLOWED_IMAGE_TYPES.containsKey(
                        contentType
                )
        ) {
            throw new IllegalArgumentException(
                    "JPG, JPEG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다."
            );
        }
    }
}