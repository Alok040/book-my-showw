package com.alok.bookmyshoww.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class AuthConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Customer registration must work before a user has logged in.
                        .requestMatchers(HttpMethod.POST, "/").permitAll()

                        // The customer website needs to load the catalogue without login.
                        .requestMatchers(HttpMethod.GET, "/movie", "/movie/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/show", "/show/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/venue", "/venue/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/screen", "/screen/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/seat", "/seat/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // Everything else requires a real database user.
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
