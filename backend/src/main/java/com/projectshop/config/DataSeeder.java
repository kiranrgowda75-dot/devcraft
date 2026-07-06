package com.projectshop.config;

import com.projectshop.entity.AdminUser;
import com.projectshop.entity.Category;
import com.projectshop.entity.Project;
import com.projectshop.entity.Lead;
import com.projectshop.enums.ProjectStatus;
import com.projectshop.enums.InquiryType;
import com.projectshop.enums.LeadStatus;
import com.projectshop.repository.AdminUserRepository;
import com.projectshop.repository.CategoryRepository;
import com.projectshop.repository.ProjectRepository;
import com.projectshop.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Runs once at startup — seeds the admin user, sample projects, and sample leads if DB is empty.
 * Credentials are read from application.properties so you can change them
 * without touching code.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final CategoryRepository categoryRepository;
    private final ProjectRepository projectRepository;
    private final LeadRepository leadRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCategories();
        seedProjects();
        seedLeads();
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) {
            log.info("ℹ️  Categories already exist — skipping seed.");
            return;
        }

        // These match the categories that used to be hardcoded in the
        // admin "New Project" dropdown, so nothing breaks for existing
        // projects and the dropdown isn't empty on first run.
        List<Category> categories = List.of(
                Category.builder().name("Web App").build(),
                Category.builder().name("Mobile App").build(),
                Category.builder().name("API / Backend").build(),
                Category.builder().name("ML / AI").build(),
                Category.builder().name("Game").build()
        );

        categoryRepository.saveAll(categories);
        log.info("✅ {} categories seeded.", categories.size());
    }

    private void seedAdmin() {
        if (adminUserRepository.count() == 0) {
            AdminUser admin = AdminUser.builder()
                    .username(adminUsername)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .build();
            adminUserRepository.save(admin);
            log.info("✅ Admin user '{}' seeded successfully.", adminUsername);
        } else {
            log.info("ℹ️  Admin user already exists — skipping seed.");
        }
    }

    private void seedProjects() {
        if (projectRepository.count() > 0) {
            log.info("ℹ️  Projects already exist — skipping seed.");
            return;
        }

        List<Project> projects = List.of(

            Project.builder()
                .title("Nexus Analytics Dashboard")
                .shortDesc("High-performance analytics template with 15+ pre-built chart components.")
                .description("A production-ready analytics dashboard built with React and Tailwind CSS. " +
                    "Includes 15+ pre-built chart and data-grid components, dark/light mode toggle, " +
                    "role-based access control, and full REST API integration. Perfect for SaaS or " +
                    "internal admin tools.")
                .price(new BigDecimal("149.00"))
                .category("Web App")
                .techStack(List.of("React", "TypeScript", "Tailwind CSS", "Recharts", "Spring Boot"))
                .thumbnailUrl("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80")
                .screenshotUrls(List.of(
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
                    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80"
                ))
                .demoVideoUrl("https://youtube.com/watch?v=demo1")
                .status(ProjectStatus.ACTIVE)
                .build(),

            Project.builder()
                .title("Aura E-Commerce Engine")
                .shortDesc("Headless commerce boilerplate with Stripe integration and full cart state.")
                .description("A complete headless e-commerce boilerplate built on Next.js. Features " +
                    "product catalog, cart state management with Zustand, checkout flow, Stripe payment " +
                    "integration, order management, and an admin dashboard. Deploy-ready on Vercel.")
                .price(new BigDecimal("299.00"))
                .category("Web App")
                .techStack(List.of("Next.js", "TypeScript", "PostgreSQL", "Stripe", "Zustand", "Tailwind CSS"))
                .thumbnailUrl("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80")
                .screenshotUrls(List.of(
                    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80"
                ))
                .demoVideoUrl("https://youtube.com/watch?v=demo2")
                .status(ProjectStatus.ACTIVE)
                .build(),

            Project.builder()
                .title("CoreAuth Microservice")
                .shortDesc("JWT authentication service with RBAC, rate limiting, and Docker support.")
                .description("A robust, production-grade authentication microservice built with Spring Boot. " +
                    "Features JWT token auth, refresh tokens, role-based access control (RBAC), " +
                    "rate limiting with Bucket4j, comprehensive test coverage, and Docker support. " +
                    "Drop it into any microservice architecture.")
                .price(new BigDecimal("99.00"))
                .category("API / Backend")
                .techStack(List.of("Spring Boot", "Java 17", "PostgreSQL", "Docker", "JWT", "Redis"))
                .thumbnailUrl("https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80")
                .screenshotUrls(List.of(
                    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80"
                ))
                .demoVideoUrl(null)
                .status(ProjectStatus.ACTIVE)
                .build(),

            Project.builder()
                .title("SwiftTask Mobile App")
                .shortDesc("Cross-platform task manager with offline sync and Kanban board.")
                .description("A cross-platform React Native task management app with offline-first sync, " +
                    "push notifications, team workspaces, drag-and-drop Kanban board, and Firebase " +
                    "backend. Works on iOS and Android with a single codebase.")
                .price(new BigDecimal("199.00"))
                .category("Mobile App")
                .techStack(List.of("React Native", "Expo", "Firebase", "TypeScript", "Redux Toolkit"))
                .thumbnailUrl("https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80")
                .screenshotUrls(List.of(
                    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80"
                ))
                .demoVideoUrl("https://youtube.com/watch?v=demo4")
                .status(ProjectStatus.ACTIVE)
                .build()
        );

        projectRepository.saveAll(projects);
        log.info("✅ {} sample projects seeded.", projects.size());
    }

    private void seedLeads() {
        if (leadRepository.count() > 0) {
            log.info("ℹ️  Leads already exist — skipping seed.");
            return;
        }

        List<Project> allProjects = projectRepository.findAll();
        if (allProjects.isEmpty()) return;
        
        Project p1 = allProjects.get(0);
        Project p2 = allProjects.get(1);
        Project p3 = allProjects.get(2);

        List<Lead> leads = List.of(
            Lead.builder()
                .project(p1)
                .customerName("Julian Dash")
                .customerEmail("julian.d@example.com")
                .inquiryType(InquiryType.CONTACT_FORM)
                .status(LeadStatus.NEW)
                .build(),
            Lead.builder()
                .project(p2)
                .customerName("Sarah Koenig")
                .customerEmail("ID: #CUST-9921")
                .inquiryType(InquiryType.WHATSAPP_CLICK)
                .status(LeadStatus.IN_PROGRESS)
                .build(),
            Lead.builder()
                .project(p1)
                .customerName("Marcus Reed")
                .customerEmail("m.reed@agency.io")
                .inquiryType(InquiryType.CONTACT_FORM)
                .status(LeadStatus.CLOSED)
                .build(),
            Lead.builder()
                .project(p2)
                .customerName("Elena Lopez")
                .customerEmail("ID: #CUST-9877")
                .inquiryType(InquiryType.WHATSAPP_CLICK)
                .status(LeadStatus.NEW)
                .build()
        );

        leadRepository.saveAll(leads);
        log.info("✅ {} sample leads seeded.", leads.size());
    }
}
