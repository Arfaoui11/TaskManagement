package tn.esprit.authservice.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.error.OAuth2AccessDeniedHandler;

@Configuration
@EnableResourceServer
public class AuthResourceServerConfig extends ResourceServerConfigurerAdapter {


    private static final String RESOURCE_ID = "auth-resource";

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) throws Exception {

        resources.resourceId(RESOURCE_ID).stateless(false);
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {

        http
                .authorizeRequests()
                .antMatchers("/users/**,/permissions/**,/roles/**,/auth/**,/projets/**,/documents/**,/dossiers/**,'/teams/**,/taches/**,'/api2/auth/login").hasAnyRole("ADMIN","USER","MANAGER").and()
                .exceptionHandling().accessDeniedHandler(new OAuth2AccessDeniedHandler());


    }
}