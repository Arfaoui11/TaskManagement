package tn.esprit.serviceproj.Entity;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class TeamDto {
    private Long id;
    private String name;
    private List<UserDto> users;
    private List<Map<String, Object>> membersDetails; // à ajouter si non présent

    // Optionnel, utilisé seulement si UserDto n’est pas connu ou utilisé dans certains cas
}


