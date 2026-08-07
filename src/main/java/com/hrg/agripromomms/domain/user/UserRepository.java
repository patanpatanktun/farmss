package com.hrg.agripromomms.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** user 테이블에 접근하는 저장소입니다. */
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUserId(String userId);
}
