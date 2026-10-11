package com.spaceops.space_mission_paltform.satellite;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/satellites")
public class SatelliteController {

    private final SatelliteService satelliteService;

    public SatelliteController(SatelliteService satelliteService) {
        this.satelliteService = satelliteService;
    }

    // Create a satellite
    @PostMapping
    public ResponseEntity<Satellite> createSatellite(
            @Valid @RequestBody Satellite satellite) {
        return ResponseEntity.ok(
                satelliteService.createSatellite(satellite)
        );
    }

    // Get all satellites
    @GetMapping
    public ResponseEntity<List<Satellite>> getAllSatellites() {
        return ResponseEntity.ok(
                satelliteService.getAllSatellites()
        );
    }

    // Get satellite by ID
    @GetMapping("/{id}")
    public ResponseEntity<Satellite> getSatelliteById(
            @PathVariable Long id) {
        return satelliteService.getSatelliteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update a satellite
    @PutMapping("/{id}")
    public ResponseEntity<Satellite> updateSatellite(
            @PathVariable Long id,
            @Valid @RequestBody Satellite satellite) {
        return ResponseEntity.ok(
                satelliteService.updateSatellite(id, satellite)
        );
    }

    // Delete a satellite
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSatellite(
            @PathVariable Long id) {
        satelliteService.deleteSatellite(id);
        return ResponseEntity.noContent().build();
    }
}

