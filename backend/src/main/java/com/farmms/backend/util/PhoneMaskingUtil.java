package com.farmms.backend.util;

public final class PhoneMaskingUtil {

    private PhoneMaskingUtil() {
    }

    public static String mask(String phone) {

        if (phone == null || phone.isBlank()) {
            return phone;
        }

        String numbers =
                phone.replaceAll("[^0-9]", "");

        /*
         * 휴대전화 예:
         * 01012345678
         * ↓
         * 010****5678
         */
        if (numbers.length() == 11) {
            return numbers.substring(0, 3)
                    + "****"
                    + numbers.substring(7);
        }

        /*
         * 10자리 전화번호 예:
         * 0101234567
         * ↓
         * 010***4567
         */
        if (numbers.length() == 10) {
            return numbers.substring(0, 3)
                    + "***"
                    + numbers.substring(6);
        }

        /*
         * 예상하지 못한 형식은
         * 전체 번호를 그대로 노출하지 않습니다.
         */
        if (numbers.length() >= 7) {
            return numbers.substring(0, 3)
                    + "****"
                    + numbers.substring(
                            numbers.length() - 4
                    );
        }

        return "****";
    }
}