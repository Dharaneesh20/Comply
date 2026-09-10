package com.align.compliance.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI alignOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Align Compliance Intelligence API")
                        .description("Privacy-first Regulatory & SOP Compliance Intelligence Platform REST API")
                        .version("v0.1.0")
                        .contact(new Contact()
                                .name("Align Architecture Team")
                                .email("dev@aligncompliance.io"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://aligncompliance.io")));
    }
}
