package com.foodapp.service;

import com.foodapp.dto.LoginRequest;
import com.foodapp.model.User;
import com.foodapp.repository.UserRepository;
import com.foodapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User register(User user) {
        user.setRole("USER");
        return userRepository.save(user);
    }

    public Optional<Map<String, Object>> login(String email, String password) {
        return userRepository.findByEmailAndPassword(email, password)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("name", user.getName());
                    response.put("email", user.getEmail());
                    response.put("role", user.getRole());
                    response.put("phone", user.getPhone());
                    response.put("address", user.getAddress());
                    response.put("token", token);
                    return response;
                });
    }

    public List<User> getAllUsers() {
        return userRepository.findByRole("USER");
    }
}
