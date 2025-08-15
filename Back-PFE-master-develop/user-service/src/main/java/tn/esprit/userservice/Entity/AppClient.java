package tn.esprit.userservice.Entity;

import lombok.*;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name="oauth_client_details")
public class AppClient implements Serializable {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    @Column(name="id")
    private Long id;


    @Column(name="client_id")
    private String clientId;

    @Column(name="client_secret")
    private String clientSecret;

    @Column(name="access_token_validity")
    private int accessTokenValidity;

    @Column(name="scope")
    private String scope;

    @Column(name="authorities")
    private String authorities;

    @Column(name="authorized_grant_types")
    private String authorizedGrantTypes;

    @Column(name="refresh_token_validity")
    private int refreshTokenValidity;

    @Column(name="resource_ids")
    private String resourceIds;

    @Column(name="web_server_redirect_uri")
    private String webServerRedirectUri;

    @Column(name="autoapprove")
    private String autoApprove;

    @Column(name="additional_information")
    private String addInfo;
}
