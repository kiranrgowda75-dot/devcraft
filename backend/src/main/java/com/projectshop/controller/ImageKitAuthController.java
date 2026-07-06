package com.projectshop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

/**
 * GET /api/admin/imagekit/auth
 * Returns the short-lived authentication parameters that the frontend
 * ImageKit SDK needs to upload directly to ImageKit from the browser.
 *
 * Protected by JWT (same as all /api/admin/** routes).
 */
@RestController
@RequestMapping("/api/admin/imagekit")
@RequiredArgsConstructor
public class ImageKitAuthController {

    @Value("${imagekit.private-key}")
    private String privateKey;

    @GetMapping("/auth")
    public ResponseEntity<Map<String, String>> getAuthParams()
            throws NoSuchAlgorithmException, InvalidKeyException {

        String token     = UUID.randomUUID().toString();
        String expire    = String.valueOf((System.currentTimeMillis() / 1000) + 1800); // 30-min window (ImageKit requires < 1 hour)
        String signature = hmacSha1(privateKey, token + expire);

        return ResponseEntity.ok(Map.of(
                "token",     token,
                "expire",    expire,
                "signature", signature
        ));
    }

    private String hmacSha1(String key, String data)
            throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA1"));
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(rawHmac);
    }
}
