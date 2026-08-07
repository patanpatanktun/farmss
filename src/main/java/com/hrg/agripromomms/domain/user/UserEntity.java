package com.hrg.agripromomms.domain.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 판매업자 회원 정보를 저장하는 user 테이블 엔티티입니다.
 * User라는 이름은 Spring Security 클래스와 혼동될 수 있어 UserEntity로 작성했습니다.
 */
@Getter
@Entity
@Table(name = "`user`")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_num")
    private Long userNum;

    @Column(name = "user_id", nullable = false, unique = true, length = 100)
    private String userId;

    @Column(name = "pw", nullable = false, length = 255)
    private String password;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, columnDefinition = "CHAR(1)")
    private Gender gender;

    @Column(name = "age")
    private Integer age;

    @Column(name = "join_date", nullable = false)
    private LocalDateTime joinDate;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;
}
