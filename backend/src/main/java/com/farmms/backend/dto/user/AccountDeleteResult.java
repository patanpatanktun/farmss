package com.farmms.backend.dto.user;

import java.util.List;

/**
 * 회원 탈퇴 후 서버에서 실제로 삭제해야 하는
 * 이미지 파일 주소 목록입니다.
 */
public record AccountDeleteResult(

        /**
         * 회원이 등록한 상품 참고 이미지 주소 목록입니다.
         */
        List<String> referenceImageUrls,

        /**
         * 회원이 OpenAI로 생성한 이미지 주소 목록입니다.
         */
        List<String> generatedImageUrls

) {

    public AccountDeleteResult {
        referenceImageUrls =
                referenceImageUrls == null
                        ? List.of()
                        : List.copyOf(
                                referenceImageUrls
                        );

        generatedImageUrls =
                generatedImageUrls == null
                        ? List.of()
                        : List.copyOf(
                                generatedImageUrls
                        );
    }
}