package com.farmms.backend.service.product;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * 상품 참고 이미지 파일을 서버에 저장하고 삭제합니다.
 */
@Service
public class ProductImageStorageService {

    /**
     * 허용되는 이미지 MIME 타입과 확장자입니다.
     */
    private static final Map<String, String>
            ALLOWED_IMAGE_TYPES = Map.of(
                    "image/jpeg", "jpg",
                    "image/png", "png",
                    "image/webp", "webp"
            );

    /**
     * 업로드 가능한 파일의 최대 크기입니다.
     * 10MB로 제한합니다.
     */
    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;

    /**
     * 상품 참고 이미지가 실제로 저장되는 폴더입니다.
     *
     * application.yml에 별도 설정이 없으면
     * 프로젝트 실행 위치의 uploads/products 폴더를 사용합니다.
     */
    private final Path productUploadDirectory;

    public ProductImageStorageService(
            @Value(
                    "${app.upload.product-directory:"
                    + "uploads/products}"
            )
            String productUploadDirectory
    ) {
        this.productUploadDirectory =
                Path.of(productUploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        createUploadDirectory();
    }

    /**
     * 참고 이미지를 서버에 저장하고
     * 브라우저에서 사용할 이미지 주소를 반환합니다.
     */
    public String store(MultipartFile imageFile) {
        validateImageFile(imageFile);

        String contentType =
                imageFile.getContentType();

        String extension =
                ALLOWED_IMAGE_TYPES.get(contentType);

        String storedFileName =
                UUID.randomUUID()
                        + "."
                        + extension;

        Path targetPath =
                productUploadDirectory
                        .resolve(storedFileName)
                        .normalize();

        validateTargetPath(targetPath);

        try (
                InputStream inputStream =
                        imageFile.getInputStream()
        ) {
            Files.copy(
                    inputStream,
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException error) {
            throw new IllegalStateException(
                    "참고 이미지 저장 중 오류가 발생했습니다.",
                    error
            );
        }

        return "/uploads/products/" + storedFileName;
    }

    /**
     * 기존 참고 이미지 파일을 삭제합니다.
     */
    public void delete(String imageUrl) {
        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {
            return;
        }

        String fileName;

        try {
            fileName = Path.of(imageUrl)
                    .getFileName()
                    .toString();
        } catch (Exception error) {
            throw new IllegalArgumentException(
                    "올바르지 않은 이미지 주소입니다."
            );
        }

        Path targetPath =
                productUploadDirectory
                        .resolve(fileName)
                        .normalize();

        validateTargetPath(targetPath);

        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException error) {
            throw new IllegalStateException(
                    "기존 참고 이미지 삭제 중 오류가 발생했습니다.",
                    error
            );
        }
    }

    /**
     * 이미지 파일이 업로드 가능한 상태인지 검사합니다.
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

        if (imageFile.getSize() > MAX_FILE_SIZE) {
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

    /**
     * 업로드 폴더가 없으면 생성합니다.
     */
    private void createUploadDirectory() {
        try {
            Files.createDirectories(
                    productUploadDirectory
            );
        } catch (IOException error) {
            throw new IllegalStateException(
                    "상품 이미지 저장 폴더를 생성할 수 없습니다.",
                    error
            );
        }
    }

    /**
     * 저장하거나 삭제하려는 파일이 지정된 업로드 폴더
     * 외부를 가리키지 않는지 검사합니다.
     */
    private void validateTargetPath(
            Path targetPath
    ) {
        if (
                !targetPath.startsWith(
                        productUploadDirectory
                )
        ) {
            throw new IllegalArgumentException(
                    "올바르지 않은 이미지 저장 경로입니다."
            );
        }
    }
}