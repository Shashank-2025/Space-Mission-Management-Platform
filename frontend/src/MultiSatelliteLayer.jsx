import { useEffect, useState } from "react";
import {
    CircleMarker,
    Popup,
    Tooltip,
    useMap,
} from "react-leaflet";
import * as satellite from "satellite.js";

const TRACKED_SATELLITES = [
    {
        id: 25544,
        name: "International Space Station",
        color: "#ff6b8a",
        showMarker: false,
    },
    {
        id: 20580,
        name: "Hubble Space Telescope",
        color: "#62a8ff",
        showMarker: true,
    },
    {
        id: 33591,
        name: "NOAA-19",
        color: "#42ddb0",
        showMarker: true,
    },
    {
        id: 43013,
        name: "NOAA-20",
        color: "#ffd166",
        showMarker: true,
    },
];

function SatelliteFocusController({ selectedSatellite }) {
    const map = useMap();

    useEffect(() => {
        if (!selectedSatellite?.position) return;

        const { latitude, longitude } = selectedSatellite.position;

        map.flyTo(
            [latitude, longitude],
            Math.max(map.getZoom(), 5),
            { duration: 1.2 }
        );
    }, [map, selectedSatellite]);

    return null;
}

function SatelliteTrackingPanel({
    satellites,
    selectedId,
    setSelectedId,
}) {
    const selectedSatellite = satellites.find(
        (item) => String(item.id) === selectedId
    );

    const position = selectedSatellite?.position;

    return (
        <div
            style={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 1000,
                width: "min(310px, calc(100% - 24px))",
                boxSizing: "border-box",
                padding: 17,
                borderRadius: 14,
                background: "rgba(10, 18, 34, 0.97)",
                border: "1px solid #293951",
                color: "#e8edf7",
                boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
                fontFamily: "inherit",
            }}
        >
            <div
                style={{
                    color: "#8c9db7",
                    fontSize: 10,
                    letterSpacing: 1.5,
                    marginBottom: 6,
                }}
            >
                SPACE OPERATIONS / TRACKING
            </div>

            <h3
                style={{
                    margin: "0 0 14px",
                    fontSize: 18,
                    color: "#e8edf7",
                }}
            >
                🛰️ Satellite Control
            </h3>

            <label
                htmlFor="satellite-selector"
                style={{
                    display: "block",
                    marginBottom: 7,
                    fontSize: 12,
                    color: "#9aacc5",
                }}
            >
                Select satellite
            </label>

            <select
                id="satellite-selector"
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #354761",
                    background: "#111e30",
                    color: "#e8edf7",
                    fontSize: 12,
                    outline: "none",
                }}
            >
                {TRACKED_SATELLITES.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                        {item.name}
                    </option>
                ))}
            </select>

            <button
                type="button"
                disabled={!position}
                onClick={() => {
                    if (!position) return;

                    window.dispatchEvent(
                        new CustomEvent("spaceops-focus-satellite", {
                            detail: {
                                latitude: position.latitude,
                                longitude: position.longitude,
                                id: selectedSatellite.id,
                            },
                        })
                    );
                }}
                style={{
                    width: "100%",
                    marginTop: 10,
                    padding: 10,
                    border: "none",
                    borderRadius: 8,
                    background: position ? "#477cf5" : "#293951",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: position ? "pointer" : "not-allowed",
                }}
            >
                🎯 Focus Satellite
            </button>

            <div
                style={{
                    marginTop: 15,
                    padding: 12,
                    background: "#111e30",
                    borderRadius: 9,
                    border: "1px solid #22334a",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                    }}
                >
                    <strong style={{ fontSize: 12 }}>
                        {selectedSatellite?.name ?? "Loading satellite..."}
                    </strong>

                    <span
                        style={{
                            color: position ? "#42ddb0" : "#ffd580",
                            fontSize: 10,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {position ? "● TRACKING" : "● WAITING"}
                    </span>
                </div>

                {position ? (
                    <>
                        {[
                            [
                                "LATITUDE",
                                `${position.latitude.toFixed(4)}°`,
                            ],
                            [
                                "LONGITUDE",
                                `${position.longitude.toFixed(4)}°`,
                            ],
                            [
                                "ALTITUDE",
                                `${position.altitudeKm.toFixed(2)} km`,
                            ],
                            [
                                "ORBITAL SPEED",
                                position.speedKmS != null
                                    ? `${position.speedKmS.toFixed(2)} km/s`
                                    : "Unavailable",
                            ],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 8,
                                    padding: "7px 0",
                                    borderBottom: "1px solid #22334a",
                                    fontSize: 11,
                                }}
                            >
                                <span style={{ color: "#8c9db7" }}>
                                    {label}
                                </span>

                                <strong style={{ textAlign: "right" }}>
                                    {value}
                                </strong>
                            </div>
                        ))}

                        <div
                            style={{
                                marginTop: 10,
                                color: "#8c9db7",
                                fontSize: 10,
                            }}
                        >
                            NORAD Catalog ID: {selectedSatellite.id}
                        </div>
                    </>
                ) : (
                    <p
                        style={{
                            color: "#8c9db7",
                            fontSize: 12,
                            lineHeight: 1.6,
                            margin: 0,
                        }}
                    >
                        Waiting for orbital data or a valid position
                        calculation.
                    </p>
                )}
            </div>
        </div>
    );
}

export default function MultiSatelliteLayer() {
    const [satellites, setSatellites] = useState([]);
    const [selectedId, setSelectedId] = useState("25544");

    const map = useMap();

    useEffect(() => {
        function handleFocus(event) {
            const { latitude, longitude } = event.detail;

            if (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude)
            ) {
                map.flyTo(
                    [latitude, longitude],
                    Math.max(map.getZoom(), 5),
                    { duration: 1.2 }
                );
            }
        }

        window.addEventListener(
            "spaceops-focus-satellite",
            handleFocus
        );

        return () => {
            window.removeEventListener(
                "spaceops-focus-satellite",
                handleFocus
            );
        };
    }, [map]);

    useEffect(() => {
        let cancelled = false;
        let timer;

        async function startTracking() {
            const results = await Promise.all(
                TRACKED_SATELLITES.map(async (item) => {
                    try {
                        const response = await fetch(
                            `https://celestrak.org/NORAD/elements/gp.php?CATNR=${item.id}&FORMAT=JSON`
                        );

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }

                        const records = await response.json();

                        if (!Array.isArray(records) || records.length === 0) {
                            throw new Error("No orbital elements returned");
                        }

                        return {
                            ...item,
                            satrec: satellite.json2satrec(records[0]),
                            available: true,
                        };
                    } catch (error) {
                        console.error(
                            `Could not load ${item.name}:`,
                            error
                        );

                        return {
                            ...item,
                            satrec: null,
                            available: false,
                        };
                    }
                })
            );

            if (cancelled) return;

            function updatePositions() {
                const now = new Date();
                const gmst = satellite.gstime(now);

                const updated = results.map((item) => {
                    if (!item.satrec) {
                        return {
                            ...item,
                            position: null,
                        };
                    }

                    try {
                        const propagated = satellite.propagate(
                            item.satrec,
                            now
                        );

                        const positionEci = propagated.position;
                        const velocityEci = propagated.velocity;

                        if (
                            !positionEci ||
                            typeof positionEci === "boolean" ||
                            !Number.isFinite(positionEci.x) ||
                            !Number.isFinite(positionEci.y) ||
                            !Number.isFinite(positionEci.z)
                        ) {
                            return {
                                ...item,
                                position: null,
                            };
                        }

                        const geo = satellite.eciToGeodetic(
                            positionEci,
                            gmst
                        );

                        const latitude = satellite.degreesLat(
                            geo.latitude
                        );

                        const longitude = satellite.degreesLong(
                            geo.longitude
                        );

                        const altitudeKm = geo.height;

                        if (
                            !Number.isFinite(latitude) ||
                            !Number.isFinite(longitude) ||
                            !Number.isFinite(altitudeKm)
                        ) {
                            return {
                                ...item,
                                position: null,
                            };
                        }

                        const velocityValid =
                            velocityEci &&
                            typeof velocityEci !== "boolean" &&
                            Number.isFinite(velocityEci.x) &&
                            Number.isFinite(velocityEci.y) &&
                            Number.isFinite(velocityEci.z);

                        const speedKmS = velocityValid
                            ? Math.sqrt(
                                velocityEci.x ** 2 +
                                velocityEci.y ** 2 +
                                velocityEci.z ** 2
                            )
                            : null;

                        return {
                            ...item,
                            position: {
                                latitude,
                                longitude,
                                altitudeKm,
                                speedKmS,
                            },
                        };
                    } catch (error) {
                        console.error(
                            `Position calculation failed for ${item.name}:`,
                            error
                        );

                        return {
                            ...item,
                            position: null,
                        };
                    }
                });

                if (!cancelled) {
                    setSatellites(updated);
                }
            }

            updatePositions();
            timer = window.setInterval(updatePositions, 3000);
        }

        startTracking().catch((error) => {
            console.error("Satellite tracking failed:", error);
        });

        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, []);

    const selectedSatellite = satellites.find(
        (item) => String(item.id) === selectedId
    );

    return (
        <>
            <SatelliteTrackingPanel
                satellites={satellites}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
            />

            <SatelliteFocusController
                selectedSatellite={selectedSatellite}
            />

            {satellites.map((item) => {
                if (!item.position || !item.showMarker) {
                    return null;
                }

                const p = item.position;

                return (
                    <CircleMarker
                        key={item.id}
                        center={[p.latitude, p.longitude]}
                        radius={7}
                        pathOptions={{
                            color: "#ffffff",
                            weight: 1.5,
                            fillColor: item.color,
                            fillOpacity: 1,
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -8]}>
                            {item.name}
                        </Tooltip>

                        <Popup>
                            <div style={{ minWidth: 190, lineHeight: 1.8 }}>
                                <strong>🛰️ {item.name}</strong>
                                <div>NORAD ID: {item.id}</div>
                                <div>
                                    Latitude: {p.latitude.toFixed(4)}°
                                </div>
                                <div>
                                    Longitude: {p.longitude.toFixed(4)}°
                                </div>
                                <div>
                                    Altitude: {p.altitudeKm.toFixed(2)} km
                                </div>
                                <div>
                                    Orbital speed:{" "}
                                    {p.speedKmS != null
                                        ? `${p.speedKmS.toFixed(2)} km/s`
                                        : "Unavailable"}
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
}