const config = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                mist: "#f4f1ea",
                panel: "#fffaf2",
                ink: "#1f2a2f",
                line: "#d8cfbf",
                accent: "#0f766e",
                ember: "#c97316",
                danger: "#b42318",
                success: "#146c43"
            },
            fontFamily: {
                sans: ["Aptos", "Segoe UI Variable", "Segoe UI", "Noto Sans", "sans-serif"],
                display: ["Aptos", "Segoe UI Variable", "Segoe UI", "sans-serif"]
            },
            boxShadow: {
                panel: "0 16px 48px rgba(33, 37, 41, 0.08)"
            },
            backgroundImage: {
                lattice: "radial-gradient(circle at top left, rgba(15, 118, 110, 0.14), transparent 32%), linear-gradient(135deg, rgba(15, 118, 110, 0.04), rgba(201, 115, 22, 0.05))"
            }
        }
    },
    plugins: []
};
export default config;
