package com.spaceops.space_mission_paltform.mission;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Mission> createMission(
            @Valid @RequestBody Mission mission) {

        return ResponseEntity.ok(missionService.createMission(mission));
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Mission>> getAllMissions() {

        return ResponseEntity.ok(missionService.getAllMissions());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Mission> getMissionById(
            @PathVariable Long id) {

        return missionService.getMissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Mission> updateMission(
            @PathVariable Long id,
            @Valid @RequestBody Mission mission) {

        return ResponseEntity.ok(
                missionService.updateMission(id, mission)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMission(
            @PathVariable Long id) {

        missionService.deleteMission(id);

        return ResponseEntity.noContent().build();
    }
}

