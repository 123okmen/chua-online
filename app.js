/**
 * =========================================================================
 * CHÙA ONLINE 4.0 — TỊNH TÂM TÍCH ĐỨC & TU TẠI GIA
 * Hệ thống logic: Web Audio Synthesizer, Canvas Smoke/Pond, Passcode Gate,
 * 32 Quẻ Xăm Quán Âm, Auto-tap Mõ Gỗ, Dâng Hương & Phóng Sinh.
 * =========================================================================
 */

// =========================================================================
// 1. DỮ LIỆU KHỞI TẠO & QUẢN LÝ TRẠNG THÁI (APP STATE)
// =========================================================================
const DEFAULT_PIN = "2002";

const BLESSING_THEMES = {
  all: [
    "+1 Công Đức ✨", "+1 Phúc Lành 🪷", "Tâm Tĩnh Như Nước 💧",
    "Tiêu Trừ Muộn Phiền 🍃", "Gia Đạo Bình An 🏡", "Vạn Sự Hanh Thông 🌟",
    "Phát Tài Phát Lộc 💰", "An Nhiên Tự Tại 🧘", "Bồ Đề Tâm Khởi 📿"
  ],
  merit: [
    "+1 Công Đức ✨", "+1 Phúc Lành 🪷", "+10 Phước Thiện 🌟",
    "+1 Đại Giác Ngộ 📿", "+1 Duyên Lành 🌸"
  ],
  zen: [
    "Tâm Tĩnh Như Nước 💧", "An Nhiên Tự Tại 🧘", "Không Lo Không Sợ 🕊️",
    "Buông Bỏ Chấp Niệm 🍃", "Tâm Bất Biến Giữa Dòng Đời 🌊"
  ],
  buddha: [
    "Nam Mô A Di Đà Phật 🙏", "Nam Mô Quán Thế Âm Bồ Tát 🪷",
    "Nam Mô Bổn Sư Thích Ca Mâu Ni Phật 🌟", "Án Ma Ni Bát Mê Hồng ☸️"
  ],
  wealth: [
    "Vạn Sự Hanh Thông 🌟", "Kinh Doanh Phát Đạt 📈", "Tài Lộc Dồi Dào 💰",
    "Quý Nhân Phù Trợ 🤝", "May Mắn Tràn Đầy 🍀"
  ]
};

const RANKS = [
  { level: 1, name: "Thiện Nam Tín Nữ", badge: "Lv.1", minMerit: 0, maxMerit: 300 },
  { level: 2, name: "Phật Tử Tinh Tấn", badge: "Lv.2", minMerit: 300, maxMerit: 1000 },
  { level: 3, name: "Cư Sĩ Tịnh Độ", badge: "Lv.3", minMerit: 1000, maxMerit: 3000 },
  { level: 4, name: "Thiền Gia Giác Ngộ", badge: "Lv.4", minMerit: 3000, maxMerit: 10000 },
  { level: 5, name: "Bồ Đề Vô Thượng", badge: "Lv.5", minMerit: 10000, maxMerit: 99999999 }
];

let appState = {
  unlocked: false,
  passcode: DEFAULT_PIN,
  rememberSession: true,
  totalMerit: 0,
  todayMerit: 0,
  lastActiveDate: "",
  streakDays: 1,
  totalTaps: 0,
  todayTaps: 0,
  totalIncense: 0,
  totalBells: 0,
  totalFortunes: 0,
  totalFishes: 8,
  totalLanterns: 3,
  activeTheme: "all",
  soundEnabled: true,
  hapticEnabled: true,
  masterVolume: 0.8,
  autoSpeedBpm: 60,
  savedFortunes: []
};

// =========================================================================
// 2. KHO 32 QUẺ XĂM QUÁN ÂM LINH ỨNG (FORTUNE DATABASE)
// =========================================================================
const FORTUNES_DB = [
  {
    num: "01",
    rank: "THƯỢNG THƯỢNG (ĐẠI CÁT)",
    title: "Khai Thiên Lập Địa • Rồng Mây Gặp Hội",
    poem: "Vận hội rồng mây gặp tiết xuân,\nCông danh sáng tỏ phúc muôn phần.\nCầu tài được lộc nhà vui vẻ,\nPhước đức vun bồi vạn sự hưng.",
    career: "Thời cơ chín muồi, công danh thăng tiến rực rỡ, việc kinh doanh như diều gặp gió, có quý nhân tương trợ.",
    wealth: "Tài lộc hanh thông, tiền bạc dồi dào, đầu tư kinh doanh thu lợi nhuận cao.",
    family: "Gia đạo yên vui, trong ấm ngoài êm, có tin vui về hôn sự hoặc con cháu thành đạt.",
    love: "Người độc thân sớm tìm được ý trung nhân tâm đầu ý hợp, người có đôi hạnh phúc viên mãn.",
    health: "Thân tâm an lạc, sinh khí dồi dào, bệnh tật tiêu trừ.",
    travel: "Xuất hành đại lợi, đi xa gặp gỡ bạn bè tri kỷ và đối tác tốt.",
    advice: "Gặp vận đại cát chớ kiêu căng tự mãn, hãy năng làm việc thiện, giúp đỡ người khó khăn để phúc đức lưu truyền lâu dài."
  },
  {
    num: "02",
    rank: "THƯỢNG CÁT",
    title: "Trăng Tròn Đỉnh Núi • Soi Sáng Mọi Đường",
    poem: "Trăng thanh vằng vặc chiếu ngàn khơi,\nSoi lối người đi thấu sự đời.\nChăm chỉ làm lành gieo quả ngọt,\nBình an thanh thản tự tại chơi.",
    career: "Mọi việc dần đi vào quỹ đạo ổn định, được cấp trên tin tưởng, đồng nghiệp ủng hộ.",
    wealth: "Tài lộc ổn định vững vàng, không thiếu thốn, tích lũy được tiền của.",
    family: "Trong nhà hòa thuận, anh em kính nhường, mọi hiểu lầm xưa cũ đều được hóa giải.",
    love: "Tình cảm phát triển thuận hòa, nên lắng nghe và thấu hiểu đối phương nhiều hơn.",
    health: "Sức khỏe dẻo dai, nên duy trì tập luyện thể dục và ăn uống thanh đạm.",
    travel: "Đi xa thuận buồm xuôi gió, hướng Nam và Đông Nam cát lợi.",
    advice: "Giữ tâm trong sáng như ánh trăng rằm, làm việc chính trực thì chẳng bao giờ phải âu lo."
  },
  {
    num: "03",
    rank: "TRUNG CÁT",
    title: "Gió Thu Cuốn Lá • Tĩnh Tâm Đợi Thời",
    poem: "Gió thổi mây bay lá rụng vàng,\nĐừng nên vội vã dạ hoang mang.\nKiên tâm giữ chí qua mùa rét,\nHoa nở mùa xuân đón phúc an.",
    career: "Công việc hiện tại chưa có bước đột phá lớn, nên củng cố kỹ năng và trau dồi kinh nghiệm thay vì nôn nóng đổi hướng.",
    wealth: "Chi tiêu cần có kế hoạch, tránh đầu tư mạo hiểm hoặc nghe lời rủ rê cờ bạc đỏ đen.",
    family: "Gia đình cần có sự sẻ chia, nhẫn nhịn lời nói để giữ hòa khí.",
    love: "Chuyện tình cảm có chút thử thách nhỏ, cần bình tĩnh trò chuyện để tránh xa cách.",
    health: "Chú ý đường hô hấp và giấc ngủ, nên ngồi thiền hoặc nghe nhạc tịnh tâm mỗi tối.",
    travel: "Hạn chế đi xa vào ngày thời tiết xấu, cẩn thận xe cộ.",
    advice: "Chữ 'Nhẫn' quý hơn vàng. Mùa đông qua đi ắt mùa xuân sẽ tới, kiên trì ắt có quả lành."
  },
  {
    num: "04",
    rank: "THƯỢNG THƯỢNG (ĐẠI CÁT)",
    title: "Cá Hóa Rồng Bay • Vạn Sự Như Ý",
    poem: "Vượt sóng ba đào cá hóa rồng,\nBao năm rèn giũa thỏa ước mong.\nTừ đây bay lượn vòm trời rộng,\nDanh vọng rạng ngời rạng tổ tông.",
    career: "Vượt qua thử thách gian nan, thi cử đỗ đạt, công việc được thăng chức hoặc dự án lớn thành công mỹ mãn.",
    wealth: "Nguồn thu dồi dào, tiền bạc hanh thông từ nhiều nguồn lương thiện.",
    family: "Cả nhà hân hoan, có hỷ tín, rạng danh gia tộc.",
    love: "Tình duyên thắm thiết, lời cầu hôn được chấp thuận, kết duyên trăm năm.",
    health: "Thể chất sung mãn, tinh thần phấn chấn, ngập tràn năng lượng.",
    travel: "Đi xa gặp cơ hội đổi đời, có duyên gặp bậc thầy khai mở trí tuệ.",
    advice: "Thành công không quên ơn nghĩa sinh thành và những người đã nâng đỡ mình khi cơ hàn."
  },
  {
    num: "05",
    rank: "TRUNG BÌNH (BÌNH AN)",
    title: "Nước Chảy Mây Trôi • Thuận Theo Tự Nhiên",
    poem: "Nước biếc non xanh cảnh hữu tình,\nThuận theo trời đất giữ lòng thanh.\nBon chen chi lắm thêm phiền muộn,\nThanh tịnh tâm hồn vạn phước sinh.",
    career: "Công việc bình ổn, hoàn thành tốt nhiệm vụ, không nên tranh giành quyền lợi nơi công sở.",
    wealth: "Thu chi cân bằng, đủ ăn đủ mặc, biết đủ là hạnh phúc lớn nhất trần gian.",
    family: "Gia đạo yên ổn, cuộc sống giản dị mà ấm cúng.",
    love: "Mối quan hệ nhẹ nhàng, không sóng gió, là chỗ dựa tinh thần bình yên.",
    health: "Bình thường, nên uống nhiều nước lọc và sống gần gũi thiên nhiên.",
    travel: "Đi lại an toàn, các chuyến đi dã ngoại hoặc về quê rất có lợi cho tâm trí.",
    advice: "Học cách buông bỏ những điều không thuộc về mình, tâm an lạc là kho báu lớn nhất."
  },
  {
    num: "06",
    rank: "THƯỢNG CÁT",
    title: "Cây Khô Đâm Chồi • Hồi Sinh Kỳ Diệu",
    poem: "Mưa xuân tưới mát cội bồ đề,\nChồi non hé nụ đón hương về.\nKhổ tận cam lai phước đức tới,\nTràn trề hy vọng dạ say mê.",
    career: "Dự án bế tắc nay tìm được lối thoát, công việc kinh doanh vực dậy mạnh mẽ sau chuỗi ngày khó khăn.",
    wealth: "Dòng tiền lưu thông trở lại, nợ nần được tháo gỡ, bắt đầu có tích lũy.",
    family: "Có người thân xa về đoàn tụ, hiểu lầm được tháo gỡ, không khí đầm ấm.",
    love: "Gương vỡ lại lành, người cũ thấu hiểu hoặc gặp được người sẵn sàng đồng cam cộng khổ.",
    health: "Sức khỏe phục hồi rõ rệt sau ốm, tinh thần lạc quan yêu đời.",
    travel: "Đi công tác hoặc xuất hành tìm kiếm đối tác đều đạt kết quả tốt.",
    advice: "Gian nan là lò luyện kim cương. Trân trọng những bài học trong nghịch cảnh để vững bước tương lai."
  },
  {
    num: "07",
    rank: "THƯỢNG THƯỢNG (ĐẠI CÁT)",
    title: "Hoa Sen Nở Rộ • Phật Pháp Nhiệm Mầu",
    poem: "Gần bùn chẳng nhiễm sắc tinh khôi,\nHương thơm lan tỏa ngát đất trời.\nPhật từ soi sáng đường nhân thế,\nAn lạc muôn nơi phúc thắm tươi.",
    career: "Được khách hàng và đối tác hết mực tôn trọng vì sự uy tín và tâm đức trong nghề.",
    wealth: "Làm ăn chân chính tạo ra của cải bền vững, của tiền dồi dào.",
    family: "Con cháu hiếu thảo, gia phong nề nếp, phước đức sâu dày.",
    love: "Mối lương duyên tiền định, hai bên cùng hướng thiện và thấu hiểu nhau.",
    health: "Thân tâm trong sạch, ngủ ngon giấc, ít âu lo phiền muộn.",
    travel: "Đi viếng chùa, hành hương hoặc đi xa đều thuận lợi, bình an vô sự.",
    advice: "Tiếp tục giữ gìn tâm trong sáng, sống nhân từ, lấy đức độ làm gốc rễ cho mọi việc."
  },
  {
    num: "08",
    rank: "HẠ CÁT (CẦN CẨN TRỌNG)",
    title: "Thuyền Nan Vượt Sóng • Giữ Chắc Tay Chèo",
    poem: "Thuyền nan gặp lúc sóng dập dồn,\nGiữ dạ kiên trung vững cội hồn.\nChớ vội sang ngang phó mặc nước,\nCập bến bình yên phúc đức tôn.",
    career: "Có tiểu nhân ghen ghét hoặc công việc có chút trắc trở, cần cẩn trọng giấy tờ, hợp đồng.",
    wealth: "Không cho vay mượn tiền bạc bừa bãi, cẩn thận mất mát của cải đồ đạc.",
    family: "Tránh to tiếng cãi vã vì những chuyện nhỏ nhặt, một điều nhịn chín điều lành.",
    love: "Cần lắng nghe đối phương, chớ vội vàng đưa ra quyết định chia tay lúc nóng giận.",
    health: "Chú ý cẩn thận khi lái xe và hạn chế làm việc quá sức về đêm.",
    travel: "Không nên đi lại đường sông nước hiểm trở hoặc đi đêm một mình.",
    advice: "Gặp lúc vận trắc trở hãy năng niệm Phật, trì chú, phóng sinh và tu tâm tích đức để hóa giải tai ương."
  }
];

// =========================================================================
// 3. HỆ THỐNG ÂM THANH NGUYÊN BẢN (WEB AUDIO SYNTHESIZER AN TOÀN TUYỆT ĐỐI)
// 100% Offline, không phụ thuộc file ngoài, không chặn UI, không bao giờ crash.
// =========================================================================
let audioCtx = null;
let zenOscillatorNodes = [];
let isZenMusicPlaying = false;

function initAudio() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {
    console.warn("Audio init warning:", e);
  }
}

// 1. Tiếng Mõ Gỗ (Safe Synthesized Wooden Fish)
function playMoyuSound() {
  if (!appState.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const vol = Math.max(0.01, appState.masterVolume);

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.07);

    gain.gain.setValueAtTime(Math.max(0.001, 0.85 * vol), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * 0.03));
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3.0, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(Math.max(0.001, 0.35 * vol), now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    whiteNoise.start(now);
    osc.stop(now + 0.14);
    whiteNoise.stop(now + 0.05);

    triggerHaptic(25);
  } catch (err) {
    console.warn("playMoyuSound error:", err);
  }
}

// 2. Tiếng Đại Hồng Chung / Chuông Bát Nhã
function playBellSound() {
  if (!appState.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const vol = Math.max(0.01, appState.masterVolume);

    const freqs = [220, 222.5, 440, 587.33, 840, 1260];
    const weights = [0.8, 0.6, 0.4, 0.35, 0.2, 0.15];
    const decays = [5.5, 5.0, 4.0, 3.5, 2.8, 1.8];

    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now);

      const w = Math.max(0.001, weights[idx] * vol);
      gain.gain.setValueAtTime(w, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + decays[idx]);
    });

    triggerHaptic([40, 60, 40]);
  } catch (err) {
    console.warn("playBellSound error:", err);
  }
}

// 3. Tiếng Lắc Ống Xăm
function playStickSound() {
  if (!appState.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const vol = Math.max(0.01, appState.masterVolume);

    for (let i = 0; i < 4; i++) {
      const t = now + (i * 0.08);
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

      gain.gain.setValueAtTime(Math.max(0.001, 0.25 * vol), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    }

    triggerHaptic(30);
  } catch (err) {
    console.warn("playStickSound error:", err);
  }
}

// 4. Tiếng Nước Róc Rách / Phóng Sinh
function playWaterSound() {
  if (!appState.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const vol = Math.max(0.01, appState.masterVolume);

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);

    gain.gain.setValueAtTime(Math.max(0.001, 0.4 * vol), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.36);

    triggerHaptic(35);
  } catch (err) {
    console.warn("playWaterSound error:", err);
  }
}

// 5. Bộ Máy Âm Nhạc Thiền Ambient
function toggleZenMusic() {
  try {
    initAudio();
    if (isZenMusicPlaying) {
      stopZenAmbient();
    } else {
      startZenAmbient();
    }
  } catch {}
}

function startZenAmbient() {
  try {
    if (!audioCtx) return;
    stopZenAmbient();

    const now = audioCtx.currentTime;
    const zenPitches = [146.83, 220.0, 293.66, 329.63, 440.0, 523.25];
    
    zenPitches.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.2 + (idx * 0.05), now);
      lfoGain.gain.setValueAtTime(3.0, now);
      lfo.connect(osc.frequency);
      lfo.start(now);

      gain.gain.setValueAtTime(0.04 * appState.masterVolume, now);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);

      zenOscillatorNodes.push({ osc, lfo, gain });
    });

    isZenMusicPlaying = true;
    const btn = document.getElementById("btnZenMusic");
    if (btn) btn.classList.add("active");
    const icon = document.getElementById("zenMusicIcon");
    if (icon) icon.textContent = "🎶";
  } catch (err) {
    console.warn("startZenAmbient error:", err);
  }
}

function stopZenAmbient() {
  zenOscillatorNodes.forEach(node => {
    try {
      node.osc.stop();
      node.lfo.stop();
    } catch {}
  });
  zenOscillatorNodes = [];
  isZenMusicPlaying = false;
  const btn = document.getElementById("btnZenMusic");
  if (btn) btn.classList.remove("active");
  const icon = document.getElementById("zenMusicIcon");
  if (icon) icon.textContent = "🎵";
}

function triggerHaptic(duration) {
  if (appState.hapticEnabled && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(duration);
    } catch {}
  }
}

// =========================================================================
// 5. GÕ MÕ TỤNG KINH (VIRTUAL MUYU) & AUTO-TAP
// =========================================================================
let autoTapTimer = null;
let isAutoTapRunning = false;

function tapMoyu(event) {
  addMerit(1);
  appState.totalTaps += 1;
  appState.todayTaps += 1;

  playMoyuSound();

  // Hiệu ứng Mõ nhún xuống nảy lên
  const wrapper = document.getElementById("moyuWrapper");
  wrapper.classList.remove("hit");
  void wrapper.offsetWidth; // Reflow
  wrapper.classList.add("hit");

  // Spawn chữ bay lên
  spawnFloatingText(event);

  saveState();
  updateUI();
}

function spawnFloatingText(event) {
  const container = document.getElementById("floatingContainer");
  const el = document.createElement("div");
  el.className = "floating-merit";

  // Lấy câu ngẫu nhiên từ theme đã chọn
  const themeList = BLESSING_THEMES[appState.activeTheme] || BLESSING_THEMES.all;
  const quote = themeList[Math.floor(Math.random() * themeList.length)];
  el.textContent = quote;

  // Vị trí xuất hiện ngẫu nhiên quanh tâm mõ
  const offsetX = (Math.random() - 0.5) * 140;
  const startX = `calc(50% + ${offsetX}px)`;
  el.style.left = startX;
  el.style.top = "60%";

  container.appendChild(el);

  setTimeout(() => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }, 1400);
}

function toggleAutoTap() {
  if (isAutoTapRunning) {
    stopAutoTap();
  } else {
    startAutoTap();
  }
}

function startAutoTap() {
  isAutoTapRunning = true;
  document.getElementById("btnToggleAuto").textContent = "⏹ Dừng Gõ";
  document.getElementById("btnToggleAuto").classList.add("running");
  document.getElementById("autoStatusDot").classList.add("active");

  const intervalMs = Math.round(60000 / appState.autoSpeedBpm);
  autoTapTimer = setInterval(() => {
    tapMoyu();
  }, intervalMs);
}

function stopAutoTap() {
  if (autoTapTimer) {
    clearInterval(autoTapTimer);
    autoTapTimer = null;
  }
  isAutoTapRunning = false;
  document.getElementById("btnToggleAuto").textContent = "▶ Bắt Đầu Gõ";
  document.getElementById("btnToggleAuto").classList.remove("running");
  document.getElementById("autoStatusDot").classList.remove("active");
}

function changeAutoSpeed(val) {
  appState.autoSpeedBpm = parseInt(val, 10);
  let label = "Tịnh tâm";
  if (appState.autoSpeedBpm >= 140) label = "Siêu tốc";
  else if (appState.autoSpeedBpm >= 100) label = "108 Hạt Chuỗi";
  document.getElementById("speedDisplay").textContent = `${appState.autoSpeedBpm} lần/phút (${label})`;

  if (isAutoTapRunning) {
    stopAutoTap();
    startAutoTap();
  }
}

function setBpm(val) {
  document.getElementById("autoSpeedRange").value = val;
  changeAutoSpeed(val);
}

function changeBlessingTheme(theme) {
  appState.activeTheme = theme;
  saveState();
}

// Bắt phím Space / Enter trên máy tính
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && appState.unlocked) {
    const activeTab = document.querySelector(".tab-panel.active");
    if (activeTab && activeTab.id === "tab-moyu") {
      e.preventDefault();
      tapMoyu();
    }
  }
});

// =========================================================================
// 6. DÂNG HƯƠNG & KHÓI NHANG CANVAS (VIRTUAL INCENSE)
// =========================================================================
let incenseBurningTimer = null;
let incenseTimeLeft = 0;
let incenseTotalTime = 0;
let smokeParticles = [];
let smokeAnimId = null;

class SmokeParticle {
  constructor(x, y) {
    this.x = x + (Math.random() - 0.5) * 8;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = - (0.6 + Math.random() * 0.7);
    this.size = 2 + Math.random() * 2;
    this.maxSize = 14 + Math.random() * 8;
    this.alpha = 0.5;
    this.decay = 0.003 + Math.random() * 0.004;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx += (Math.random() - 0.5) * 0.1;
    if (this.size < this.maxSize) {
      this.size += 0.08;
    }
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initSmokeCanvas() {
  const canvas = document.getElementById("smokeCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nếu đang thắp hương, sinh khói từ 3 nén nhang
    if (incenseTimeLeft > 0) {
      const emitters = [125, 150, 175]; // X coordinates của 3 nén
      emitters.forEach(ex => {
        if (Math.random() < 0.45) {
          smokeParticles.push(new SmokeParticle(ex, 190));
        }
      });
    }

    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      const p = smokeParticles[i];
      p.update();
      p.draw(ctx);
      if (p.alpha <= 0 || p.y < 0) {
        smokeParticles.splice(i, 1);
      }
    }

    smokeAnimId = requestAnimationFrame(loop);
  }

  if (!smokeAnimId) {
    loop();
  }
}

function lightIncense() {
  const radios = document.getElementsByName("incenseDuration");
  let duration = 300;
  for (let r of radios) {
    if (r.checked) {
      duration = parseInt(r.value, 10);
      break;
    }
  }

  incenseTotalTime = duration;
  incenseTimeLeft = duration;

  // Kích hoạt nén nhang cháy
  for (let i = 1; i <= 3; i++) {
    const sw = document.querySelector(`.stick-${i}`);
    if (sw) sw.classList.add("burning");
  }

  playBellSound();
  addMerit(50);
  appState.totalIncense += 3;
  saveState();
  updateUI();

  // Đếm ngược thời gian nhang cháy
  if (incenseBurningTimer) clearInterval(incenseBurningTimer);
  updateIncenseCountdown();

  incenseBurningTimer = setInterval(() => {
    incenseTimeLeft -= 1;
    updateIncenseCountdown();

    // Thu ngắn thân nhang tương ứng tiến trình
    const pct = Math.max(0, incenseTimeLeft / incenseTotalTime);
    for (let i = 1; i <= 3; i++) {
      const body = document.getElementById(`stickBody${i}`);
      if (body) {
        body.style.height = `${Math.round(pct * 100)}px`;
      }
    }

    if (incenseTimeLeft <= 0) {
      clearInterval(incenseBurningTimer);
      incenseBurningTimer = null;
      finishIncense();
    }
  }, 1000);
}

function updateIncenseCountdown() {
  const m = Math.floor(incenseTimeLeft / 60);
  const s = incenseTimeLeft % 60;
  const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  document.getElementById("incenseCountdown").textContent = str;
  document.getElementById("incenseStatusText").textContent = "🔥 Tâm hương đang cháy tỏa ngát:";
}

function finishIncense() {
  for (let i = 1; i <= 3; i++) {
    const sw = document.querySelector(`.stick-${i}`);
    if (sw) sw.classList.remove("burning");
    const body = document.getElementById(`stickBody${i}`);
    if (body) body.style.height = "10px";
  }
  document.getElementById("incenseStatusText").textContent = "✨ Nhang đã tàn thanh tịnh:";
  document.getElementById("incenseCountdown").textContent = "HOÀN TẤT";
  addMerit(100);
  playBellSound();
  alert("✨ Lễ Dâng Hương Hoàn Tất!\nNguyện ước bình an của bạn đã được chứng giám. +100 Công đức lành!");
}

// =========================================================================
// 7. THỈNH ĐẠI HỒNG CHUNG (TEMPLE BELL)
// =========================================================================
function tollBell() {
  playBellSound();
  addMerit(10);
  appState.totalBells += 1;
  saveState();
  updateUI();

  // Rung lắc chuông & vồ gõ
  const bellVisual = document.getElementById("bellVisual");
  const stage = document.querySelector(".bell-stage");
  
  stage.classList.remove("struck");
  bellVisual.classList.remove("struck");
  void stage.offsetWidth;
  stage.classList.add("struck");
  bellVisual.classList.add("struck");

  // Hiệu ứng sóng âm lan tỏa
  for (let i = 1; i <= 3; i++) {
    const w = document.getElementById(`bellWave${i}`);
    if (w) {
      w.classList.remove("ringing");
      void w.offsetWidth;
      w.classList.add("ringing");
      w.style.animationDelay = `${(i - 1) * 0.3}s`;
    }
  }
}

// =========================================================================
// 8. XIN XĂM / BỐC QUẺ QUÁN ÂM (FORTUNE DIVINATION)
// =========================================================================
let currentFortuneResult = null;

function shakeSticks() {
  const pot = document.getElementById("bambooPot");
  const sticks = document.querySelectorAll(".bamboo-stick");
  const resultCard = document.getElementById("fortuneResultCard");

  pot.classList.add("shaking");
  resultCard.classList.add("hidden");
  playStickSound();

  let shakeCount = 0;
  const shakeInterval = setInterval(() => {
    playStickSound();
    shakeCount++;
    if (shakeCount >= 4) {
      clearInterval(shakeInterval);
      pot.classList.remove("shaking");

      // Bật que xăm trồi lên
      const randStick = sticks[Math.floor(Math.random() * sticks.length)];
      randStick.classList.add("ejected");

      setTimeout(() => {
        randStick.classList.remove("ejected");
        revealFortune();
      }, 600);
    }
  }, 250);
}

function revealFortune() {
  // Lấy ngẫu nhiên 1 quẻ xăm từ cơ sở dữ liệu
  const fortune = FORTUNES_DB[Math.floor(Math.random() * FORTUNES_DB.length)];
  currentFortuneResult = fortune;

  document.getElementById("cardRankPill").textContent = fortune.rank;
  document.getElementById("cardNumberTitle").textContent = `QUẺ SỐ ${fortune.num}: ${fortune.title.toUpperCase()}`;
  document.getElementById("cardPoemBody").innerHTML = fortune.poem.replace(/\n/g, "<br>");
  document.getElementById("detCareer").textContent = fortune.career;
  document.getElementById("detWealth").textContent = fortune.wealth;
  document.getElementById("detFamily").textContent = fortune.family;
  document.getElementById("detLove").textContent = fortune.love;
  document.getElementById("detHealth").textContent = fortune.health;
  document.getElementById("detTravel").textContent = fortune.travel;
  document.getElementById("cardAdviceText").textContent = fortune.advice;

  const card = document.getElementById("fortuneResultCard");
  card.classList.remove("hidden");
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });

  playBellSound();
  addMerit(30);
  appState.totalFortunes += 1;
  saveState();
  updateUI();
}

function saveFortuneToHistory() {
  if (!currentFortuneResult) return;
  const item = {
    num: currentFortuneResult.num,
    rank: currentFortuneResult.rank,
    title: currentFortuneResult.title,
    date: new Date().toLocaleDateString("vi-VN")
  };
  appState.savedFortunes.unshift(item);
  saveState();
  renderSavedFortunes();
  alert("⭐ Đã lưu quẻ xăm vào Sổ Công Đức thành công!");
}

function resetFortune() {
  document.getElementById("fortuneResultCard").classList.add("hidden");
  window.scrollTo({ top: 120, behavior: "smooth" });
}

function renderSavedFortunes() {
  const container = document.getElementById("savedFortunesContainer");
  if (!container) return;

  if (appState.savedFortunes.length === 0) {
    container.innerHTML = `<p class="empty-list-text">Chưa có quẻ xăm nào được lưu. Hãy sang tab "Xin Xăm" để chiêm nghiệm nhé!</p>`;
    return;
  }

  container.innerHTML = appState.savedFortunes.map(f => `
    <div class="fortune-history-item">
      <div>
        <span class="fhi-num">Quẻ ${f.num}:</span>
        <span>${f.title}</span>
      </div>
      <span class="fhi-date">${f.date}</span>
    </div>
  `).join("");
}

// =========================================================================
// 9. HỒ SEN PHÓNG SINH (VIRTUAL LOTUS POND SIMULATION)
// =========================================================================
let pondCanvas = null;
let pondCtx = null;
let pondFishes = [];
let pondLanterns = [];
let pondAnimId = null;

class KoiFish {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.size = 14 + Math.random() * 8;
    this.color = Math.random() < 0.6 ? "#ea580c" : (Math.random() < 0.5 ? "#f59e0b" : "#dc2626");
    this.angle = 0;
    this.tailOsc = Math.random() * Math.PI * 2;
  }

  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;
    this.tailOsc += 0.15;

    // Quay đầu khi chạm bờ
    if (this.x < 30) this.vx = Math.abs(this.vx);
    if (this.x > w - 30) this.vx = -Math.abs(this.vx);
    if (this.y < 30) this.vy = Math.abs(this.vy);
    if (this.y > h - 30) this.vy = -Math.abs(this.vy);

    this.angle = Math.atan2(this.vy, this.vx);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Thân cá
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Đuôi cá quẫy theo nhịp sóng
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    const tailWiggle = Math.sin(this.tailOsc) * 4;
    ctx.moveTo(-this.size, 0);
    ctx.lineTo(-this.size - 10, -6 + tailWiggle);
    ctx.lineTo(-this.size - 10, 6 + tailWiggle);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

class FloatingLantern {
  constructor(w, h) {
    this.x = 40 + Math.random() * (w - 80);
    this.y = 40 + Math.random() * (h - 80);
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.2;
  }

  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 20 || this.x > w - 20) this.vx *= -1;
    if (this.y < 20 || this.y > h - 20) this.vy *= -1;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Hào quang nến
    ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Cánh hoa đăng hồng
    ctx.fillStyle = "#ec4899";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.rotate(Math.PI / 3);
      ctx.ellipse(0, 8, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Đốm lửa nến vàng rực
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function initPondCanvas() {
  pondCanvas = document.getElementById("pondCanvas");
  if (!pondCanvas) return;
  pondCtx = pondCanvas.getContext("2d");

  // Resize canvas theo container
  const rect = pondCanvas.getBoundingClientRect();
  pondCanvas.width = rect.width || 480;
  pondCanvas.height = rect.height || 340;

  // Khởi tạo đàn cá ban đầu
  pondFishes = [];
  for (let i = 0; i < appState.totalFishes; i++) {
    pondFishes.push(new KoiFish(pondCanvas.width, pondCanvas.height));
  }

  // Khởi tạo hoa đăng
  pondLanterns = [];
  for (let i = 0; i < appState.totalLanterns; i++) {
    pondLanterns.push(new FloatingLantern(pondCanvas.width, pondCanvas.height));
  }

  function renderPond() {
    const w = pondCanvas.width;
    const h = pondCanvas.height;

    // Nền nước hồ sen sâu thẳm
    const grad = pondCtx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w/2);
    grad.addColorStop(0, "#0c4a6e");
    grad.addColorStop(1, "#082f49");
    pondCtx.fillStyle = grad;
    pondCtx.fillRect(0, 0, w, h);

    // Vẽ lá sen xanh
    pondCtx.fillStyle = "#047857";
    const padCoords = [[80, 80, 35], [w - 90, 70, 42], [w/2, h - 70, 38], [70, h - 90, 30]];
    padCoords.forEach(([px, py, pr]) => {
      pondCtx.beginPath();
      pondCtx.arc(px, py, pr, 0.2, Math.PI * 1.85);
      pondCtx.lineTo(px, py);
      pondCtx.closePath();
      pondCtx.fill();
    });

    // Cập nhật & vẽ cá Koi
    pondFishes.forEach(fish => {
      fish.update(w, h);
      fish.draw(pondCtx);
    });

    // Cập nhật & vẽ hoa đăng
    pondLanterns.forEach(lan => {
      lan.update(w, h);
      lan.draw(pondCtx);
    });

    pondAnimId = requestAnimationFrame(renderPond);
  }

  if (!pondAnimId) {
    renderPond();
  }
}

function releaseFish() {
  if (!pondCanvas) return;
  playWaterSound();
  pondFishes.push(new KoiFish(pondCanvas.width, pondCanvas.height));
  appState.totalFishes += 1;
  addMerit(20);
  saveState();
  updateUI();
  document.getElementById("fishCountDisplay").textContent = appState.totalFishes;
}

function floatLantern() {
  if (!pondCanvas) return;
  playWaterSound();
  pondLanterns.push(new FloatingLantern(pondCanvas.width, pondCanvas.height));
  appState.totalLanterns += 1;
  addMerit(30);
  saveState();
  updateUI();
  document.getElementById("lanternCountDisplay").textContent = appState.totalLanterns;
}

// =========================================================================
// 10. DÂNG LỄ CÚNG DƯỜNG (OFFERINGS)
// =========================================================================
function offerItem(type) {
  playBellSound();
  let meritGain = 50;
  let slotId = "slotFruit";
  let label = "Mâm Ngũ Quả";

  if (type === "flower") {
    meritGain = 50;
    slotId = "slotFlower";
    label = "Bình Hoa Sen Tươi";
  } else if (type === "water") {
    meritGain = 30;
    slotId = "slotWater";
    label = "Chén Nước Cam Lồ";
  } else if (type === "candle") {
    meritGain = 40;
    slotId = "slotCandle";
    label = "Đèn Nến Sen Vàng";
  }

  addMerit(meritGain);
  saveState();
  updateUI();

  // Hiệu ứng slot bừng sáng
  const slot = document.getElementById(slotId);
  if (slot) {
    slot.style.transform = "scale(1.2)";
    slot.style.filter = "drop-shadow(0 0 16px #f59e0b)";
    setTimeout(() => {
      slot.style.transform = "scale(1)";
      slot.style.filter = "none";
    }, 400);
  }

  alert(`🌸 Dâng lễ thành công!\nBạn vừa thành tâm dâng ${label} lên Tam Bảo. +${meritGain} Công đức lành!`);
}

// =========================================================================
// 11. ĐIỀU HƯỚNG TABS & QUẢN LÝ GIAO DIỆN (UI CONTROLLER)
// =========================================================================
function switchTab(tabId) {
  // Đóng auto tap nếu chuyển tab khác mõ
  if (tabId !== "moyu" && isAutoTapRunning) {
    stopAutoTap();
  }

  // Cập nhật nút nav
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Cập nhật tab panel
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `tab-${tabId}`);
  });

  // Khởi chạy canvas tương ứng
  if (tabId === "pond") {
    setTimeout(initPondCanvas, 50);
  } else if (tabId === "incense") {
    setTimeout(initSmokeCanvas, 50);
  } else if (tabId === "ledger") {
    renderSavedFortunes();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addMerit(amount) {
  appState.totalMerit += amount;
  appState.todayMerit += amount;
}

function updateUI() {
  // Cập nhật ngày & chuỗi ngày tinh tấn
  const todayStr = new Date().toLocaleDateString("vi-VN");
  if (appState.lastActiveDate !== todayStr) {
    if (appState.lastActiveDate) {
      appState.todayMerit = 0;
      appState.todayTaps = 0;
      appState.streakDays += 1;
    }
    appState.lastActiveDate = todayStr;
    saveState();
  }

  // Cập nhật hiển thị Header
  document.getElementById("headerMeritVal").textContent = appState.totalMerit.toLocaleString("vi-VN");
  document.getElementById("todayMeritVal").textContent = appState.todayMerit.toLocaleString("vi-VN");
  document.getElementById("todayTapsVal").textContent = appState.todayTaps.toLocaleString("vi-VN");
  document.getElementById("streakDaysVal").textContent = appState.streakDays;

  // Tính cấp bậc tu tập
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (appState.totalMerit >= RANKS[i].minMerit) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || RANKS[i];
    }
  }

  document.getElementById("headerLevelBadge").textContent = currentRank.badge;
  document.getElementById("headerLevelTitle").textContent = currentRank.name;
  document.getElementById("ledgerRankName").textContent = currentRank.name;
  document.getElementById("ledgerRankBadge").textContent = currentRank.badge;

  // Thanh tiến trình công đức
  const span = nextRank.minMerit - currentRank.minMerit;
  const progress = appState.totalMerit - currentRank.minMerit;
  const pct = span > 0 ? Math.min(100, Math.round((progress / span) * 100)) : 100;

  document.getElementById("ledgerExpFill").style.width = `${pct}%`;
  document.getElementById("expCurrentText").textContent = `${appState.totalMerit.toLocaleString("vi-VN")} / ${nextRank.minMerit.toLocaleString("vi-VN")} Công Đức`;
  document.getElementById("expNextRank").textContent = `Tiếp theo: ${nextRank.name}`;

  // Cập nhật chỉ số matrix
  document.getElementById("statTotalTaps").textContent = appState.totalTaps.toLocaleString("vi-VN");
  document.getElementById("statTotalIncense").textContent = appState.totalIncense.toLocaleString("vi-VN");
  document.getElementById("statTotalBells").textContent = appState.totalBells.toLocaleString("vi-VN");
  document.getElementById("statTotalFortunes").textContent = appState.totalFortunes.toLocaleString("vi-VN");
  document.getElementById("statTotalFishes").textContent = appState.totalFishes.toLocaleString("vi-VN");
  document.getElementById("statTotalLanterns").textContent = appState.totalLanterns.toLocaleString("vi-VN");
}

// =========================================================================
// 12. CÀI ĐẶT & LƯU TRỮ TRẠNG THÁI (LOCALSTORAGE & CHỐNG TREO KHI ĐỔI MẬT MÃ)
// =========================================================================
function loadState() {
  try {
    const raw = localStorage.getItem("chua_online_state_v4");
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = { ...appState, ...parsed };
    }
  } catch {}
}

function saveState() {
  try {
    localStorage.setItem("chua_online_state_v4", JSON.stringify(appState));
  } catch {}
}

function openSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.remove("hidden");
  
  const curPin = "2002";
  const curDisplay = document.getElementById("currentPinDisplay");
  if (curDisplay) curDisplay.textContent = curPin;

  document.getElementById("soundEffectCheck").checked = appState.soundEnabled;
  document.getElementById("hapticCheck").checked = appState.hapticEnabled;
  document.getElementById("volumeRange").value = Math.round(appState.masterVolume * 100);
}

function closeSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.add("hidden");
  const notice = document.getElementById("pinChangeNotice");
  if (notice) notice.textContent = "";
}

// Mật mã mở khóa cố định là 2002 theo yêu cầu

function toggleSoundEffects(enabled) {
  appState.soundEnabled = enabled;
  saveState();
}

function toggleHaptic(enabled) {
  appState.hapticEnabled = enabled;
  saveState();
}

function changeMasterVolume(val) {
  appState.masterVolume = parseInt(val, 10) / 100.0;
  saveState();
}

function confirmResetMerit() {
  const ans = confirm("Bạn có chắc chắn muốn đặt lại toàn bộ số liệu công đức về 0 để tu tập lại từ đầu?");
  if (ans) {
    appState.totalMerit = 0;
    appState.todayMerit = 0;
    appState.totalTaps = 0;
    appState.todayTaps = 0;
    appState.totalIncense = 0;
    appState.totalBells = 0;
    appState.totalFortunes = 0;
    appState.savedFortunes = [];
    saveState();
    updateUI();
    renderSavedFortunes();
    alert("Đã làm mới sổ công đức thành công!");
  }
}

// Xuất Chứng Nhận Công Đức (HTML5 Canvas Shareable Certificate)
function generateMeritCertificate() {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");

  const bgGrad = ctx.createLinearGradient(0, 0, 800, 600);
  bgGrad.addColorStop(0, "#1e130a");
  bgGrad.addColorStop(0.5, "#451a03");
  bgGrad.addColorStop(1, "#1c0a00");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 600);

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 6;
  ctx.strokeRect(25, 25, 750, 550);
  ctx.lineWidth = 2;
  ctx.strokeRect(35, 35, 730, 530);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fef08a";
  ctx.font = "bold 28px 'Segoe UI', serif";
  ctx.fillText("CHỨNG NHẬN CÔNG ĐỨC TU TẬP", 400, 95);

  ctx.fillStyle = "#f59e0b";
  ctx.font = "italic 16px 'Segoe UI', serif";
  ctx.fillText("Chùa Online 4.0 — Tịnh Tâm Tích Đức Tại Gia", 400, 130);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "18px 'Segoe UI', sans-serif";
  ctx.fillText("Chứng nhận Tín Chủ đã phát tâm tinh tấn tu tập tích lũy được:", 400, 200);

  ctx.fillStyle = "#facc15";
  ctx.font = "bold 44px 'Segoe UI', sans-serif";
  ctx.fillText(`${appState.totalMerit.toLocaleString("vi-VN")} ĐIỂM CÔNG ĐỨC`, 400, 270);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "16px 'Segoe UI', sans-serif";
  ctx.fillText(`Cấp bậc: ${document.getElementById("ledgerRankName").textContent} • Chuỗi tinh tấn: ${appState.streakDays} ngày`, 400, 320);
  ctx.fillText(`Số tiếng mõ: ${appState.totalTaps.toLocaleString("vi-VN")} | Nén nhang: ${appState.totalIncense} | Tiếng chuông: ${appState.totalBells}`, 400, 355);

  ctx.fillStyle = "#f59e0b";
  ctx.font = "italic 15px 'Segoe UI', serif";
  ctx.fillText('"Phước đức vun bồi vạn sự hưng • Tâm an vạn sự an"', 400, 440);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px 'Segoe UI', sans-serif";
  ctx.fillText(`Ngày chứng thực: ${new Date().toLocaleDateString("vi-VN")}`, 400, 510);

  const dataUrl = canvas.toDataURL("image/png");
  const win = window.open();
  win.document.write(`<title>Chứng Nhận Công Đức</title><body style="margin:0;background:#090b10;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${dataUrl}" style="max-width:90%;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.8);"/></body>`);
}

// Khởi động ứng dụng trực tiếp không qua mật mã
window.addEventListener("DOMContentLoaded", () => {
  loadState();
  appState.unlocked = true;
  updateUI();
  try {
    setTimeout(initSmokeCanvas, 100);
  } catch {}
  try {
    setTimeout(initPondCanvas, 100);
  } catch {}
});
