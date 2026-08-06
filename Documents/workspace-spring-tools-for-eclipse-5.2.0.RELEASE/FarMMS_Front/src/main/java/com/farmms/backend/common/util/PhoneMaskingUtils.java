package com.farmms.backend.common.util;

/**
 * 고객 전화번호가 화면에 그대로 노출되지 않도록 마스킹하는 유틸리티입니다.
 */
public final class PhoneMaskingUtils {

    // 객체 생성을 막기 위한 private 생성자입니다.
    private PhoneMaskingUtils() {
    }

    /**
     * 전화번호 중간 번호를 별표로 변경합니다.
     *
     * 예: 01012345678 -> 010****5678
     *
     * @param phoneNumber 원본 전화번호
     * @return 마스킹된 전화번호
     */
    public static String mask(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 8) {
            return "****";
        }

        return phoneNumber.substring(0, 3)
                + "****"
                + phoneNumber.substring(phoneNumber.length() - 4);
    }
}
