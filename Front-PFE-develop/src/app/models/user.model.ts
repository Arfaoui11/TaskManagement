import { Role } from "./role.model";
import { Team } from "./team.model";
export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
  }
  
  
export interface User {
    id: number;                       // Identifiant unique pour l'utilisateur
    username: string;                  // Le nom d'utilisateur de l'utilisateur
    password: string;                  // Le mot de passe de l'utilisateur (assurez-vous de le gérer de manière sécurisée côté backend)
    email: string;                     // L'email de l'utilisateur
    clientId?: string;                 // ID client optionnel
    role?: Role;  // Rendre la propriété role optionnelle avec `?`
    teams?: Team[];  // Utilisez un tableau d'équipes pour la relation many-to-many
    activated: boolean;                // Si l'utilisateur est activé ou non
    createdAt?: string;                // Date de création de l'utilisateur
    updatedAt?: string;                // Date de dernière mise à jour de l'utilisateur
    confirmPassword?: string;          // Pour la confirmation du mot de passe (utilisé uniquement côté client)
    firstName: string;                 // Le prénom de l'utilisateur
    lastName: string;                  // Le nom de famille de l'utilisateur
    phoneNumber?: string;              // Le numéro de téléphone de l'utilisateur
    activationToken?: string;          // Token pour activer le compte
    activationExpiration?: string;     // Date d'expiration du token d'activation
    dateOfBirth?: string;              // Date de naissance de l'utilisateur
    gender: Gender;                    // Le genre de l'utilisateur
    position?: string;                 // Le poste de l'utilisateur dans l'entreprise
    address?: string;                    // The user's address
    

  
  }
  
  
  