import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
  3D quadcopter for the Phase 1 preview. Units: 1 = 10 cm. Front = -Z, right = +X, up = +Y.
  Quad-X motors: 1 front-right CCW, 2 rear-left CCW, 3 front-left CW, 4 rear-right CW.
  Every part is a group with userData.part (id used by the step table in content.js)
  and userData.ex (how far it moves in the exploded view).
*/

const OUTLINE_WIDTH = 0.05; // hull push along the normals, in model units
const HOME = { yaw: 1.85, pitch: 0.36, dist: 12, ty: -0.05 };
const EXPLODED = { dist: 16, ty: 0.4 };
const ease = (x) => x * x * (3 - 2 * x);

/** step = { show, explode, props, outline: [part ids] }. opts = { outlineColor, reduced }. */
export function createDroneModel(canvas, opts = {}) {
  const T = THREE;
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
  scene.add(new T.HemisphereLight(0xffffff, 0x8a8f9c, 2.2));
  const sun = new T.DirectionalLight(0xffffff, 2.7);
  sun.position.set(4, 9, 3);
  scene.add(sun);
  const rim = new T.DirectionalLight(0xdfe8ff, 1.1);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

    /* ---------- textures drawn on canvases (no image files) ---------- */
  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.anisotropy = 4; t.colorSpace = T.SRGBColorSpace;
    return t;
  };
  const carbon = (rx, ry) => {
    const t = canvasTex(64, 64, (g) => {
      g.fillStyle = '#1b1d22'; g.fillRect(0, 0, 64, 64);
      for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 8) {
        const odd = ((x + y) / 8) % 2;
        const gr = g.createLinearGradient(x, y, odd ? x + 8 : x, odd ? y : y + 8);
        gr.addColorStop(0, '#24272d'); gr.addColorStop(0.5, '#3b3f48'); gr.addColorStop(1, '#202329');
        g.fillStyle = gr; g.fillRect(x + 0.5, y + 0.5, 7, 7);
      }
    });
    t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry);
    return t;
  };
  const label = (w, h, bg, lines) => canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (const [text, x, y, size, color, align] of lines) {
      g.fillStyle = color; g.font = `bold ${size}px Arial, sans-serif`;
      g.textAlign = align || 'left'; g.textBaseline = 'middle'; g.fillText(text, x, y);
    }
  });

  const M = (color, o = {}) => new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0.1 }, o));
  const mat = {
    carbonPlate: M(0xffffff, { map: carbon(3, 3), roughness: 0.4, metalness: 0.3 }),
    carbonTube: M(0xffffff, { map: carbon(4, 14), roughness: 0.35, metalness: 0.3 }),
    carbonLeg: M(0xffffff, { map: carbon(2, 20), roughness: 0.4, metalness: 0.3 }),
    black: M(0x18181c, { roughness: 0.7 }),
    blackFlat: M(0x1c1c21, { roughness: 0.65, flatShading: true }),
    hole: M(0x0c0c0e, { roughness: 1 }),
    metal: M(0xc4c8d0, { roughness: 0.3, metalness: 0.9 }),
    alu: M(0xd8dbe2, { roughness: 0.25, metalness: 0.8, flatShading: true }),
    copper: M(0xb8733a, { roughness: 0.35, metalness: 0.8 }),
    acrylic: M(0xe8f6ff, { roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, depthWrite: false }),
    board: M(0x111114, { roughness: 0.5 }),
    jst: M(0xf4f1e8, { roughness: 0.6 }),
    gold: M(0xd9b34a, { roughness: 0.3, metalness: 0.9 }),
    xt60: M(0xf0c030, { roughness: 0.5 }),
    red: M(0xc0201c, { roughness: 0.5 }),
    blue: M(0x2c4fd0, { roughness: 0.5 }),
    yellow: M(0xe8c21c, { roughness: 0.5 }),
    prop: M(0x16161a, { roughness: 0.35, side: T.DoubleSide })
  };
  mat.orange = M(0xff5a1f, { roughness: 0.55 });
  mat.orangeFlat = M(0xff5a1f, { roughness: 0.6, flatShading: true });
  mat.cube = M(0xff6a2a, { roughness: 0.45 });

  /* ---------- helpers ---------- */
  const drone = new T.Group();
  scene.add(drone);
  const parts = [];
  const part = (name, ex, parent = drone) => {
    const g = new T.Group();
    g.userData.part = name; g.userData.ex = ex || new T.Vector3();
    parent.add(g); parts.push(g);
    return g;
  };
  const add = (geo, m, x, y, z, parent) => {
    const mesh = new T.Mesh(geo, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const box3 = (w, h, d) => new T.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, seg = 20) => new T.CylinderGeometry(rt, rb, h, seg);
  const tube = (pts, r, m, parent) => add(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((p) => V(...p))), Math.max(12, pts.length * 8), r, 6, false), m, 0, 0, 0, parent);
  // two wires twisted around a path (the yellow / black signal pairs)
  const twisted = (pts, r, mA, mB, parent, turns = 6) => {
    const curve = new T.CatmullRomCurve3(pts.map((p) => V(...p)));
    const n = 60, a = [], b = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = curve.getPoint(t), tan = curve.getTangent(t);
      const side = new T.Vector3().crossVectors(tan, V(0, 1, 0)).normalize();
      if (side.lengthSq() < 0.01) side.set(1, 0, 0);
      const up = new T.Vector3().crossVectors(side, tan).normalize();
      const ang = t * turns * Math.PI * 2, off = r * 1.1;
      const o = side.clone().multiplyScalar(Math.cos(ang) * off).add(up.clone().multiplyScalar(Math.sin(ang) * off));
      a.push(p.clone().add(o)); b.push(p.clone().sub(o));
    }
    add(new T.TubeGeometry(new T.CatmullRomCurve3(a), n * 2, r, 5, false), mA, 0, 0, 0, parent);
    add(new T.TubeGeometry(new T.CatmullRomCurve3(b), n * 2, r, 5, false), mB, 0, 0, 0, parent);
  };
  // flat plate with holes (rounded rectangle extruded upwards from y = 0)
  const plate = (w, d, r, holes, depth) => {
    const s = new T.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    for (const h of holes) {
      const p = new T.Path();
      if (h.n) {
        for (let i = 0; i <= h.n; i++) {
          const a = (i / h.n) * Math.PI * 2 + (h.rot || 0);
          const px = h.x + Math.cos(a) * h.r, py = h.y + Math.sin(a) * h.r;
          i ? p.lineTo(px, py) : p.moveTo(px, py);
        }
      } else p.absarc(h.x, h.y, h.r, 0, Math.PI * 2, true);
      s.holes.push(p);
    }
    const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 18 });
    g.rotateX(-Math.PI / 2);
    return g;
  };
  const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  /* ---------- central frame ---------- */
  const frame = part('frame', V(0, -0.35, 0));
  add(plate(1.5, 1.5, 0.12, [
    { x: 0, y: 0, r: 0.2 }, ...corners.map(([sx, sz]) => ({ x: sx * 0.42, y: sz * 0.42, r: 0.07 })),
    { x: 0, y: 0.55, r: 0.09 }, { x: 0, y: -0.55, r: 0.09 }, { x: 0.55, y: 0, r: 0.09 }, { x: -0.55, y: 0, r: 0.09 }
  ], 0.035), mat.carbonPlate, 0, -0.02, 0, frame);
  // PDB: a thin board with copper pads between the plates
  const pdb = part('frame', V(0, -0.15, 0), frame);
  add(box3(0.62, 0.025, 0.62), M(0x1f3b2a, { roughness: 0.5 }), 0, 0.06, 0, pdb);
  for (const [sx, sz] of corners) add(box3(0.1, 0.012, 0.07), mat.gold, sx * 0.22, 0.078, sz * 0.22, pdb);
  // red power wires from the PDB towards each arm (to the ESCs)
  for (const [sx, sz] of corners) tube([[sx * 0.2, 0.08, sz * 0.2], [sx * 0.42, 0.14, sz * 0.38], [sx * 0.62, 0.12, sz * 0.62]], 0.018, mat.red, pdb);

  const mid = part('frame', V(0, 0.25, 0));
  add(plate(1.3, 1.3, 0.1, [
    ...corners.map(([sx, sz]) => ({ x: sx * 0.38, y: sz * 0.38, r: 0.06 })), { x: 0, y: 0.45, r: 0.12 }, { x: 0, y: -0.45, r: 0.12 }
  ], 0.035), mat.carbonPlate, 0, 0.345, 0, mid);
  for (const [sx, sz] of corners) add(cyl(0.028, 0.028, 0.34, 6), mat.alu, sx * 0.58, 0.17, sz * 0.2, frame);

  // orange arm clamps with their holes
  const clampG = [];
  for (const [sx, sz] of corners) {
    const ang = Math.atan2(sz, sx);
    const c = part('clamp', V(Math.cos(ang) * 0.35, 0, Math.sin(ang) * 0.35));
    c.position.set(sx * 0.5, 0.18, sz * 0.5);
    c.rotation.y = -ang;
    add(box3(0.3, 0.3, 0.3), mat.orange, 0, 0, 0, c);
    for (const [fy, fz] of [[0, 1], [0, -1], [1, 0]]) {
      for (const u of [-0.07, 0.07]) for (const v of [-0.07, 0.07]) {
        const hole = add(cyl(0.042, 0.042, 0.02, 14), mat.hole, fy ? u : u, fy ? 0.151 : v, fy ? v : fz * 0.151, c);
        if (!fy) hole.rotation.x = Math.PI / 2;
      }
    }
    clampG.push(c);
  }

  /* ---------- autopilot: carrier board + Orange Cube + connectors ---------- */
  const cube = part('cube', V(0, 0.7, 0));
  const carrierTex = label(256, 64, '#111114', [['CubePilot', 128, 32, 30, '#e8e8ee', 'center']]);
  const carrierMats = [mat.board, mat.board, mat.board, mat.board, M(0xffffff, { map: carrierTex, roughness: 0.5 }), mat.board];
  add(box3(0.82, 0.09, 0.54), carrierMats, 0, 0.42, 0.05, cube);
  for (let i = 0; i < 6; i++) add(box3(0.07, 0.045, 0.05), mat.jst, -0.3 + i * 0.12, 0.485, 0.29, cube);
  for (let i = 0; i < 4; i++) add(box3(0.05, 0.045, 0.07), mat.jst, 0.38, 0.485, -0.12 + i * 0.1, cube);
  const cubeGeo = new T.ExtrudeGeometry((() => {
    const s = new T.Shape(), a = 0.16, r = 0.04;
    s.moveTo(-a + r, -a); s.lineTo(a - r, -a); s.quadraticCurveTo(a, -a, a, -a + r); s.lineTo(a, a - r);
    s.quadraticCurveTo(a, a, a - r, a); s.lineTo(-a + r, a); s.quadraticCurveTo(-a, a, -a, a - r);
    s.lineTo(-a, -a + r); s.quadraticCurveTo(-a, -a, -a + r, -a);
    return s;
  })(), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  cubeGeo.rotateX(-Math.PI / 2);
  add(cubeGeo, mat.cube, 0, 0.47, 0.05, cube);
  add(box3(0.07, 0.03, 0.02), mat.hole, 0, 0.56, -0.13, cube);                     // micro-USB
  // signal pairs from the carrier board to the four arms
  const wires = part('wires', V(0, 0.45, 0));
  for (const [sx, sz] of corners) twisted([[sx * 0.25, 0.43, sz * 0.2], [sx * 0.45, 0.39, sz * 0.4], [sx * 0.62, 0.3, sz * 0.62]], 0.012, mat.yellow, mat.black, wires, 7);

  /* ---------- acrylic top plate on standoffs ---------- */
  const top = part('plate', V(0, 1.15, 0));
  const hexes = [[-0.36, -0.22], [0, -0.3], [0.36, -0.22], [-0.36, 0.22], [0.36, 0.22]].map(([x, y]) => ({ x, y, r: 0.11, n: 6, rot: Math.PI / 6 }));
  const acrGeo = plate(1.25, 1.05, 0.08, [...hexes, { x: 0, y: 0.18, r: 0.13 }, { x: 0, y: -0.02, r: 0.05 }], 0.04);
  add(acrGeo, mat.acrylic, 0, 0.94, 0, top);
  const edges = new T.LineSegments(new T.EdgesGeometry(acrGeo, 30), new T.LineBasicMaterial({ color: 0x9fc3dd }));
  edges.position.y = 0.94; top.add(edges);
  for (const [sx, sz] of corners) add(cyl(0.024, 0.024, 0.5, 6), mat.alu, sx * 0.52, 0.69, sz * 0.42, top);

  /* ---------- GPS mast and Here3 puck (front-edge centre, as on our drone) ---------- */
  const mast = part('mast', V(0, 1.7, 0));
  add(box3(0.16, 0.05, 0.16), mat.black, 0, 1.005, -0.41, mast);
  for (const [sx, sz] of corners) add(cyl(0.012, 0.012, 0.03, 8), mat.metal, 0 + sx * 0.055, 1.04, -0.41 + sz * 0.055, mast);
  const pole = add(box3(0.09, 1.3, 0.09), mat.black, 0, 1.68, -0.41, mast);
  pole.rotation.z = 0;
  add(box3(0.12, 0.25, 0.12), mat.blackFlat, 0, 1.2, -0.41, mast);            // folding joint
  const gps = part('gps', V(0, 1.9, 0));
  const puckGeo = new T.LatheGeometry([V(0, 0, 0), V(0.36, 0, 0), V(0.385, 0.02, 0), V(0.39, 0.06, 0), V(0.37, 0.1, 0), V(0.3, 0.12, 0), V(0, 0.125, 0)].map((p) => new T.Vector2(p.x, p.y)), 48);
  add(puckGeo, mat.black, 0, 2.32, -0.41, gps);
  const here3 = label(256, 256, '#1d1e23', [['Here3', 128, 128, 44, '#c9ccd4', 'center']]);
  add(new T.CircleGeometry(0.29, 48), M(0xffffff, { map: here3, roughness: 0.4 }), 0, 2.448, -0.41, gps).rotation.x = -Math.PI / 2;
  add(box3(0.06, 0.02, 0.03), M(0x9fe3ff, { emissive: 0x2a8ad0, emissiveIntensity: 0.6 }), 0, 2.45, -0.13, gps);   // status LED
  tube([[0.1, 2.3, -0.38], [0.1, 2.0, -0.3], [0.12, 1.4, 0.02], [0.06, 0.95, 0.12], [0.02, 0.6, 0.1]], 0.018, mat.black, gps);

  /* ---------- under the frame: telemetry radio, receiver, XT60 lead ---------- */
  const telem = part('telemetry', V(0.5, -0.5, 0.3));
  const telTex = label(256, 160, '#141418', [['Holybro', 20, 30, 22, '#d8d8de'], ['TELEMETRY RADIO', 20, 82, 26, '#f0f0f4'], ['433 MHz 500 mW', 20, 122, 20, '#b8b8c0']]);
  // mounted on its side under the frame, label facing out (right side of the drone)
  add(box3(0.1, 0.26, 0.42), [M(0xffffff, { map: telTex }), mat.board, mat.board, mat.board, mat.board, mat.board], 0.5, -0.16, 0.32, telem);
  add(cyl(0.025, 0.025, 0.08, 10), mat.gold, 0.5, -0.2, 0.56, telem).rotation.x = Math.PI / 2;
  add(cyl(0.03, 0.03, 0.06, 10), mat.black, 0.5, -0.24, 0.6, telem);
  add(cyl(0.026, 0.034, 0.52, 12), mat.black, 0.5, -0.52, 0.6, telem);           // antenna pointing down

  const rx = part('receiver', V(-0.55, -0.45, 0));
  const rxTex = label(256, 160, '#121216', [['R8 PRO', 128, 62, 44, '#f2f2f6', 'center'], ['ACCESS', 128, 118, 24, '#4f8de8', 'center']]);
  // also on its side, label facing the left side of the drone
  add(box3(0.1, 0.2, 0.34), [mat.board, M(0xffffff, { map: rxTex }), mat.board, mat.board, mat.board, mat.board], -0.45, -0.13, 0.1, rx);
  tube([[-0.45, -0.23, -0.02], [-0.55, -0.5, -0.1], [-0.68, -0.85, -0.2]], 0.007, mat.black, rx);
  tube([[-0.45, -0.23, 0.22], [-0.4, -0.5, 0.36], [-0.32, -0.88, 0.5]], 0.007, mat.black, rx);
  add(cyl(0.014, 0.014, 0.12, 8), mat.black, -0.69, -0.9, -0.21, rx);
  add(cyl(0.014, 0.014, 0.12, 8), mat.black, -0.32, -0.94, 0.51, rx);

  const xt = part('xt60', V(0.15, -0.6, 0.3));
  twisted([[0.18, -0.02, 0.48], [0.28, -0.22, 0.62], [0.32, -0.38, 0.7]], 0.017, mat.red, mat.black, xt, 2);
  add(box3(0.15, 0.08, 0.11), mat.xt60, 0.33, -0.44, 0.72, xt);
  for (const k of [-0.025, 0.025]) add(cyl(0.012, 0.012, 0.05, 8), mat.gold, 0.33 + k, -0.5, 0.72, xt);

  /* ---------- LiPo battery under the frame, held by two straps ---------- */
  const bat = part('battery', V(0, -1.0, 0));
  const batGeo = new T.ExtrudeGeometry((() => {            // rounded cross-section, extruded front to back
    const s = new T.Shape(), w = 0.24, h = 0.19, r = 0.05;
    s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r);
    s.quadraticCurveTo(w, h, w - r, h); s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r);
    s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
    return s;
  })(), { depth: 1.46, bevelEnabled: false, curveSegments: 8 });
  batGeo.translate(0, 0, -0.73);
  add(batGeo, M(0x2a3a5c, { roughness: 0.35, metalness: 0.15 }), 0, -0.26, 0, bat);
  const batTex = label(512, 128, '#f2c230', [['LiPo', 24, 64, 64, '#1d1e24'], ['BATTERY', 200, 46, 34, '#1d1e24'], ['handle with care', 200, 92, 24, '#3a3a40']]);
  for (const k of [-1, 1]) {                                // label on both sides
    const lab = add(new T.PlaneGeometry(0.9, 0.22), M(0xffffff, { map: batTex, roughness: 0.5 }), k * 0.2405, -0.26, 0, bat);
    lab.rotation.y = k * Math.PI / 2;
  }
  // straps: a black loop around the battery and the bottom plate, with a buckle
  for (const z of [-0.42, 0.42]) {
    add(box3(0.52, 0.014, 0.1), mat.black, 0, -0.458, z, bat);
    add(box3(0.52, 0.014, 0.1), mat.black, 0, 0.022, z, bat);
    for (const k of [-1, 1]) add(box3(0.014, 0.49, 0.1), mat.black, k * 0.255, -0.215, z, bat);
    add(box3(0.12, 0.03, 0.12), M(0x6b6f7a, { roughness: 0.4, metalness: 0.5 }), 0.1, -0.47, z, bat);
  }
  // main lead to the XT60 of the drone, and the white balance plug
  twisted([[0.1, -0.2, 0.74], [0.24, -0.34, 0.86], [0.33, -0.44, 0.84]], 0.017, mat.red, mat.black, bat, 2);
  add(box3(0.15, 0.08, 0.1), mat.xt60, 0.33, -0.44, 0.82, bat);
  [[mat.black, -0.03], [mat.red, -0.01], [mat.red, 0.01], [mat.red, 0.03]].forEach(([m, k]) => tube([[-0.1 + k, -0.3, 0.74], [-0.14 + k, -0.42, 0.86], [-0.16 + k, -0.58, 0.9]], 0.006, m, bat));
  add(box3(0.12, 0.05, 0.04), mat.jst, -0.16, -0.62, 0.9, bat);

  /* ---------- arms, motor mounts, legs, motors, propellers ---------- */
  const ARMS = [
    { n: 1, sx: 1, sz: -1, spin: 'ccw', front: true },
    { n: 2, sx: -1, sz: 1, spin: 'ccw', front: false },
    { n: 3, sx: -1, sz: -1, spin: 'cw', front: true },
    { n: 4, sx: 1, sz: 1, spin: 'cw', front: false }
  ];
  const R0 = 0.55, R1 = 2.25, props = [];
  const bladeShape = (() => {                                     // tapered blade with a rounded tip
    const s = new T.Shape();
    s.moveTo(0.06, -0.05); s.lineTo(0.35, -0.085); s.quadraticCurveTo(0.8, -0.1, 1.1, -0.05);
    s.quadraticCurveTo(1.2, -0.02, 1.18, 0.03); s.quadraticCurveTo(0.8, 0.07, 0.35, 0.06); s.lineTo(0.06, 0.04);
    return s;
  })();
  for (const a of ARMS) {
    const ang = Math.atan2(a.sz, a.sx);
    const armG = new T.Group();                                   // local +X points outwards along the arm
    armG.rotation.y = -ang; drone.add(armG);
    const out = (d) => V(d, 0, 0);

    const tubeP = part('arm', out(0.55), armG);
    const t = add(cyl(0.07, 0.07, R1 - R0, 24), mat.carbonTube, (R0 + R1) / 2, 0.18, 0, tubeP);
    t.rotation.z = Math.PI / 2;

    const mountMat = a.front ? mat.orange : mat.black, mountFlat = a.front ? mat.orangeFlat : mat.blackFlat;
    const mount = part('mount', V(0.9, 0, 0), armG);
    add(box3(0.34, 0.24, 0.3), mountMat, R1, 0.18, 0, mount);
    add(cyl(0.11, 0.11, 0.33, 20), mountMat, R1 - 0.2, 0.18, 0, mount).rotation.z = Math.PI / 2;   // tube clamp
    for (const k of [-1, 1]) add(cyl(0.02, 0.02, 0.33, 8), mat.metal, R1 - 0.2, 0.18 + k * 0.1, k * 0.12, mount).rotation.x = Math.PI / 2;
    add(cyl(0.14, 0.055, 0.78, 10), mountFlat, R1, -0.32, 0, mount);              // fluted leg sleeve

    const leg = part('leg', V(0.9, -0.7, 0), armG);
    add(cyl(0.035, 0.035, 1.8, 14), mat.carbonLeg, R1, -1.5, 0, leg);
    const foot = add(new T.SphereGeometry(0.06, 14, 10), mat.black, R1, -2.38, 0, leg);
    foot.scale.y = 0.7;

    const motor = part('motor', V(0.9, 0.55, 0), armG);
    const mx = R1, my = 0.3;
    add(cyl(0.15, 0.16, 0.05, 28), mat.black, mx, my + 0.025, 0, motor);         // base
    add(cyl(0.155, 0.155, 0.015, 28), mat.metal, mx, my + 0.055, 0, motor);
    add(cyl(0.135, 0.135, 0.17, 24), mat.copper, mx, my + 0.15, 0, motor);       // windings
    for (let i = 0; i < 7; i++) {                                                // bell with vents
      const b = (i / 7) * Math.PI * 2;
      const bar = add(box3(0.06, 0.17, 0.035), mat.black, mx + Math.cos(b) * 0.158, my + 0.15, Math.sin(b) * 0.158, motor);
      bar.rotation.y = -b + Math.PI / 2;
    }
    add(cyl(0.172, 0.172, 0.045, 28), mat.black, mx, my + 0.255, 0, motor);
    add(cyl(0.06, 0.06, 0.01, 20), mat.metal, mx, my + 0.282, 0, motor);
    add(cyl(0.02, 0.02, 0.16, 10), mat.metal, mx, my + 0.36, 0, motor);          // shaft
    // the three motor wires loop outside the mount, as on our drone
    [[mat.red, -0.05], [mat.blue, 0], [mat.black, 0.05]].forEach(([m, k]) => tube([
      [mx - 0.05, my + 0.03, k], [mx - 0.25, my - 0.02, 0.18 + k], [mx - 0.32, my - 0.22, 0.24 + k], [mx - 0.12, my - 0.28, 0.12 + k]
    ], 0.014, m, motor));

    const prop = part('prop', V(0.9, 1.1, 0), armG);
    prop.position.set(0, 0, 0);
    const rotor = new T.Group();
    rotor.position.set(mx, my + 0.42, 0);
    prop.add(rotor);
    const pitch = a.spin === 'ccw' ? 0.22 : -0.22;
    for (const k of [0, Math.PI]) {
      const bg = new T.ExtrudeGeometry(bladeShape, { depth: 0.012, bevelEnabled: false, curveSegments: 10 });
      bg.rotateX(-Math.PI / 2);
      const bl = add(bg, mat.prop, 0, 0, 0, rotor);
      bl.rotation.y = k; bl.rotation.x = k ? -pitch : pitch;
    }
    add(cyl(0.075, 0.075, 0.06, 18), mat.black, 0, 0.01, 0, rotor);
    add(cyl(0.04, 0.04, 0.05, 6), mat.alu, 0, 0.06, 0, rotor);                 // prop nut
    prop.visible = false;
    props.push({ g: prop, rotor });

  }

  for (const p of parts) p.userData.home = p.position.clone();

  /* ---------- merge meshes per part and material (few draw calls), one outline hull per part ---------- */
  const hullMat = new T.MeshBasicMaterial({ color: new T.Color(opts.outlineColor || "#ff6a1a"), side: T.BackSide });
  hullMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>\ntransformed += normalize(normal) * ${OUTLINE_WIDTH.toFixed(3)};`,
    );
  };
  const partOf = (o) => {
    while (o && !o.userData.part) o = o.parent;
    return o;
  };
  scene.updateMatrixWorld(true);
  const baked = new Map();   // part -> { all: [geo], byMat: Map(material -> [geo]), mesh: [old meshes] }
  const old = [];
  drone.traverse((o) => { if (o.isMesh) old.push(o); });
  for (const m of old) {
    const pt = partOf(m);
    if (!pt) continue;
    let e = baked.get(pt);
    if (!e) baked.set(pt, (e = { hull: [], byMat: new Map() }));
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone());
    for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") g.deleteAttribute(k);
    g.clearGroups();
    g.applyMatrix4(new T.Matrix4().copy(pt.matrixWorld).invert().multiply(m.matrixWorld));
    const mats = Array.isArray(m.material) ? null : m.material;
    if (!mats || !mats.transparent) e.hull.push(g);
    if (mats) {
      if (!e.byMat.has(mats)) e.byMat.set(mats, []);
      e.byMat.get(mats).push(g);
      m.parent.remove(m);
      m.geometry.dispose();
    }   // multi-material boxes (labels) stay as they are
  }
  const hulls = [];
  for (const [pt, e] of baked) {
    for (const [m, list] of e.byMat) {
      if (m.transparent) {                                 // acrylic: keep as is, already a single mesh
        pt.add(new T.Mesh(mergeGeometries(list), m));
        continue;
      }
      pt.add(new T.Mesh(mergeGeometries(list), m));
    }
    const hg = mergeGeometries(e.hull);
    if (hg) {
      const h = new T.Mesh(hg, hullMat);
      h.visible = false; h.userData.hullOf = pt.userData.part;
      pt.add(h); hulls.push(h);
    }
  }
  for (const h of hulls) h.userData.part = h.userData.hullOf;

  /* ---------- state and loop ---------- */
  let reduced = !!opts.reduced;
  let yaw = HOME.yaw;
  let turn = 0;   // 0..1 = one full turn from step 02 to step 08
  let explode = 0, explodeTo = 0;
  let running = false, raf = 0, last = 0;
  const target = V(0, HOME.ty, 0);

  const place = () => {
    const k = ease(explode);
    const dist = HOME.dist + (EXPLODED.dist - HOME.dist) * k;
    target.y = HOME.ty + (EXPLODED.ty - HOME.ty) * k;
    const cp = Math.cos(HOME.pitch);
    camera.position.set(target.x + dist * cp * Math.sin(yaw), target.y + dist * Math.sin(HOME.pitch), target.z + dist * cp * Math.cos(yaw));
    camera.lookAt(target);
  };
  const applyExplode = () => {
    const k = ease(explode);
    for (const p of parts) p.position.copy(p.userData.home).addScaledVector(p.userData.ex, k);
  };
  const loop = (ts) => {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts;
    if (explode !== explodeTo) {
      explode = reduced ? explodeTo : explodeTo > explode ? Math.min(explodeTo, explode + dt * 1.6) : Math.max(explodeTo, explode - dt * 1.6);
      applyExplode();
    }
    place();
    renderer.render(scene, camera);
    if (explode !== explodeTo) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (running && !raf) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  };

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    kick();
  };
  const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  ro ? ro.observe(canvas) : window.addEventListener("resize", resize);
  resize();

  return {
    setStep(step) {
      const s = step || {};
      drone.visible = !!s.show;
      explodeTo = s.explode ? 1 : 0;
      if (reduced) { explode = explodeTo; applyExplode(); }
      const on = new Set(s.outline || []);
      for (const h of hulls) h.visible = on.has(h.userData.part);
      for (const p of props) p.g.visible = !!s.props;
      kick();
    },
    setTurn(t) {
      turn = Math.min(1, Math.max(0, t || 0));
      const ny = HOME.yaw + (reduced ? 0 : turn * Math.PI * 2);
      if (ny === yaw) return;
      yaw = ny;
      kick();
    },
    setReduced(v) {
      reduced = !!v;
      yaw = HOME.yaw + (reduced ? 0 : turn * Math.PI * 2);
      if (reduced) { explode = explodeTo; applyExplode(); }
      kick();
    },
    setRunning(v) {
      running = !!v;
      if (!running) { cancelAnimationFrame(raf); raf = 0; } else kick();
    },
    dispose() {
      running = false; cancelAnimationFrame(raf); raf = 0;
      ro ? ro.disconnect() : window.removeEventListener("resize", resize);
      const seen = new Set();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        for (const m of [].concat(o.material || [])) {
          if (seen.has(m)) continue;
          seen.add(m); if (m.map) m.map.dispose(); m.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss && renderer.forceContextLoss();
    },
  };
}
