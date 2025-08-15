package tn.esprit.userservice.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.error.OAuth2AccessDeniedHandler;
import org.springframework.web.bind.annotation.CrossOrigin;

@Configuration
@EnableResourceServer
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class UserResourceServerConfig extends ResourceServerConfigurerAdapter {

    private static final String RESOURCE_ID = "user-resource";

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
        resources.resourceId(RESOURCE_ID).stateless(false);
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.
                csrf()
                .disable().cors().disable()
                .httpBasic().disable()
                .authorizeRequests()
                .antMatchers("/auth/**", "/auth/forget-password/**","/auth/reset-password/","/auth/refresh-token/","/auth/logout/", "/users/**","/permissions/**","/roles/**","/api2/users/invite","/projets/**","/documents/**","/dossiers/**","api2/teams/**","/taches/**").permitAll()
                .anyRequest()
                .authenticated()
                .and().exceptionHandling().accessDeniedHandler(new OAuth2AccessDeniedHandler());
    }

}
