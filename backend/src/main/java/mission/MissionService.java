package com.spaceops.space_mission_paltform.mission;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MissionService {

    private final MissionRepository missionRepository;

    public MissionService(MissionRepository missionRepository) {
        this.missionRepository = missionRepository;
    }

    // Validate mission scheduling dates
    private void validateMissionDates(Mission mission) {

        LocalDate launchDate = mission.getLaunchDate();
        LocalDate plannedEndDate = mission.getPlannedEndDate();

        if (launchDate != null
                && plannedEndDate != null
                && plannedEndDate.isBefore(launchDate)) {

            throw new IllegalArgumentException(
                    "Planned end date cannot be before the launch date"
            );
        }
    }

    // Create a new mission
    public Mission createMission(Mission mission) {

        validateMissionDates(mission);

        return missionRepository.save(mission);
    }

    // Get all missions
    @Transactional(readOnly = true)
    public List<Mission> getAllMissions() {

        return missionRepository.findAll();
    }

    // Get mission by ID
    @Transactional(readOnly = true)
    public Optional<Mission> getMissionById(Long id) {

        return missionRepository.findById(id);
    }

    // Update an existing mission
    public Mission updateMission(Long id, Mission updatedMission) {

        Mission existingMission = missionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Mission not found with id: " + id
                        )
                );

        validateMissionDates(updatedMission);

        existingMission.setMissionName(
                updatedMission.getMissionName()
        );

        existingMission.setMissionCode(
                updatedMission.getMissionCode()
        );

        existingMission.setDescription(
                updatedMission.getDescription()
        );

        existingMission.setLaunchDate(
                updatedMission.getLaunchDate()
        );

        existingMission.setPlannedEndDate(
                updatedMission.getPlannedEndDate()
        );

        existingMission.setStatus(
                updatedMission.getStatus()
        );

        existingMission.setDestination(
                updatedMission.getDestination()
        );

        return missionRepository.save(existingMission);
    }

    // Delete a mission
    public void deleteMission(Long id) {

        if (!missionRepository.existsById(id)) {

            throw new RuntimeException(
                    "Mission not found with id: " + id
            );
        }

        missionRepository.deleteById(id);
    }
}