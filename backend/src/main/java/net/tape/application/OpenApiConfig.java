package net.tape.application;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI tapeOpenAPI() {
        return new OpenAPI().info(new Info()
            .title("Tape Network API")
            .version("v1")
            .description("Public content API (/api/v1) and CMS admin API (/api/admin)."));
    }

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder().group("user").pathsToMatch("/api/v1/**").build();
    }

    @Bean
    public GroupedOpenApi cmsApi() {
        return GroupedOpenApi.builder().group("cms").pathsToMatch("/api/admin/**").build();
    }
}
