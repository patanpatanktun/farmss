package com.farmms.backend.domain.user;

import java.time.LocalDateTime;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "`user`")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_num")
    private Long userNum;

    @Column(
            name = "user_id",
            nullable = false,
            unique = true,
            length = 100
    )
    private String userId;

    @Column(
            name = "pw",
            nullable = false,
            length = 255
    )
    private String password;

    @Column(
            name = "email",
            nullable = false,
            unique = true,
            length = 100
    )
    private String email;

    @Column(
            name = "name",
            nullable = false,
            length = 30
    )
    private String name;

    @Column(
            name = "gender",
            nullable = false,
            length = 1
    )
    private String gender;

    @Column(
            name = "age",
            nullable = false
    )
    private Integer age;

    @Column(
            name = "phone",
            nullable = false,
            length = 20
    )
    private String phone;
    
    @Column(name = "join_date", nullable = false)
    private LocalDateTime joinDate;
    
    private User(
            String userId,
            String password,
            String email,
            String name,
            String gender,
            Integer age,
            String phone
    ) {
        this.userId = userId;
        this.password = password;
        this.email = email;
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.phone = phone;
    }

    public static User create(
            String userId,
            String encodedPassword,
            String email,
            String name,
            String gender,
            Integer age,
            String phone
    ) {
        return new User(
                userId,
                encodedPassword,
                email,
                name,
                gender,
                age,
                phone
        );
    }
    
    /**
     * 회원의 기본 정보를 수정합니다.
     */
    public void updateProfile(
            String email,
            String name,
            String gender,
            Integer age,
            String phone
    ) {
        this.email = email;
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.phone = phone;
    }

    /**
     * 암호화된 새 비밀번호로 변경합니다.
     */
    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
    
    @PrePersist
    public void prePersist() {
        if (joinDate == null) {
            joinDate = LocalDateTime.now();
        }
    }
    
}