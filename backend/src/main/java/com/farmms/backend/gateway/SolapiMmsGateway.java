package com.farmms.backend.gateway;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Locale;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.solapi.sdk.message.dto.request.MessageListRequest;
import com.solapi.sdk.message.dto.response.MessageListResponse;
import com.solapi.sdk.message.dto.response.MultipleDetailMessageSentResponse;
import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.dto.request.SendRequestConfig;
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
    /**
     * 고객 한 명에게 실제 MMS를 발송하거나
     * 예약 발송을 등록합니다.
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

            Message message =
                    new Message();

            /*
             * 모든 사용자는 운영자가 SOLAPI에 등록한
             * 공통 대표 발신번호를 사용합니다.
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
             * 화면에서 MMS 제목을 입력받지 않는 경우
             * 기본 제목을 사용합니다.
             */
            String title =
                    command.title();

            if (
                    title == null ||
                    title.isBlank()
            ) {
                title =
                        "FarMMS 홍보 안내";
            }

            message.setSubject(
                    title.trim()
            );

            message.setImageId(imageId);

            /*
             * 즉시 발송이면 null,
             * 예약 발송이면 예약 설정이 반환됩니다.
             */
            SendRequestConfig sendConfig =
                    createSendRequestConfig(
                            command
                    );

            /*
             * SOLAPI 발송 응답을 받습니다.
             *
             * 이 응답의 그룹 ID를 저장해야 나중에
             * 실제 발송 결과를 다시 조회할 수 있습니다.
             */
            MultipleDetailMessageSentResponse response =
                    messageService.send(
                            message,
                            sendConfig
                    );

            if (
                    response == null ||
                    response.getGroupInfo() == null
            ) {
                throw new IllegalStateException(
                        "SOLAPI 발송 응답이 올바르지 않습니다."
                );
            }

            String groupId =
                    response
                            .getGroupInfo()
                            .getGroupId();

            if (
                    groupId == null ||
                    groupId.isBlank()
            ) {
                throw new IllegalStateException(
                        "SOLAPI 그룹 ID를 받지 못했습니다."
                );
            }

            /*
             * 즉시 발송과 예약 발송 모두 그룹 ID를 반환합니다.
             */
            return MmsSendResult.success(
                    groupId.trim()
            );

        } catch (Exception error) {
            String errorMessage =
                    findErrorMessage(error);

            return MmsSendResult.fail(
                    "MMS 발송 실패: " +
                    errorMessage
            );
        }
    }

    /**
     * SOLAPI 그룹 ID로 실제 MMS 발송 결과를 확인합니다.
     *
     * 예약 시간이 됐다는 이유만으로 성공 처리하지 않고,
     * SOLAPI가 제공하는 실제 상태를 확인합니다.
     */
    @Override
    public MmsDeliveryStatus getDeliveryStatus(
            String providerMessageId
    ) {
        if (
                providerMessageId == null ||
                providerMessageId.isBlank()
        ) {
            return MmsDeliveryStatus.UNKNOWN;
        }

        try {
            MessageListRequest request =
                    new MessageListRequest();

            /*
             * 발송 요청 시 반환받은 그룹 ID로 검색합니다.
             */
            request.setGroupId(
                    providerMessageId.trim()
            );

            request.setLimit(20);

            MessageListResponse response =
                    messageService.getMessageList(
                            request
                    );

            if (
                    response == null ||
                    response.getMessageList() == null ||
                    response.getMessageList().isEmpty()
            ) {
                /*
                 * SOLAPI 조회 결과가 아직 만들어지지 않았다면
                 * 발송 대기 상태로 유지합니다.
                 */
                return MmsDeliveryStatus.PENDING;
            }

            boolean pendingExists = false;

            for (
                    Message resultMessage :
                    response
                            .getMessageList()
                            .values()
            ) {
                String status =
                        normalizeDeliveryStatus(
                                resultMessage.getStatus()
                        );

                String statusCode =
                        resultMessage.getStatusCode();

                /*
                 * SOLAPI의 발송 완료 성공 코드입니다.
                 */
                if (
                        "COMPLETE".equals(status) &&
                        "4000".equals(statusCode)
                ) {
                    continue;
                }

                /*
                 * 발송이 완료됐지만 성공 코드가 아니라면
                 * 실제 발송 실패로 처리합니다.
                 */
                if ("COMPLETE".equals(status)) {
                    return MmsDeliveryStatus.FAILED;
                }

                /*
                 * SOLAPI가 실패 상태를 반환한 경우입니다.
                 */
                if ("FAILED".equals(status)) {
                    return MmsDeliveryStatus.FAILED;
                }

                /*
                 * 아직 발송 전이거나 발송 처리 중입니다.
                 */
                if (
                        "PENDING".equals(status) ||
                        "SENDING".equals(status)
                ) {
                    pendingExists = true;
                    continue;
                }

                /*
                 * 일부 SDK 버전에서는 status 값이 다르게
                 * 내려올 수 있으므로 상태 코드도 확인합니다.
                 */
                if ("4000".equals(statusCode)) {
                    continue;
                }

                /*
                 * 2000번대는 발송 대기,
                 * 3000번대는 발송 처리 중입니다.
                 */
                if (
                        statusCode != null &&
                        (
                            statusCode.startsWith("2") ||
                            statusCode.startsWith("3")
                        )
                ) {
                    pendingExists = true;
                    continue;
                }

                /*
                 * 완료됐지만 4000이 아닌 상태 코드는
                 * 실패 결과로 판단합니다.
                 */
                if (
                        statusCode != null &&
                        statusCode.startsWith("4")
                ) {
                    return MmsDeliveryStatus.FAILED;
                }

                pendingExists = true;
            }

            if (pendingExists) {
                return MmsDeliveryStatus.PENDING;
            }

            /*
             * 모든 메시지가 정상 완료된 경우입니다.
             */
            return MmsDeliveryStatus.SUCCESS;

        } catch (Exception error) {
            /*
             * SOLAPI 상태 조회 자체가 실패한 경우에는
             * 발송 실패로 확정하지 않습니다.
             *
             * 다음 조회 때 다시 확인할 수 있도록
             * UNKNOWN을 반환합니다.
             */
            return MmsDeliveryStatus.UNKNOWN;
        }
    }

    /**
     * SOLAPI 상태 문자열을 비교 가능한 형태로 정리합니다.
     */
    private String normalizeDeliveryStatus(
            String status
    ) {
        if (status == null) {
            return "";
        }

        return status
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    /**
     * SOLAPI에 전달할 발송 설정을 생성합니다.
     *
     * scheduledDate가 null이면 즉시발송이므로 null을 반환하고,
     * 예약시간이 있으면 SOLAPI 예약발송 설정을 생성합니다.
     */
    private SendRequestConfig createSendRequestConfig(
            MmsSendCommand command
    ) {
        if (command.scheduledDate() == null) {
            return null;
        }

        ZoneId seoulZone =
                ZoneId.of("Asia/Seoul");

        LocalDateTime scheduledLocalDateTime =
                command.scheduledDate()
                        .atZoneSameInstant(seoulZone)
                        .toLocalDateTime();

        SendRequestConfig config =
                new SendRequestConfig();

        config.setScheduledDateFromLocalDateTime(
                scheduledLocalDateTime,
                seoulZone
        );

        return config;
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