package com.spaceops.space_mission_paltform.groundstation;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroundStationService {

    private final GroundStationRepository groundStationRepository;

    public GroundStationService(
            GroundStationRepository groundStationRepository) {
        this.groundStationRepository = groundStationRepository;
    }

    // Add a ground station
    public GroundStation createGroundStation(GroundStation station) {
        return groundStationRepository.save(station);
    }

    // Get all ground stations
    public List<GroundStation> getAllGroundStations() {
        return groundStationRepository.findAll();
    }

    // Get a ground station by ID
    public Optional<GroundStation> getGroundStationById(Long id) {
        return groundStationRepository.findById(id);
    }

    // Update a ground station
    public GroundStation updateGroundStation(
            Long id, GroundStation updatedStation) {

        GroundStation existingStation =
                groundStationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ground station not found with id: " + id));

        existingStation.setStationName(updatedStation.getStationName());
        existingStation.setStationCode(updatedStation.getStationCode());
        existingStation.setLocation(updatedStation.getLocation());
        existingStation.setAntennaType(updatedStation.getAntennaType());
        existingStation.setStatus(updatedStation.getStatus());
        existingStation.setOperator(updatedStation.getOperator());

        return groundStationRepository.save(existingStation);
    }

    // Delete a ground station
    public void deleteGroundStation(Long id) {
        if (!groundStationRepository.existsById(id)) {
            throw new RuntimeException(
                    "Ground station not found with id: " + id);
        }

        groundStationRepository.deleteById(id);
    }
}
