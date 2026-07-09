package com.pms.registration.controller;

import com.pms.registration.dto.AppointmentDto;
import com.pms.registration.service.AppointmentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST equivalent of the legacy appointment booking/confirm/cancel family
 * (migration doc §4.1) - collapses ~10 near-duplicate legacy cancel methods
 * into one endpoint with a required reason.
 */
@RestController
@RequestMapping("/api/registration/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<AppointmentDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public AppointmentDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentDto book(@Valid @RequestBody AppointmentDto dto) {
        return service.book(dto);
    }

    @PatchMapping("/{id}/confirm")
    public AppointmentDto confirm(@PathVariable Long id) {
        return service.confirm(id);
    }

    @PatchMapping("/{id}/cancel")
    public AppointmentDto cancel(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.cancel(id, body.get("reason"));
    }
}
