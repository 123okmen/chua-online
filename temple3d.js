/**
 * =========================================================================
 * CHÙA ONLINE 4.0 — CHÁNH ĐIỆN 3D & ĐẠO TRÀNG TÂM GIAO
 * Công nghệ: Three.js 3D WebGL, 3D Avatars người đi lễ chùa,
 * Animation lạy Phật, tọa thiền, thắp hương, bong bóng chat 3D và
 * phòng chat đồng bộ thời gian thực (BroadcastChannel + LocalStorage).
 * =========================================================================
 */

let templeScene, templeCamera, templeRenderer;
let templeContainer = null;
let isTemple3DInitialized = false;
let templeAnimId = null;

// Nhóm chứa các đối tượng trong chùa
let hallGroup, altarGroup, auraMesh, incenseSmokeParticles = [];
let avatars = [];
let userAvatar = null;

// Trạng thái góc nhìn Camera
let currentCameraMode = "overview"; // "overview" | "user" | "altar"

// Chat State
const CHAT_CHANNEL_NAME = "chua_online_temple_chat";
let chatChannel = null;
let templeChatMessages = [];

// Thông tin người dùng hiện tại
let currentUserProfile = {
  name: "Phật Tử Diệu Tâm",
  robeColor: "#3b82f6", // Áo Lam
  robeName: "Áo Lam",
  action: "idle"
};

// Danh sách các phật tử trong Chánh Điện
const TEMPLE_VISITORS_DATA = [
  { id: "v1", name: "Đạo hữu Diệu Thiện", robeColor: "#3b82f6", robeName: "Áo Lam", x: -2.2, z: 1.5, action: "bowing" },
  { id: "v2", name: "Đạo hữu Minh Tâm", robeColor: "#78350f", robeName: "Áo Nâu", x: 2.2, z: 1.5, action: "meditating" },
  { id: "v3", name: "Cư sĩ Tuệ Lâm", robeColor: "#3b82f6", robeName: "Áo Lam", x: -1.2, z: 3.5, action: "offering" },
  { id: "v4", name: "Đạo hữu Giác Hải", robeColor: "#78350f", robeName: "Áo Nâu", x: 1.2, z: 3.5, action: "bowing" },
  { id: "v5", name: "Tín nữ Liên Hoa", robeColor: "#f8fafc", robeName: "Áo Trắng", x: -3.0, z: 5.0, action: "walking" },
  { id: "v6", name: "Phật tử Thiện Đức", robeColor: "#f59e0b", robeName: "Áo Vàng", x: 3.0, z: 5.0, action: "idle" }
];

// Danh sách câu chào tự động của các đạo hữu ảo
const BOT_PRAYERS = [
  "Nam Mô A Di Đà Phật, kính chào toàn thể đạo tràng! 🙏",
  "A Di Đà Phật, chúc quý đạo hữu một ngày thân tâm an lạc, vạn sự cát tường 🪷",
  "Thành tâm đảnh lễ Đức Bổn Sư Thích Ca Mâu Ni Phật ✨",
  "Nguyện cầu hồng ân Tam Bảo gia hộ cho gia đạo mọi người luôn bình an 🏡",
  "Cùng nhau gõ mõ niệm Phật tích lũy công đức nhé quý vị 🪵",
  "Tâm tịnh như nước, bồ đề tâm mở rộng, phiền não tan biến 🍃",
  "Hôm nay Chánh Điện trang nghiêm và ấm cúng quá! 🙏",
  "Chúc các đạo hữu tu tập tinh tấn, phước đức sâu dày 🌟"
];

// =========================================================================
// 1. KHỞI TẠO KHÔNG GIAN 3D CHÁNH ĐIỆN (THREE.JS SCENE)
// =========================================================================
function initTemple3D() {
  if (isTemple3DInitialized) return;
  templeContainer = document.getElementById("temple3dViewport");
  if (!templeContainer) return;

  const width = templeContainer.clientWidth || 800;
  const height = templeContainer.clientHeight || 480;

  // 1. Scene
  templeScene = new THREE.Scene();
  templeScene.background = new THREE.Color(0x0a0c13);
  templeScene.fog = new THREE.FogExp2(0x0a0c13, 0.045);

  // 2. Camera
  templeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  setCameraMode("overview");

  // 3. Renderer
  templeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  templeRenderer.setSize(width, height);
  templeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  templeRenderer.shadowMap.enabled = true;
  templeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Xóa canvas cũ nếu có
  while (templeContainer.firstChild) {
    templeContainer.removeChild(templeContainer.firstChild);
  }
  templeContainer.appendChild(templeRenderer.domElement);

  // 4. Ánh sáng Chánh Điện (Warm Temple Lighting)
  const ambientLight = new THREE.AmbientLight(0xffedd5, 0.6);
  templeScene.add(ambientLight);

  // Ánh sáng vàng rực từ bàn thờ Phật
  const altarPointLight = new THREE.PointLight(0xf59e0b, 2.2, 18);
  altarPointLight.position.set(0, 4, -4);
  altarPointLight.castShadow = true;
  templeScene.add(altarPointLight);

  // Ánh sáng đèn nến dịu ấm
  const candleLight1 = new THREE.PointLight(0xf97316, 1.2, 10);
  candleLight1.position.set(-2.5, 2.2, -3.5);
  templeScene.add(candleLight1);

  const candleLight2 = new THREE.PointLight(0xf97316, 1.2, 10);
  candleLight2.position.set(2.5, 2.2, -3.5);
  templeScene.add(candleLight2);

  // Ánh sáng trên trần rọi xuống Chánh Điện
  const dirLight = new THREE.DirectionalLight(0xfef08a, 0.8);
  dirLight.position.set(0, 10, 5);
  dirLight.castShadow = true;
  templeScene.add(dirLight);

  // 5. Dựng kiến trúc Chánh Điện
  buildTempleArchitecture();

  // 6. Dựng các nhân vật 3D đi lễ chùa
  initTempleAvatars();

  // 7. Xử lý tương tác kéo xoay Camera (Touch / Mouse Orbit)
  setupCameraControls();

  // 8. Vòng lặp Render 60fps
  isTemple3DInitialized = true;
  animateTemple3D();

  // Resize listener
  window.addEventListener("resize", onTempleWindowResize);
}

function onTempleWindowResize() {
  if (!templeContainer || !templeCamera || !templeRenderer) return;
  const w = templeContainer.clientWidth || 800;
  const h = templeContainer.clientHeight || 480;
  templeCamera.aspect = w / h;
  templeCamera.updateProjectionMatrix();
  templeRenderer.setSize(w, h);
}

// =========================================================================
// 2. DỰNG KIẾN TRÚC CHÙA CỔ KÍNH & TƯỢNG PHẬT HOÀNG KIM (3D ARCHITECTURE)
// =========================================================================
function buildTempleArchitecture() {
  hallGroup = new THREE.Group();
  templeScene.add(hallGroup);

  // Sàn gạch chùa men vàng bóng phản chiếu ánh đèn (Temple Floor)
  const floorGeo = new THREE.PlaneGeometry(24, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x271406,
    roughness: 0.35,
    metalness: 0.25
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  hallGroup.add(floor);

  // Thảm đỏ lối đi chính giữa Chánh Điện (Aisle Runner)
  const carpetGeo = new THREE.PlaneGeometry(2.8, 22);
  const carpetMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
  const carpet = new THREE.Mesh(carpetGeo, carpetMat);
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0.01, 2);
  carpet.receiveShadow = true;
  hallGroup.add(carpet);

  // Tường sau Chánh Điện (Back Altar Wall - Gỗ chạm khắc)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1f1105, roughness: 0.7 });
  const backWallGeo = new THREE.BoxGeometry(24, 12, 0.5);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 6, -6);
  hallGroup.add(backWall);

  // Bức liễn chạm rồng vàng trung tâm
  const bannerGeo = new THREE.BoxGeometry(6, 9, 0.1);
  const bannerMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4, metalness: 0.4 });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 5.5, -5.7);
  hallGroup.add(banner);

  // Cột gỗ Lim đỏ son thếp vàng 2 bên (Temple Pillars)
  const pillarGeo = new THREE.CylinderGeometry(0.35, 0.4, 11, 20);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.3, metalness: 0.2 });
  const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });

  const pillarPositions = [
    [-3.8, -4], [-3.8, 1], [-3.8, 6],
    [3.8, -4], [3.8, 1], [3.8, 6]
  ];

  pillarPositions.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, 5.5, pz);
    pillar.castShadow = true;
    hallGroup.add(pillar);

    // Vòng thếp vàng chân & đỉnh cột
    const ring1 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 20), goldRingMat);
    ring1.position.set(px, 0.3, pz);
    hallGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 20), goldRingMat);
    ring2.position.set(px, 10.5, pz);
    hallGroup.add(ring2);
  });

  // =========================================================================
  // BÀN THỜ TAM BẢO & TƯỢNG PHẬT THÍCH CA MÂU NI (ALTAR & BUDDHA)
  // =========================================================================
  altarGroup = new THREE.Group();
  altarGroup.position.set(0, 0, -4.5);
  hallGroup.add(altarGroup);

  // Bàn thờ gỗ 3 tầng
  const altarTier1 = new THREE.Mesh(
    new THREE.BoxGeometry(7, 1.2, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 })
  );
  altarTier1.position.set(0, 0.6, 0);
  altarTier1.castShadow = true;
  altarGroup.add(altarTier1);

  const altarTier2 = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.0, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.5 })
  );
  altarTier2.position.set(0, 1.7, -0.2);
  altarGroup.add(altarTier2);

  // Tòa Sen Hoàng Kim (Lotus Throne)
  const lotusBaseGeo = new THREE.CylinderGeometry(1.4, 1.1, 0.6, 24);
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0x78350f,
    emissiveIntensity: 0.25
  });
  const lotusBase = new THREE.Mesh(lotusBaseGeo, goldMaterial);
  lotusBase.position.set(0, 2.5, -0.2);
  altarGroup.add(lotusBase);

  // Tượng Đức Phật Thích Ca Mâu Ni Thiền Tọa (Stylised Golden Buddha)
  const buddhaGroup = new THREE.Group();
  buddhaGroup.position.set(0, 2.8, -0.2);
  altarGroup.add(buddhaGroup);

  // Thân tượng tọa thiền
  const bodyGeo = new THREE.ConeGeometry(0.9, 1.6, 16);
  const bodyMesh = new THREE.Mesh(bodyGeo, goldMaterial);
  bodyMesh.position.set(0, 0.8, 0);
  bodyMesh.castShadow = true;
  buddhaGroup.add(bodyMesh);

  // Chân xếp bằng kiết già
  const legsGeo = new THREE.TorusGeometry(0.75, 0.25, 12, 24);
  const legsMesh = new THREE.Mesh(legsGeo, goldMaterial);
  legsMesh.rotation.x = Math.PI / 2;
  legsMesh.position.set(0, 0.2, 0);
  buddhaGroup.add(legsMesh);

  // Đầu tượng Phật
  const headGeo = new THREE.SphereGeometry(0.42, 24, 20);
  const headMesh = new THREE.Mesh(headGeo, goldMaterial);
  headMesh.position.set(0, 1.85, 0);
  buddhaGroup.add(headMesh);

  // Nhục kế (Ushnisha) trên đỉnh đầu
  const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMaterial);
  ushnisha.position.set(0, 2.25, 0);
  buddhaGroup.add(ushnisha);

  // Hào Quang Phật Phát Sáng (Rotating Halo Aura)
  const haloGeo = new THREE.RingGeometry(0.6, 1.8, 36);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  auraMesh = new THREE.Mesh(haloGeo, haloMat);
  auraMesh.position.set(0, 2.0, -0.4);
  buddhaGroup.add(auraMesh);

  // Lư Hương Đồng Trên Bàn Thờ (Incense Burner)
  const burnerGeo = new THREE.CylinderGeometry(0.4, 0.35, 0.45, 16);
  const burnerMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
  const burner = new THREE.Mesh(burnerGeo, burnerMat);
  burner.position.set(0, 1.45, 0.8);
  altarGroup.add(burner);

  // 3 Nén hương cắm trong lư
  for (let i = -1; i <= 1; i++) {
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4500 })
    );
    stick.position.set(i * 0.1, 1.9, 0.8);
    altarGroup.add(stick);
  }

  // Bình hoa sen 2 bên bàn thờ
  [-1.8, 1.8].forEach(hx => {
    const vase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.2 })
    );
    vase.position.set(hx, 1.5, 0.6);
    altarGroup.add(vase);

    const lotusFlower = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 0.3 })
    );
    lotusFlower.position.set(hx, 1.9, 0.6);
    altarGroup.add(lotusFlower);
  });

  // Các Đệm Quỳ Lạy & Tọa Thiền (Meditation Mats in Hall)
  const matGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.12, 20);
  const matColors = [0x991b1b, 0xb45309, 0x991b1b, 0xb45309];

  const matCoords = [
    [0, 0], // Đệm chính diện cho User
    [-2.2, 1.5], [2.2, 1.5],
    [-1.2, 3.5], [1.2, 3.5],
    [-2.8, 5.2], [2.8, 5.2]
  ];

  matCoords.forEach(([mx, mz], idx) => {
    const mat = new THREE.Mesh(
      matGeo,
      new THREE.MeshStandardMaterial({ color: matColors[idx % matColors.length], roughness: 0.9 })
    );
    mat.position.set(mx, 0.06, mz);
    mat.receiveShadow = true;
    hallGroup.add(mat);
  });
}

// =========================================================================
// 3. DỰNG CÁC NHÂN VẬT 3D ĐI LỄ CHÙA (3D AVATARS & VISITORS)
// =========================================================================
function createAvatarMesh(name, robeHex, isUser = false) {
  const group = new THREE.Group();

  // Chất liệu trang phục (Áo Lam, Áo Nâu, v.v.)
  const robeMat = new THREE.MeshStandardMaterial({
    color: robeHex,
    roughness: 0.65,
    metalness: 0.1
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24, // Da vàng ấm
    roughness: 0.5
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Tóc đen mượt
    roughness: 0.8
  });

  // Tà Áo Dài / Thân Nhân Vật (Body Cone/Cylinder)
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.42, 1.3, 16);
  const bodyMesh = new THREE.Mesh(bodyGeo, robeMat);
  bodyMesh.position.set(0, 0.65, 0);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Đầu nhân vật (Head)
  const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.set(0, 1.48, 0);
  headMesh.castShadow = true;
  group.add(headMesh);

  // Mái tóc búi cao gọn gàng (Hair Bun)
  const hairGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 1.68, -0.05);
  group.add(hairMesh);

  // Hai Tay Chắp Lạy Phật Trước Ngực (Anjali Mudra / Prayer Hands)
  const handsGroup = new THREE.Group();
  handsGroup.position.set(0, 1.05, 0.22);

  const armGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8);
  const leftArm = new THREE.Mesh(armGeo, robeMat);
  leftArm.rotation.set(0.6, 0, -0.6);
  leftArm.position.set(-0.2, 0, 0);
  handsGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, robeMat);
  rightArm.rotation.set(0.6, 0, 0.6);
  rightArm.position.set(0.2, 0, 0);
  handsGroup.add(rightArm);

  // Bàn tay chắp sen
  const palmGeo = new THREE.BoxGeometry(0.08, 0.16, 0.04);
  const palmMesh = new THREE.Mesh(palmGeo, skinMat);
  palmMesh.position.set(0, 0.12, 0.08);
  handsGroup.add(palmMesh);

  group.add(handsGroup);

  // Vòng sáng hào quang dưới chân (nếu là nhân vật của User)
  if (isUser) {
    const userRingGeo = new THREE.RingGeometry(0.5, 0.65, 24);
    const userRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const userRing = new THREE.Mesh(userRingGeo, userRingMat);
    userRing.rotation.x = -Math.PI / 2;
    userRing.position.y = 0.02;
    group.add(userRing);
  }

  group.userData = {
    name: name,
    isUser: isUser,
    body: bodyMesh,
    hands: handsGroup,
    animTime: Math.random() * 10,
    action: "idle",
    speechText: "",
    speechTimer: null
  };

  return group;
}

function initTempleAvatars() {
  avatars = [];

  // 1. Tạo Avatar của người dùng (Đứng/quỳ tại đệm chính diện trung tâm)
  const savedName = localStorage.getItem("chua_online_user_name") || currentUserProfile.name;
  currentUserProfile.name = savedName;

  userAvatar = createAvatarMesh(savedName, currentUserProfile.robeColor, true);
  userAvatar.position.set(0, 0, 0);
  userAvatar.rotation.y = Math.PI; // Hướng mặt về bàn thờ Phật
  hallGroup.add(userAvatar);
  avatars.push(userAvatar);

  // 2. Tạo các đạo hữu khác đang vào lễ Phật
  TEMPLE_VISITORS_DATA.forEach(data => {
    const avatar = createAvatarMesh(data.name, data.robeColor, false);
    avatar.position.set(data.x, 0, data.z);
    avatar.rotation.y = Math.PI + (Math.random() - 0.5) * 0.4;
    avatar.userData.action = data.action;
    hallGroup.add(avatar);
    avatars.push(avatar);
  });
}

// Cập nhật diện mạo người dùng
function updateUserAvatarAppearence(name, robeColor, robeName) {
  currentUserProfile.name = name;
  currentUserProfile.robeColor = robeColor;
  currentUserProfile.robeName = robeName;
  localStorage.setItem("chua_online_user_name", name);
  localStorage.setItem("chua_online_robe_color", robeColor);
  localStorage.setItem("chua_online_robe_name", robeName);

  if (userAvatar) {
    userAvatar.userData.name = name;
    userAvatar.userData.body.material.color.set(robeColor);
  }
  updateTempleLabelsOverlay();
  showZenToast(`✓ Đã cập nhật Pháp Danh: ${name} (${robeName})`);
}

// Hành động của User: Lạy Phật, Dâng Hương, Tọa Thiền
function performUserAction(actionType) {
  if (!userAvatar) return;
  userAvatar.userData.action = actionType;
  userAvatar.userData.animTime = 0;

  if (actionType === "bowing") {
    showZenToast("🙏 Thành tâm cúi đầu đảnh lễ Tam Bảo...");
    playMoyuSound();
    addMerit(15);
  } else if (actionType === "offering") {
    showZenToast("🕯️ Thành kính dâng hương trầm lên mười phương chư Phật...");
    playBellSound();
    addMerit(20);
  } else if (actionType === "meditating") {
    showZenToast("🧘 An tọa thiền định, buông bỏ muộn phiền...");
    addMerit(25);
  }

  saveState();
  updateUI();
}

// =========================================================================
// 4. ANIMATION VÀ GÓC NHÌN CAMERA 3D (RENDER LOOP)
// =========================================================================
let isOrbiting = false;
let prevMousePos = { x: 0, y: 0 };
let cameraAngleX = 0;
let cameraAngleY = 0.25;
let cameraDistance = 10;

function setupCameraControls() {
  const vp = templeContainer;
  if (!vp) return;

  vp.addEventListener("mousedown", (e) => {
    isOrbiting = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mousemove", (e) => {
    if (!isOrbiting) return;
    const dx = e.clientX - prevMousePos.x;
    const dy = e.clientY - prevMousePos.y;
    cameraAngleX -= dx * 0.006;
    cameraAngleY = Math.max(0.08, Math.min(0.65, cameraAngleY + dy * 0.005));
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    isOrbiting = false;
  });

  // Hỗ trợ cảm ứng vuốt trên Smartphone
  vp.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isOrbiting = true;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isOrbiting || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - prevMousePos.x;
    const dy = e.touches[0].clientY - prevMousePos.y;
    cameraAngleX -= dx * 0.008;
    cameraAngleY = Math.max(0.08, Math.min(0.65, cameraAngleY + dy * 0.007));
    prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isOrbiting = false;
  });
}

function setCameraMode(mode) {
  currentCameraMode = mode;
  document.querySelectorAll(".btn-cam-view").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  if (mode === "overview") {
    cameraDistance = 11;
    cameraAngleX = 0;
    cameraAngleY = 0.32;
  } else if (mode === "user") {
    cameraDistance = 4.5;
    cameraAngleX = 0;
    cameraAngleY = 0.2;
  } else if (mode === "altar") {
    cameraDistance = 6;
    cameraAngleX = 0;
    cameraAngleY = 0.15;
  }
}

function animateTemple3D() {
  templeAnimId = requestAnimationFrame(animateTemple3D);

  const time = performance.now() * 0.001;

  // 1. Xoay nhẹ hào quang Phật tỏa sáng
  if (auraMesh) {
    auraMesh.rotation.z += 0.004;
    auraMesh.material.opacity = 0.7 + Math.sin(time * 2) * 0.18;
  }

  // 2. Cập nhật vị trí Camera
  if (currentCameraMode === "overview") {
    const targetX = Math.sin(cameraAngleX) * cameraDistance;
    const targetZ = Math.cos(cameraAngleX) * cameraDistance + 2;
    const targetY = cameraAngleY * cameraDistance + 2;
    templeCamera.position.set(targetX, targetY, targetZ);
    templeCamera.lookAt(0, 2.2, -1.5);
  } else if (currentCameraMode === "user" && userAvatar) {
    const targetX = userAvatar.position.x + Math.sin(cameraAngleX) * cameraDistance;
    const targetZ = userAvatar.position.z + Math.cos(cameraAngleX) * cameraDistance + 2.5;
    const targetY = cameraAngleY * cameraDistance + 1.6;
    templeCamera.position.set(targetX, targetY, targetZ);
    templeCamera.lookAt(userAvatar.position.x, 1.4, userAvatar.position.z - 3);
  } else if (currentCameraMode === "altar") {
    templeCamera.position.set(0, 3.2, 0.5);
    templeCamera.lookAt(0, 3.2, -4.5);
  }

  // 3. Animation hành vi cử động của các nhân vật (Lạy Phật, Tọa thiền, Bước đi)
  avatars.forEach(av => {
    av.userData.animTime += 0.025;
    const t = av.userData.animTime;
    const action = av.userData.action;

    if (action === "bowing") {
      // Động tác cúi lạy thành kính
      const bowCycle = Math.sin(t * 1.8);
      const angle = Math.max(0, bowCycle) * 0.65;
      av.rotation.x = angle;
      av.position.y = -Math.max(0, bowCycle) * 0.35;
    } else if (action === "meditating") {
      // Đang tọa thiền: nhấp nhô nhẹ theo hơi thở
      av.position.y = -0.3 + Math.sin(t * 1.2) * 0.03;
      av.rotation.x = 0;
    } else if (action === "offering") {
      // Đang đứng dâng hương
      av.position.y = 0;
      av.rotation.x = Math.sin(t * 1.5) * 0.08;
      av.userData.hands.rotation.x = 0.3 + Math.sin(t * 2) * 0.15;
    } else if (action === "walking") {
      // Đang bước đi vào Chánh Điện
      av.position.y = Math.abs(Math.sin(t * 4)) * 0.08;
      av.position.z -= 0.012;
      if (av.position.z < 2.0) {
        av.position.z = 7.0; // Đi lại từ cửa
      }
    } else {
      // Idle thở nhẹ
      av.position.y = Math.sin(t * 1.5) * 0.02;
      av.rotation.x = 0;
    }
  });

  // 4. Cập nhật vị trí thẻ tên và bong bóng chat 2D trên không gian 3D
  updateTempleLabelsOverlay();

  // 5. Render
  if (templeRenderer && templeScene && templeCamera) {
    templeRenderer.render(templeScene, templeCamera);
  }
}

// Cập nhật vị trí Name Tag & Speech Bubble bám theo đầu nhân vật 3D
function updateTempleLabelsOverlay() {
  const container = document.getElementById("temple3dOverlay");
  if (!container || !templeCamera || !templeRenderer) return;

  const vpRect = templeContainer.getBoundingClientRect();
  const width = vpRect.width;
  const height = vpRect.height;

  avatars.forEach((av, idx) => {
    let tag = document.getElementById(`avatar-tag-${idx}`);
    if (!tag) {
      tag = document.createElement("div");
      tag.id = `avatar-tag-${idx}`;
      tag.className = "avatar-3d-tag";
      container.appendChild(tag);
    }

    // Tọa độ đỉnh đầu nhân vật (Y = 1.9)
    const pos = new THREE.Vector3();
    av.getWorldPosition(pos);
    pos.y += 1.85;

    // Project 3D vector to 2D screen coordinates
    pos.project(templeCamera);

    // Kiểm tra xem nhân vật có nằm phía trước camera không
    if (pos.z > 1.0) {
      tag.style.display = "none";
      return;
    }

    const screenX = (pos.x * 0.5 + 0.5) * width;
    const screenY = (-pos.y * 0.5 + 0.5) * height;

    tag.style.display = "flex";
    tag.style.left = `${screenX}px`;
    tag.style.top = `${screenY}px`;

    // Nội dung nhãn: Bong bóng thoại nếu đang nói + Tên pháp danh
    const speech = av.userData.speechText;
    const isUser = av.userData.isUser;

    tag.innerHTML = `
      ${speech ? `<div class="speech-bubble-3d">${speech}</div>` : ""}
      <div class="name-badge-3d ${isUser ? "user-badge" : ""}">
        <span class="nb-icon">${isUser ? "⭐" : "🪷"}</span>
        <span>${av.userData.name}</span>
      </div>
    `;
  });
}

// Hiện bong bóng thoại trên đầu nhân vật 3D
function showAvatarSpeechBubble(avatar, text) {
  if (!avatar) return;
  avatar.userData.speechText = text;
  if (avatar.userData.speechTimer) clearTimeout(avatar.userData.speechTimer);

  avatar.userData.speechTimer = setTimeout(() => {
    avatar.userData.speechText = "";
  }, 4500);
}

// =========================================================================
// 5. HỆ THỐNG CHAT ĐẠO TRÀNG TRỰC TUYẾN (LIVE TEMPLE CHAT ROOM)
// Đồng bộ BroadcastChannel giữa các tab + lưu trữ LocalStorage + Đạo hữu ảo
// =========================================================================
function initTempleChat() {
  // 1. Tải lịch sử chat
  try {
    const saved = localStorage.getItem("chua_online_temple_chat_msgs");
    if (saved) {
      templeChatMessages = JSON.parse(saved);
    } else {
      // Tin nhắn mẫu ban đầu
      templeChatMessages = [
        { sender: "Hệ Thống", robe: "Chùa Online", text: "Kính chào quý đạo hữu đến với Đạo Tràng Chánh Điện 3D!", time: "08:00", isSystem: true },
        { sender: "Đạo hữu Diệu Thiện", robe: "Áo Lam", text: "Nam Mô A Di Đà Phật! Kính chúc cả nhà vạn sự bình an 🙏", time: "08:15" },
        { sender: "Đạo hữu Minh Tâm", robe: "Áo Nâu", text: "Sáng nay cùng nhau thắp hương và tụng kinh nhé các bạn 🪷", time: "08:22" }
      ];
    }
  } catch {
    templeChatMessages = [];
  }

  renderChatMessages();

  // 2. Kích hoạt BroadcastChannel
  try {
    if (window.BroadcastChannel) {
      chatChannel = new BroadcastChannel(CHAT_CHANNEL_NAME);
      chatChannel.onmessage = (event) => {
        if (event.data && event.data.type === "new_message") {
          addMessageToChat(event.data.message, false);
        }
      };
    }
  } catch {}

  // 3. Tự động sinh tin nhắn đạo hữu ảo định kỳ tạo không khí ấm cúng
  setInterval(triggerRandomBotPrayer, 25000);
}

function sendUserChatMessage() {
  const input = document.getElementById("chatTextInput");
  if (!input) return;
  const raw = input.value.trim();
  if (!raw) return;

  const msg = {
    sender: currentUserProfile.name,
    robe: currentUserProfile.robeName,
    text: raw,
    time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    isUser: true
  };

  addMessageToChat(msg, true);
  input.value = "";

  // Avatar của User lạy Phật và hiện bong bóng thoại 3D!
  if (userAvatar) {
    performUserAction("bowing");
    showAvatarSpeechBubble(userAvatar, raw);
  }

  playMoyuSound();
  addMerit(5); // Tặng công đức giao lưu đạo tràng
  saveState();
  updateUI();

  // Đạo hữu ảo hồi đáp sau 1.5 - 3 giây
  setTimeout(() => {
    respondToUserMessage(raw);
  }, 1800 + Math.random() * 1200);
}

function sendQuickPrayer(prayerText) {
  const input = document.getElementById("chatTextInput");
  if (input) input.value = prayerText;
  sendUserChatMessage();
}

function addMessageToChat(msg, broadcast = true) {
  templeChatMessages.push(msg);
  if (templeChatMessages.length > 50) {
    templeChatMessages.shift();
  }

  try {
    localStorage.setItem("chua_online_temple_chat_msgs", JSON.stringify(templeChatMessages));
  } catch {}

  renderChatMessages();

  if (broadcast && chatChannel) {
    try {
      chatChannel.postMessage({ type: "new_message", message: msg });
    } catch {}
  }
}

function renderChatMessages() {
  const container = document.getElementById("templeChatStream");
  if (!container) return;

  container.innerHTML = templeChatMessages.map(m => {
    if (m.isSystem) {
      return `
        <div class="chat-msg system-msg">
          <span class="sm-text">🔔 ${m.text}</span>
        </div>
      `;
    }

    const isMe = m.isUser || m.sender === currentUserProfile.name;
    return `
      <div class="chat-msg ${isMe ? "msg-me" : "msg-other"}">
        <div class="msg-header">
          <span class="msg-sender">${m.sender}</span>
          <span class="msg-robe">${m.robe}</span>
          <span class="msg-time">${m.time}</span>
        </div>
        <div class="msg-bubble">${m.text}</div>
      </div>
    `;
  }).join("");

  // Tự động cuộn xuống tin nhắn mới nhất
  container.scrollTop = container.scrollHeight;
}

function triggerRandomBotPrayer() {
  // Chỉ chạy nếu đang mở tab Chánh Điện 3D
  const activeTab = document.querySelector(".tab-panel.active");
  if (!activeTab || activeTab.id !== "tab-temple3d") return;

  const bot = TEMPLE_VISITORS_DATA[Math.floor(Math.random() * TEMPLE_VISITORS_DATA.length)];
  const prayer = BOT_PRAYERS[Math.floor(Math.random() * BOT_PRAYERS.length)];

  const msg = {
    sender: bot.name,
    robe: bot.robeName,
    text: prayer,
    time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    isUser: false
  };

  addMessageToChat(msg, true);

  // Tìm avatar tương ứng để hiện bong bóng thoại 3D
  const matchedAv = avatars.find(a => a.userData.name === bot.name);
  if (matchedAv) {
    matchedAv.userData.action = "bowing";
    showAvatarSpeechBubble(matchedAv, prayer);
  }
}

function respondToUserMessage(userText) {
  const bot = TEMPLE_VISITORS_DATA[Math.floor(Math.random() * TEMPLE_VISITORS_DATA.length)];
  let reply = "A Di Đà Phật! Chúc đạo hữu cùng gia đình luôn vạn sự cát tường, phước lành tràn đầy 🙏";

  const lower = userText.toLowerCase();
  if (lower.includes("chào") || lower.includes("hello") || lower.includes("hi")) {
    reply = `Kính chào đạo hữu ${currentUserProfile.name}! Rất vui mừng được gặp đạo hữu nơi Chánh Điện thanh tịnh 🪷`;
  } else if (lower.includes("bình an") || lower.includes("cầu an")) {
    reply = "Thành tâm kính lễ Đức Quán Thế Âm Bồ Tát cứu khổ cứu nạn, gia hộ cho đạo hữu tai qua nạn khỏi, thân tâm an lạc ✨";
  } else if (lower.includes("tài lộc") || lower.includes("tiền") || lower.includes("công việc")) {
    reply = "Chúc đạo hữu công việc hanh thông, kinh doanh phát đạt, gieo phước thiện ắt hái quả lành 💰";
  } else if (lower.includes("kinh") || lower.includes("mõ") || lower.includes("phật")) {
    reply = "Nam Mô A Di Đà Phật! Tiếng chuông mõ ngân vang tiêu trừ mọi muộn phiền 🪵";
  }

  const msg = {
    sender: bot.name,
    robe: bot.robeName,
    text: reply,
    time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    isUser: false
  };

  addMessageToChat(msg, true);

  const matchedAv = avatars.find(a => a.userData.name === bot.name);
  if (matchedAv) {
    matchedAv.userData.action = "bowing";
    showAvatarSpeechBubble(matchedAv, reply);
  }
}

// Mở Modal đổi pháp danh & trang phục
function openProfileModal() {
  const modal = document.getElementById("profileModal");
  if (modal) {
    modal.classList.remove("hidden");
    document.getElementById("inputDharmaName").value = currentUserProfile.name;
  }
}

function closeProfileModal() {
  const modal = document.getElementById("profileModal");
  if (modal) modal.classList.add("hidden");
}

function saveProfileSettings() {
  const inp = document.getElementById("inputDharmaName");
  const newName = inp ? inp.value.trim() : "";
  if (!newName) {
    showZenToast("Vui lòng nhập Pháp danh hoặc họ tên của bạn!");
    return;
  }

  const robeSelect = document.getElementById("selectRobeColor");
  let robeColor = "#3b82f6";
  let robeName = "Áo Lam";

  if (robeSelect) {
    robeColor = robeSelect.value;
    robeName = robeSelect.options[robeSelect.selectedIndex].text;
  }

  updateUserAvatarAppearence(newName, robeColor, robeName);
  closeProfileModal();
}
