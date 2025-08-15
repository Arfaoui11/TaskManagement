package tn.esprit.userservice.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceClient {
    
    @Autowired
    private RestTemplate restTemplate;

    public String login(String username, String password) {
        String authUrl = "http://auth-service/oauth/token";

        // Corps de la requête
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("grant_type", "password");
        requestBody.put("username", username);
        requestBody.put("password", password);

        // Headers de la requête
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // Conversion du body en format attendu
        StringBuilder requestBodyEncoded = new StringBuilder();
        requestBody.forEach((key, value) -> requestBodyEncoded.append(key).append("=").append(value).append("&"));
        requestBodyEncoded.deleteCharAt(requestBodyEncoded.length() - 1);

        HttpEntity<String> requestEntity = new HttpEntity<>(requestBodyEncoded.toString(), headers);

        // Envoi de la requête
        ResponseEntity<Map> response = restTemplate.exchange(authUrl, HttpMethod.POST, requestEntity, Map.class);

        // Vérification de la réponse
        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("access_token")) {
                return responseBody.get("access_token").toString();
            }
        }

        throw new RuntimeException("Login failed: " + response.getBody());
    }

}
