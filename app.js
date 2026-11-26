(() => {
  "use strict";
  const M = window.Planner;
  const $ = (id) => document.getElementById(id);
  const paths = {
    layout:
      '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h2m3 0h2"/>',
    heart:
      '<path d="M20.7 5.8a5.3 5.3 0 0 0-7.5 0L12 7l-1.2-1.2a5.3 5.3 0 0 0-7.5 7.5L12 21l8.7-7.7a5.3 5.3 0 0 0 0-7.5Z"/>',
    moon: '<path d="M20.8 14.2A9.2 9.2 0 0 1 9.8 3.1a9.2 9.2 0 1 0 11 11.1Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    sliders:
      '<path d="M4 6h5m4 0h7M4 12h10m4 0h2M4 18h3m4 0h9"/><circle cx="11" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
    filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>',
    timer:
      '<circle cx="12" cy="14" r="8"/><path d="M9 2h6m-3 0v4m6 1 2-2m-8 5v4l3-2"/>',
    pencil: '<path d="m4 16-1 5 5-1L20 8l-4-4L4 16Zm9-9 4 4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
    flame:
      '<path d="M13 2c2 6-3 6-2 11 2-1 3-3 4-5 4 3 6 7 4 11-3 5-12 4-14-2-2-6 4-9 8-15Z"/>',
    clipboard:
      '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6m-6 4h4"/>',
    device:
      '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6m-3-4v4"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
    gear: '<path d="m6 8 10 10m-8-12 10 10M3 13l10-10M11 21l10-10M2 10l8-8m4 20 8-8"/>',
    level: '<path d="M5 19v-4m7 4v-9m7 9V4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    leaf: '<path d="M20 3c-7 1-15 1-15 9a6 6 0 0 0 6 6c8 0 8-8 9-15ZM4 21l10-11"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    meal: '<path d="M5 3v7m3-7v7m3-7v7M5 8c0 5 6 5 6 0m-3 4v9M19 3c-3 4-4 8 0 9v9m0-18v9"/>',
  };
  const icon = (name) =>
    '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' +
    paths[name] +
    "</svg>";
  const asset = (name) =>
    (window.plannerImages || {})[name] || "assets/" + name + ".jpg";
  document
    .querySelectorAll("[data-icon]")
    .forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
  const keys = {
    plans: "deoljichim.plans.v1",
    favorites: "deoljichim.favorites.v1",
    theme: "deoljichim.theme.v1",
  };
  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(keys[key])) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(keys[key], JSON.stringify(value));
      return true;
    } catch {
      notify("브라우저 저장 공간을 사용할 수 없어요.");
      return false;
    }
  }
  function savedPlans() {
    const list = read("plans", []);
    return Array.isArray(list)
      ? list.filter(
          (p) =>
            p &&
            /^[\w-]+$/.test(p.id) &&
            M.byId(p.workout) &&
            /^\d{4}-\d{2}-\d{2}$/.test(p.date) &&
            /^\d{2}:\d{2}$/.test(p.time) &&
            Number.isInteger(p.minutes) &&
            p.minutes >= 1 &&
            p.minutes <= 240 &&
            Object.hasOwn(M.meals, p.meal),
        )
      : [];
  }
  function favorites() {
    const list = read("favorites", []);
    return Array.isArray(list) ? list.filter((id) => M.byId(id)) : [];
  }
  function localDate(date = new Date()) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }
  const formatDate = (date) =>
    new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  const state = {
    budget: 30,
    minutes: 20,
    weight: null,
    place: "all",
    gear: "none",
    level: 0,
    balance: 0,
    selected: "walk",
    date: localDate(),
    time: "18:00",
    meal: "skip",
  };
  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    $("toast").classList.add("show");
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2600);
  }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $("theme").innerHTML = icon(theme === "dark" ? "sun" : "moon");
    $("theme").setAttribute(
      "aria-label",
      theme === "dark" ? "라이트 모드 켜기" : "다크 모드 켜기",
    );
  }
  applyTheme(read("theme", "light"));
  $("theme").onclick = () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    write("theme", theme);
  };
  $("today").innerHTML = icon("calendar") + formatDate(new Date());
  function card(w, isFavoritePage = false) {
    const selected = !isFavoritePage && w.id === state.selected,
      fav = favorites().includes(w.id);
    const kcal = M.calories(w.met, state.weight, state.minutes);
    return (
      '<article class="work-card' +
      (selected ? " selected" : "") +
      '"><div class="card-img"><img src="' +
      asset(w.image) +
      '" alt=""><span class="type ' +
      w.tone +
      '">' +
      icon(w.type === "유산소" ? "activity" : "leaf") +
      w.tag +
      '</span><button class="fav-btn" data-fav="' +
      w.id +
      '" aria-pressed="' +
      fav +
      '" aria-label="' +
      w.name +
      ' 선호 운동">' +
      icon("heart") +
      '</button></div><div class="card-content"><h3>' +
      w.name +
      "</h3><p>" +
      w.note +
      '</p><div class="metrics"><span>' +
      icon("clock") +
      state.minutes +
      "분</span><span>" +
      icon("flame") +
      (kcal === null ? w.met.toFixed(1) + " MET" : kcal + " kcal (추정)") +
      '</span></div><button class="select-work" data-select="' +
      w.id +
      '" aria-pressed="' +
      selected +
      '">' +
      icon(selected ? "check" : "plus") +
      (selected ? "선택한 운동" : "운동 선택") +
      "</button></div></article>"
    );
  }
  function empty(iconName, title, desc, button, action) {
    return (
      '<div class="empty">' +
      icon(iconName) +
      "<h2>" +
      title +
      "</h2><p>" +
      desc +
      '</p><button class="primary" data-action="' +
      action +
      '">' +
      button +
      "</button></div>"
    );
  }
  function render() {
    const pool = M.candidates(state, favorites(), state.balance);
    if (!pool.some((w) => w.id === state.selected))
      state.selected = pool[0]?.id || "";
    const w = M.byId(state.selected),
      duration = w ? state.minutes : 0,
      remaining = state.budget - duration;
    $("cards").innerHTML =
      pool.map((w) => card(w)).join("") ||
      empty(
        "filter",
        "가능한 운동이 없어요",
        "장소나 사용 가능한 기구를 바꿔 보세요.",
        "조건 변경",
        "conditions",
      );
    $("count").textContent = pool.length + "개";
    $("filters").innerHTML = [
      ["pin", M.places[state.place]],
      ["gear", M.gears[state.gear]],
      ["level", M.levels[state.level]],
    ]
      .map(
        ([i, t]) =>
          '<button class="chip" data-action="conditions">' +
          icon(i) +
          t +
          "</button>",
      )
      .join("");
    $("hero-min").textContent = state.budget + "분";
    $("budget-num").textContent = state.budget;
    $("used-time").textContent = duration + "분";
    $("free-time").textContent =
      remaining >= 0 ? remaining + "분" : Math.abs(remaining) + "분 초과";
    document
      .querySelector(".ring")
      .style.setProperty(
        "--used",
        Math.min(100, (duration / state.budget) * 100) + "%",
      );
    $("board-exercise").textContent = w
      ? w.name + " 선택 중"
      : "운동을 선택해 주세요";
    $("plan-editor").hidden = !w;
    if (w) {
      $("edit-name").textContent = w.name;
      $("edit-minutes").innerHTML = state.minutes + "분 " + icon("pencil");
      const kcal = M.calories(w.met, state.weight, state.minutes);
      $("edit-weight").innerHTML =
        (kcal === null ? "체중 입력" : kcal + " kcal (추정)") +
        " " +
        icon("pencil");
      $("calc-note").innerHTML =
        "<p>" +
        w.name +
        " · " +
        w.met.toFixed(1) +
        " MET (" +
        w.pace +
        '). MET는 활동 강도를 나타내는 단위예요.</p><p>총 소모 열량(추정 kcal) = MET × 3.5 × 체중(kg) ÷ 200 × 운동 시간(분). 결과는 정수로 반올림하며 개인의 실제 소모량과 다를 수 있어요.</p><p><a target="_blank" rel="noopener" href="https://pacompendium.com/' +
        w.source +
        '/">2024 Adult Compendium · ' +
        w.code +
        '</a> · <a target="_blank" rel="noopener" href="https://kin240.education.msu.edu/_files/KIN240_Handout_20.pdf">Michigan State University 계산식</a></p>';
    }
    const favs = favorites().map(M.byId);
    $("favorite-cards").innerHTML =
      favs.map((w) => card(w, true)).join("") ||
      empty(
        "heart",
        "선호 운동을 골라 보세요",
        "운동 카드의 하트를 누르면 여기에 모여요.",
        "운동 둘러보기",
        "planner",
      );
    $("balance").setAttribute(
      "aria-valuetext",
      "소모량 우선 " + state.balance + "%",
    );
    renderSchedule();
  }
  function renderSchedule() {
    const plans = savedPlans().sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time),
    );
    if (!plans.length) {
      $("schedule").innerHTML = empty(
        "calendar",
        "첫 계획을 만들어 보세요",
        "오늘 가능한 운동을 고르고 시작 시각을 정해 보세요.",
        "플래너 열기",
        "planner",
      );
      return;
    }
    let date = "";
    $("schedule").innerHTML = plans
      .map((p) => {
        const w = M.byId(p.workout),
          meal = M.meals[p.meal];
        const heading =
          p.date !== date
            ? '<h2 class="date-title">' +
              formatDate(new Date(p.date + "T12:00:00")) +
              "</h2>"
            : "";
        date = p.date;
        return (
          heading +
          '<article class="schedule-row"><span class="schedule-time">' +
          p.time +
          " ~ " +
          M.endLabel(p.time, p.minutes) +
          '</span><img src="' +
          asset(w.image) +
          '" alt=""><div class="details"><h3>' +
          w.name +
          " · " +
          p.minutes +
          "분</h3><p>" +
          (meal.menu ? meal.name + " · " + meal.menu : "식사 건너뜀") +
          '</p></div><span class="schedule-meta">' +
          (Number.isFinite(p.kcal) ? p.kcal + " kcal (추정)" : "") +
          '</span><button class="icon-btn" data-remove="' +
          p.id +
          '" aria-label="' +
          p.time +
          " " +
          w.name +
          ' 계획 삭제">' +
          icon("trash") +
          "</button></article>"
        );
      })
      .join("");
  }
  function route() {
    const page = ["plans", "favorites"].includes(location.hash.slice(1))
      ? location.hash.slice(1)
      : "planner";
    ["planner", "plans", "favorites"].forEach(
      (key) => ($(key + "-page").hidden = key !== page),
    );
    document.querySelectorAll("[data-page]").forEach((a) => {
      if (a.dataset.page === page) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    render();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  window.addEventListener("storage", (event) => {
    if (event.key === keys.theme) applyTheme(read("theme", "light"));
    render();
  });
  const modal = $("modal");
  function openModal(title, html) {
    $("modal-title").textContent = title;
    $("modal-content").innerHTML = html;
    if (!modal.open) modal.showModal();
  }
  $("modal-close").onclick = () => modal.close();
  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    if (
      e.target === modal &&
      (e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom)
    )
      modal.close();
  });
  const formFooter = (title = "적용하기") =>
    '<p id="form-error" class="form-error" role="alert"></p><div class="form-actions"><button class="secondary" type="button" data-close>취소</button><button class="primary" type="submit">' +
    title +
    "</button></div>";
  const options = (items, selected) =>
    Object.entries(items)
      .map(
        ([value, label]) =>
          '<option value="' +
          value +
          '"' +
          (String(value) === String(selected) ? " selected" : "") +
          ">" +
          label +
          "</option>",
      )
      .join("");
  const numberField = (
    name,
    label,
    value,
    min,
    max,
    step = 1,
    optional = false,
  ) =>
    '<label class="field">' +
    label +
    '<input type="number" inputmode="' +
    (step === 1 ? "numeric" : "decimal") +
    '" name="' +
    name +
    '" min="' +
    min +
    '" max="' +
    max +
    '" step="' +
    step +
    '" value="' +
    (value ?? "") +
    '" ' +
    (optional ? 'placeholder="입력 안 함"' : "required") +
    "></label>";
  function conditions() {
    openModal(
      "운동 조건 설정",
      '<form id="conditions-form" class="form-grid">' +
        numberField("budget", "가능 시간 (분)", state.budget, 1, 240) +
        '<div class="twocol"><label class="field">운동 장소<select name="place">' +
        options(M.places, state.place) +
        '</select></label><label class="field">사용 가능한 기구<select name="gear">' +
        options(M.gears, state.gear) +
        '</select></label></div><label class="field">운동 경험<select name="level">' +
        options(M.levels, state.level) +
        "</select></label><div>" +
        numberField(
          "weight",
          "체중 (kg, 선택)",
          state.weight,
          20,
          300,
          0.1,
          true,
        ) +
        '<p class="hint">칼로리 추정에만 사용해요. 비워 두어도 계획을 저장할 수 있어요.</p></div>' +
        formFooter() +
        "</form>",
    );
    $("conditions-form").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target.elements;
      Object.assign(state, {
        budget: +f.budget.value,
        place: f.place.value,
        gear: f.gear.value,
        level: +f.level.value,
        weight: f.weight.value ? +f.weight.value : null,
      });
      render();
      if (state.selected && state.minutes > state.budget) {
        timeEditor();
      } else {
        modal.close();
        notify("운동 조건을 적용했어요.");
      }
    };
  }
  function timeEditor(focusWeight = false) {
    const w = M.byId(state.selected);
    openModal(
      "시간과 소모량 조절",
      '<form class="form-grid" id="timing"><div class="twocol">' +
        numberField("budget", "가능 시간 (분)", state.budget, 1, 240) +
        numberField("minutes", "운동 시간 (분)", state.minutes, 1, 240) +
        '</div><label class="field">운동 시간 조절<input type="range" id="duration-range" min="1" max="240" value="' +
        state.minutes +
        '"></label>' +
        numberField(
          "weight",
          "체중 (kg, 선택)",
          state.weight,
          20,
          300,
          0.1,
          true,
        ) +
        '<div class="time-readout" id="time-readout" aria-live="polite"></div><p class="hint">가능 시간과 운동 시간은 1~240분이에요. 체중은 20~300 kg 범위에서 소수 첫째 자리까지 입력할 수 있어요.</p>' +
        formFooter() +
        "</form>",
    );
    const f = $("timing").elements;
    const update = () => {
      const min = f.minutes.valueAsNumber,
        budget = f.budget.valueAsNumber,
        weight = f.weight.valueAsNumber;
      $("duration-range").value = Number.isFinite(min) ? min : 1;
      const kcal =
        w && f.weight.validity.valid ? M.calories(w.met, weight, min) : null;
      $("time-readout").textContent =
        f.minutes.validity.valid && f.budget.validity.valid
          ? "남은 시간 " +
            Math.max(0, budget - min) +
            "분" +
            (kcal !== null && Number.isFinite(kcal)
              ? " · " + kcal + " kcal (추정)"
              : "")
          : "가능 시간과 운동 시간을 입력해 주세요.";
      $("form-error").textContent =
        min > budget ? "운동 시간을 " + (min - budget) + "분 줄여 주세요." : "";
    };
    $("duration-range").oninput = (e) => {
      f.minutes.value = e.target.value;
    };
    $("timing").oninput = update;
    update();
    $("timing").onsubmit = (e) => {
      e.preventDefault();
      update();
      if (+f.minutes.value > +f.budget.value) {
        f.minutes.focus();
        return;
      }
      Object.assign(state, {
        budget: +f.budget.value,
        minutes: +f.minutes.value,
        weight: f.weight.value ? +f.weight.value : null,
      });
      render();
      modal.close();
    };
    if (focusWeight) f.weight.focus();
  }
  function planForm() {
    if (state.minutes > state.budget) {
      timeEditor();
      return;
    }
    const w = M.byId(state.selected);
    if (!w) return;
    openModal(
      "운동과 한 끼 저장",
      '<form class="form-grid" id="save-plan"><p class="summary-note box">' +
        w.name +
        " · 운동 " +
        state.minutes +
        "분 · 남은 시간 " +
        (state.budget - state.minutes) +
        '분</p><fieldset class="check-group"><legend>한 끼 선택</legend><div class="meal-choices">' +
        ["cafeteria", "store", "home", "skip"]
          .map(
            (key) =>
              '<label><input type="radio" name="meal" value="' +
              key +
              '" ' +
              (key === state.meal ? "checked" : "") +
              "><span>" +
              M.meals[key].name +
              "</span></label>",
          )
          .join("") +
        '</div></fieldset><p id="meal-example" class="meal-note"></p><div class="twocol"><label class="field">운동 날짜<input required type="date" name="date" min="1900-01-01" max="9999-12-31" value="' +
        state.date +
        '"></label><label class="field">시작 시각<input required type="time" step="60" name="time" value="' +
        state.time +
        '"></label></div><div class="hint" id="end-time"></div>' +
        formFooter("내 계획표에 저장") +
        "</form>",
    );
    const form = $("save-plan"),
      f = form.elements;
    const sync = () => {
      state.meal = f.meal.value;
      state.date = f.date.value;
      state.time = f.time.value;
      $("meal-example").textContent =
        M.meals[state.meal].menu || "운동 일정만 저장해요.";
      $("end-time").textContent = state.time
        ? "종료 예정 " + M.endLabel(state.time, state.minutes)
        : "";
      $("form-error").textContent = "";
    };
    form.oninput = sync;
    sync();
    form.onsubmit = async (e) => {
      e.preventDefault();
      sync();
      const submit = form.querySelector("[type=submit]");
      if (submit.disabled) return;
      submit.disabled = true;
      const p = {
        id:
          globalThis.crypto?.randomUUID?.() ||
          Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
        workout: w.id,
        date: state.date,
        time: state.time,
        minutes: state.minutes,
        meal: state.meal,
        kcal: M.calories(w.met, state.weight, state.minutes),
      };
      const save = () => {
        const plans = savedPlans(),
          conflict = plans.find((existing) => M.overlaps(p, existing));
        if (conflict) {
          $("form-error").textContent =
            "기존 일정(" +
            conflict.date +
            " " +
            conflict.time +
            "~" +
            M.endLabel(conflict.time, conflict.minutes) +
            ")과 겹쳐요. 시작 시각을 바꿔 주세요.";
          f.time.focus();
          return;
        }
        if (!write("plans", [...plans, p])) {
          $("form-error").textContent =
            "저장 공간을 확인하고 다시 시도해 주세요.";
          return;
        }
        modal.close();
        location.hash = "plans";
        render();
        notify("내 계획표에 저장했어요.");
      };
      try {
        if (navigator.locks) await navigator.locks.request(keys.plans, save);
        else save();
      } finally {
        submit.disabled = false;
      }
    };
  }
  function confirmRemove(id) {
    const p = savedPlans().find((x) => x.id === id);
    if (!p) return;
    openModal(
      "계획을 삭제할까요?",
      '<form class="form-grid" id="remove-plan"><p>' +
        p.date +
        " " +
        p.time +
        "에 예정된 " +
        M.byId(p.workout).name +
        " 계획을 삭제해요.</p>" +
        formFooter("삭제하기") +
        "</form>",
    );
    $("remove-plan").onsubmit = async (e) => {
      e.preventDefault();
      const remove = () => {
        if (
          write(
            "plans",
            savedPlans().filter((x) => x.id !== id),
          )
        ) {
          modal.close();
          render();
          notify("계획을 삭제했어요.");
        }
      };
      if (navigator.locks) await navigator.locks.request(keys.plans, remove);
      else remove();
    };
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-close")) modal.close();
    if (b.dataset.fav) {
      const id = b.dataset.fav,
        list = favorites(),
        active = list.includes(id);
      if (
        write(
          "favorites",
          active ? list.filter((x) => x !== id) : [...list, id],
        )
      ) {
        const container = b.closest(".card-grid").id;
        render();
        document
          .querySelector("#" + container + ' [data-fav="' + id + '"]')
          ?.focus({ preventScroll: true });
        notify(
          active ? "선호 운동에서 해제했어요." : "선호 운동에 추가했어요.",
        );
      }
    }
    if (b.dataset.select) {
      const w = M.byId(b.dataset.select);
      if (location.hash === "#favorites") {
        if (state.place !== "all" && !w.places.includes(state.place))
          state.place = w.places[0];
        if (w.gear !== "none") state.gear = w.gear;
        state.level = Math.max(w.level, state.level);
        location.hash = "planner";
      }
      state.selected = w.id;
      render();
      document
        .querySelector('#cards [data-select="' + w.id + '"]')
        ?.focus({ preventScroll: true });
      notify(w.name + " 선택 · " + state.minutes + "분");
    }
    if (b.dataset.remove) confirmRemove(b.dataset.remove);
    if (b.dataset.action === "planner") location.hash = "planner";
    if (b.dataset.action === "conditions") conditions();
  });
  $("set-conditions").onclick = conditions;
  $("filter-btn").onclick = conditions;
  $("set-time").onclick = () => timeEditor();
  $("edit-minutes").onclick = () => timeEditor();
  $("edit-weight").onclick = () => timeEditor(true);
  $("balance").oninput = (e) => {
    state.balance = +e.target.value;
    render();
  };
  $("next").onclick = planForm;
  route();
})();
