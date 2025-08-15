package tn.esprit.userservice.Entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActivationUserDTO {
    private String otp;
    private String activationToken;

}
