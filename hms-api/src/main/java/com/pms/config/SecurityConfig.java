package com.pms.config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Interim security setup for local development. Replaces the legacy app's
 * plaintext-password / infinite-session-timeout auth (see migration doc R5, R9)
 * with stateless sessions + hashed passwords. Swap the in-memory user store
 * and add a JWT filter here per the migration plan's Phase 1 auth task -
 * this is a starting point, not the final auth design.
 *
 * Auth enforcement is currently DISABLED (permitAll, no httpBasic challenge)
 * to unblock local frontend testing - see chat history 2026-07-09. The
 * passwordEncoder/userDetailsService beans below are left in place so
 * re-enabling is a one-line revert: swap permitAll() back to
 * .requestMatchers("/actuator/health", "/actuator/info").permitAll()
 * .anyRequest().authenticated(), and restore .httpBasic(basic -> {}).
 * Do this before any environment other than a single developer's machine.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            org.springframework.core.env.Environment env, PasswordEncoder encoder) {
        String user = env.getProperty("app.security.dev-user", "admin");
        String password = env.getProperty("app.security.dev-password", "admin");
        return new InMemoryUserDetailsManager(
                User.withUsername(user).password(encoder.encode(password)).roles("ADMIN").build());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    // Dev-only: allows the Angular dev server (localhost:4200) to call this API
    // directly. Tighten to the real deployed origin(s) outside local development.
    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
