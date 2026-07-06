package com.projectshop.controller;

import com.projectshop.dto.SiteSettingsResponse;
import com.projectshop.service.SiteSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public endpoint — no authentication required.
 * Lets the homepage render admin-editable content (hero title/description/image).
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SiteSettingsService siteSettingsService;

    @GetMapping
    public ResponseEntity<SiteSettingsResponse> getSettings() {
        return ResponseEntity.ok(siteSettingsService.getSettings());
    }
}
