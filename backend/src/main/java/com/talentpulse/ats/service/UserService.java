package com.talentpulse.ats.service;

import com.talentpulse.ats.dto.AuthRequest;
import com.talentpulse.ats.dto.AuthResponse;
import com.talentpulse.ats.dto.RegisterRequest;
import com.talentpulse.ats.model.Role;
import com.talentpulse.ats.model.User;
import com.talentpulse.ats.repository.UserRepository;
import com.talentpulse.ats.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

        return new AuthResponse(
                jwt,
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user.getCompanyName()
        );
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getEmail(),
                request.getRole() != null ? request.getRole() : Role.ROLE_CANDIDATE,
                request.getFullName(),
                request.getCompanyName()
        );

        userRepository.save(user);

        return login(new AuthRequest(request.getUsername(), request.getPassword()));
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
