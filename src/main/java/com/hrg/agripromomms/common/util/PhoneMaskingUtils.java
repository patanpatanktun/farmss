package com.hrg.agripromomms.common.util;

/** 개인정보 보호를 위해 전화번호 일부를 가립니다. */
public final class PhoneMaskingUtils {

    private PhoneMaskingUtils() {
    }

    public static String mask(String phone) {
        if (phone == null || phone.isBlank()) {
            return "";
        }
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() < 7) {
            return "****";
        }
        return digits.substring(0, 3) + "-****-" + digits.substring(digits.length() - 4);
    }
}
