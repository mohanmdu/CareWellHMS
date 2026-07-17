package com.pms.ipadmission.controller;

import com.pms.ipadmission.dto.RoomTypeDto;
import com.pms.ipadmission.service.RoomTypeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ip/room-types")
public class RoomTypeController {

    private final RoomTypeService service;

    public RoomTypeController(RoomTypeService service) {
        this.service = service;
    }

    @GetMapping
    public List<RoomTypeDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<RoomTypeDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomTypeDto create(@Valid @RequestBody RoomTypeDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public RoomTypeDto update(@PathVariable Long id, @Valid @RequestBody RoomTypeDto dto) {
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
}
