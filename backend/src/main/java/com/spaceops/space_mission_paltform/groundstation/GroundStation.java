package com.spaceops.space_mission_paltform.groundstation;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "ground_stations")
public class GroundStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Station name is required")
    @Size(max = 100, message = "Station name cannot exceed 100 characters")
    @Column(nullable = false)
    private String stationName;

    @NotBlank(message = "Station code is required")
    @Size(max = 50, message = "Station code cannot exceed 50 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9-]+$",
            message = "Station code can contain only letters, numbers, and hyphens"
    )
    @Column(nullable = false, unique = true)
    private String stationCode;

    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    @DecimalMin(value = "-90.0", message = "Latitude must be at least -90")
    @DecimalMax(value = "90.0", message = "Latitude cannot exceed 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be at least -180")
    @DecimalMax(value = "180.0", message = "Longitude cannot exceed 180")
    private Double longitude;

    @Size(max = 100, message = "Antenna type cannot exceed 100 characters")
    private String antennaType;

    @NotBlank(message = "Station status is required")
    @Pattern(
            regexp = "(?i)^(ACTIVE|INACTIVE|MAINTENANCE)$",
            message = "Status must be Active, Inactive, or Maintenance"
    )
    @Column(nullable = false)
    private String status;

    @Size(max = 100, message = "Operator cannot exceed 100 characters")
    private String operator;

    public GroundStation() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getStationCode() {
        return stationCode;
    }

    public void setStationCode(String stationCode) {
        this.stationCode = stationCode;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public String getAntennaType() {
        return antennaType;
    }

    public void setAntennaType(String antennaType) {
        this.antennaType = antennaType;
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
}