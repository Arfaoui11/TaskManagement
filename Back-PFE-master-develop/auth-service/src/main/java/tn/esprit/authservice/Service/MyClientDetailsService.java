package tn.esprit.authservice.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.ClientDetailsService;
import org.springframework.security.oauth2.provider.ClientRegistrationException;
import org.springframework.stereotype.Service;
import tn.esprit.authservice.Entity.AppClient;
import tn.esprit.authservice.Entity.MyClientDetails;
import tn.esprit.authservice.Repository.ClientRepository;

@Service
public class MyClientDetailsService implements ClientDetailsService {

    @Autowired
    private ClientRepository cRepo;


    @Override
    public ClientDetails loadClientByClientId(String clientId) throws ClientRegistrationException {

        AppClient c=cRepo.findByClientId(clientId);

        if(c==null)
            throw new ClientRegistrationException("client with "+clientId +" is not available");



        return new MyClientDetails(c);
    }

}