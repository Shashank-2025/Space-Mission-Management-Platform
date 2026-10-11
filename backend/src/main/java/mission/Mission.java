package com.spaceops.space_mission_paltform.mission;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "missions")
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Mission name is required")
    @Size(max = 100, message = "Mission name cannot exceed 100 characters")
    @Column(nullable = false)
    private String missionName;

    @NotBlank(message = "Mission code is required")
    @Size(max = 50, message = "Mission code cannot exceed 50 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9-]+$",
            message = "Mission code can contain only letters, numbers, and hyphens"
    )
    @Column(nullable = false, unique = true)
    private String missionCode;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    private LocalDate launchDate;

    private LocalDate plannedEndDate;

    @NotBlank(message = "Mission status is required")
    @Pattern(
            regexp = "(?i)^(PLANNED|SCHEDULED|ACTIVE|COMPLETED|CANCELLED)$",
            message = "Status must be Planned, Scheduled, Active, Completed, or Cancelled"
    )
    @Column(nullable = false)
    private String status;

    @Size(max = 100, message = "Destination cannot exceed 100 characters")
    private String destination;

    @DecimalMin(value = "-90.0", message = "Latitude must be at least -90")
    @DecimalMax(value = "90.0", message = "Latitude cannot exceed 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be at least -180")
    @DecimalMax(value = "180.0", message = "Longitude cannot exceed 180")
    private Double longitude;
    @ManyToMany
    @JoinTable(
            name = "mission_satellites",
            joinColumns = @JoinColumn(name = "mission_id"),
            inverseJoinColumns = @JoinColumn(name = "satellite_id"),
            uniqueConstraints = @UniqueConstraint(
                    columnNames = {"mission_id", "satellite_id"}
            )
    )
    private java.util.Set<com.spaceops.space_mission_paltform.satellite.Satellite>
            satellites = new java.util.HashSet<>();

    public Mission() {
    }

    @PrePersist
    @PreUpdate
    private void validateMissionDates() {
        if (launchDate != null
                && plannedEndDate != null
                && plannedEndDate.isBefore(launchDate)) {
            throw new IllegalArgumentException(
                    "Planned end date cannot be before the launch date"
            );
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMissionName() {
        return missionName;
    }

    public void setMissionName(String missionName) {
        this.missionName = missionName;
    }

    public String getMissionCode() {
        return missionCode;
    }

    public void setMissionCode(String missionCode) {
        this.missionCode = missionCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getLaunchDate() {
        return launchDate;
    }

    public void setLaunchDate(LocalDate launchDate) {
        this.launchDate = launchDate;
    }

    public LocalDate getPlannedEndDate() {
        return plannedEndDate;
    }

    public void setPlannedEndDate(LocalDate plannedEndDate) {
        this.plannedEndDate = plannedEndDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    public java.util.Set<com.spaceops.space_mission_paltform.satellite.Satellite>
    getSatellites() {
        return satellites;
    }

    public void setSatellites(
            java.util.Set<com.spaceops.space_mission_paltform.satellite.Satellite>
                    satellites) {
        this.satellites = satellites;
    }
}


