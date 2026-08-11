package com.farmms.backend.domain.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUserId(String userId);

    boolean existsByUserId(String userId);

    boolean existsByEmail(String email);
    
    /**
     * 현재 사용자를 제외하고 동일한 이메일이 있는지 확인합니다.
     */
    boolean existsByEmailAndUserNumNot(
            String email,
            Long userNum
    );
}