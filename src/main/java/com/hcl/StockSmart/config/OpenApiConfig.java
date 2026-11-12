package com.hcl.StockSmart.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI stockSmartOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("StockSmart – Inventory Management API")
                        .description(
                                "RESTful API documentation for StockSmart, a full-stack inventory management system. " +
                                "Covers Products, Inventory, Orders, Suppliers, Locations, Purchase Orders, and Reports.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Ananya Agrawal")
                                .url("https://github.com/ananya-ag286")));
    }
}

