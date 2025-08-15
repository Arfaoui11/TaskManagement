package tn.esprit.getway.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity serverHttpSecurity) {
        serverHttpSecurity
                .csrf().disable()
                .cors().disable()
                .httpBasic().disable()
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/auth/**", "/api2/**", "/api1/**", "/api2/users/invite", "/api1/projets")
                        .permitAll()
                        .anyExchange()
                        .authenticated()
                );

        return serverHttpSecurity.build();
    }
}
