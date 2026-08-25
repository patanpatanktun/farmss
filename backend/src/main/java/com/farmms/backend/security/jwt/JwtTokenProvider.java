	package com.farmms.backend.security.jwt;

	import java.util.Date;

	import javax.crypto.SecretKey;

	import org.springframework.beans.factory.annotation.Value;
	import org.springframework.stereotype.Component;

	import io.jsonwebtoken.Claims;
	import io.jsonwebtoken.JwtException;
	import io.jsonwebtoken.Jwts;
	import io.jsonwebtoken.io.Decoders;
	import io.jsonwebtoken.security.Keys;
	import jakarta.annotation.PostConstruct;

	@Component
	public class JwtTokenProvider {

	    @Value("${jwt.secret}")
	    private String secret;

	    @Value("${jwt.access-token-expiration}")
	    private long accessTokenExpiration;

	    private SecretKey signingKey;

	    @PostConstruct
	    public void initializeKey() {
	        byte[] keyBytes = Decoders.BASE64.decode(secret);
	        signingKey = Keys.hmacShaKeyFor(keyBytes);
	    }

	    public String createAccessToken(
	            Long userNum,
	            String userId,
	            String role
	    ) {

	        Date issuedAt = new Date();

	        Date expiration = new Date(
	                issuedAt.getTime() + accessTokenExpiration
	        );

	        return Jwts.builder()
	                .subject(userId)
	                .claim("userNum", userNum)
	                .claim("role", role)
	                .issuedAt(issuedAt)
	                .expiration(expiration)
	                .signWith(signingKey)
	                .compact();
	    }

	    public boolean validateToken(String token) {
	        try {
	            Claims claims = parseClaims(token);

	            String userId =
	                    claims.getSubject();

	            Number userNum =
	                    claims.get(
	                            "userNum",
	                            Number.class
	                    );

	            String role =
	                    claims.get(
	                            "role",
	                            String.class
	                    );

	            if (
	                    userId == null ||
	                    userId.isBlank()
	            ) {
	                return false;
	            }

	            if (
	                    userNum == null ||
	                    userNum.longValue() <= 0
	            ) {
	                return false;
	            }

	            if (
	                    role == null ||
	                    (
	                            !role.equals("USER") &&
	                            !role.equals("ADMIN")
	                    )
	            ) {
	                return false;
	            }

	            return true;

	        } catch (
	                JwtException |
	                IllegalArgumentException exception
	        ) {
	            return false;
	        }
	    }

	    public Long getUserNum(String token) {
	        Number userNum = parseClaims(token).get("userNum", Number.class);
	        return userNum.longValue();
	    }

	    public String getUserId(String token) {
	        return parseClaims(token).getSubject();
	    }

	    public String getRole(String token) {
	        return parseClaims(token)
	                .get("role", String.class);
	    }

	    private Claims parseClaims(String token) {
	        return Jwts.parser()
	                .verifyWith(signingKey)
	                .build()
	                .parseSignedClaims(token)
	                .getPayload();
	    }
	}