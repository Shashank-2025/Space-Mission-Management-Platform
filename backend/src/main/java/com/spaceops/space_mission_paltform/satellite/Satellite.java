package com.spaceops.space_mission_paltform.satellite;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.spaceops.space_mission_paltform.mission.Mission;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "satellites")
public class Satellite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Satellite name is required")
    @Size(max = 100, message = "Satellite name cannot exceed 100 characters")
    @Column(nullable = false)
    private String satelliteName;

    @NotBlank(message = "Satellite code is required")
    @Size(max = 50, message = "Satellite code cannot exceed 50 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9-]+$",
            message = "Satellite code can contain only letters, numbers, and hyphens"
    )
    @Column(nullable = false, unique = true)
    private String satelliteCode;

    @Size(max = 50, message = "Orbit type cannot exceed 50 characters")
    private String orbitType;

    private LocalDate launchDate;

    @NotBlank(message = "Satellite status is required")
    @Pattern(
            regexp = "(?i)^(ACTIVE|INACTIVE|MAINTENANCE)$",
            message = "Status must be Active, Inactive, or Maintenance"
    )
    @Column(nullable = false)
    private String status;

    @Size(max = 100, message = "Operator cannot exceed 100 characters")
    private String operator;

    // Orbital configuration for globe visualization

    @DecimalMin(
            value = "160.0",
            message = "Orbital altitude must be at least 160 km"
    )
    @DecimalMax(
            value = "100000.0",
            message = "Orbital altitude cannot exceed 100000 km"
    )
    @Column(name = "orbital_altitude_km")
    private Double orbitalAltitudeKm = 550.0;

    @DecimalMin(
            value = "0.0",
            message = "Inclination cannot be negative"
    )
    @DecimalMax(
            value = "180.0",
            message = "Inclination cannot exceed 180 degrees"
    )
    @Column(name = "inclination_deg")
    private Double inclinationDeg = 53.0;

    @DecimalMin(
            value = "0.0",
            message = "Initial orbit angle cannot be negative"
    )
    @DecimalMax(
            value = "360.0",
            message = "Initial orbit angle cannot exceed 360 degrees"
    )
    @Column(name = "initial_orbit_angle_deg")
    private Double initialOrbitAngleDeg = 0.0;

    @DecimalMin(
            value = "1.0",
            message = "Orbital period must be positive"
    )
    @DecimalMax(
            value = "100000.0",
            message = "Orbital period is too large"
    )
    @Column(name = "orbital_period_minutes")
    private Double orbitalPeriodMinutes = 95.0;

    @JsonIgnore
    @ManyToMany(mappedBy = "satellites")
    private Set<Mission> missions = new HashSet<>();

    public Satellite() {
    }

    // Existing getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSatelliteName() {
        return satelliteName;
    }

    public void setSatelliteName(String satelliteName) {
        this.satelliteName = satelliteName;
    }

    public String getSatelliteCode() {
        return satelliteCode;
    }

    public void setSatelliteCode(String satelliteCode) {
        this.satelliteCode = satelliteCode;
    }

    public String getOrbitType() {
        return orbitType;
    }

    public void setOrbitType(String orbitType) {
        this.orbitType = orbitType;
    }

    public LocalDate getLaunchDate() {
        return launchDate;
    }

    public void setLaunchDate(LocalDate launchDate) {
        this.launchDate = launchDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public Double getOrbitalAltitudeKm() {
        return orbitalAltitudeKm;
    }

    public void setOrbitalAltitudeKm(Double orbitalAltitudeKm) {
        this.orbitalAltitudeKm = orbitalAltitudeKm;
    }

    public Double getInclinationDeg() {
        return inclinationDeg;
    }

    public void setInclinationDeg(Double inclinationDeg) {
        this.inclinationDeg = inclinationDeg;
    }

    public Double getInitialOrbitAngleDeg() {
        return initialOrbitAngleDeg;
    }

    public void setInitialOrbitAngleDeg(Double initialOrbitAngleDeg) {
        this.initialOrbitAngleDeg = initialOrbitAngleDeg;
    }

    public Double getOrbitalPeriodMinutes() {
        return orbitalPeriodMinutes;
    }

    public void setOrbitalPeriodMinutes(Double orbitalPeriodMinutes) {
        this.orbitalPeriodMinutes = orbitalPeriodMinutes;
    }

    public Set<Mission> getMissions() {
        return missions;
    }

    public void setMissions(Set<Mission> missions) {
        this.missions = missions;
    }
}