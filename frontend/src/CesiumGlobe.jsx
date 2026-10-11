
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const EARTH_RADIUS_KM = 6371;
const EARTH_MU_KM3_S2 = 398600.4418;

function getNumber(value, fallback) {
    if (value === "" || value == null) return fallback;

    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizeDegrees(value) {
    return ((value % 360) + 360) % 360;
}

function getOrbitSettings(satellite) {
    const orbitType = String(satellite.orbitType || "LEO").toUpperCase();

    let defaultAltitude = 550;
    let defaultInclination = 53;

    if (orbitType.includes("GEO")) {
        defaultAltitude = 35786;
        defaultInclination = 0;
    } else if (orbitType.includes("MEO")) {
        defaultAltitude = 20200;
        defaultInclination = 55;
    } else if (orbitType.includes("POLAR")) {
        defaultAltitude = 700;
        defaultInclination = 90;
    } else if (orbitType.includes("SUN")) {
        defaultAltitude = 700;
        defaultInclination = 98;
    }

    const altitudeKm = Math.max(
        200,
        Math.min(50000, getNumber(satellite.altitudeKm, defaultAltitude))
    );

    const inclinationDeg = Math.max(
        0,
        Math.min(180, getNumber(satellite.inclinationDeg, defaultInclination))
    );

    const raanDeg = normalizeDegrees(getNumber(satellite.raanDeg, 0));
    const orbitPhaseDeg = normalizeDegrees(
        getNumber(satellite.orbitPhaseDeg, 0)
    );

    const orbitSpeedMultiplier = Math.max(
        0.1,
        Math.min(20, getNumber(satellite.orbitSpeedMultiplier, 1))
    );

    const radiusKm = EARTH_RADIUS_KM + altitudeKm;

    const periodSeconds =
        2 *
        Math.PI *
        Math.sqrt((radiusKm ** 3) / EARTH_MU_KM3_S2);

    return {
        altitudeKm,
        inclinationDeg,
        raanDeg,
        orbitPhaseDeg,
        orbitSpeedMultiplier,
        radiusKm,
        periodSeconds,
    };
}

function getSatellitePosition(satellite, elapsedSeconds) {
    const orbit = getOrbitSettings(satellite);

    const inclination = Cesium.Math.toRadians(orbit.inclinationDeg);
    const raan = Cesium.Math.toRadians(orbit.raanDeg);
    const phase = Cesium.Math.toRadians(orbit.orbitPhaseDeg);

    const angularSpeed =
        (2 * Math.PI * orbit.orbitSpeedMultiplier) / orbit.periodSeconds;

    const angle = phase + angularSpeed * elapsedSeconds;

    const xOrbital = orbit.radiusKm * Math.cos(angle);
    const yOrbital = orbit.radiusKm * Math.sin(angle);

    const x =
        xOrbital * Math.cos(raan) -
        yOrbital * Math.cos(inclination) * Math.sin(raan);

    const y =
        xOrbital * Math.sin(raan) +
        yOrbital * Math.cos(inclination) * Math.cos(raan);

    const z = yOrbital * Math.sin(inclination);

    return Cesium.Cartesian3.fromElements(x * 1000, y * 1000, z * 1000);
}

function buildOrbitPath(satellite) {
    const orbit = getOrbitSettings(satellite);
    const positions = [];
    const sampleCount = 180;

    for (let index = 0; index <= sampleCount; index += 1) {
        const angle = (2 * Math.PI * index) / sampleCount;

        positions.push(
            getSatellitePosition(
                {
                    ...satellite,
                    orbitPhaseDeg: 0,
                    orbitSpeedMultiplier: 1,
                },
                (angle * orbit.periodSeconds) / (2 * Math.PI)
            )
        );
    }

    return positions;
}

export default function CesiumGlobe({
    markers = [],
    satellites = [],
    compact = false,
    onSelect,
}) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const entitiesRef = useRef([]);
    const startTimeRef = useRef(Date.now());
    const onSelectRef = useRef(onSelect);

    const [viewerReady, setViewerReady] = useState(false);

    useEffect(() => {
        onSelectRef.current = onSelect;
    }, [onSelect]);

    useEffect(() => {
        let viewer;
        let cancelled = false;

        async function initializeGlobe() {
            const token = import.meta.env.VITE_CESIUM_ION_TOKEN;

            if (!token) {
                console.error("Cesium ion token is missing from .env.local");
                return;
            }

            Cesium.Ion.defaultAccessToken = token;

            try {
                viewer = new Cesium.Viewer(containerRef.current, {
                    animation: false,
                    timeline: false,
                    baseLayerPicker: false,
                    geocoder: false,
                    homeButton: true,
                    sceneModePicker: false,
                    navigationHelpButton: false,
                    fullscreenButton: false,
                    infoBox: true,
                    selectionIndicator: true,
                    shouldAnimate: true,
                });

                if (cancelled) {
                    viewer.destroy();
                    return;
                }

                viewerRef.current = viewer;

                viewer.scene.globe.enableLighting = true;
                viewer.scene.backgroundColor =
                    Cesium.Color.fromCssColorString("#050914");

                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(78.4867, 17.385, 8000000),
                    duration: 2,
                });

                viewer.selectedEntityChanged.addEventListener((entity) => {
                    if (entity && onSelectRef.current) {
                        const properties = entity.properties;

                        onSelectRef.current({
                            name: entity.name || "Space Object",
                            category:
                                properties?.category?.getValue
                                    ? properties.category.getValue()
                                    : "Space Object",
                            code:
                                properties?.code?.getValue
                                    ? properties.code.getValue()
                                    : "",
                        });
                    }
                });

                startTimeRef.current = Date.now();
                setViewerReady(true);
            } catch (error) {
                console.error("Failed to initialize Cesium globe:", error);

                if (viewer && !viewer.isDestroyed()) {
                    viewer.destroy();
                }

                viewer = undefined;
                viewerRef.current = null;
            }
        }

        initializeGlobe();

        return () => {
            cancelled = true;
            viewerRef.current = null;
            setViewerReady(false);

            if (viewer && !viewer.isDestroyed()) {
                viewer.destroy();
            }
        };
    }, []);

    useEffect(() => {
        const viewer = viewerRef.current;

        if (!viewerReady || !viewer || viewer.isDestroyed()) return;

        entitiesRef.current.forEach((entity) => {
            viewer.entities.remove(entity);
        });

        entitiesRef.current = [];

        markers.forEach((marker) => {
            const entity = viewer.entities.add({
                id: marker.id,
                name: marker.name,
                properties: {
                    category: marker.category,
                    code: marker.code || "",
                },
                position: Cesium.Cartesian3.fromDegrees(
                    marker.longitude,
                    marker.latitude,
                    10000
                ),
                point: {
                    pixelSize: 14,
                    color: Cesium.Color.fromCssColorString(marker.color || "#42ddb0"),
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 3,
                    show: true,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },

                label: {
                    text: marker.name,
                    font: "bold 14px sans-serif",
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 4,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    pixelOffset: new Cesium.Cartesian2(0, -22),
                    show: true,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    scaleByDistance: new Cesium.NearFarScalar(
                        100000,
                        1,
                        20000000,
                        0.7
                    ),
                },
                description: marker.description || marker.name,
            });

            entitiesRef.current.push(entity);
        });

        satellites.forEach((satellite) => {
            const orbit = getOrbitSettings(satellite);

            const orbitColor = Cesium.Color.fromCssColorString(
                satellite.color || "#c2a0ff"
            );

            const orbitEntity = viewer.entities.add({
                id: `orbit-${satellite.id}`,
                name: `${satellite.name} Orbit`,
                properties: {
                    category: "Satellite Orbit",
                    code: satellite.satelliteCode || "",
                },
                polyline: {
                    positions: buildOrbitPath(satellite),
                    width: compact ? 1.5 : 2,
                    material: orbitColor.withAlpha(0.7),
                    arcType: Cesium.ArcType.NONE,
                },
            });

            entitiesRef.current.push(orbitEntity);

            const satelliteEntity = viewer.entities.add({
                id: `satellite-${satellite.id}`,
                name: satellite.name,
                properties: {
                    category: "Satellites",
                    code: satellite.satelliteCode || "",
                },
                position: new Cesium.CallbackProperty(() => {
                    const elapsedSeconds =
                        (Date.now() - startTimeRef.current) / 1000;

                    return getSatellitePosition(satellite, elapsedSeconds);
                }, false),
                point: {
                    pixelSize: compact ? 8 : 11,
                    color: orbitColor,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
                label: {
                    text: satellite.name,
                    font: "12px sans-serif",
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 3,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    pixelOffset: new Cesium.Cartesian2(0, -18),
                    scaleByDistance: new Cesium.NearFarScalar(
                        100000,
                        1,
                        20000000,
                        0.5
                    ),
                },
                description: `
          <strong>${satellite.name}</strong>
          <p>Code: ${satellite.satelliteCode || "N/A"}</p>
          <p>Orbit: ${satellite.orbitType || "LEO (simulated)"}</p>
          <p>Altitude: ${orbit.altitudeKm} km</p>
          <p>Inclination: ${orbit.inclinationDeg}°</p>
          <p>Orbital period: ${(orbit.periodSeconds / 60).toFixed(1)} minutes</p>
          <p><em>Simulated orbit, not live tracking.</em></p>
        `,
            });

            entitiesRef.current.push(satelliteEntity);
        });
    }, [viewerReady, markers, satellites, compact]);

    return (
        <div
            ref={containerRef}
            className="cesium-space-map-container"
            style={{
                width: "100%",
                height: "100%",
                minHeight: compact ? 320 : 500,
                overflow: "hidden",
                background: "#050914",
            }}
        />
    );
}
