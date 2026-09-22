export type Project = {
  slug: string;
  number: string;
  title: string;
  category: "Embedded systems" | "Software";
  discipline: string;
  summary: string;
  stack: string[];
  image: string;
  signal: string;
  overview: string;
  focus: { title: string; description: string }[];
  flow: [string, string, string];
  // Omit to disable the widget and all repository requests.
  repositoryBrowser?: { url: string; branch?: string; rootPath?: string };
  sourceUrl?: string;
  liveUrl?: string;
};

// Original portfolio descriptions, plus public repository descriptions/READMEs
// for Radar and SpriteForge. Only add verified source and demo links here.
export const projects: Project[] = [
  {
    slug: "wall-avoiding-robot", number: "01", title: "Automatic Wall-Avoiding Robot",
    category: "Embedded systems", discipline: "Robotics / embedded control",
    summary: "Sensor-driven robot that navigates by connecting obstacle detection to DC motor control.",
    stack: ["C++", "Arduino", "Sensors", "DC motors"], image: "/projects/wall-avoiding-robot.jpg", signal: "Sense → decide → actuate",
    overview: "An autonomous robot that detects obstacles and drives DC motors to navigate around them. I built this using an Arduino to map raw sensor inputs directly to motor movement commands.",
    focus: [
      { title: "Sensor input", description: "Obstacle sensors provide the raw data. The software parses these readings to figure out what's in front of the robot." },
      { title: "Control logic", description: "C++ on the Arduino translates sensor readings into navigation commands, letting the robot react to its environment in real-time." },
      { title: "Motor output", description: "DC motors turn the software's decisions into physical movement, bridging the gap between code and hardware." },
    ], flow: ["Obstacle sensors", "Arduino / C++", "DC motors"],
  },
  {
    slug: "plant-watering-system", number: "02", title: "Autonomous Plant-Watering System",
    category: "Embedded systems", discipline: "Sensing / automation",
    summary: "An automated watering system that triggers based on soil moisture and environmental data.",
    stack: ["Java", "I2C", "IoT"], image: "/projects/plant-watering-system.jpg", signal: "Measure → evaluate → water",
    overview: "A smart plant-watering system that checks soil moisture and ambient conditions to decide when a plant needs water. It's a fun IoT project combining sensors, I2C communication, and custom application logic.",
    focus: [
      { title: "Environmental sensing", description: "Soil-moisture sensors monitor the plant's environment, ensuring it only gets watered when necessary." },
      { title: "Device communication", description: "I2C is used to handle communication between the microcontroller and peripheral components." },
      { title: "Automated decisions", description: "Java handles the core logic, taking the sensor data and deciding whether to trigger the water pump." },
    ], flow: ["Soil / environment", "Watering logic", "Water delivery"],
  },
  {
    slug: "pantry-app", number: "03", title: "Pantry App",
    category: "Software", discipline: "Full-stack / inventory systems",
    summary: "A full-stack application for managing kitchen inventory, tracking expiration dates, and sending low-stock alerts.",
    stack: ["Next.js", "Supabase", "Stripe"], image: "/projects/pantry-app.jpg", signal: "Inventory → state → notification",
    overview: "A web app I built to keep track of pantry inventory, monitor expiration dates, and alert me when stock is low. It takes physical kitchen inventory and turns it into a manageable digital dashboard.",
    focus: [
      { title: "Inventory state", description: "The app tracks items, quantities, and expiration dates, presenting everything in a clean, easy-to-read interface." },
      { title: "Application stack", description: "Built with Next.js for the frontend, Supabase for backend database management, and Stripe for payments/subscriptions." },
      { title: "Time and stock", description: "Expiration tracking and low-stock alerts make the app genuinely useful for everyday kitchen management." },
    ], flow: ["Pantry inventory", "Application / data", "Stock notifications"],
  },
  {
    slug: "wuwa-builds", number: "04", title: "WUWA Builds",
    category: "Software", discipline: "Full-stack / structured game data",
    summary: "A database website for organizing and sharing Wuthering Waves character builds.",
    stack: ["Next.js", "Supabase", "Python"], image: "/projects/wuwa-builds.jpg", signal: "Resonator → equipment → build",
    overview: "A tool I made for my friends and me to track our Wuthering Waves character builds. It stores resonator stats, weapons, and echoes in a Supabase database and displays them through a Next.js frontend.",
    focus: [
      { title: "Structured build data", description: "Each build groups a character with their stats, weapons, and echoes into a single, clean record." },
      { title: "Application and storage", description: "Next.js handles the UI, while Supabase provides reliable backend storage for all the game data." },
      { title: "A usable reference", description: "It turns messy screenshots and spreadsheets into a browsable database that's easy to share." },
    ], flow: ["Resonator / gear", "Supabase storage", "Next.js interface"],
    repositoryBrowser: { url: "https://github.com/thomasnwmn/wuwabuilds" },
    sourceUrl: "https://github.com/thomasnwmn/wuwabuilds", liveUrl: "https://wuwa.thomasnewman.ca",
  },
  {
    slug: "radar", number: "05", title: "Arduino Radar",
    category: "Embedded systems", discipline: "Instrumentation / visualization",
    summary: "A radar system built with an Arduino, a servo, an ultrasonic sensor, and a Streamlit UI.",
    stack: ["Arduino", "Ultrasonic sensor", "Streamlit", "Servo"], image: "/projects/radar.jpg", signal: "Sweep → measure → display",
    overview: "A hardware radar that uses a servo motor to sweep an ultrasonic sensor, measuring distances in real-time. It outputs data to a local LCD and streams it to a Streamlit web interface for a cool visual radar display.",
    focus: [
      { title: "Physical scanning", description: "The servo motor physically sweeps the ultrasonic sensor back and forth to map out the surrounding space." },
      { title: "Local readout", description: "An LCD screen wired directly to the Arduino provides instant distance readouts." },
      { title: "Software interface", description: "A Python Streamlit app takes the serial data and renders it into a visual radar screen." },
    ], flow: ["Servo / ultrasonic", "Arduino", "LCD / Streamlit"], sourceUrl: "https://github.com/thomasnwmn/radar",
  },
  {
    slug: "spriteforge", number: "06", title: "SpriteForge",
    category: "Software", discipline: "Systems programming / game engine",
    summary: "A custom 2D game engine built from scratch in C using SDL2.",
    stack: ["C", "SDL2", "CMake", "Lua"], image: "/projects/spriteforge.jpg", signal: "Input → simulation → render",
    overview: "My custom 2D game engine written from scratch in C. It handles input, graphics, entities, physics, audio, and UI using SDL2. I built this to get a better understanding of low-level software architecture and memory management.",
    focus: [
      { title: "Engine subsystems", description: "I built custom systems for rendering, physics, and entity management to see how they all interact in a C environment." },
      { title: "Assets and interaction", description: "Includes systems for asset management, audio playback, and UI to actually support making playable games." },
      { title: "Build toolchain", description: "Uses CMake for the build system and vcpkg to manage dependencies like SDL2 and Lua on Windows." },
    ], flow: ["Input / events", "Entities / physics", "SDL2 rendering"], sourceUrl: "https://github.com/thomasnwmn/spriteforge",
  },
];

export function getProject(slug: string) { return projects.find((project) => project.slug === slug); }
