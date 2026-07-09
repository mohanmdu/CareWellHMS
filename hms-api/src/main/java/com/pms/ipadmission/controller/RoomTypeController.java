package com.pms.ipadmission.controller;

import com.pms.ipadmission.dto.RoomTypeDto;
import com.pms.ipadmission.service.RoomTypeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
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
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomTypeDto create(@Valid @RequestBody RoomTypeDto dto) {
        return service.create(dto);
    }
}
