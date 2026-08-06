package com.farmms.backend.common.util;

/**
 * 전화번호 형식을 통일하는 유틸리티입니다.
 */
public final class PhoneNumberUtils {

    private PhoneNumberUtils() {
    }

    /**
     * 전화번호에서 하이픈, 공백 등 숫자가 아닌 문자를 제거합니다.
     *
     * @param phoneNumber 사용자가 입력한 전화번호
     * @return 숫자만 남긴 전화번호
     */
    public static String normalize(String phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }

        return phoneNumber.replaceAll("[^0-9]", "");
    }
}
