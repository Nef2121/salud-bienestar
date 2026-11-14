const fs = require("fs");
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    ...(fs.existsSync("./google-services.json")
      ? { googleServicesFile: "./google-services.json" }
      : {}),
  },
  plugins: [
    ...(config.plugins || []).filter(
      (p) => (Array.isArray(p) ? p[0] : p) !== "expo-notifications",
    ),
    ["expo-notifications", { defaultChannel: "salud" }],
  ],
});
