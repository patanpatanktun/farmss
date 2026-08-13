package com.farmms.backend.service.image;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * OpenAI가 생성한 이미지를 서버에 저장하고 관리합니다.
 *
 * 생성된 이미지 하단에는 Java 후처리를 이용하여
 * 정확한 문의 전화번호를 표시합니다.
 */
@Service
public class GeneratedImageStorageService {

    /**
     * 생성 이미지가 저장되는 실제 폴더입니다.
     *
     * 기본 경로:
     * uploads/generated
     */
    private final Path generatedImageDirectory;

    public GeneratedImageStorageService(
            @Value(
                    "${app.upload.generated-image-directory:"
                    + "uploads/generated}"
            )
            String generatedImageDirectory
    ) {
        this.generatedImageDirectory =
                Path.of(generatedImageDirectory)
                        .toAbsolutePath()
                        .normalize();

        createUploadDirectory();
    }

    /**
     * OpenAI API가 반환한 Base64 이미지를
     * PNG 파일로 저장하고 이미지 URL을 반환합니다.
     */
    public String storeBase64Image(
            String base64Image
    ) {
        if (
                base64Image == null ||
                base64Image.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "생성된 이미지 데이터가 존재하지 않습니다."
            );
        }

        byte[] imageBytes;

        try {
            imageBytes =
                    Base64.getDecoder()
                            .decode(base64Image);

        } catch (IllegalArgumentException error) {
            throw new IllegalStateException(
                    "생성 이미지 데이터를 변환할 수 없습니다.",
                    error
            );
        }

        if (imageBytes.length == 0) {
            throw new IllegalStateException(
                    "생성된 이미지 파일이 비어 있습니다."
            );
        }

        String storedFileName =
                UUID.randomUUID()
                + ".png";

        Path targetPath =
                generatedImageDirectory
                        .resolve(storedFileName)
                        .normalize();

        validateTargetPath(targetPath);

        try {
            Files.write(
                    targetPath,
                    imageBytes
            );

        } catch (IOException error) {
            throw new IllegalStateException(
                    "생성 이미지를 서버에 저장하지 못했습니다.",
                    error
            );
        }

        return "/uploads/generated/"
                + storedFileName;
    }

    /**
     * 이미지 URL을 서버의 실제 파일 경로로 변환합니다.
     *
     * 예:
     * /uploads/generated/abc.png
     */
    public Path resolveStoredImagePath(
            String imageUrl
    ) {
        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "생성 이미지 주소가 필요합니다."
            );
        }

        if (
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://")
        ) {
            throw new IllegalArgumentException(
                    "외부 이미지 주소는 서버 파일 경로로 변환할 수 없습니다."
            );
        }

        String normalizedUrl =
                imageUrl
                        .trim()
                        .replace("\\", "/");

        if (
                !normalizedUrl.startsWith(
                        "/uploads/generated/"
                )
        ) {
            throw new IllegalArgumentException(
                    "생성 이미지 주소가 올바르지 않습니다."
            );
        }

        String fileName;

        try {
            fileName =
                    Path.of(normalizedUrl)
                            .getFileName()
                            .toString();

        } catch (Exception error) {
            throw new IllegalArgumentException(
                    "생성 이미지 주소가 올바르지 않습니다."
            );
        }

        Path targetPath =
                generatedImageDirectory
                        .resolve(fileName)
                        .normalize();

        validateTargetPath(targetPath);

        if (
                !Files.exists(targetPath) ||
                !Files.isRegularFile(targetPath)
        ) {
            throw new IllegalStateException(
                    "서버에 저장된 생성 이미지 파일을 찾을 수 없습니다."
            );
        }

        return targetPath;
    }

    /**
     * 생성 이미지 하단에 문의 전화번호를 합성합니다.
     *
     * 하단 배너에는 정확히 다음 두 줄만 표시됩니다.
     *
     * 문의
     * 010-1111-1111
     *
     * company 매개변수는 기존 서비스 호출 코드와의
     * 호환성을 위해 유지하지만 이미지에는 표시하지 않습니다.
     */
    public String addCompanyContactBanner(
            String imageUrl,
            String company,
            String companyPhone
    ) {
        String formattedPhone =
                formatPhone(companyPhone);

        Path imagePath =
                resolveStoredImagePath(imageUrl);

        BufferedImage sourceImage;

        try {
            sourceImage =
                    ImageIO.read(
                            imagePath.toFile()
                    );

        } catch (IOException error) {
            throw new IllegalStateException(
                    "생성 이미지를 읽을 수 없습니다.",
                    error
            );
        }

        if (sourceImage == null) {
            throw new IllegalStateException(
                    "지원하지 않는 생성 이미지 형식입니다."
            );
        }

        int imageWidth =
                sourceImage.getWidth();

        int imageHeight =
                sourceImage.getHeight();

        BufferedImage resultImage =
                new BufferedImage(
                        imageWidth,
                        imageHeight,
                        BufferedImage.TYPE_INT_ARGB
                );

        Graphics2D graphics =
                resultImage.createGraphics();

        try {
            applyRenderingHints(graphics);

            /*
             * 원본 이미지를 먼저 그립니다.
             */
            graphics.drawImage(
                    sourceImage,
                    0,
                    0,
                    null
            );

            /*
             * 이미지 하단 약 17%를 배너로 사용합니다.
             */
            int bannerHeight =
                    Math.max(
                            150,
                            imageHeight / 6
                    );

            int bannerTop =
                    imageHeight - bannerHeight;

            /*
             * AI가 하단에 잘못 생성한 업체명이나
             * 전화번호가 남지 않도록 불투명한 색으로
             * 배너 영역 전체를 완전히 덮습니다.
             */
            graphics.setComposite(
                    AlphaComposite.Src
            );

            graphics.setColor(
                    new Color(
                            0,
                            94,
                            63,
                            255
                    )
            );

            graphics.fillRect(
                    0,
                    bannerTop,
                    imageWidth,
                    bannerHeight
            );

            graphics.setComposite(
                    AlphaComposite.SrcOver
            );

            int horizontalPadding =
                    Math.max(
                            36,
                            imageWidth / 24
                    );

            /*
             * 첫 번째 줄에는 "문의"만 표시합니다.
             */
            int labelFontSize =
                    Math.max(
                            28,
                            imageWidth / 32
                    );

            Font labelFont =
                    createKoreanFont(
                            labelFontSize
                    );

            graphics.setFont(labelFont);

            graphics.setColor(
                    new Color(
                            220,
                            252,
                            231
                    )
            );

            FontMetrics labelMetrics =
                    graphics.getFontMetrics();

            int labelBaseline =
                    bannerTop
                    + Math.max(
                            labelMetrics.getAscent() + 20,
                            bannerHeight / 3
                    );

            graphics.drawString(
                    "문의",
                    horizontalPadding,
                    labelBaseline
            );

            /*
             * 두 번째 줄에는 전화번호만 표시합니다.
             */
            int phoneFontSize =
                    Math.max(
                            42,
                            imageWidth / 20
                    );

            Font phoneFont =
                    createKoreanFont(
                            phoneFontSize
                    );

            graphics.setFont(phoneFont);
            graphics.setColor(Color.WHITE);

            FontMetrics phoneMetrics =
                    graphics.getFontMetrics();

            int phoneBaseline =
                    bannerTop
                    + bannerHeight
                    - Math.max(
                            24,
                            phoneMetrics.getDescent() + 18
                    );

            graphics.drawString(
                    formattedPhone,
                    horizontalPadding,
                    phoneBaseline
            );

        } finally {
            graphics.dispose();
        }

        try {
            boolean written =
                    ImageIO.write(
                            resultImage,
                            "png",
                            imagePath.toFile()
                    );

            if (!written) {
                throw new IllegalStateException(
                        "문의 전화번호가 포함된 이미지를 저장할 수 없습니다."
                );
            }

        } catch (IOException error) {
            throw new IllegalStateException(
                    "문의 전화번호를 이미지에 저장하지 못했습니다.",
                    error
            );
        }

        return imageUrl;
    }

    /**
     * 이미지와 글자를 부드럽게 표시하기 위한 설정입니다.
     */
    private void applyRenderingHints(
            Graphics2D graphics
    ) {
        graphics.setRenderingHint(
                RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON
        );

        graphics.setRenderingHint(
                RenderingHints.KEY_TEXT_ANTIALIASING,
                RenderingHints.VALUE_TEXT_ANTIALIAS_ON
        );

        graphics.setRenderingHint(
                RenderingHints.KEY_RENDERING,
                RenderingHints.VALUE_RENDER_QUALITY
        );

        graphics.setRenderingHint(
                RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BICUBIC
        );
    }

    /**
     * 한글을 지원하는 글꼴을 생성합니다.
     */
    private Font createKoreanFont(
            int fontSize
    ) {
        return new Font(
                "Malgun Gothic",
                Font.BOLD,
                fontSize
        );
    }

    /**
     * 전화번호를 하이픈이 포함된 형식으로 변환합니다.
     *
     * 예:
     * 01011111111
     * -> 010-1111-1111
     */
    private String formatPhone(
            String phone
    ) {
        if (
                phone == null ||
                phone.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "문의 전화번호가 필요합니다."
            );
        }

        String numbers =
                phone.replaceAll(
                        "[^0-9]",
                        ""
                );

        /*
         * 휴대전화 번호
         * 예: 010-1234-5678
         */
        if (numbers.length() == 11) {
            return numbers.replaceFirst(
                    "(\\d{3})(\\d{4})(\\d{4})",
                    "$1-$2-$3"
            );
        }

        /*
         * 서울 지역번호
         * 예: 02-1234-5678
         */
        if (
                numbers.length() == 10 &&
                numbers.startsWith("02")
        ) {
            return numbers.replaceFirst(
                    "(\\d{2})(\\d{4})(\\d{4})",
                    "$1-$2-$3"
            );
        }

        /*
         * 일반 지역번호 또는 휴대전화 번호
         * 예: 062-123-4567
         */
        if (numbers.length() == 10) {
            return numbers.replaceFirst(
                    "(\\d{3})(\\d{3})(\\d{4})",
                    "$1-$2-$3"
            );
        }

        /*
         * 서울 지역번호
         * 예: 02-123-4567
         */
        if (
                numbers.length() == 9 &&
                numbers.startsWith("02")
        ) {
            return numbers.replaceFirst(
                    "(\\d{2})(\\d{3})(\\d{4})",
                    "$1-$2-$3"
            );
        }

        throw new IllegalArgumentException(
                "문의 전화번호 형식이 올바르지 않습니다."
        );
    }

    /**
     * 서버에 저장된 생성 이미지 파일을 삭제합니다.
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

        /*
         * 외부 URL은 서버에 저장된 파일이 아니므로
         * 삭제하지 않습니다.
         */
        if (
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://")
        ) {
            return;
        }

        String fileName;

        try {
            fileName =
                    Path.of(imageUrl)
                            .getFileName()
                            .toString();

        } catch (Exception error) {
            throw new IllegalArgumentException(
                    "올바르지 않은 생성 이미지 주소입니다."
            );
        }

        Path targetPath =
                generatedImageDirectory
                        .resolve(fileName)
                        .normalize();

        validateTargetPath(targetPath);

        try {
            Files.deleteIfExists(
                    targetPath
            );

        } catch (IOException error) {
            throw new IllegalStateException(
                    "생성 이미지 파일 삭제 중 오류가 발생했습니다.",
                    error
            );
        }
    }

    /**
     * 생성 이미지 저장 폴더가 없으면 생성합니다.
     */
    private void createUploadDirectory() {
        try {
            Files.createDirectories(
                    generatedImageDirectory
            );

        } catch (IOException error) {
            throw new IllegalStateException(
                    "생성 이미지 저장 폴더를 만들 수 없습니다.",
                    error
            );
        }
    }

    /**
     * 접근하려는 파일이 uploads/generated 폴더
     * 외부를 가리키지 않는지 확인합니다.
     */
    private void validateTargetPath(
            Path targetPath
    ) {
        if (
                !targetPath.startsWith(
                        generatedImageDirectory
                )
        ) {
            throw new IllegalArgumentException(
                    "올바르지 않은 생성 이미지 저장 경로입니다."
            );
        }
    }
}