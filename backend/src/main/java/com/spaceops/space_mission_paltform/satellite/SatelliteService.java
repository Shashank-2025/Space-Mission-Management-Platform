package com.spaceops.space_mission_paltform.satellite;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SatelliteService {

    private final SatelliteRepository satelliteRepository;

    public SatelliteService(SatelliteRepository satelliteRepository) {
        this.satelliteRepository = satelliteRepository;
    }

    // Create a satellite
    public Satellite createSatellite(Satellite satellite) {
        return satelliteRepository.save(satellite);
    }

    // Get all satellites
    public List<Satellite> getAllSatellites() {
        return satelliteRepository.findAll();
    }

    // Get satellite by ID
    public Optional<Satellite> getSatelliteById(Long id) {
        return satelliteRepository.findById(id);
    }

    // Update satellite details, including orbital configuration
    public Satellite updateSatellite(Long id, Satellite updatedSatellite) {

        Satellite existingSatellite = satelliteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Satellite not found with id: " + id
                        ));

        existingSatellite.setSatelliteName(
                updatedSatellite.getSatelliteName()
        );

        existingSatellite.setSatelliteCode(
                updatedSatellite.getSatelliteCode()
        );

        existingSatellite.setOrbitType(
                updatedSatellite.getOrbitType()
        );

        existingSatellite.setLaunchDate(
                updatedSatellite.getLaunchDate()
        );

        existingSatellite.setStatus(
                updatedSatellite.getStatus()
        );

        existingSatellite.setOperator(
                updatedSatellite.getOperator()
        );

        // Update orbital parameters
        existingSatellite.setOrbitalAltitudeKm(
                updatedSatellite.getOrbitalAltitudeKm()
        );

        existingSatellite.setInclinationDeg(
                updatedSatellite.getInclinationDeg()
        );

        existingSatellite.setInitialOrbitAngleDeg(
                updatedSatellite.getInitialOrbitAngleDeg()
        );

        existingSatellite.setOrbitalPeriodMinutes(
                updatedSatellite.getOrbitalPeriodMinutes()
        );

        return satelliteRepository.save(existingSatellite);
    }

    // Delete a satellite
    public void deleteSatellite(Long id) {

        if (!satelliteRepository.existsById(id)) {
            throw new RuntimeException(
                    "Satellite not found with id: " + id
            );
        }

        satelliteRepository.deleteById(id);
    }
}