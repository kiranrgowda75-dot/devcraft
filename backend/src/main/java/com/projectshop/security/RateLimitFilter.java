package com.projectshop.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Lightweight per-IP rate limiter for the two public endpoints that are
 * otherwise wide open to abuse: admin login (brute force) and lead
 * submission (spam).
 *
 * This is deliberately simple — an in-memory sliding window, no extra
 * dependency. It protects a single instance. If this app is ever scaled
 * to multiple instances behind a load balancer, replace this with a
 * shared store (e.g. Redis) so limits are enforced across all instances.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(String method, String path, int maxRequests, long windowMs) {}

    private static final Rule[] RULES = {
            // Login: 5 attempts per minute per IP — generous for a real user,
            // painful for a brute-force script.
            new Rule("POST", "/api/admin/login", 5, 60_000),
            // Leads/contact form: 8 submissions per minute per IP.
            new Rule("POST", "/api/leads", 8, 60_000),
    };

    private final Map<String, ConcurrentLinkedDeque<Long>> hits = new ConcurrentHashMap<>();
    private final AtomicLong requestCounter = new AtomicLong();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        Rule matchedRule = matchRule(request);

        if (matchedRule != null) {
            String key = matchedRule.path() + "|" + clientIp(request);
            long now = System.currentTimeMillis();
            ConcurrentLinkedDeque<Long> timestamps = hits.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

            synchronized (timestamps) {
                while (!timestamps.isEmpty() && now - timestamps.peekFirst() > matchedRule.windowMs()) {
                    timestamps.pollFirst();
                }
                if (timestamps.size() >= matchedRule.maxRequests()) {
                    response.setStatus(429); // Too Many Requests
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"status\":429,\"error\":\"Too Many Requests\"," +
                            "\"message\":\"Too many requests — please wait a minute and try again.\"}");
                    return;
                }
                timestamps.addLast(now);
            }
        }

        // Occasionally sweep out fully-expired entries so the map doesn't
        // grow unbounded from one-off visitors. Cheap and good enough here.
        if (requestCounter.incrementAndGet() % 500 == 0) {
            long now = System.currentTimeMillis();
            hits.entrySet().removeIf(entry -> {
                ConcurrentLinkedDeque<Long> deque = entry.getValue();
                synchronized (deque) {
                    return deque.isEmpty() || now - deque.peekLast() > 300_000;
                }
            });
        }

        filterChain.doFilter(request, response);
    }

    private Rule matchRule(HttpServletRequest request) {
        for (Rule rule : RULES) {
            if (rule.method().equalsIgnoreCase(request.getMethod())
                    && rule.path().equals(request.getRequestURI())) {
                return rule;
            }
        }
        return null;
    }

    private String clientIp(HttpServletRequest request) {
        // Behind a reverse proxy/load balancer, the real client IP is in
        // X-Forwarded-For (first entry). Falls back to the socket address
        // for direct connections (e.g. local dev).
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
