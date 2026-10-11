import CesiumGlobe from "./CesiumGlobe";

export default function CesiumGlobeTest() {
    return (
        <div
            style={{
                height: "100vh",
                padding: 16,
                background: "#050914",
                color: "#e8edf7",
                boxSizing: "border-box",
            }}
        >
            <h2>Space Operations — 3D Earth</h2>

            <div
                style={{
                    height: "calc(100% - 60px)",
                    minHeight: 400,
                    border: "1px solid #293951",
                    borderRadius: 12,
                    overflow: "hidden",
                }}
            >
                <CesiumGlobe />
            </div>
        </div>
    );
}
