(() => {
  "use strict";
  const workouts = [
    {
      id: "walk",
      name: "빠르게 걷기",
      type: "유산소",
      tag: "유산소",
      tone: "green",
      image: "walk",
      places: ["campus", "gym"],
      gear: "none",
      level: 0,
      met: 4.8,
      source: "walking",
      code: "17200",
      note: "평지에서 팔을 가볍게 흔들며 경쾌하게 걸어요.",
      pace: "평지에서 시속 약 5.6~6.3 km로 걷기",
    },
    {
      id: "run",
      name: "가벼운 조깅",
      type: "유산소",
      tag: "유산소",
      tone: "orange",
      image: "run",
      places: ["campus"],
      gear: "none",
      level: 0,
      met: 7.5,
      source: "running",
      code: "12020",
      note: "어깨에 힘을 빼고 편안한 보폭으로 달려요.",
      pace: "스스로 정한 속도로 하는 일반 조깅",
    },
    {
      id: "stretch",
      name: "전신 스트레칭",
      type: "유연성",
      tag: "유연성",
      tone: "purple",
      image: "stretch",
      places: ["campus", "home", "gym"],
      gear: "none",
      level: 0,
      met: 2.3,
      source: "conditioning-exercise",
      code: "02101",
      note: "목과 어깨부터 다리까지 천천히 늘려 주세요.",
      pace: "가벼운 강도의 스트레칭",
    },
    {
      id: "pilates",
      name: "매트 필라테스",
      type: "코어",
      tag: "코어",
      tone: "purple",
      image: "stretch",
      places: ["home", "gym"],
      gear: "mat",
      level: 0,
      met: 1.8,
      source: "conditioning-exercise",
      code: "02103",
      note: "매트에 누워 호흡에 맞춰 한쪽 다리씩 들어 올려요.",
      pace: "전통적인 매트 필라테스",
    },
    {
      id: "track",
      name: "트랙 러닝",
      type: "유산소",
      tag: "유산소",
      tone: "orange",
      image: "run",
      places: ["campus"],
      gear: "none",
      level: 1,
      met: 8.5,
      source: "running",
      code: "12030",
      note: "트랙에서 일정한 보폭과 리듬으로 달려요.",
      pace: "시속 약 8.0~8.4 km로 달리기",
    },
    {
      id: "treadmill",
      name: "트레드밀 걷기",
      type: "유산소",
      tag: "유산소",
      tone: "green",
      image: "walk",
      places: ["gym"],
      gear: "treadmill",
      level: 0,
      met: 3.8,
      source: "walking",
      code: "17355",
      note: "경사를 평평하게 맞추고 일정한 속도로 걸어요.",
      pace: "경사 0%, 시속 약 4.8~5.5 km로 걷기",
    },
  ];
  const places = {
    all: "모든 장소",
    campus: "캠퍼스·야외",
    home: "집·기숙사",
    gym: "헬스장",
  };
  const gears = { none: "기구 없음", mat: "운동 매트", treadmill: "트레드밀" };
  const levels = ["입문", "경험 있음"];
  const meals = {
    skip: { name: "건너뛰기", menu: "" },
    cafeteria: { name: "학식", menu: "잡곡밥 · 두부조림 · 계절 나물" },
    store: { name: "편의점", menu: "삼각김밥 · 구운 달걀 · 두유" },
    home: { name: "집밥", menu: "현미밥 · 닭고기 채소볶음 · 김치" },
  };
  const byId = (id) => workouts.find((w) => w.id === id);
  function candidates(filters, favorites, balance) {
    const pool = workouts.filter(
      (w) =>
        (filters.place === "all" || w.places.includes(filters.place)) &&
        (w.gear === "none" || w.gear === filters.gear) &&
        w.level <= filters.level,
    );
    const low = Math.min(...pool.map((w) => w.met)),
      high = Math.max(...pool.map((w) => w.met));
    const score = (w) =>
      (favorites.includes(w.id) ? 1 : 0) * (1 - balance / 100) +
      (((w.met - low) / (high - low || 1)) * balance) / 100;
    return pool.sort(
      (a, b) =>
        score(b) - score(a) || workouts.indexOf(a) - workouts.indexOf(b),
    );
  }
  const calories = (met, weight, minutes) =>
    weight > 0 ? Math.round((met * 3.5 * weight * minutes) / 200) : null;
  function startMinute(date, time) {
    const [year, month, day] = date.split("-").map(Number),
      [hour, min] = time.split(":").map(Number);
    return Date.UTC(year, month - 1, day, hour, min) / 60000;
  }
  function overlaps(a, b) {
    const x = startMinute(a.date, a.time),
      y = startMinute(b.date, b.time);
    return x < y + b.minutes && y < x + a.minutes;
  }
  function endLabel(time, duration) {
    const [h, m] = time.split(":").map(Number),
      total = h * 60 + m + duration;
    const pad = (n) => String(n).padStart(2, "0");
    return (
      (total >= 1440 ? "다음 날 " : "") +
      pad(Math.floor(total / 60) % 24) +
      ":" +
      pad(total % 60)
    );
  }
  const model = {
    workouts,
    places,
    gears,
    levels,
    meals,
    byId,
    candidates,
    calories,
    overlaps,
    endLabel,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = model;
  else window.Planner = model;
})();
