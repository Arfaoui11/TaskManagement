package tn.esprit.serviceproj.Config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsResourceDetails;
import org.springframework.web.client.RestTemplate;

@Configuration
public class SecurityConf {

    @Bean
    @ConfigurationProperties("security.oauth2.client")
    public ClientCredentialsResourceDetails oAuthDetails()
    {
        return new ClientCredentialsResourceDetails();
    }


    @Bean
    @LoadBalanced
    public RestTemplate getRestTemplate()
    {
        return new OAuth2RestTemplate(oAuthDetails());
    }

}