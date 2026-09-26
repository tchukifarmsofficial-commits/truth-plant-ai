const workbox = require("workbox-build");

workbox.generateSW({
  globDirectory: "dist/client",
  globPatterns: [
    "**/*.{js,css,html,png,svg,ico,webmanifest}"
  ],
  swDest: "dist/client/sw.js",
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true
})
.then((result) => {
  console.log("PWA service worker generated successfully.");
  console.log(result);
})
.catch((error) => {
  console.error("PWA service worker generation failed:");
  console.error(error);
  process.exit(1);
});
