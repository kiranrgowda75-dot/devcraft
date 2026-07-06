package com.projectshop.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Refuses to finish starting up under the "prod" profile if the app is
 * still using the placeholder JWT secret or default admin password from
 * application.properties. Those defaults are fine for local dev, but
 * booting production with them would mean anyone who reads the (public)
 * source code can forge admin tokens or log in as admin.
 *
 * Set real values via the JWT_SECRET / ADMIN_USERNAME / ADMIN_PASSWORD
 * environment variables before deploying.
 */
@Component
@Slf4j
public class StartupSecurityCheck {

    private static final String DEFAULT_JWT_SECRET = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY_MIN_32_CHARS";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    private final Environment environment;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.admin.password}")
    private String adminPassword;

    public StartupSecurityCheck(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void verifySecureConfig() {
        boolean isProd = java.util.Arrays.asList(environment.getActiveProfiles()).contains("prod");

        if (!isProd) {
            return;
        }

        StringBuilder problems = new StringBuilder();

        if (DEFAULT_JWT_SECRET.equals(jwtSecret)) {
            problems.append("\n  - JWT_SECRET is still the placeholder value. Set a long random secret (32+ chars).");
        }
        if (jwtSecret != null && jwtSecret.length() < 32) {
            problems.append("\n  - JWT_SECRET is shorter than 32 characters, which weakens the signature.");
        }
        if (DEFAULT_ADMIN_PASSWORD.equals(adminPassword)) {
            problems.append("\n  - ADMIN_PASSWORD is still the default 'admin123'. Set a strong password.");
        }

        if (problems.length() > 0) {
            String message = "Refusing to start with 'prod' profile active due to insecure configuration:"
                    + problems + "\n";
            log.error(message);
            throw new IllegalStateException(message);
        }

        log.info("Startup security check passed: JWT secret and admin password look configured.");
    }
}
