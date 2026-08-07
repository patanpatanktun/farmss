package com.hrg.agripromomms.dto.ai;

/**
 * AI 홍보 콘텐츠 생성 결과입니다.
 */
public record AiPromotionResponse(

        // GPT가 생성한 MMS 제목
        String mmsTitle,

        // GPT가 생성한 MMS 본문
        String mmsContent,

        // 이미지 생성에 사용한 프롬프트
        String imagePrompt,

        // 텍스트 생성 모델
        String model,

        // 생성된 실제 이미지 조회 주소
        String imageUrl,

        // 저장된 이미지 파일명
        String imageFileName,

        // 이미지 생성 모델
        String imageModel
) {
}