/*
  ============================================================================
   EDIT THIS FILE TO CHANGE THE TEXT OF THE WEBSITE
  ============================================================================

   1. Anything in [square brackets] is a placeholder. Replace it, brackets
      included. Placeholders show up on the site with a dashed underline so
      you can spot the ones you missed.

   2. Many texts come in two versions:
        simple: for everyone (family, friends, recruiters)
        tech:   for engineers (classmates, professors)
      The "Simple / Technical" switch at the top of the site picks one.
      If you only write one plain string, it is shown in both modes.

   3. Photos are NOT listed here. Drop them into the folders in src/photos/
      (read src/photos/HOW-TO.txt). The site finds them automatically.

   4. Everything below was pre-filled from the official Transversal Project
      guide. Check it against what YOUR team actually did and change anything
      that is different (dates, parts, steps).
*/

export const site = {
  teamName: "[Team name]",
  // Shown in the browser tab. Leave empty to build it from the team name.
  pageTitle: "",
  description:
    "How our team built and flew a drone for the Transversal Project of the Master's in Drones at UPC.",
  contactEmail: "[team-email@example.com]",
  course: {
    name: "Master's degree in Applications and Technologies for Unmanned Aircraft Systems (Drones)",
    school: "Castelldefels School of Telecommunications and Aerospace Engineering (EETAC)",
    university: "UPC BarcelonaTech",
    url: "https://drones.masters.upc.edu/en",
    address: ["Campus del Baix Llobregat", "C/ Esteve Terradas, 7", "08860 Castelldefels"],
  },
  // While true, empty photo slots show where to put your photos.
  // Set to false once you have added all the photos you want.
  showPhotoHints: true,
  year: 2026,
};

/* ---------------------------------------------------------------- HERO -- */
export const hero = {
  title: "From a box of parts to the sky.",
  intro: {
    simple:
      "We are three students in the Master's in Drones at UPC. In our first month, each team got a box of parts. This is how we turned ours into a drone that flies, one step at a time, with the photos we took along the way.",
    tech:
      "Phase 1 of our Transversal Project at EETAC, UPC: assembling a Hexsoon quadcopter frame, integrating a Cube Orange autopilot running ArduCopter, configuring it in Mission Planner, and validating it with manual flight tests and log analysis.",
  },
  modes: {
    simple: { label: "Simple", hint: "Plain words, no jargon" },
    tech: { label: "Technical", hint: "Ports, parameters and logs" },
  },
  // Captions under the drawing while it assembles itself.
  stages: [
    { simple: "The kit, as it arrived", tech: "Kit inventory: airframe, propulsion, avionics" },
    { simple: "Frame and arms", tech: "Centre plate with PDB, four arms" },
    { simple: "Motors on", tech: "Four brushless motors mounted" },
    { simple: "Autopilot, GPS and radios", tech: "Cube Orange, GNSS, RC receiver, telemetry" },
    { simple: "Propellers on", tech: "Two CW and two CCW props fitted" },
    { simple: "Armed and hovering", tech: "Armed, hovering" },
  ],
  // Labels next to the parts in the drawing (desktop only).
  kitLabels: {
    arms: { simple: "4 arms", tech: "4× arm + ESC" },
    plate: { simple: "Frame", tech: "Centre plate (PDB)" },
    battery: { simple: "Battery", tech: "LiPo" },
    motors: { simple: "4 motors", tech: "4× brushless motor" },
    cube: { simple: "Autopilot", tech: "Cube Orange" },
    gps: { simple: "GPS", tech: "GNSS + compass" },
    radios: { simple: "Radios", tech: "RC RX + telemetry" },
    props: { simple: "4 propellers", tech: "2× CW + 2× CCW props" },
  },
};

/* ------------------------------------------------------------- PROJECT -- */
export const project = {
  title: "Four phases, one drone.",
  lead: {
    simple:
      "The Transversal Project runs alongside our classes for the whole semester. Each team gets a drone kit and takes it from parts on a table to a real mission: build it, fly it, give it a job, and use the data it collects.",
    tech:
      "The Transversal Project develops a drone application through all of its stages: platform assembly and tuning, payload integration, mission planning, mission execution and exploitation of the collected data. It applies the content of the first-semester subjects, and this site is the project blog we update at the end of each phase.",
  },
  // status: "done", "current" or "upcoming"
  phases: [
    {
      title: "Assembly, setup and first flight",
      when: "September",
      status: "done",
      simple: "Build the drone from the kit and fly it for the first time.",
      tech: "Frame assembly, RC and autopilot configuration, calibrations, manual flight tests and log analysis.",
    },
    {
      title: "Putting the subjects to work",
      when: "October to January",
      status: "current",
      simple: "Use the drone in the practical work of our courses.",
      tech: "Static and dynamic flight plans, the onboard Raspberry Pi, camera and OpenCV, all on our own platform.",
    },
    {
      title: "Basic mission in the DroneLab",
      when: "January",
      status: "upcoming",
      simple: "Fly a search pattern to find a landing pad and report where it is.",
      tech: "Scan pattern over the DroneLab, landing-pad detection with the onboard camera, position sent to the ground station.",
    },
    {
      title: "Advanced mission",
      when: "January to February",
      status: "upcoming",
      simple: "Go deeper into one part of the mission that we choose ourselves.",
      tech: "Extend the basic mission in one direction, such as multi-pad detection with re-planning, obstacle avoidance with a depth camera, or AI-based detection.",
    },
  ],
};

/* --------------------------------------------------------------- BUILD -- */
// Photos for each step: name them with the step number first, for example
// 01-box.jpg, 01-parts.jpg, 03-motors-on.jpg ... and drop them in
// src/photos/steps/. The text after the number becomes the caption.
export const build = {
  title: "How we built it",
  lead: {
    simple: "Eight steps took us from opening the box to studying the data from our first flight.",
    tech: "Phase 1 followed the course activities: radio set-up, two-stage frame assembly, autopilot configuration, final calibrations, flight test and log analysis.",
  },
  steps: [
    {
      title: "Unboxing the kit",
      date: "[Date]",
      glyph: "box",
      simple:
        "Everything arrived in one box: frame, motors, electronics, radio and tools. Before touching anything we checked every part against the list and photographed it all, because the kit goes back to the university at the end of the course.",
      tech:
        "Inventory of the kit against the packing list, with photos of every component for the end-of-course return check. We also started the component table (function, supplier and price of each part) that you can find in the parts section.",
      details: ["Kit inventory", "Component table started"],
    },
    {
      title: "Radio control",
      date: "[Date]",
      glyph: "radio",
      simple:
        "The remote control talks to a small receiver on the drone. We chose which stick controls what, paired the remote with the receiver, and tested it on the bench with two motors and a small servo before going near the drone.",
      tech:
        "Radio configured with OpenTX Companion. Bench test with two ESC and motor pairs and a servo on the receiver's PWM outputs. Final model \"Our drone\": CH1 roll (Ail), CH2 pitch (Ele), CH3 throttle, CH4 yaw (Rud), CH5 flight-mode mix on switches SA and SB, CH7 arm/disarm on SF. Transmitter bound to the receiver.",
      details: ["OpenTX Companion", "CH1 to CH4: AETR", "CH5: flight modes", "CH7: arm/disarm"],
    },
    {
      title: "Frame assembly, part 1",
      date: "[Date]",
      glyph: "arm",
      simple:
        "We built the skeleton: the central body, which also shares the battery's power, and four arms with a motor at the end of each one.",
      tech:
        "Centre body with integrated power distribution board, four arms with brushless motors and ESCs. We added the twisted extension to each ESC signal lead, which made the autopilot wiring in part 2 much easier.",
      details: ["PDB in centre plate", "4× motor + ESC", "ESC signal extensions"],
    },
    {
      title: "The autopilot",
      date: "[Date]",
      glyph: "cube",
      simple:
        "The autopilot is the drone's brain. We installed its software from a laptop and taught it which way is down and where north is, so it can keep the drone level and pointing the right way.",
      tech:
        "Cube Orange flashed with ArduCopter from Mission Planner. Receiver SBUS out to RCIN, GPS and buzzer connected, parameters loaded and rebooted. Accelerometer, compass and radio calibrated; flight modes set to Stabilize, AltHold and Loiter.",
      details: ["Cube Orange", "ArduCopter", "Mission Planner", "Accel and compass calibration", "RC calibration"],
    },
    {
      title: "Frame assembly, part 2",
      date: "[Date]",
      glyph: "gps",
      simple:
        "Next came the rest of the electronics: the GPS, the receiver, a data radio that talks to our laptop, and sensors that measure height and movement over the floor. Then we tied everything down with velcro and zip ties.",
      tech:
        "Autopilot fixed to the frame; motors to MAIN OUT 1 to 4 in ArduCopter Quad-X order; GPS on CAN1; optical flow sensor on I2C2 and the downward altimeter mount; telemetry radio on TELEM1; buzzer on the USB port; battery straps. Everything secured with velcro and zip ties against vibration.",
      details: ["GPS: CAN1", "Optical flow: I2C2", "Telemetry: TELEM1", "Motors: MAIN OUT 1 to 4"],
    },
    {
      title: "Final calibrations",
      date: "[Date]",
      glyph: "calibrate",
      simple:
        "Before flying, we checked that all four motors respond the same way and spin in the right direction, and set a safety rule that brings the drone home if it loses the remote's signal. The propellers went on last.",
      tech:
        "ESC calibration, flight modes on CH5, radio failsafe set to RTL, arm/disarm on RC7 (switch SF), motor test in Mission Planner to verify order and direction, battery monitor configured, default parameters for our frame loaded. Props fitted last.",
      details: ["ESC calibration", "Failsafe: RTL", "RC7: arm/disarm", "Motor test", "Battery monitor"],
    },
    {
      title: "First flight test",
      date: "[Date]",
      glyph: "flight",
      simple:
        "Each of us flew the drone in a small controlled area on campus, following the same short pattern: up, forward, sideways, turn around, and back down to land.",
      tech:
        "Each team member flew the same manual test in the campus test area: 2 m climbs and descents, 2 m translations, and 180° and 90° yaw turns. You can replay the full pattern in the flight section.",
      details: ["Manual flight", "Stabilize and AltHold", "11-step pattern"],
    },
    {
      title: "Log analysis",
      date: "[Date]",
      glyph: "log",
      simple:
        "The autopilot records everything it does. After landing we downloaded that recording and checked on graphs that the drone did what we asked it to do.",
      tech:
        "DataFlash log (.bin) downloaded from the Cube and telemetry log (.tlog) from Mission Planner. We plotted desired against measured altitude (CTUN.DAlt and CTUN.Alt) and yaw (ATT.DesYaw and ATT.Yaw) to check the response to each manoeuvre.",
      details: ["DataFlash .bin", ".tlog", "CTUN.Alt", "ATT.Yaw"],
    },
  ],
};

/* --------------------------------------------------------------- PARTS -- */
// The course asks for this table: what each part does, where to buy it and
// its price. Prices are numbers in euros (for example 35 or 12.5) so the
// site can add them up. Leave the brackets until you know the real value.
// "key" links a row to the drawing; keep it as it is.
export const parts = {
  title: "What's inside",
  lead: {
    simple: "Each part has one job. Select a part to see where it sits on the drone.",
    tech: "Bill of materials of the platform as delivered in the kit, with the interface each component uses on the autopilot.",
  },
  priceNote: "[Prices checked on (month year). Where to buy: the supplier we found, not necessarily the one the university used.]",
  items: [
    {
      key: "frame", name: "Frame", qty: 1, model: "[Hexsoon frame kit, model]",
      simple: "The skeleton. Holds everything together and protects the electronics.",
      tech: "Quad-X airframe. The centre plate doubles as the power distribution board (PDB).",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "motor", name: "Motor", qty: 4, model: "[Model and KV]",
      simple: "Spin the propellers. Faster spin means more lift.",
      tech: "Brushless outrunners. Two spin clockwise and two counter-clockwise so their torques cancel.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "esc", name: "Speed controller (ESC)", qty: 4, model: "[Model and current rating]",
      simple: "Turn the autopilot's commands into power for each motor.",
      tech: "Drives each three-phase motor from the autopilot's PWM command (about 1000 to 2000 µs).",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "prop", name: "Propeller", qty: 4, model: "[Size and pitch]",
      simple: "Push air down to lift the drone.",
      tech: "Two CW and two CCW props, each matched to its motor's direction of rotation.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "cube", name: "Autopilot", qty: 1, model: "Cube Orange",
      simple: "The brain. Keeps the drone level and stable, correcting hundreds of times a second.",
      tech: "Pixhawk-standard flight controller with redundant IMUs and barometers, running ArduCopter.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "gps", name: "GPS", qty: 1, model: "[Model]",
      simple: "Tells the drone where it is and which way is north.",
      tech: "GNSS receiver with compass, on the CAN1 port.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "rx", name: "Radio receiver", qty: 1, model: "[Model]",
      simple: "Picks up the pilot's commands from the remote control.",
      tech: "SBUS output to RCIN, powered by the autopilot.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "telem", name: "Telemetry radio", qty: 1, model: "[Model and frequency]",
      simple: "A data link between the drone and our laptop.",
      tech: "MAVLink radio pair on TELEM1, linking the autopilot to Mission Planner.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "battery", name: "Battery", qty: 1, model: "[Cells and capacity, e.g. 4S 5000 mAh]",
      simple: "The fuel tank.",
      tech: "LiPo pack. Voltage and current are measured by the power module for the battery monitor.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "flow", name: "Optical flow sensor", qty: 1, model: "[Model]",
      simple: "A tiny downward camera that sees how the drone moves over the floor.",
      tech: "On I2C2. Gives velocity over the ground for position hold without GPS, for example indoors.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "lidar", name: "Altimeter", qty: 1, model: "[Model]",
      simple: "Measures the exact height above the floor.",
      tech: "Downward rangefinder for precise height above ground at low altitude.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "buzzer", name: "Buzzer", qty: 1, model: "[Model]",
      simple: "Beeps to tell us what the drone is doing.",
      tech: "Status tones for arming, failsafes and errors.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "tx", name: "Remote control", qty: 1, model: "[Model]",
      simple: "What the pilot holds. Sends every stick movement to the drone.",
      tech: "OpenTX radio with our \"Our drone\" model: AETR channel order, flight modes on CH5, arm/disarm on CH7.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
    {
      key: "rpi", name: "Onboard computer", qty: 1, model: "Raspberry Pi [model]",
      simple: "A small computer we will use in the next phases to give the drone missions.",
      tech: "Companion computer running our Python code over MAVLink, with camera, LEDs and a button for the missions.",
      store: { name: "[Store]", url: "" }, price: "[€]",
    },
  ],
};

/* ------------------------------------------------------- HOW IT FLIES -- */
// Motor order follows ArduCopter's Quad-X layout:
// M1 front right (CCW), M2 rear left (CCW), M3 front left (CW), M4 rear right (CW)
export const physics = {
  title: "How four propellers fly",
  lead: {
    simple: "A drone has no wings and no rudder. Every move comes from changing how fast each motor spins. Pick a move to see what the motors do.",
    tech: "A multirotor is steered only by differential thrust and reaction torque. The mixer turns throttle, roll, pitch and yaw demands into four motor outputs. Pick a move to see the mix.",
  },
  moves: [
    {
      id: "hover", label: "Hover",
      simple: "All four motors spin at the same speed. Their lift exactly matches the drone's weight, so it stays where it is.",
      tech: "Collective thrust equals weight and the roll, pitch and yaw demands are zero, so all four outputs are equal.",
    },
    {
      id: "climb", label: "Climb",
      simple: "All four motors speed up together. Lift is now bigger than weight, so the drone rises.",
      tech: "Throttle (CH3) raises collective thrust T by the same amount on every motor.",
    },
    {
      id: "forward", label: "Forward",
      simple: "The back motors speed up and the front ones slow down. The drone tips its nose down and the tilted lift pushes it forward.",
      tech: "Pitch demand (CH2): rear motors M2 and M4 up, front motors M1 and M3 down. The thrust vector tilts forward and gains a horizontal component.",
    },
    {
      id: "right", label: "Right",
      simple: "The left motors speed up and the right ones slow down, so the drone leans to the right and slides that way.",
      tech: "Roll demand (CH1): left motors M2 and M3 up, right motors M1 and M4 down.",
    },
    {
      id: "turn", label: "Turn right",
      simple: "Each spinning propeller twists the drone slightly the other way. Two spin one way and two the other, so normally the twists cancel out. Speed up one pair and the whole drone turns on the spot.",
      tech: "Yaw demand (CH4): the counter-clockwise motors M1 and M2 speed up and the clockwise motors M3 and M4 slow down. The reaction-torque imbalance yaws the airframe clockwise while total thrust stays the same.",
    },
  ],
  // Technical mode shows the mixer equations between these two sentences.
  mixerIntro: "With T for throttle, R for roll right, P for pitch forward and Y for yaw right, the four outputs are:",
  mixerOutro: "ArduCopter recomputes the mix at 400 Hz, and its PID loops add the corrections that keep the drone level.",
};

/* -------------------------------------------------------------- FLIGHT -- */
export const flight = {
  title: "First flight",
  lead: {
    simple: "Each of us flew the same short test in a small controlled area on campus. Flown well, the drone lands exactly where it took off, facing the same way. Press play to watch the route.",
    tech: "Each team member flew the same manual test. Moves are relative to the drone's heading, and the pattern closes in both position and heading, so any drift is easy to see in the logs.",
  },
  // The test pattern. Moves: up, down, forward, back, left, right (metres),
  // turnLeft, turnRight (degrees) and land. The 3D replay is drawn from this list.
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
  modesTitle: "The three flight modes we set up",
  modes: [
    {
      name: "Stabilize",
      simple: "The drone keeps itself level. The pilot controls the height with the throttle.",
      tech: "Self-levels roll and pitch. Throttle is manual; no altitude or position hold.",
    },
    {
      name: "AltHold",
      simple: "The drone also holds its height. Centre the stick and it stays at the same altitude.",
      tech: "Barometric altitude hold. Mid-stick throttle means zero climb rate; roll and pitch as in Stabilize.",
    },
    {
      name: "Loiter",
      simple: "With GPS, it holds its position too. Let go of the sticks and it waits in the air.",
      tech: "Position and altitude hold using GNSS. Sticks command velocity. Needs a good GPS fix, so outdoors.",
    },
  ],
  galleryTitle: "Photos from the flight",
  // Optional: a YouTube link to your flight video, e.g. "https://youtu.be/abc123"
  videoUrl: "",
  logs: {
    title: "What the logs say",
    // Shown while there is no log file in src/flight-log/ (see README)
    planned: {
      simple: "The autopilot records everything during a flight. The chart shows the height the test pattern asks for at each moment.",
      tech: "Planned altitude profile of the test pattern, at the replay's speed.",
    },
    // Shown once you add your log file
    measured: {
      simple: "The autopilot records everything during a flight. The chart compares the height it was asked to hold with the height it actually flew at.",
      tech: "Target altitude (CTUN.DAlt) against measured altitude (CTUN.Alt), from the DataFlash log of our flight.",
    },
    // Your conclusions from the log analysis:
    findings: "[What did your logs show? For example: altitude held within ±0.2 m in AltHold, yaw tracked the stick with little overshoot, no vibration warnings.]",
  },
};

/* ---------------------------------------------------------------- TEAM -- */
// Portraits: put 1.jpg, 2.jpg and 3.jpg in src/photos/team/ (in this order).
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
      role: "[Role in the project, e.g. pilot and log analysis]",
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

/* -------------------------------------------------------------- FOOTER -- */
export const footer = {
  next: "Phase 2 is next.",
  nextText: "We will add each new phase to this site as we complete it.",
};
