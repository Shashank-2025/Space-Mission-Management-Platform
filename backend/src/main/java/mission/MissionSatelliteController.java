package com.spaceops.space_mission_paltform.mission;

import com.spaceops.space_mission_paltform.satellite.Satellite;
import com.spaceops.space_mission_paltform.satellite.SatelliteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/missions")
public class MissionSatelliteController {


    private final com.spaceops.space_mission_paltform.mission.MissionRepository missionRepository;
    private final SatelliteRepository satelliteRepository;

    public MissionSatelliteController(
            com.spaceops.space_mission_paltform.mission.MissionRepository missionRepository,
            SatelliteRepository satelliteRepository) {
        this.missionRepository = missionRepository;
        this.satelliteRepository = satelliteRepository;
    }

    @PostMapping("/{missionId}/satellites/{satelliteId}")
    public ResponseEntity<?> assignSatellite(
            @PathVariable Long missionId,
            @PathVariable Long satelliteId) {

        var mission = missionRepository.findById(missionId);

        if (mission.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Mission not found"));
        }

        var satellite = satelliteRepository.findById(satelliteId);

        if (satellite.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Satellite not found"));
        }

        boolean added = mission.get().getSatellites()
                .add(satellite.get());

        if (!added) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Satellite is already assigned to this mission"
                    ));
        }

        missionRepository.save(mission.get());

        return ResponseEntity.ok(Map.of(
                "message", "Satellite assigned successfully",
                "missionId", missionId,
                "satelliteId", satelliteId
        ));
    }

    @DeleteMapping("/{missionId}/satellites/{satelliteId}")
    public ResponseEntity<?> removeSatellite(
            @PathVariable Long missionId,
            @PathVariable Long satelliteId) {

        var mission = missionRepository.findById(missionId);

        if (mission.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Mission not found"));
        }

        var satellite = satelliteRepository.findById(satelliteId);

        if (satellite.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Satellite not found"));
        }

        boolean removed = mission.get().getSatellites()
                .remove(satellite.get());

        if (!removed) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Satellite is not assigned to this mission"
                    ));
        }

        missionRepository.save(mission.get());

        return ResponseEntity.ok(Map.of(
                "message", "Satellite removed from mission successfully"
        ));
    }

    @GetMapping("/{missionId}/satellites")
    public ResponseEntity<?> getMissionSatellites(
            @PathVariable Long missionId) {

        var mission = missionRepository.findById(missionId);

        if (mission.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Mission not found"));
        }

        return ResponseEntity.ok(mission.get().getSatellites());
    }

}

