import { useMemo, useState } from "react";
import CesiumGlobe from "./CesiumGlobe";

const CATEGORY_CONFIG = {
    Missions: {
        color: "#8aa8ff",
        description: "Mission locations",
    },
    "Ground Stations": {
        color: "#42ddb0",
        description: "Ground station locations",
    },
    Satellites: {
        color: "#c2a0ff",
        description: "Simulated satellite orbits",
    },
};

function getValue(item, keys, fallback = "") {
    for (const key of keys) {
        const value = item?.[key];

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return fallback;
}

function getCoordinates(item) {
    const latitude = Number(
        item?.latitude ?? item?.lat ?? item?.groundLatitude
    );

    const longitude = Number(
        item?.longitude ??
        item?.lon ??
        item?.lng ??
        item?.groundLongitude
    );

    if (
        item?.latitude == null && item?.lat == null &&
        item?.groundLatitude == null
    ) {
        return null;
    }

    if (
        item?.longitude == null &&
        item?.lon == null &&
        item?.lng == null &&
        item?.groundLongitude == null
    ) {
        return null;
    }

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }

    return { latitude, longitude };
}

function getItemName(item, fallback) {
    return String(
        getValue(
            item,
            ["name", "missionName", "satelliteName", "stationName"],
            fallback
        )
    );
}

function getItemCode(item) {
    return String(
        getValue(
            item,
            [
                "missionCode",
                "satelliteCode",
                "stationCode",
                "code",
            ],
            ""
        )
    );
}

function getItemId(item, fallback) {
    return getValue(item, ["id", "missionId", "satelliteId", "stationId"], fallback);
}

export default function SpaceMap({
    missions = [],
    groundStations = [],
    satellites = [],
    compact = false,
    onOpenFullMap,
}) {
    const [visibleCategories, setVisibleCategories] = useState({
        Missions: true,
        "Ground Stations": true,
        Satellites: true,
    });

    const [selectedItem, setSelectedItem] = useState(null);

    const toggleCategory = (category) => {
        setVisibleCategories((previous) => ({
            ...previous,
            [category]: !previous[category],
        }));

        setSelectedItem(null);
    };

    const allLocationMarkers = useMemo(() => {
        const missionMarkers = missions.flatMap((mission, index) => {
            const coordinates = getCoordinates(mission);

            if (!coordinates) return [];

            const name = getItemName(mission, `Mission ${index + 1}`);

            return [
                {
                    id: `mission-${getItemId(mission, index)}`,
                    name,
                    code: getItemCode(mission),
                    category: "Missions",
                    subtitle: "Mission location",
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    color: CATEGORY_CONFIG.Missions.color,
                    description: `
                        <strong>${name}</strong>
                        <p>Category: Mission</p>
                        <p>Latitude: ${coordinates.latitude}</p>
                        <p>Longitude: ${coordinates.longitude}</p>
                    `,
                },
            ];
        });

        const stationMarkers = groundStations.flatMap((station, index) => {
            const coordinates = getCoordinates(station);

            if (!coordinates) return [];

            const name = getItemName(
                station,
                `Ground Station ${index + 1}`
            );

            return [
                {
                    id: `station-${getItemId(station, index)}`,
                    name,
                    code: getItemCode(station),
                    category: "Ground Stations",
                    subtitle: "Ground station",
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    color: CATEGORY_CONFIG["Ground Stations"].color,
                    description: `
                        <strong>${name}</strong>
                        <p>Category: Ground Station</p>
                        <p>Latitude: ${coordinates.latitude}</p>
                        <p>Longitude: ${coordinates.longitude}</p>
                    `,
                },
            ];
        });

        return [...missionMarkers, ...stationMarkers];
    }, [missions, groundStations]);

    const visibleMarkers = useMemo(
        () =>
            allLocationMarkers.filter(
                (marker) => visibleCategories[marker.category]
            ),
        [allLocationMarkers, visibleCategories]
    );

    const visibleSatellites = useMemo(
        () =>
            visibleCategories.Satellites
                ? satellites.map((satellite, index) => ({
                    ...satellite,
                    id: getItemId(satellite, index),
                    name: getItemName(satellite, `Satellite ${index + 1}`),
                    satelliteCode: getItemCode(satellite),

                    altitudeKm:
                        satellite.altitudeKm ??
                        satellite.orbitalAltitudeKm ??
                        undefined,

                    orbitPhaseDeg:
                        satellite.orbitPhaseDeg ??
                        satellite.initialOrbitAngleDeg ??
                        0,

                    inclinationDeg:
                        satellite.inclinationDeg ?? undefined,

                    color: CATEGORY_CONFIG.Satellites.color,
                }))
                : [],
        [satellites, visibleCategories.Satellites]
    );

    const counts = {
        Missions: missions.length,
        "Ground Stations": groundStations.length,
        Satellites: satellites.length,
    };

    const mappedMissionCount = allLocationMarkers.filter(
        (marker) => marker.category === "Missions"
    ).length;

    const mappedStationCount = allLocationMarkers.filter(
        (marker) => marker.category === "Ground Stations"
    ).length;

    const totalVisible =
        visibleMarkers.length + visibleSatellites.length;

    return (
        <section
            className={`space-map-section ${compact ? "space-map-compact" : ""
                }`}
        >
            <div className="space-map-toolbar">
                <div>
                    <h2 className="space-map-heading">
                        {compact ? "Space Overview" : "Interactive Space Map"}
                    </h2>

                    <p className="space-map-description">
                        Explore mission locations, ground stations, and
                        simulated satellite orbits on the 3D Earth.
                    </p>
                </div>

                <div className="space-map-controls">
                    {Object.entries(CATEGORY_CONFIG).map(
                        ([category, config]) => (
                            <button
                                key={category}
                                type="button"
                                className={`map-filter-button ${visibleCategories[category]
                                    ? "selected"
                                    : ""
                                    }`}
                                onClick={() => toggleCategory(category)}
                                aria-pressed={visibleCategories[category]}
                            >
                                <span
                                    className="map-filter-dot"
                                    style={{
                                        backgroundColor: config.color,
                                    }}
                                />

                                <span>{category}</span>

                                <span className="map-filter-count">
                                    {counts[category]}
                                </span>
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="space-map-container">
                <div
                    style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        zIndex: 10,
                        padding: "8px 12px",
                        background: "#101827",
                        color: "white",
                        borderRadius: 6,
                        fontSize: 12,
                    }}
                >
                    Markers: {visibleMarkers.length} | Satellites: {visibleSatellites.length}
                </div>
                <CesiumGlobe
                    markers={visibleMarkers}
                    satellites={visibleSatellites}
                    compact={compact}
                    onSelect={setSelectedItem}
                />

                <div className="space-map-counter">
                    <strong>{totalVisible}</strong>
                    <span>visible objects</span>
                </div>

                <div className="space-map-legend">
                    {Object.entries(CATEGORY_CONFIG)
                        .filter(([category]) => visibleCategories[category])
                        .map(([category, config]) => (
                            <div key={category}>
                                <span
                                    className="map-filter-dot"
                                    style={{
                                        backgroundColor: config.color,
                                    }}
                                />
                                <span>{category}</span>
                            </div>
                        ))}
                </div>

                {totalVisible === 0 && (
                    <div className="space-map-empty-overlay">
                        <strong>No visible objects</strong>
                        <p>
                            Enable a map layer or add objects with valid
                            coordinates.
                        </p>
                    </div>
                )}
            </div>

            {selectedItem && (
                <div className="space-map-notice">
                    <strong>{selectedItem.name}</strong>

                    <span>
                        {selectedItem.category}
                        {selectedItem.code ? ` · ${selectedItem.code}` : ""}
                    </span>

                    <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                    >
                        Clear selection
                    </button>
                </div>
            )}

            {(mappedMissionCount < missions.length ||
                mappedStationCount < groundStations.length) && (
                    <div className="space-map-notice">
                        Some missions or ground stations are not displayed because
                        their latitude or longitude is missing or invalid.
                        Add valid coordinates to display them on the globe.
                    </div>
                )}

            <div className="space-map-notice">
                Satellite positions and orbital paths are simulated, not
                live satellite tracking.
            </div>

            {compact && onOpenFullMap && (
                <button
                    type="button"
                    className="map-filter-button"
                    onClick={onOpenFullMap}
                >
                    Open Full Space Map →
                </button>
            )}
        </section>
    );
}