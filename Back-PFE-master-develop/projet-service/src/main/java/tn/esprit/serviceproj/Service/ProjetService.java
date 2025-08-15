package tn.esprit.serviceproj.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import tn.esprit.serviceproj.Entity.Notification;
import tn.esprit.serviceproj.Entity.Projet;
import tn.esprit.serviceproj.Entity.TeamDto;
import tn.esprit.serviceproj.Entity.UserDto;
import tn.esprit.serviceproj.IService.IProjetService;
import tn.esprit.serviceproj.Repository.DocumentRepo;
import tn.esprit.serviceproj.Repository.NotificationRepository;
import tn.esprit.serviceproj.Repository.ProjetRepo;

import org.springframework.http.HttpMethod;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProjetService implements IProjetService {
    @Autowired
    private DocumentRepo documentRepository;
    @Autowired
    private ProjetRepo projetRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private NotificationRepository notificationRepository;

    private final KafkaProducerService kafkaProducer;

    public ProjetService(KafkaProducerService kafkaProducer) {
        this.kafkaProducer = kafkaProducer;
    }

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public List<Map<String, Object>> getUsersForProject(Long projectId) {
        Optional<Projet> projectOpt = projetRepository.findById(projectId);
        if (projectOpt.isPresent()) {
            Projet project = projectOpt.get();
            List<Long> userIds = project.getUserIds();

            String userServiceUrl = "http://user-service/api2/users";

            List<Map<String, Object>> users = new ArrayList<>();
            for (Long userId : userIds) {
                try {
                    Map<String, Object> user = restTemplate.getForObject(userServiceUrl + "/" + userId, Map.class);
                    if (user != null) {
                        users.add(user);
                    }
                } catch (Exception e) {
                    System.err.println("Utilisateur non trouvé pour ID: " + userId + ": " + e.getMessage());
                }
            }
            return users;
        }
        throw new RuntimeException("Projet non trouvé");
    }

    @Override
    public Projet createProjet(Projet projet) {
        Projet savedProjet = projetRepository.save(projet);

        // Création notification
        Notification notif = new Notification();
        notif.setType("projet_cree");
        notif.setMessage("Le projet '" + savedProjet.getTitle() + "' a été créé.");
        notif.setProjetId(savedProjet.getId());

        // Utiliser createdBy pour associer l'utilisateur
        notif.setUserId(savedProjet.getCreatedBy());

        // Sauvegarde notification
        notificationRepository.save(notif);

        try {
            // Conversion en JSON
            String jsonNotif = objectMapper.writeValueAsString(notif);
            kafkaProducer.sendMessage(jsonNotif);
            System.out.println("✅ Notification envoyée au créateur du projet : " + notif.getUserId());
        } catch (JsonProcessingException e) {
            e.printStackTrace(); // Gérer proprement en prod
        }

        return savedProjet;
    }



    @Override
    public Projet getProjetById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
    }

    @Override
    public List<Projet> getAllProjets() {
        return projetRepository.findAll();
    }

    @Override
    public List<Projet> getArchivedProjets() {
        return projetRepository.findByArchivedTrue();
    }

    @Override
    public List<Projet> getActiveProjets() {
        return projetRepository.findByArchivedFalse();
    }

    @Override
    public List<Projet> getArchivedProjetsByUser(Long userId) {
        return projetRepository.findByArchivedTrueAndAndCreatedBy(userId);
    }

    @Override
    public List<Projet> getActiveProjetsByUser(Long userId) {
        return projetRepository.findByArchivedFalseAndUserIdsContaining(userId);
    }

    @Override
    public void deleteProjet(Long id) {
        // Supprimer les documents liés d'abord

        // Puis supprimer le projet
        projetRepository.deleteById(id);
    }
    @Override
    public Projet updateProjet(Long id, Projet projetDetails) {
        Projet projet = getProjetById(id);

        projet.setTitle(projetDetails.getTitle());
        projet.setDescription(projetDetails.getDescription());
        projet.setUpdatedAt(LocalDateTime.now());

        return projetRepository.save(projet);
    }

    @Override
    public Projet archiveProjet(Long id, Long userId) {
        return projetRepository.findById(id)
                .map(projet -> {
                    // Log project and user IDs for debugging
                    System.out.println("Project Users: " + projet.getUserIds());
                    System.out.println("Attempted User: " + userId);

                    // Vérifier si l'utilisateur est associé au projet
//                    if (!projet.getCreatedBy().equals(userId)) {
//                        throw new SecurityException("L'utilisateur " + userId + " n'a pas les droits pour archiver ce projet");
//                    }

                    projet.setArchived(true);
                    projet.setUpdatedAt(LocalDateTime.now());
                    return projetRepository.save(projet);
                })
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'ID: " + id));
    }


    @Override
    public Projet restoreProjet(Long id, Long userId) {
        return projetRepository.findById(id)
                .map(projet -> {
                    // Vérifier si l'utilisateur est associé au projet
                    if (!projet.getCreatedBy().equals(userId)) {
                        throw new SecurityException("L'utilisateur " + userId + " n'a pas les droits pour restaurer ce projet");
                    }

                    projet.setArchived(false);
                    projet.setUpdatedAt(LocalDateTime.now());
                    return projetRepository.save(projet);
                })
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'ID: " + id));
    }

    @Override
    public Projet affecterUtilisateurs(Long id, List<Long> userIds) {
        Optional<Projet> projetOptional = projetRepository.findById(id);

        if (!projetOptional.isPresent()) {
            throw new RuntimeException("Le projet avec l'ID " + id + " n'a pas été trouvé.");
        }

        Projet projet = projetOptional.get();

        // Ajouter les IDs des utilisateurs dans le projet
        projet.getUserIds().addAll(userIds);
        Projet updatedProjet = projetRepository.save(projet);

        // Récupérer les informations des utilisateurs via REST
        String userServiceUrl = "http://user-service/api2/users";

        for (Long userId : userIds) {
            try {
                Map<String, Object> user = restTemplate.getForObject(userServiceUrl + "/" + userId, Map.class);
                if (user != null && user.get("email") != null) {
                    String email = user.get("email").toString();
                    String link = "http://localhost:4200/list-task/" + id; // Lien vers le projet côté front
                    String subject = "Ajout à un projet";
                    String body = "Bonjour " + user.get("username") + ",\n\n" +
                            "Vous avez été ajouté au projet \"" + projet.getTitle() + "\".\n" +
                            "Cliquez ici pour y accéder : " + link + "\n\n" +
                            "Cordialement,\nL'équipe gestion de projets.";

                    emailService.sendEmail(email, subject, body);
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de l'envoi d'e-mail pour l'utilisateur ID: " + userId + ": " + e.getMessage());
            }
        }

        // Créer et envoyer une notification pour chaque utilisateur ajouté
        for (Long userId : userIds) {
            Notification notif = new Notification();
            notif.setType("utilisateur_affecte");
            notif.setMessage("Vous avez été ajouté au projet '" + projet.getTitle() + "'.");
            notif.setProjetId(projet.getId());
            notif.setUserId(userId);

            notificationRepository.save(notif);

            try {
                String jsonNotif = objectMapper.writeValueAsString(notif);
                kafkaProducer.sendMessage(jsonNotif);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }

        return updatedProjet;

    }



    @Override
    public Projet assignTeamToProject(Long projetId, Long teamId) {
        try {
            System.out.println("[START] AssignTeamToProject called with projetId = " + projetId + ", teamId = " + teamId);

            // Récupération du projet
            Projet projet = projetRepository.findById(projetId)
                    .orElseThrow(() -> {
                        System.out.println("[ERROR] Projet non trouvé pour ID: " + projetId);
                        return new RuntimeException("Projet non trouvé");
                    });
            System.out.println("[INFO] Projet trouvé: " + projet.getTitle());

            // Récupération de l'équipe
            TeamDto team = getTeamById(teamId);
            if (team == null) {
                System.out.println("[ERROR] Team non trouvée pour l'ID: " + teamId);
                throw new RuntimeException("Team non trouvée pour l'ID: " + teamId);
            }
            System.out.println("[INFO] Team trouvée: " + team.getName());

            // Affectation de l'équipe
            projet.setTeamId(teamId);
            System.out.println("[INFO] Équipe assignée au projet");

            // Création de la notification
            Notification notif = new Notification();
            notif.setType("equipe_assignee");
            notif.setMessage("L'équipe '" + team.getName() + "' a été assignée au projet '" + projet.getTitle() + "'.");
            notif.setProjetId(projet.getId());
            notif.setUserId(projet.getCreatedBy());
            System.out.println("[INFO] Notification créée : " + notif.getMessage());

            // Sauvegarde de la notification
            notificationRepository.save(notif);
            System.out.println("[INFO] Notification sauvegardée");

            // Envoi Kafka
            String jsonNotif = objectMapper.writeValueAsString(notif);
            kafkaProducer.sendMessage(jsonNotif);
            System.out.println("[INFO] Notification envoyée via Kafka : " + jsonNotif);

            // Sauvegarde du projet
            Projet savedProjet = projetRepository.save(projet);
            System.out.println("[SUCCESS] Projet mis à jour avec l'équipe assignée");

            return savedProjet;

        } catch (Exception e) {
            System.out.println("[EXCEPTION] Une erreur est survenue:");
            e.printStackTrace(); // Stack trace complète
            throw new RuntimeException("Erreur dans assignTeamToProject: " + e.getMessage());
        }
    }


    @Override
    public TeamDto getTeamByIdWithMembers(Long teamId) {
        String teamServiceUrl = "http://user-service/api2/teams";
        String userServiceUrl = "http://user-service/api2/users";

        try {
            // 1. Récupérer l'équipe avec la liste des membres (ids)
            TeamDto teamDto = restTemplate.getForObject(teamServiceUrl + "/" + teamId, TeamDto.class);
            if (teamDto == null || teamDto.getUsers() == null) {
                return null;
            }

            // 2. Récupérer les informations détaillées pour chaque membre
            List<Map<String, Object>> membersDetails = new ArrayList<>();
            for (UserDto user : teamDto.getUsers()) {
                try {
                    Map<String, Object> userDetails = restTemplate.getForObject(
                            userServiceUrl + "/" + user.getId(), Map.class
                    );
                    if (userDetails != null) {
                        membersDetails.add(userDetails);
                    }
                } catch (Exception ex) {
                    System.err.println("Erreur lors de la récupération de l'utilisateur ID " + user.getId() + ": " + ex.getMessage());
                }
            }

            // 3. Injecter les détails des membres dans le DTO de l'équipe
            teamDto.setMembersDetails(membersDetails); // Assure-toi que ce setter existe dans TeamDto

            return teamDto;

        } catch (Exception ex) {
            System.err.println("Erreur lors de la récupération de l'équipe ID " + teamId + ": " + ex.getMessage());
            return null;
        }
    }



    public TeamDto getTeamById(Long teamId) {
        String url = "http://user-service/api2/teams/" + teamId;

        // 🔐 Récupération du token depuis la requête HTTP en cours
        String token = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                .getRequest()
                .getHeader("Authorization");

        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Token d'authentification manquant dans la requête");
        }

        // 🔧 Création des headers avec Authorization
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token); // le token commence déjà par "Bearer "

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<TeamDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    TeamDto.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            System.out.println("[ERROR] Appel vers " + url + " échoué avec status " + e.getStatusCode());
            throw new RuntimeException("Erreur appel service team: " + e.getResponseBodyAsString());
        }
    }


}