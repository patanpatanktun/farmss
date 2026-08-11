package com.farmms.backend.gateway;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.model.StorageType;
import com.solapi.sdk.message.service.DefaultMessageService;

/**
 * SOLAPI를 이용해 실제 MMS를 발송하는 Gateway입니다.
 *
 * 모든 FarMMS 회원은 운영자가 SOLAPI에 등록한
 * 공통 발신번호를 사용합니다.
 */
@Component
@ConditionalOnProperty(
        name = "farmms.mms.provider",
        havingValue = "solapi"
)
public class SolapiMmsGateway implements MmsGateway {

    /**
     * SOLAPI MMS 이미지 최대 크기입니다.
     *
     * SOLAPI MMS 첨부 이미지는 JPG 형식으로 변환하며
     * 200KB 이하가 되도록 처리합니다.
     */
    private static final long MAX_MMS_IMAGE_SIZE =
            200L * 1024L;

    /**
     * 이미지 크기 축소 시 사용할 최초 최대 길이입니다.
     */
    private static final int INITIAL_MAX_IMAGE_LENGTH =
            1000;

    /**
     * JPG 압축 품질입니다.
     */
    private static final float INITIAL_JPEG_QUALITY =
            0.85F;

    private final DefaultMessageService messageService;

    /**
     * 운영자가 SOLAPI에 등록한 공통 발신번호입니다.
     */
    private final String senderNumber;

    /**
     * OpenAI가 생성한 이미지가 저장되는 실제 폴더입니다.
     */
    private final Path generatedImageDirectory;

    /**
     * 동일한 이미지가 여러 고객에게 발송되는 경우
     * 매번 SOLAPI에 다시 업로드하지 않도록
     * 이미지 URL과 SOLAPI 이미지 ID를 저장합니다.
     */
    private final Map<String, String> uploadedImageIdCache =
            new ConcurrentHashMap<>();

    public SolapiMmsGateway(
            @Value("${solapi.api-key}")
            String apiKey,

            @Value("${solapi.api-secret}")
            String apiSecret,

            @Value("${solapi.sender-number}")
            String senderNumber,

            @Value(
                    "${app.upload.generated-directory:"
                    + "uploads/generated}"
            )
            String generatedImageDirectory
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "SOLAPI API Key가 설정되지 않았습니다."
            );
        }

        if (apiSecret == null || apiSecret.isBlank()) {
            throw new IllegalStateException(
                    "SOLAPI API Secret이 설정되지 않았습니다."
            );
        }

        if (
                senderNumber == null ||
                senderNumber.isBlank()
        ) {
            throw new IllegalStateException(
                    "SOLAPI 발신번호가 설정되지 않았습니다."
            );
        }

        this.messageService =
                SolapiClient.INSTANCE.createInstance(
                        apiKey.trim(),
                        apiSecret.trim()
                );

        this.senderNumber =
                normalizePhoneNumber(senderNumber);

        this.generatedImageDirectory =
                Path.of(generatedImageDirectory)
                        .toAbsolutePath()
                        .normalize();
    }

    /**
     * 고객 한 명에게 실제 MMS를 발송합니다.
     */
    @Override
    public MmsSendResult send(
            MmsSendCommand command
    ) {
        try {
            validateCommand(command);

            String imageId =
                    getOrUploadImageId(
                            command.imageUrl()
                    );

            Message message = new Message();

            /*
             * 사용자가 입력한 발신번호를 사용하지 않고
             * 운영자가 SOLAPI에 등록한 공통 발신번호를 사용합니다.
             */
            message.setFrom(senderNumber);

            message.setTo(
                    normalizePhoneNumber(
                            command.toNumber()
                    )
            );

            message.setText(
                    command.content().trim()
            );

            /*
             * FarMMS 화면에서는 MMS 제목을 입력받지 않지만,
             * SOLAPI에서 제목이 필요한 경우 고정 제목을 사용합니다.
             */
            String title = command.title();

            if (
                    title == null ||
                    title.isBlank()
            ) {
                title = "FarMMS 홍보 안내";
            }

            message.setSubject(title.trim());
            message.setImageId(imageId);

            /*
             * SOLAPI에 MMS 발송을 요청합니다.
             *
             * 여기에서 성공했다는 것은 SOLAPI가 발송 요청을
             * 정상적으로 접수했다는 뜻입니다.
             */
            messageService.send(message, null);

            return MmsSendResult.success(
                    "SOLAPI-ACCEPTED"
            );

        } catch (Exception error) {
            String errorMessage =
                    findErrorMessage(error);

            return MmsSendResult.fail(
                    "MMS 발송 실패: " + errorMessage
            );
        }
    }

    /**
     * 이미지를 SOLAPI에 업로드하고 이미지 ID를 반환합니다.
     *
     * Windows에서 SOLAPI SDK가 임시 파일을 잠시 사용하고 있으면
     * 즉시 삭제되지 않을 수 있습니다. 임시 파일 삭제 실패는
     * MMS 발송 실패로 처리하지 않습니다.
     */
    private String getOrUploadImageId(
            String imageUrl
    ) throws IOException {
        String cachedImageId =
                uploadedImageIdCache.get(imageUrl);

        if (
                cachedImageId != null &&
                !cachedImageId.isBlank()
        ) {
            return cachedImageId;
        }

        Path originalImagePath =
                resolveGeneratedImagePath(imageUrl);

        File convertedImageFile =
                createSolapiMmsImage(
                        originalImagePath
                );

        /*
         * 즉시 삭제되지 않더라도 JVM 종료 시
         * 임시 파일을 다시 삭제하도록 등록합니다.
         */
        convertedImageFile.deleteOnExit();

        try {
            String uploadedImageId =
                    messageService.uploadFile(
                            convertedImageFile,
                            StorageType.MMS,
                            null
                    );

            if (
                    uploadedImageId == null ||
                    uploadedImageId.isBlank()
            ) {
                throw new IllegalStateException(
                        "SOLAPI 이미지 업로드 결과가 비어 있습니다."
                );
            }

            uploadedImageIdCache.put(
                    imageUrl,
                    uploadedImageId
            );

            return uploadedImageId;

        } finally {
            try {
                Files.deleteIfExists(
                        convertedImageFile.toPath()
                );
            } catch (IOException ignored) {
                /*
                 * Windows에서 SOLAPI SDK가 파일을 사용 중이면
                 * 즉시 삭제하지 못할 수 있습니다.
                 *
                 * 이 문제는 MMS 발송 자체와 관계없기 때문에
                 * 발송 실패로 처리하지 않습니다.
                 *
                 * deleteOnExit()에 의해 서버 종료 시
                 * 다시 삭제를 시도합니다.
                 */
            }
        }
    }

    /**
     * /uploads/generated/파일명 형태의 URL을
     * 실제 서버 파일 경로로 변환합니다.
     */
    private Path resolveGeneratedImagePath(
            String imageUrl
    ) {
        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "MMS에 첨부할 이미지가 없습니다."
            );
        }

        String fileName;

        try {
            fileName = Path.of(imageUrl)
                    .getFileName()
                    .toString();

        } catch (Exception error) {
            throw new IllegalArgumentException(
                    "올바르지 않은 생성 이미지 주소입니다."
            );
        }

        Path imagePath =
                generatedImageDirectory
                        .resolve(fileName)
                        .normalize();

        if (
                !imagePath.startsWith(
                        generatedImageDirectory
                )
        ) {
            throw new IllegalArgumentException(
                    "올바르지 않은 생성 이미지 경로입니다."
            );
        }

        if (!Files.exists(imagePath)) {
            throw new IllegalArgumentException(
                    "MMS에 첨부할 생성 이미지 파일을 찾을 수 없습니다."
            );
        }

        if (!Files.isRegularFile(imagePath)) {
            throw new IllegalArgumentException(
                    "MMS 첨부 이미지 경로가 파일이 아닙니다."
            );
        }

        return imagePath;
    }

    /**
     * OpenAI 생성 이미지를 SOLAPI MMS 규격에 맞는
     * 200KB 이하 JPG 파일로 변환합니다.
     */
    private File createSolapiMmsImage(
            Path originalImagePath
    ) throws IOException {
        BufferedImage originalImage =
                ImageIO.read(
                        originalImagePath.toFile()
                );

        if (originalImage == null) {
            throw new IllegalArgumentException(
                    "MMS 첨부 이미지를 읽을 수 없습니다."
            );
        }

        int maxImageLength =
                INITIAL_MAX_IMAGE_LENGTH;

        float jpegQuality =
                INITIAL_JPEG_QUALITY;

        File temporaryFile =
                Files.createTempFile(
                        "farmms-solapi-",
                        ".jpg"
                ).toFile();

        /*
         * 크기와 품질을 단계적으로 낮춰
         * 200KB 이하의 JPG 파일을 만듭니다.
         */
        for (int attempt = 0; attempt < 12; attempt++) {
            BufferedImage resizedImage =
                    resizeAndConvertToRgb(
                            originalImage,
                            maxImageLength
                    );

            writeJpeg(
                    resizedImage,
                    temporaryFile,
                    jpegQuality
            );

            if (
                    temporaryFile.length()
                    <= MAX_MMS_IMAGE_SIZE
            ) {
                return temporaryFile;
            }

            if (jpegQuality > 0.45F) {
                jpegQuality -= 0.1F;
            } else {
                maxImageLength =
                        Math.max(
                                400,
                                (int) (
                                        maxImageLength
                                        * 0.85
                                )
                        );
            }
        }

        try {
            Files.deleteIfExists(
                    temporaryFile.toPath()
            );
        } catch (IOException ignored) {
            temporaryFile.deleteOnExit();
        }

        throw new IllegalArgumentException(
                "MMS 첨부 이미지를 200KB 이하로 변환하지 못했습니다."
        );
    }

    /**
     * 이미지 비율을 유지하면서 크기를 줄이고
     * 투명 배경을 흰색으로 바꾼 RGB 이미지를 만듭니다.
     */
    private BufferedImage resizeAndConvertToRgb(
            BufferedImage originalImage,
            int maxImageLength
    ) {
        int originalWidth =
                originalImage.getWidth();

        int originalHeight =
                originalImage.getHeight();

        double scale = Math.min(
                1.0,
                Math.min(
                        (double) maxImageLength
                                / originalWidth,
                        (double) maxImageLength
                                / originalHeight
                )
        );

        int targetWidth =
                Math.max(
                        1,
                        (int) Math.round(
                                originalWidth * scale
                        )
                );

        int targetHeight =
                Math.max(
                        1,
                        (int) Math.round(
                                originalHeight * scale
                        )
                );

        BufferedImage rgbImage =
                new BufferedImage(
                        targetWidth,
                        targetHeight,
                        BufferedImage.TYPE_INT_RGB
                );

        Graphics2D graphics =
                rgbImage.createGraphics();

        try {
            graphics.setRenderingHint(
                    RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BICUBIC
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_RENDERING,
                    RenderingHints.VALUE_RENDER_QUALITY
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_ANTIALIASING,
                    RenderingHints.VALUE_ANTIALIAS_ON
            );

            /*
             * PNG의 투명 영역이 JPG에서 검게 나오지 않도록
             * 배경을 흰색으로 채웁니다.
             */
            graphics.setColor(
                    java.awt.Color.WHITE
            );

            graphics.fillRect(
                    0,
                    0,
                    targetWidth,
                    targetHeight
            );

            graphics.drawImage(
                    originalImage,
                    0,
                    0,
                    targetWidth,
                    targetHeight,
                    null
            );

        } finally {
            graphics.dispose();
        }

        return rgbImage;
    }

    /**
     * 지정한 품질로 JPG 파일을 저장합니다.
     */
    private void writeJpeg(
            BufferedImage image,
            File targetFile,
            float quality
    ) throws IOException {
        Iterator<ImageWriter> writers =
                ImageIO.getImageWritersByFormatName(
                        "jpg"
                );

        if (!writers.hasNext()) {
            throw new IllegalStateException(
                    "JPG 이미지 저장 기능을 사용할 수 없습니다."
            );
        }

        ImageWriter writer =
                writers.next();

        try (
                ImageOutputStream outputStream =
                        ImageIO.createImageOutputStream(
                                targetFile
                        )
        ) {
            ImageWriteParam writeParam =
                    writer.getDefaultWriteParam();

            if (
                    writeParam.canWriteCompressed()
            ) {
                writeParam.setCompressionMode(
                        ImageWriteParam.MODE_EXPLICIT
                );

                writeParam.setCompressionQuality(
                        Math.max(
                                0.1F,
                                Math.min(
                                        1.0F,
                                        quality
                                )
                        )
                );
            }

            writer.setOutput(outputStream);

            writer.write(
                    null,
                    new IIOImage(
                            image,
                            null,
                            null
                    ),
                    writeParam
            );

        } finally {
            writer.dispose();
        }
    }

    /**
     * MMS 발송에 필요한 값을 검사합니다.
     */
    private void validateCommand(
            MmsSendCommand command
    ) {
        if (command == null) {
            throw new IllegalArgumentException(
                    "MMS 발송 정보가 없습니다."
            );
        }

        String toNumber =
                normalizePhoneNumber(
                        command.toNumber()
                );

        if (toNumber.length() < 10) {
            throw new IllegalArgumentException(
                    "수신 전화번호가 올바르지 않습니다."
            );
        }

        if (
                command.content() == null ||
                command.content().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "MMS 발송 문구를 입력해주세요."
            );
        }

        if (
                command.imageUrl() == null ||
                command.imageUrl().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "MMS에 첨부할 이미지가 없습니다."
            );
        }
    }

    /**
     * 전화번호에서 숫자를 제외한 문자를 제거합니다.
     */
    private String normalizePhoneNumber(
            String phoneNumber
    ) {
        if (phoneNumber == null) {
            return "";
        }

        return phoneNumber.replaceAll(
                "[^0-9]",
                ""
        );
    }

    /**
     * 중첩된 예외에서 실제 오류 메시지를 찾습니다.
     */
    private String findErrorMessage(
            Throwable error
    ) {
        Throwable current = error;
        String message = null;

        while (current != null) {
            if (
                    current.getMessage() != null &&
                    !current.getMessage().isBlank()
            ) {
                message = current.getMessage();
            }

            current = current.getCause();
        }

        if (
                message == null ||
                message.isBlank()
        ) {
            return "SOLAPI에서 알 수 없는 오류가 발생했습니다.";
        }

        return message;
    }
}