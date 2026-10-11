import { useEffect, useState } from "react";
import { CircleMarker, Polyline, Popup } from "react-leaflet";
import * as satellite from "satellite.js";

const ISS_CATALOG_ID = 25544;
const MAX_TRAIL_POINTS = 120;
const metricStyle = {
    padding: 11,
    background: "#111e30",
    border: "1px solid #22334a",
    borderRadius: 9,
    minWidth: 0,
};

const labelStyle = {
    fontSize: 9,
    color: "#8c9db7",
    letterSpacing: 1,
    marginBottom: 8,
};

const valueStyle = {
    fontSize: 17,
    fontWeight: 700,
    overflowWrap: "anywhere",
};

const unitStyle = {
    fontSize: 10,
    fontWeight: 400,
    color: "#8c9db7",
};

function splitTrailAtDateLine(points) {
    if (points.length === 0) return [];

    const segments = [];
    let currentSegment = [points[0]];

    for (let i = 1; i < points.length; i++) {
        const previous = points[i - 1];
        const current = points[i];

        // Prevent an unwanted line across the entire map
        // when the ISS crosses the international date line.
        if (Math.abs(current[1] - previous[1]) > 180) {
            if (currentSegment.length > 1) {
                segments.push(currentSegment);
            }

            currentSegment = [current];
        } else {
            currentSegment.push(current);
        }
    }

    if (currentSegment.length > 1) {
        segments.push(currentSegment);
    }

    return segments;
}

export default function LiveSatelliteLayer() {
    const [position, setPosition] = useState(null);
    const [trail, setTrail] = useState([]);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        let cancelled = false;
        let timer;

        async function startTracking() {
            try {
                setError("");

                const response = await fetch(
                    `https://celestrak.org/NORAD/elements/gp.php?CATNR=${ISS_CATALOG_ID}&FORMAT=JSON`
                );

                if (!response.ok) {
                    throw new Error(
                        `Orbital data request failed: ${response.status}`
                    );
                }

                const records = await response.json();

                if (!Array.isArray(records) || records.length === 0) {
                    throw new Error("No ISS orbital data was returned.");
                }

                const satrec = satellite.json2satrec(records[0]);

                function updatePosition() {
                    if (cancelled) return;

                    const now = new Date();
                    const propagated = satellite.propagate(satrec, now);
                    const positionEci = propagated.position;
                    const velocityEci = propagated.velocity;

                    if (
                        !positionEci ||
                        typeof positionEci === "boolean" ||
                        !Number.isFinite(positionEci.x) ||
                        !Number.isFinite(positionEci.y) ||
                        !Number.isFinite(positionEci.z)
                    ) {
                        setError("Unable to calculate the ISS position.");
                        return;
                    }

                    const gmst = satellite.gstime(now);

                    const geodetic = satellite.eciToGeodetic(
                        positionEci,
                        gmst
                    );

                    const latitude = satellite.degreesLat(
                        geodetic.latitude
                    );

                    const longitude = satellite.degreesLong(
                        geodetic.longitude
                    );

                    const altitudeKm = geodetic.height;

                    if (
                        !Number.isFinite(latitude) ||
                        !Number.isFinite(longitude) ||
                        !Number.isFinite(altitudeKm)
                    ) {
                        setError("The calculated ISS coordinates are invalid.");
                        return;
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

                    const currentPosition = {
                        latitude,
                        longitude,
                        altitudeKm,
                        speedKmS,
                    };

                    setPosition(currentPosition);

                    // Save the latest position for the ground-track trail.
                    setTrail((previousTrail) => {
                        const nextTrail = [
                            ...previousTrail,
                            [latitude, longitude],
                        ];

                        return nextTrail.slice(-MAX_TRAIL_POINTS);
                    });

                    setLastUpdated(now);
                    setError("");
                }

                updatePosition();

                // Calculate the ISS position every three seconds.
                timer = window.setInterval(updatePosition, 3000);
            } catch (err) {
                console.error("ISS tracking error:", err);

                if (!cancelled) {
                    setError(
                        "Live tracking unavailable. Check your connection and browser console."
                    );
                }
            }
        }

        startTracking();

        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, []);

    const trailSegments = splitTrailAtDateLine(trail);

    return (
        <>
            {/* ISS ground-track trail */}
            {trailSegments.map((segment, index) => (
                <Polyline
                    key={`iss-trail-${index}`}
                    positions={segment}
                    pathOptions={{
                        color: "#ff6b8a",
                        weight: 3,
                        opacity: 0.85,
                        lineCap: "round",
                        lineJoin: "round",
                    }}
                />
            ))}

            {/* Current ISS position */}
            {position && (
                <CircleMarker
                    center={[
                        position.latitude,
                        position.longitude,
                    ]}
                    radius={9}
                    pathOptions={{
                        color: "#ffffff",
                        weight: 2,
                        fillColor: "#ff6b8a",
                        fillOpacity: 1,
                    }}
                >
                    <Popup>
                        <div
                            style={{
                                minWidth: "200px",
                                lineHeight: 1.8,
                            }}
                        >
                            <strong>
                                🛰️ International Space Station
                            </strong>

                            <div>NORAD ID: {ISS_CATALOG_ID}</div>

                            <div>
                                Latitude: {position.latitude.toFixed(4)}°
                            </div>

                            <div>
                                Longitude: {position.longitude.toFixed(4)}°
                            </div>

                            <div>
                                Altitude: {position.altitudeKm.toFixed(2)} km
                            </div>

                            <div>
                                Trail points: {trail.length}
                            </div>

                            <div>
                                Updated:{" "}
                                {lastUpdated
                                    ? lastUpdated.toLocaleTimeString()
                                    : "Calculating..."}
                            </div>

                            <small>
                                Position calculated using SGP4 orbital propagation.
                            </small>
                        </div>
                    </Popup>
                </CircleMarker>
            )}

            {/* Show an error only when tracking fails. */}
            {error && (
                <div
                    role="status"
                    style={{
                        position: "absolute",
                        zIndex: 1000,
                        top: 12,
                        left: 12,
                        maxWidth: 280,
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: "#251724",
                        color: "#ffb8c6",
                        border: "1px solid #71394a",
                        fontSize: 12,
                    }}
                >
                    {error}
                </div>
            )}
            {/* LIVE SATELLITE TRACKING DASHBOARD */}
            <div
                style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 1000,
                    width: "min(290px, calc(100% - 24px))",
                    padding: 18,
                    borderRadius: 14,
                    background: "rgba(10, 18, 34, 0.96)",
                    color: "#e8edf7",
                    border: "1px solid #293951",
                    boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    pointerEvents: "auto",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                        gap: 8,
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: "#8c9db7",
                                fontSize: 10,
                                letterSpacing: 1.5,
                                marginBottom: 5,
                            }}
                        >
                            SPACE OPERATIONS
                        </div>

                        <div style={{ fontSize: 17, fontWeight: 700 }}>
                            🛰️ ISS TRACKER
                        </div>
                    </div>

                    <span
                        style={{
                            background: error ? "#48232d" : position ? "#123b32" : "#40351d",
                            color: error ? "#ff9bad" : position ? "#42ddb0" : "#ffd580",
                            padding: "5px 8px",
                            borderRadius: 20,
                            fontSize: 10,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {error ? "OFFLINE" : position ? "● TRACKING" : "CONNECTING"}
                    </span>
                </div>

                {/* Tracking metrics */}
                {position ? (
                    <>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 10,
                            }}
                        >
                            <div style={metricStyle}>
                                <div style={labelStyle}>ALTITUDE</div>
                                <div style={valueStyle}>
                                    {position.altitudeKm.toFixed(1)}
                                    <span style={unitStyle}> km</span>
                                </div>
                            </div>

                            <div style={metricStyle}>
                                <div style={labelStyle}>ORBITAL SPEED</div>
                                <div style={valueStyle}>
                                    {position.speedKmS != null
                                        ? position.speedKmS.toFixed(2)
                                        : "—"}
                                    <span style={unitStyle}> km/s</span>
                                </div>
                            </div>

                            <div style={metricStyle}>
                                <div style={labelStyle}>LATITUDE</div>
                                <div style={valueStyle}>
                                    {position.latitude.toFixed(3)}°
                                </div>
                            </div>

                            <div style={metricStyle}>
                                <div style={labelStyle}>LONGITUDE</div>
                                <div style={valueStyle}>
                                    {position.longitude.toFixed(3)}°
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: 14,
                                paddingTop: 12,
                                borderTop: "1px solid #293951",
                                fontSize: 11,
                                color: "#8c9db7",
                                lineHeight: 1.8,
                            }}
                        >
                            <div>
                                <span style={{ color: "#42ddb0" }}>●</span>{" "}
                                Position model active
                            </div>

                            <div>
                                Last calculated:{" "}
                                {lastUpdated
                                    ? lastUpdated.toLocaleTimeString()
                                    : "Calculating..."}
                            </div>

                            <div>NORAD Catalog ID: 25544</div>
                            <div>Trail history: {trail.length} points</div>
                        </div>
                    </>
                ) : (
                    <div style={{ color: "#8c9db7", fontSize: 12, lineHeight: 1.8 }}>
                        {error || "Downloading orbital elements and calculating position..."}
                    </div>
                )}
            </div>
        </>
    );
}