package com.projectshop.config;

import com.projectshop.security.JwtFilter;
import com.projectshop.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final RateLimitFilter rateLimitFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (stateless JWT API)
            .csrf(AbstractHttpConfigurer::disable)

            // CORS from our CorsConfigurationSource bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Route authorization rules
            .authorizeHttpRequests(auth -> auth
                // H2 console — dev only
                .requestMatchers("/h2-console/**").permitAll()

                // Health check — used by Docker/uptime monitors
                .requestMatchers("/actuator/health").permitAll()

                // Public endpoints — no auth required
                .requestMatchers(HttpMethod.GET,  "/api/projects").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/projects/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/settings").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/categories").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/leads").permitAll()

                // Admin login — no auth
                .requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()

                // All other /api/admin/** routes — require valid JWT
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Everything else denied
                .anyRequest().authenticated()
            )

            // Stateless session — no HTTP session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Allow H2 console to render in iframes
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))

            // Return 401 instead of 403 for unauthenticated REST API requests
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new org.springframework.security.web.authentication.HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED))
            )

            // Wire up our auth provider
            .authenticationProvider(authenticationProvider())

            // Add JWT filter before the standard username/password filter,
            // and rate-limit login/lead submission before that
            .addFilterBefore(rateLimitFilter, org.springframework.security.web.authentication.logout.LogoutFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
