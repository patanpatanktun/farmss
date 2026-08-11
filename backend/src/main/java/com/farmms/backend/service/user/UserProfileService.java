package com.farmms.backend.service.user;

import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.common.util.PhoneNumberUtils;
import com.farmms.backend.domain.contact.Contact;
import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.contactgroup.ContactGroup;
import com.farmms.backend.domain.contactgroup.ContactGroupRepository;
import com.farmms.backend.domain.image.GeneratedImage;
import com.farmms.backend.domain.image.GeneratedImageRepository;
import com.farmms.backend.domain.mms.MmsHistory;
import com.farmms.backend.domain.mms.MmsHistoryRepository;
import com.farmms.backend.domain.product.Product;
import com.farmms.backend.domain.product.ProductRepository;
import com.farmms.backend.domain.prompt.PromptHistoryRepository;
import com.farmms.backend.domain.user.User;
import com.farmms.backend.domain.user.UserRepository;
import com.farmms.backend.dto.user.AccountDeleteResult;
import com.farmms.backend.dto.user.CurrentPasswordRequest;
import com.farmms.backend.dto.user.DeleteAccountRequest;
import com.farmms.backend.dto.user.PasswordChangeRequest;
import com.farmms.backend.dto.user.UserProfileResponse;
import com.farmms.backend.dto.user.UserProfileUpdateRequest;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserRepository
            userRepository;

    private final ContactRepository
            contactRepository;

    private final ContactGroupRepository
            contactGroupRepository;

    private final ProductRepository
            productRepository;

    private final GeneratedImageRepository
            generatedImageRepository;

    private final MmsHistoryRepository
            mmsHistoryRepository;

    private final PromptHistoryRepository
            promptHistoryRepository;

    private final PasswordEncoder
            passwordEncoder;

    /**
     * 로그인한 사용자의 회원정보를 조회합니다.
     */
    public UserProfileResponse findMyProfile(
            Long userNum
    ) {
        User user = findUser(userNum);

        return UserProfileResponse.from(user);
    }

    /**
     * 회원정보 수정 전 현재 비밀번호를 확인합니다.
     */
    public void verifyCurrentPassword(
            Long userNum,
            CurrentPasswordRequest request
    ) {
        User user = findUser(userNum);

        validateCurrentPassword(
                user,
                request.currentPassword()
        );
    }

    /**
     * 로그인한 사용자의 기본정보를 수정합니다.
     */
    @Transactional
    public UserProfileResponse updateProfile(
            Long userNum,
            UserProfileUpdateRequest request
    ) {
        User user = findUser(userNum);

        validateCurrentPassword(
                user,
                request.currentPassword()
        );

        String email =
                request
                        .email()
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        boolean duplicatedEmail =
                userRepository
                        .existsByEmailAndUserNumNot(
                                email,
                                userNum
                        );

        if (duplicatedEmail) {
            throw new IllegalArgumentException(
                    "이미 사용 중인 이메일입니다."
            );
        }

        String normalizedPhone =
                PhoneNumberUtils.normalize(
                        request.phone()
                );

        user.updateProfile(
                email,
                request.name().trim(),
                request.gender()
                        .trim()
                        .toUpperCase(
                                Locale.ROOT
                        ),
                request.age(),
                normalizedPhone
        );

        return UserProfileResponse.from(user);
    }

    /**
     * 현재 비밀번호를 확인한 후 새 비밀번호로 변경합니다.
     */
    @Transactional
    public void changePassword(
            Long userNum,
            PasswordChangeRequest request
    ) {
        User user = findUser(userNum);

        validateCurrentPassword(
                user,
                request.currentPassword()
        );

        if (
                passwordEncoder.matches(
                        request.newPassword(),
                        user.getPassword()
                )
        ) {
            throw new IllegalArgumentException(
                    "새 비밀번호는 현재 비밀번호와 달라야 합니다."
            );
        }

        String encodedPassword =
                passwordEncoder.encode(
                        request.newPassword()
                );

        user.changePassword(
                encodedPassword
        );
    }

    /**
     * 현재 비밀번호를 확인하고
     * 회원과 연관된 데이터를 모두 삭제합니다.
     *
     * DB 삭제가 끝난 후 Controller에서 실제 이미지 파일을
     * 삭제할 수 있도록 파일 주소 목록을 반환합니다.
     */
    @Transactional
    public AccountDeleteResult deleteMyAccount(
            Long userNum,
            DeleteAccountRequest request
    ) {
        User user = findUser(userNum);

        validateCurrentPassword(
                user,
                request.currentPassword()
        );

        /*
         * 회원이 등록한 상품을 미리 조회합니다.
         *
         * 상품 삭제 전에 참고 이미지 주소를
         * 수집하기 위해 필요합니다.
         */
        List<Product> products =
                productRepository
                        .findAllByUserNumOrderByProNumDesc(
                                userNum
                        );

        /*
         * 상품 참고 이미지 실제 파일 주소를 수집합니다.
         */
        List<String> referenceImageUrls =
                products
                        .stream()
                        .map(
                                Product::getReferenceImageUrl
                        )
                        .filter(imageUrl ->
                                imageUrl != null &&
                                !imageUrl.isBlank()
                        )
                        .distinct()
                        .toList();

        /*
         * 회원이 생성한 OpenAI 이미지들을 미리 조회합니다.
         */
        List<GeneratedImage> generatedImages =
                generatedImageRepository
                        .findAllByUserNumOrderByCreateDayDesc(
                                userNum
                        );

        /*
         * 서버에 저장된 실제 생성 이미지 주소를 수집합니다.
         */
        List<String> generatedImageUrls =
                generatedImages
                        .stream()
                        .map(
                                GeneratedImage::getImageUrl
                        )
                        .filter(imageUrl ->
                                imageUrl != null &&
                                !imageUrl.isBlank()
                        )
                        .distinct()
                        .toList();

        /*
         * 외래키 관계의 아래 데이터부터 삭제합니다.
         *
         * 1. MMS 발송 내역
         * 2. 생성 이미지
         * 3. 프롬프트 내역
         * 4. 상품
         * 5. 연락처와 재배작물
         * 6. 연락처 그룹
         * 7. 회원
         */

        /*
         * 1. 회원의 MMS 발송 내역을 삭제합니다.
         *
         * 회원 탈퇴 시에는 발송 내역도 함께 삭제합니다.
         */
        List<MmsHistory> mmsHistories =
                mmsHistoryRepository
                        .findAllByUserNumOrderByMmsNumDesc(
                                userNum
                        );

        if (!mmsHistories.isEmpty()) {
            mmsHistoryRepository.deleteAll(
                    mmsHistories
            );

            mmsHistoryRepository.flush();
        }

        /*
         * 2. 생성 이미지 DB 정보를 삭제합니다.
         */
        if (!generatedImages.isEmpty()) {
            generatedImageRepository.deleteAll(
                    generatedImages
            );

            generatedImageRepository.flush();
        }

        /*
         * 3. 프롬프트 생성 내역을 삭제합니다.
         */
        promptHistoryRepository.deleteAllByUserNum(
                userNum
        );

        promptHistoryRepository.flush();

        /*
         * 4. 회원이 등록한 상품을 삭제합니다.
         */
        if (!products.isEmpty()) {
            productRepository.deleteAll(
                    products
            );

            productRepository.flush();
        }

        /*
         * 5. 재배작물과 연락처를 삭제합니다.
         *
         * Contact의 crops는 @ElementCollection이므로
         * Contact가 삭제될 때 함께 삭제됩니다.
         */
        List<Contact> contacts =
                contactRepository
                        .findAllByUserNumOrderByConNumDesc(
                                userNum
                        );

        if (!contacts.isEmpty()) {
            contactRepository.deleteAll(
                    contacts
            );

            contactRepository.flush();
        }

        /*
         * 6. 고객 그룹을 삭제합니다.
         */
        List<ContactGroup> contactGroups =
                contactGroupRepository
                        .findAllByUserNumOrderByGroupNumDesc(
                                userNum
                        );

        if (!contactGroups.isEmpty()) {
            contactGroupRepository.deleteAll(
                    contactGroups
            );

            contactGroupRepository.flush();
        }

        /*
         * 7. 회원을 삭제합니다.
         */
        userRepository.delete(user);
        userRepository.flush();

        /*
         * DB 삭제가 성공한 뒤 Controller에서 실제 파일을
         * 삭제할 수 있도록 주소 목록을 반환합니다.
         */
        return new AccountDeleteResult(
                referenceImageUrls,
                generatedImageUrls
        );
    }

    /**
     * 전달받은 비밀번호가 현재 비밀번호와
     * 일치하는지 확인합니다.
     */
    private void validateCurrentPassword(
            User user,
            String currentPassword
    ) {
        if (
                currentPassword == null ||
                currentPassword.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "현재 비밀번호를 입력해주세요."
            );
        }

        if (
                !passwordEncoder.matches(
                        currentPassword,
                        user.getPassword()
                )
        ) {
            throw new IllegalArgumentException(
                    "현재 비밀번호가 일치하지 않습니다."
            );
        }
    }

    /**
     * 회원 번호로 사용자를 조회합니다.
     */
    private User findUser(Long userNum) {
        if (userNum == null) {
            throw new IllegalArgumentException(
                    "로그인 정보가 존재하지 않습니다."
            );
        }

        return userRepository
                .findById(userNum)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "회원 정보를 찾을 수 없습니다."
                        )
                );
    }
}