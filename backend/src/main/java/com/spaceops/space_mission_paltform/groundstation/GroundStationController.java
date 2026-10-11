package com.spaceops.space_mission_paltform.groundstation;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ground-stations")
public class GroundStationController {

    private final GroundStationService groundStationService;

    public GroundStationController(
            GroundStationService groundStationService) {
        this.groundStationService = groundStationService;
    }

    // Create a ground station
    @PostMapping
    public ResponseEntity<GroundStation> createGroundStation(
            @Valid @RequestBody GroundStation station) {
        return ResponseEntity.ok(
                groundStationService.createGroundStation(station)
        );
    }

    // Get all ground stations
    @GetMapping
    public ResponseEntity<List<GroundStation>> getAllGroundStations() {
        return ResponseEntity.ok(
                groundStationService.getAllGroundStations()
        );
    }

    // Get a ground station by ID
    @GetMapping("/{id}")
    public ResponseEntity<GroundStation> getGroundStationById(
            @PathVariable Long id) {
        return groundStationService.getGroundStationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update a ground station
    @PutMapping("/{id}")
    public ResponseEntity<GroundStation> updateGroundStation(
            @PathVariable Long id,
            @Valid @RequestBody GroundStation station) {
        return ResponseEntity.ok(
                groundStationService.updateGroundStation(id, station)
        );
    }

    // Delete a ground station
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroundStation(
            @PathVariable Long id) {
        groundStationService.deleteGroundStation(id);
        return ResponseEntity.noContent().build();
    }
}
