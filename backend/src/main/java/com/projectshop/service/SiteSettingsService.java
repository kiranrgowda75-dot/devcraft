package com.projectshop.service;

import com.projectshop.dto.SiteSettingsRequest;
import com.projectshop.dto.SiteSettingsResponse;
import com.projectshop.entity.SiteSettings;
import com.projectshop.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

    private static final Long SETTINGS_ID = 1L;

    private final SiteSettingsRepository siteSettingsRepository;

    /**
     * Returns the current site settings, seeding sensible defaults on first call
     * so the public homepage never renders empty even before an admin edits anything.
     */
    @Transactional
    public SiteSettingsResponse getSettings() {
        SiteSettings settings = siteSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(this::createDefaults);
        return toResponse(settings);
    }

    @Transactional
    public SiteSettingsResponse updateSettings(SiteSettingsRequest request) {
        SiteSettings settings = siteSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(this::createDefaults);

        settings.setHeroTitle(request.getHeroTitle());
        settings.setHeroHighlight(request.getHeroHighlight());
        settings.setHeroDescription(request.getHeroDescription());
        settings.setHeroImageUrl(request.getHeroImageUrl());

        return toResponse(siteSettingsRepository.save(settings));
    }

    private SiteSettings createDefaults() {
        SiteSettings defaults = SiteSettings.builder()
                .id(SETTINGS_ID)
                .heroTitle("Precision Digital Craftsmanship.")
                .heroHighlight("Ready to Deploy.")
                .heroDescription("Discover premium, pre-built engineering projects. Skip the boilerplate " +
                        "and accelerate your timeline with production-ready codebases designed " +
                        "for modern infrastructure.")
                .heroImageUrl("https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=85")
                .build();
        return siteSettingsRepository.save(defaults);
    }

    private SiteSettingsResponse toResponse(SiteSettings s) {
        return SiteSettingsResponse.builder()
                .heroTitle(s.getHeroTitle())
                .heroHighlight(s.getHeroHighlight())
                .heroDescription(s.getHeroDescription())
                .heroImageUrl(s.getHeroImageUrl())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
