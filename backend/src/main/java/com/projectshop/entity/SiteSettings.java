package com.projectshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Single-row table holding editable public-site content (currently: homepage hero).
 * We always read/write the row with id = 1 — see SiteSettingsService.
 */
@Entity
@Table(name = "site_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSettings {

    @Id
    private Long id;

    @Column(name = "hero_title", nullable = false, length = 200)
    private String heroTitle;

    // The accent-colored trailing part of the headline, e.g. "Ready to Deploy."
    @Column(name = "hero_highlight", length = 100)
    private String heroHighlight;

    @Column(name = "hero_description", nullable = false, columnDefinition = "TEXT")
    private String heroDescription;

    @Column(name = "hero_image_url", nullable = false)
    private String heroImageUrl;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
