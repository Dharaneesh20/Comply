package com.align.compliance.config;

import com.align.compliance.model.Organization;
import com.align.compliance.model.OrganizationMember;
import com.align.compliance.model.User;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.repository.OrganizationRepository;
import com.align.compliance.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!test")
public class DatabaseSeederConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeederConfig.class);

    @Bean
    public CommandLineRunner seedDatabase(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository memberRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            String demoEmail = "admin@align.com";
            if (!userRepository.existsByEmail(demoEmail)) {
                log.info("Seeding default demo admin user (admin@align.com)...");
                User adminUser = new User(
                        demoEmail,
                        passwordEncoder.encode("password123"),
                        "Align System Admin",
                        "ADMIN"
                );
                adminUser = userRepository.save(adminUser);

                Organization demoOrg = new Organization(
                        "Align Compliance Inc.",
                        "ALIGN-GLOBAL",
                        "HEALTHCARE"
                );
                demoOrg = organizationRepository.save(demoOrg);

                OrganizationMember member = new OrganizationMember(
                        demoOrg,
                        adminUser,
                        "ADMIN"
                );
                memberRepository.save(member);

                log.info("Successfully seeded demo user 'admin@align.com' and organization 'Align Compliance Inc.'");
            }
        };
    }
}
