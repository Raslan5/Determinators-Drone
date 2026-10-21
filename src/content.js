/*
  Text that only the site needs (loader, presentation, ghost words,
  numbers band, type switcher) plus the site, hero, team, physics and flight text.
  Every text is one plain string. This file does not import src/content.js.
*/

export const site = {
  openPhoto: "Open photo: {caption}",
  teamName: "Determinators",
  contactEmail: "[team-email@example.com]",
  course: {
    name: "Master's degree in Applications and Technologies for Unmanned Aircraft Systems (Drones)",
    school: "Castelldefels School of Telecommunications and Aerospace Engineering (EETAC)",
    university: "UPC BarcelonaTech",
    url: "https://drones.masters.upc.edu/en",
    address: ["Campus del Baix Llobregat", "C/ Esteve Terradas, 7", "08860 Castelldefels"],
  },
  // While true, empty photo slots show where to put your photos.
  showPhotoHints: true,
  year: 2026,
};

export const hero = {
  title: "From a box of parts to the sky.",
  intro:
    "We are three students in the Master's in Drones at UPC. In our first month, each team got a box of parts. This is how we turned ours into a drone that flies, one step at a time, with the photos we took along the way.",
  // Captions under the drawing while it assembles itself.
  stages: [
    "The kit, as it arrived",
    "Frame and arms",
    "Motors on",
    "Autopilot, GPS and radios",
    "Propellers on",
    "Armed and hovering",
  ],
  // Labels next to the parts in the drawing (desktop only).
  kitLabels: {
    arms: "4 arms",
    plate: "Frame",
    battery: "Battery",
    motors: "4 motors",
    cube: "Autopilot",
    gps: "GPS",
    radio: "Radio",
    props: "4 propellers",
  },
};

// Motor order follows ArduCopter's Quad-X layout.
export const physics = {
  title: "How four propellers fly",
  lead: "A drone has no wings and no rudder. Every move comes from changing how fast each motor spins. Pick a move to see what the motors do.",
  moves: [
    { id: "hover", label: "Hover", text: "All four motors spin at the same speed. Their lift exactly matches the drone's weight, so it stays where it is." },
    { id: "climb", label: "Climb", text: "All four motors speed up together. Lift is now bigger than weight, so the drone rises." },
    { id: "forward", label: "Forward", text: "The back motors speed up and the front ones slow down. The drone tips its nose down and the tilted lift pushes it forward." },
    { id: "right", label: "Right", text: "The left motors speed up and the right ones slow down, so the drone leans to the right and slides that way." },
    { id: "turn", label: "Turn right", text: "Each spinning propeller twists the drone slightly the other way. Two spin one way and two the other, so normally the twists cancel out. Speed up one pair and the whole drone turns on the spot." },
  ],
};

export const flight = {
  title: "First flight",
  // The test pattern. Moves: up, down, forward, back, left, right (metres),
  // turnLeft, turnRight (degrees) and land.
  test: [
    { move: "up", value: 2 },
    { move: "forward", value: 2 },
    { move: "left", value: 2 },
    { move: "turnLeft", value: 180 },
    { move: "up", value: 2 },
    { move: "forward", value: 2 },
    { move: "turnRight", value: 90 },
    { move: "down", value: 2 },
    { move: "back", value: 2 },
    { move: "turnRight", value: 90 },
    { move: "land" },
  ],
  galleryTitle: "Photos from the flight",
  // Optional: a YouTube link to the flight video.
  videoUrl: "",
};

// Portraits: 1.jpg, 2.jpg and 3.jpg in src/photos/home/home_team/ (in this order).
export const team = {
  title: "Who we are",
  members: [
    {
      name: "[Name Surname]",
      role: "[Role in the project, e.g. radio and autopilot set-up]",
      background: "[Background, e.g. BSc in Aerospace Engineering]",
      from: "[City, country]",
      links: { linkedin: "", email: "", github: "" },
    },
    {
      name: "[Name Surname]",
      role: "[Role in the project, e.g. frame assembly and wiring]",
      background: "[Background]",
      from: "[City, country]",
      links: { linkedin: "", email: "", github: "" },
    },
    {
      name: "[Name Surname]",
      role: "[Role in the project, e.g. pilot]",
      background: "[Background]",
      from: "[City, country]",
      links: { linkedin: "", email: "", github: "" },
    },
  ],
  reflectionsTitle: "Looking back at Phase 1",
  reflections: [
    {
      title: "What we learned",
      text: "[Write three or four sentences. What finally made sense once you had the parts in your hands? What surprised you?]",
    },
    {
      title: "How we worked as a team",
      text: "[How did you split the work? What worked well, and what would you organise differently?]",
    },
    {
      title: "What we would do differently",
      text: "[If you started Phase 1 again tomorrow, what would you change?]",
    },
  ],
};

/*
  The 11 objects of the kit box (Phase 1, step 02 and the kit inventory).
  closed = one line on the closed card; open = text when the card is opened.
*/
export const kit = {
  items: [
    { key: "white-box-hexsoon", name: "White box (Hexsoon)", closed: "The frame of the drone.", open: "Three plates (two black and one transparent), four arms, four landing legs and joiners, the pieces that become the drone's skeleton. It also has two belts to strap the battery to the frame and a USB-to-TTL cable for a serial link between the autopilot and a laptop." },
    { key: "radio", name: "Radio", closed: "The controller the pilot holds.", open: "The radio transmitter with its battery and belt, the receiver that goes on the drone, the three-wire cable that connects the receiver to the autopilot, and a USB cable to connect the radio to a laptop. Its sticks, switches and knobs send the pilot's commands over several channels." },
    { key: "autopilot", name: "Autopilot", closed: "The brain of the drone.", open: "A Pixhawk Orange Cube running ArduPilot. It reads the radio commands and its sensors and decides how fast each motor must spin. The box also contains its power adapter and Power2 cable, a USB cable for the laptop, a buzzer that beeps to report its state, and a cable to connect it to the Raspberry Pi." },
    { key: "battery-checker", name: "Battery checker", closed: "It shows how charged the battery is.", open: "A small device that plugs into the battery and shows its voltage, so we know if it is safe to fly." },
    { key: "compass-gps", name: "Compass GPS", closed: "It tells the drone where it is and where north is.", open: "A single unit, mounted on its own support, that gives the autopilot the drone's position and heading." },
    { key: "radio-telemetry-kit", name: "Radio telemetry kit", closed: "The link between the drone and the laptop.", open: "Two emitter/receiver modules, one connected to the autopilot and one to a laptop USB port, so that Mission Planner can show live data and change settings in flight." },
    { key: "black-box", name: "Black box", closed: "Motors, electronics and screws.", open: "The four brushless motors and their four ESCs (which turn the autopilot's signal into power for each motor), extension cables, the power distribution board, the screws, nuts and support columns, the GPS support, the UBEC and T adapters, and a servo motor (not used for now)." },
    { key: "tool-box", name: "Tool box", closed: "Everything needed to build the drone.", open: "Scissors, tweezers, pliers, and sets of keys, screwdrivers and Allen keys." },
  ],
};

/* Photos shown inside the opened box, by kit key (files in photos/parts_drone/). Boxes not listed show text only. */
export const kitParts = {
  "white-box-hexsoon": [
    { file: "frame.png", alt: "Frame plate" },
    { file: "brazo.png", alt: "Arm" },
    { file: "brazo2.png", alt: "Arm, second view" },
    { file: "brazo3.png", alt: "Arm, third view" },
    { file: "brazo4.png", alt: "Arm, fourth view" },
  ],
  autopilot: [{ file: "cube.png", alt: "Orange Cube autopilot" }],
  "compass-gps": [{ file: "antena.png", alt: "GPS antenna" }],
  "radio-telemetry-kit": [{ file: "radio.png", alt: "Telemetry radio module" }],
  "black-box": [
    { file: "motor_nj.png", alt: "Motor" },
    { file: "motor_nj2.png", alt: "Motor, second view" },
    { file: "motor_negro.png", alt: "Black motor" },
    { file: "motor_negro2.png", alt: "Black motor, second view" },
  ],
};

export const brand = {
  name: "Determinators",
  // The drone's name is not decided yet.
  drone: "[Drone name]",
  presents: "presents",
  scroll: "Scroll to see how we built it",
};

// Flight lead.
export const flightDid = "Before going to the DronLab, we used the Mission Planner simulator (SITL) to prepare the geofence, a limit the autopilot does not let the drone cross. In the DronLab we had a 15-minute slot, the time it takes to empty our two batteries. For safety, the drone was tied to a weight. With the geofence defined, the master teachers made a first quick test flight, and then it was our turn: first we flew the drone manually, and then we ran a mission, a flight plan made of waypoints that the autopilot follows on its own. We started it from Mission Planner, which switches the autopilot to Auto mode by itself, so the three flight modes on the radio stayed the same.";

export const flightLead = "Our 15 minutes of glory: the day we took our drone to the DronLab at EETAC, in photos and video.";

export const loader = {
  label: "Loading",
};

// Giant semi-transparent words behind each section (decorative, hidden from screen readers).
export const ghosts = {
  top: "Lift",
  project: "Phases",
  build: "Build",
  parts: "Parts",
  physics: "Thrust",
  flight: "Flight",
  team: "Team",
  footer: "Determinators",
  byYourself: "Build",
  difficulties: "Hurdles",
};

// The numbers band. Every value is counted from this file, never typed in.
export const stats = {
  title: "Phase 1, counted",
  items: [
    { key: "phases", label: "phases in the project" },
    { key: "steps", label: "steps from box to sky" },
    { key: "parts", label: "components in the kit" },
    { key: "moves", label: "moves in the test flight" },
  ],
};

/*
  Interface text used by the components. {name} marks a value filled in by
  the component (a number, a step, a unit); it is not pending data.
*/

export const ui = {
  placeholderHint: "Placeholder: replace it in content.js",
  partsView: {
    partsLabel: "Photos of the pieces in this box",
    photosLabel: "Real photos of the drone components",
    photoAlt: "Real photo of the drone components",
    photoHint: "[Real photo of the components: put photos in src/photos/phase-1/ph1_step02/]",
  },
  intro: {
    photoAlt: "[Photo of the drone]",
    photoMissing: "[Drone photo pending: src/photos/home/home_title/]",
  },
  skip: "Skip to content",
  docTitle: "Drone Transversal Project, UPC",
  docTitleTeam: "{team} | Drone Transversal Project, UPC",
  and: " and ",
  nav: {
    sections: "Sections",
    sheet: "Sections (menu)",
    pages: "Pages",
    brand: "Home",
    // Main menu: one entry per page.
    pageLinks: [
      { path: "/", label: "Home" },
      { path: "/phase-1", label: "Phase 1" },
      { path: "/phase-2", label: "Phase 2" },
    ],
    // Secondary menu: the sections of the page you are on.
    links: {
      "/": { project: "Four phases", phases: "Phases", team: "Who we are" },
      "/phase-1": {
        route: "Route",
        "build-yourself": "Build by yourself",
        physics: "Previous to flight",
        flight: "First flight",
        difficulties: "Difficulties",
      },
      "/phase-2": {},
    },
  },
  project: {
    phase: "Phase {n}. ",
    status: { done: "Done", current: "In progress" },
  },
  team: {
    closeMark: "\u00D7",
    more: "More about {name}",
    photoHint: "[Photo {n}{ext} goes in src/photos/home/home_team/]",
    hintExt: ".jpg",
    linkedin: "LinkedIn",
    github: "GitHub",
    portrait: "Portrait of {name}",
    close: "Close",
    role: "Role in the team",
    education: "Education",
    links: "Links",
    linksGap: "[LinkedIn and GitHub links]",
    reflections: "Reflections",
    reflectionGap: "[Answer from this team member]",
    newTab: " (opens in a new tab)",
  },
  lightbox: {
    label: "Photo viewer",
    count: "{i} of {n}",
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
  },
  hero: {
    by: "By",
    artLabel:
      "Drawing of the drone kit: the parts laid out on a table assemble themselves into a quadcopter, which then takes off.",
    scrub: "Assembly",
    replay: "Replay",
  },
  build: {
    step: "Step {n}: ",
    drone: "Simple 3D drawing of a quadcopter that turns as you scroll through the build steps.",
    progress: "Build progress",
    explore: "Explore phase 1",
    goTo: "Step {n} of {total}",
    model: {
      label: "3D model of the drone, turning as you scroll. The parts we work on in the current step are outlined.",
      fallback: "Your browser cannot show the 3D model of the drone.",
    },
  },
  byYourself: {
    title: "Build by yourself",
    lead: "Now it is your turn. Drag each component onto the drone and see how it fits together.",
    fallback: "The drag-and-drop game needs a wider screen and motion enabled.",
  },
  phase2: { title: "Phase 2", working: "working..." },
  parts: {
    lead: "The 11 objects of the kit box. Open a card to see what is inside.",
    sectionLabel: "Kit components",
    rollerLabel: "Kit objects, one at a time",
    sliderLabel: "Kit object",
    sliderValue: "{name}, {i} of {n}",
    announce: "Object {i} of {n}",
    detail: {
      close: "Close details",
      inside: "What is inside",
    },
    buildTitle: "Build it yourself",
    buildHint: "Drag each component from the sides onto the drone with your mouse. It clicks into place when you drop it close to its spot. With a keyboard, Tab to a component and press Enter or Space to place it on the drone.",
    pieceLabel: "Place component {n}: {name}",
    pieceTray: "in the tray",
    piecePlaced: "placed",
    pieceNames: { battery: "battery", arm: "arm", plate: "plate", cube: "flight controller", radio: "radio", gps: "GPS", motor: "motor", prop: "propeller" },
    stageLabel: "Drone assembly game",
    cardHint: "Press Enter or Space to open details",
    placed: "{n} of {total} parts placed",
    done: "Drone assembled!",
    reset: "Start over",
  },
  physics: {
    moves: "Choose a move",
    schematic: "Top view of the drone during the move: {move}. Larger orange discs mean faster motors.",
    front: "Front",
    names: { FR: "Front right", RL: "Rear left", FL: "Front left", RR: "Rear right" },
    leftStick: "Left stick",
    rightStick: "Right stick",
    pushed: ", pushed",
    centred: ", centred",
  },
  ptf: {
    title: "Previous to flight",
    tabsLabel: "Previous to flight topics",
    tabs: { fly: "How four propellers fly", calibration: "Calibrations", planner: "Mission Planner" },
    listLabel: "Calibrations",
    intro: "With the drone fully assembled, we completed its set-up so that it was ready for the first flight test. We went through the calibrations of the guide one by one, each with its own video. Pick a calibration to see what we did.",
    videoSlot: "[video]",
    photosLabel: "Photos of the calibration process",
    animLabel: "Animated drone for the calibration: {step}.",
    steps: [
          {
                "id": "accel",
                "label": "Accelerometer and compass (again)",
                "body": "Once the drone was fully assembled, we repeated in Mission Planner the accelerometer and compass calibrations we had done in step 05."
          },
          {
                "id": "telemetry",
                "label": "Telemetry radio",
                "body": "We configured the telemetry radio so that Mission Planner and the autopilot can talk wirelessly, without the USB cable."
          },
          {
                "id": "esc",
                "label": "ESC calibration",
                "body": "We calibrated the ESCs so that all four of them understand the same range of throttle signal and the motors respond the same way."
          },
          {
                "id": "failsafe",
                "label": "Failsafe",
                "body": "We told the autopilot what to do if the drone loses contact with the radio. When the throttle signal drops below a threshold (FS pwm), the autopilot considers the radio lost and returns home (RTL). We first set it to 975, just below our minimum throttle of 982. The autopilot then refused to arm with the message \"PreArm: Check FS_THR_VALUE\", because it needs a margin of at least 10 between the two values. We lowered it to 960 and the warning disappeared."
          },
          {
                "id": "arm",
                "label": "Arm/disarm (switch SF)",
                "body": "We assigned arming and disarming to the SF switch on channel 7. Arming lets the motors spin, and disarming stops them."
          },
          {
                "id": "battery",
                "label": "Battery monitor",
                "body": "We configured the battery monitor so the autopilot knows how much charge is left. Before each use we also check the battery with the battery checker: every cell must have at least 3.7 V, otherwise it is time to charge."
          },
          {
                "id": "motor",
                "label": "Motor test",
                "body": "From Mission Planner we spun each motor on its own to check that all four are in the right order and turn in the right direction."
          },
          {
                "id": "defaults",
                "label": "Default parameters",
                "body": "We loaded the default parameters for our frame."
          },
          {
                "id": "final",
                "label": "Final tests",
                "body": "We checked the whole configuration by arming the drone. In class we did it in Stabilize, because the indoor GPS warning does not let it arm in Loiter."
          }
    ],
    planner: {
      sceneLabel: "Scene: a laptop running Mission Planner, an antenna sending radio waves, and the drone flying in the distance.",
      sections: [
        { heading: "Planning the flight", text: "Before going to the DronLab, we used Mission Planner's simulator (SITL) to rehearse without risk. We drew a geofence, a limit the autopilot does not let the drone cross, and planned a mission as a sequence of waypoints that the autopilot flies on its own. In the DronLab we started that mission from Mission Planner, which switches the autopilot to Auto mode by itself." },
        { heading: "Our ground station", text: "Mission Planner was our ground station for the whole of Phase 1. With it we installed the ArduPilot firmware on the Pixhawk Orange Cube, set its parameters, calibrated the accelerometer, compass, radio and ESCs, chose the flight modes, set up the failsafe and tested the motors." },
      ],
    },
  },
  flight: {
    video: "Video of our flight",
    stageTitle: "Illustration of the DroneLab at EETAC: a large netted flight cage over a grass field, with a drone flying a test route inside it.",
    stageNote: "Illustrative route, not the real one.",
    rollerLabel: "Photos from the flight",
    sliderLabel: "Choose a photo",
    sliderValue: "Photo {i} of {n}",
    announce: "Photo {i} of {n}",
    open: "Open photo {i} of {n}: {title}",
    close: "Close",
    titleGap: "[Photo title]",
    altGap: "[Photo description]",
    explainHead: "About this photo",
    explainGap: "[Explanation of this photo]",
    empty: "[Photos and videos from the flight]",
    sampleCount: 6,
    sampleTitle: "[Photo {i}]",
    sampleNote: "[Explanation of the photo]",
    sampleText: "[Explanation of the photo]",
    sampleOpen: "Example photo {i} of {n}: {title}. Expand it.",
  },
  glossary: {
    button: "Glossary / References",
    title: "Glossary / References",
    close: "Close",
    glossaryTitle: "Glossary",
    referencesTitle: "References",
    items: [
      ["CW / CCW", "Clockwise / counterclockwise, the two spin directions of the motors and propellers."],
      ["ESC (Electronic Speed Controller)", "It turns the autopilot's signal into power for a brushless motor."],
      ["PDB (Power Distribution Board)", "It takes the battery's power and shares it among the ESCs."],
      ["PWM", "The signal used to send commands. The width of each pulse sets, for example, how fast a motor spins."],
      ["Autopilot", "The drone's brain. It reads the radio and its sensors and controls the motors. Ours is a Pixhawk Orange Cube running ArduPilot."],
      ["Mission Planner", "The ground station software we use on the laptop to configure the autopilot and plan flights."],
      ["GCS (Ground Control Station)", "The laptop running Mission Planner."],
      ["Telemetry", "The wireless link that lets Mission Planner talk to the drone in flight."],
      ["Flight modes", "How much the autopilot helps the pilot. We used Stabilize, Alt Hold, Loiter and Land, and Auto for the mission."],
      ["RTL (Return To Launch)", "A mode that flies the drone straight back home."],
      ["Failsafe", "What the autopilot does automatically if something fails, for example if it loses the radio."],
      ["Geofence", "A limit drawn in Mission Planner that the drone is not allowed to cross."],
      ["Arm / disarm", "Arming lets the motors spin; disarming stops them."],
    ],
    references: ["Transversal Project Guide, Phase 1, Master in Drones, EETAC-UPC."],
  },
  difficulties: {
    title: "Difficulties",
    items: [
      { title: "04 Radio control \u2013 the radio and the receiver would not bind.", text: "The radio and its receiver should pair on their own, but ours did not. The guide explains that the binding procedure depends on the protocol the receiver uses. In our case we had to download a configuration file from a website and load it before the two could pair." },
      { title: "07 More calibrations \u2013 the ESC calibration sequence would not start.", text: "The instructions shown by Mission Planner were misleading, so the calibration did not start as expected. We found a video online that showed the right steps, and with it the ESCs calibrated correctly." },
    ],
  },
  footer: {
    course: "The course",
    where: "Where",
    contact: "Contact",
    credit: "Photos by the team.",
    top: "Back to top",
  },
};

// Phase 1 journey: the steps. Body = array of paragraphs or { list }.
export const journey = {
  title: "Eight steps from the box to the sky",
  // Lead as parts: plain strings and { label, href } links (rendered through safeHref).
  lead: [
    "Phase 1 took us from a box of parts to our first flight in eight steps. The first six, from the basics to the finished frame, are here. Step 7, the calibrations, is in ",
    { label: "Previous to flight", href: "#/phase-1/previous-to-flight-calibration" },
    ", and step 8 is our ",
    { label: "First flight", href: "#/phase-1/flight" },
    ".",
  ],
  listLabel: "Phase 1 journey, steps 1 to 6",
  step: "Step {n}",
  photosLabel: "Photos of step {n}: {title}",
  slotHint: "[Component breakdown goes here]",
  steps: [
    {
      "title": "The very very basics of a drone and its components",
      "body": [
        "Before touching the kit, we watched all the videos proposed in the guide to get a simple but wide picture of a drone system. We started with the introductory video and then went through each topic: radio control and its connections and configuration, ESCs, brushless motors, flight controllers vs flight computers, Mission Planner, the autopilot and flight modes. This gave us the basic map we used later: the pilot's commands travel from the radio to the receiver, the autopilot (a Pixhawk Orange Cube running ArduPilot) decides how fast each motor must spin, the ESCs power the brushless motors, and Mission Planner is the ground software we use to configure and monitor everything."
      ]
    },
    {
      "title": "Unboxing",
      "body": [
        "We received the kit box and checked its contents against the list in the guide: 11 objects, from the Hexsoon frame box and the radio to the autopilot, the laser altimeter, the GPS compass, the telemetry kit, a Raspberry Pi kit and a tool box. All 11 were there. We photographed the box and every component, so that at the end of the project we can return the kit in exactly the same condition. Two items were not in the box because they are dangerous: the battery and the propellers. They are handed over later, under the supervision of the master teachers, when they are needed. The full list of components, with their function, is in the Kit inventory section."
      ]
    },
    {
      "title": "Frame assembly (part 1)",
      "body": [
        "We started building the drone with the first phase of the frame: the central body and the four arms with their motors. We followed the assembly sheet included in the kit and used the kit's own tools. First we fixed the power distribution board to the top black plate. Then we mounted the four arms on the base plate. The tricky part was placing each arm in the right position. Each motor has three small red arrows that show its spin direction, and two of them have a white dot. In the Quad X layout, motors 1 and 2 spin counterclockwise and motors 3 and 4 spin clockwise. A motor in the wrong place means the drone cannot fly, so we checked every arm against the reference picture before tightening it. At the end we had the bare frame with motors, ready for the electronics in part 2."
      ]
    },
    {
      "title": "Radio control",
      "body": [
        "Before the radio could control the drone, we had to calibrate it and set it up. The radio sends its signals over several channels, and each stick, switch or knob controls one of them. On the drone, the receiver separates those channels and turns each one into a PWM signal: the wider the pulse, the faster the motor spins. After calibrating the radio, we put it in USB mode and created a model for our drone with OpenTX Companion on the laptop. A model tells the radio which control moves which channel. The left stick controls throttle when moved up and down (channel 3) and yaw when moved sideways (channel 4). The right stick controls pitch up and down (channel 2) and roll sideways (channel 1). We also assigned two switches: SB, with three positions, to channel 5, and SF, with two positions, to channel 7. We checked the model in the simulator, saved it to the radio and bound the radio to the receiver. Then we tested the link. We powered the receiver from the battery through the T connector and the UBEC, connected one motor to the receiver and moved the sticks to make it spin in the right direction. Finally, we reversed the pitch in the radio settings, a common practice so that pulling the right stick down raises the pitch signal."
      ]
    },
    {
      "title": "The autopilot",
      "body": [
        "The autopilot is the brain of the drone, a Pixhawk Orange Cube. It reads its internal sensors (barometer, accelerometer and gyroscope) and the GPS, and decides how fast each motor must spin to keep the drone stable in the chosen flight mode. To get it ready, we followed the steps of the guide:",
        {
          "list": [
            "We connected the radio receiver, the GPS and the buzzer to the autopilot.",
            "We installed Mission Planner on the laptop. It is the ground station software we use to configure the autopilot and, later, to plan flights.",
            "From Mission Planner we installed the ArduPilot firmware on the autopilot and set the parameters the guide gives. We then rebooted it: the LEDs turned on and the buzzer sounded, the sign that everything was fine.",
            "We calibrated the accelerometer and the compass, so the autopilot knows which way is down and where north is.",
            "We calibrated the radio in Mission Planner and noted the minimum and maximum throttle values, which were around 982 and 2006, as expected.",
            "We assigned three flight modes to the SB switch: **Stabilize**, **Alt Hold** and **Loiter**. In class we used Stabilize, which skips the indoor GPS warning that does not let the drone arm, so we could arm it and check that everything worked. In the DronLab we flew with the switch set to **Loiter, Loiter and Land**: Loiter holds the height and the position using the GPS, and Land brings the drone down safely. We also set the Return To Launch (RTL) altitude to 7 m."
          ]
        }
      ]
    },
    {
      "title": "Frame assembly (part 2)",
      "body": [
        "We finished the frame by adding the electronics on top of the body we built in part 1, following the steps of the guide and its assembly video. First we fixed the autopilot to the frame and placed the radio receiver. We connected the receiver's SBUS OUT to the RCIN input of the autopilot, a cable that also powers the receiver. Then we connected the four motors to the autopilot: each motor has a number, and that number tells which MAIN OUT it goes to. Next we mounted the transparent plate together with the GPS support and connected the GPS to the CAN 1 input. The telemetry radio went on the Telem 1 input. It is the wireless link between the autopilot and Mission Planner, which we need when the drone is flying and a USB cable is not possible. We connected the buzzer to the USB slot and added the straps that hold the battery. Finally, we secured every element with Velcro tape and zip ties, so that nothing could move or come loose in flight. The propellers were not mounted yet: they only go on at the time of the flight tests."
      ]
    },
  ],
};

// Home: phases summary (no dates).
export const projectV2 = {
  title: "Four phases, one drone.",
  lead:
    "The Transversal Project runs alongside our master's classes. Each team gets a drone kit and takes it, phase by phase, from a box of parts to a real mission in the DronLab. Phase 1 is done: we built, configured and flew our drone, and here we tell how we did it, step by step.",
  phases: [
    { title: "Assembly, configuration and first flight tests", status: "done", text: "We assemble the drone platform, configure and calibrate it, and make the first flight tests in the DronLab." },
    { title: "Application of concepts from the different subjects", status: "current", text: "Practical exercises of the first semester that use the drone platform." },
    { title: "Basic mission demonstration in the DronLab", status: "upcoming", text: "" },
    { title: "Advanced mission", status: "upcoming", text: "Delving into one specific aspect of the basic mission." },
  ],
};

// Home preview of Phase 1 (one line per step) and of Phase 2.
const previewLines = [
  ["The very very basics", "We watched the guide's videos to get a simple but complete picture of how a drone works."],
  ["Unboxing", "We opened the kit, checked its 11 objects and photographed everything."],
  ["Frame assembly (part 1)", "We built the central body and mounted the four arms with their motors in the Quad X layout."],
  ["Radio control", "We calibrated the radio, created our model and bound it to the receiver."],
  ["The autopilot", "We set up the Pixhawk Orange Cube with Mission Planner, calibrated its sensors and chose our flight modes."],
  ["Frame assembly (part 2)", "We added the autopilot, receiver, GPS, telemetry radio and buzzer, and secured everything."],
  ["More calibrations", "We completed the calibrations, from the ESCs and failsafe to the motor test, to get ready to fly."],
  ["Flight tests", "In the DronLab we flew the drone manually and then ran our first mission."],
];
const previewGlyphs = ["box", "radio", "arm", "cube", "gps", "calibrate", "flight", "flight"];
// Phase 1 preview model, one entry per step: show the drone or not, exploded view,
// propellers visible, and the part ids (userData.part in lib/droneModel.js) to outline.
const modelAll = ["cube", "receiver", "mast", "gps", "telemetry", "plate", "wires", "xt60", "battery", "prop"];
export const droneModelSteps = [
  { show: true, explode: true },
  { show: true, explode: true },
  { show: true, outline: ["frame", "clamp", "arm", "mount", "leg", "motor"] },
  { show: true, outline: ["receiver"] },
  { show: true, outline: ["cube"] },
  { show: true, props: true, outline: modelAll },
  { show: true, props: true },
  { show: true, props: true },
];
export const phasesPreview = {
  title: "Phase 1, step by step",
  lead: "",
  phase2: { title: "Phase 2", text: "Working on it..." },
  steps: previewLines.map(([title, text], i) => ({
    title,
    glyph: previewGlyphs[i],
    text,
    details: [],
  })),
};
