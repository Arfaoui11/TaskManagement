package tn.esprit.serviceproj;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableDiscoveryClient
@EnableJpaRepositories
@SpringBootApplication // Ensure the correct package for repositories
public class ServiceProjApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceProjApplication.class, args);
    }

}
