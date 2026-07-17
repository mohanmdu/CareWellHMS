package com.pms.ipadmission.controller;

import com.pms.ipadmission.dto.RoomDto;
import com.pms.ipadmission.dto.RoomStatusUpdateRequest;
import com.pms.ipadmission.service.RoomService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ip/rooms")
public class RoomController {

    private final RoomService service;

    public RoomController(RoomService service) {
        this.service = service;
    }

    @GetMapping
    public List<RoomDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<RoomDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomDto create(@Valid @RequestBody RoomDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public RoomDto update(@PathVariable Long id, @Valid @RequestBody RoomDto dto) {
        return service.update(id, dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public RoomDto updateStatus(@PathVariable Long id, @Valid @RequestBody RoomStatusUpdateRequest request) {
        return service.updateStatus(id, request.status());
    }
}
