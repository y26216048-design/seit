(() => {
  const $ = (s, root = document) => root.querySelector(s),
    $$ = (s, root = document) => [...root.querySelectorAll(s)];
  function fitLayout() {
    document.documentElement.style.setProperty(
      "--layout-scale",
      window.innerWidth > 900 ? window.innerWidth / 1280 : 1,
    );
  }
  fitLayout();
  window.addEventListener("resize", fitLayout);
  const views = ["search", "tickets", "profile"];
  function setView(name) {
    views.forEach((v) => {
      $("#view-" + v).classList.toggle("active", v === name);
      $$('[data-view="' + v + '"]').forEach((b) =>
        b.classList.toggle("active", v === name),
      );
    });
    window.scrollTo(0, 0);
  }
  $$("[data-view]").forEach((b) => (b.onclick = () => setView(b.dataset.view)));
  const cities = [
    "Москва (SVO)",
    "Санкт-Петербург (LED)",
    "Сочи (AER)",
    "Казань (KZN)",
    "Калининград (KGD)",
  ];
  const fields = $$(".search-card .field");
  fields[0].querySelector(".value").innerHTML =
    '<select aria-label="Откуда">' +
    cities.map((x) => "<option>" + x + "</option>").join("") +
    "</select>";
  fields[1].querySelector(".value").innerHTML =
    '<select aria-label="Куда">' +
    cities
      .map(
        (x, i) =>
          "<option " + (i === 1 ? "selected" : "") + ">" + x + "</option>",
      )
      .join("") +
    "</select>";
  fields[2].querySelector(".value").innerHTML =
    '<button class="date-display" type="button" aria-label="Выбрать дату вылета" aria-haspopup="dialog">15 ноя 2026</button><input aria-label="Дата вылета" type="date" value="2026-11-15" hidden>';
  fields[3].querySelector(".value").innerHTML =
    '<select aria-label="Пассажиры"><option value="1">1 пассажир</option><option value="2">2 пассажира</option><option value="3">3 пассажира</option><option value="4">4 пассажира</option></select>';
  const from = $("select", fields[0]),
    to = $("select", fields[1]),
    date = $("input", fields[2]);
  date.onchange = () => {
    const d = new Date(date.value + "T12:00:00");
    $(".date-display").textContent = Number.isNaN(d.getTime())
      ? "Выберите дату"
      : new Intl.DateTimeFormat("ru-RU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
          .format(d)
          .replace(" г.", "");
  };
  $(".date-display").onclick = () => {
    const selected = new Date(date.value + "T12:00:00");
    let month = new Date(selected.getFullYear(), selected.getMonth(), 1);
    function draw() {
      const year = month.getFullYear(),
        index = month.getMonth(),
        offset = (new Date(year, index, 1).getDay() + 6) % 7,
        days = new Date(year, index + 1, 0).getDate();
      const key = (day) =>
        year +
        "-" +
        String(index + 1).padStart(2, "0") +
        "-" +
        String(day).padStart(2, "0");
      const label = new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(month);
      dialog.innerHTML =
        '<h2>Дата вылета</h2><div class="calendar-head"><button type="button" data-prev aria-label="Предыдущий месяц">‹</button><strong>' +
        label +
        '</strong><button type="button" data-next aria-label="Следующий месяц">›</button></div><div class="calendar-grid">' +
        ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
          .map((d) => '<span class="weekday">' + d + "</span>")
          .join("") +
        Array(offset).fill("<span></span>").join("") +
        Array.from(
          { length: days },
          (_, i) =>
            '<button type="button" data-date="' +
            key(i + 1) +
            '" class="' +
            (key(i + 1) === date.value ? "selected" : "") +
            '" aria-label="' +
            key(i + 1) +
            '">' +
            (i + 1) +
            "</button>",
        ).join("") +
        '</div><div class="modal-actions"><button type="button" data-close>Закрыть</button></div>';
      $("[data-prev]", dialog).onclick = () => {
        month = new Date(year, index - 1, 1);
        draw();
      };
      $("[data-next]", dialog).onclick = () => {
        month = new Date(year, index + 1, 1);
        draw();
      };
      $$("[data-date]", dialog).forEach(
        (b) =>
          (b.onclick = () => {
            date.value = b.dataset.date;
            date.dispatchEvent(new Event("change"));
            dialog.close();
          }),
      );
      $("[data-close]", dialog).onclick = () => dialog.close();
    }
    draw();
    dialog.showModal();
  };
  function updateFieldLabels() {
    [0, 1, 3].forEach((index) => {
      const field = fields[index],
        select = $("select", field);
      let label = $(".field-choice-label", field);
      if (!label) {
        label = document.createElement("span");
        label.className = "field-choice-label";
        $(".value", field).append(label);
      }
      label.textContent = select.selectedOptions[0].textContent;
    });
  }
  [0, 1, 3].forEach((index) => {
    const field = fields[index],
      select = $("select", field);
    select.hidden = true;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "field-trigger";
    trigger.setAttribute(
      "aria-label",
      [
        "Выбрать город вылета",
        "Выбрать город прилёта",
        "",
        "Выбрать количество пассажиров",
      ][index],
    );
    trigger.setAttribute("aria-haspopup", "dialog");
    field.append(trigger);
    const chevron = document.createElement("i");
    chevron.setAttribute("data-lucide", "chevron-down");
    chevron.className = "field-chevron";
    field.append(chevron);
    trigger.onclick = () => {
      show(
        "<h2>" +
          ["Откуда", "Куда", "", "Пассажиры"][index] +
          '</h2><div class="field-options">' +
          [...select.options]
            .map(
              (o) =>
                '<button type="button" data-value="' +
                escape(o.value) +
                '" class="' +
                (o.selected ? "selected" : "") +
                '">' +
                escape(o.textContent) +
                "</button>",
            )
            .join("") +
          '</div><div class="modal-actions"><button type="button" data-close>Закрыть</button></div>',
      );
      $$("[data-value]", dialog).forEach(
        (button) =>
          (button.onclick = () => {
            select.value = button.dataset.value;
            select.dispatchEvent(new Event("change"));
            updateFieldLabels();
            dialog.close();
          }),
      );
    };
    select.addEventListener("change", updateFieldLabels);
  });
  updateFieldLabels();
  fields[2].onclick = (e) => {
    if (!e.target.closest(".date-display")) $(".date-display").click();
  };
  $(".swap").setAttribute("aria-label", "Поменять города местами");
  $(".swap").title = "Поменять города местами";
  $(".swap").onclick = () => {
    [from.value, to.value] = [to.value, from.value];
    updateFieldLabels();
  };
  const rows = $$(".result-row"),
    heading = $(".results-head h3");
  heading.textContent = "Найдено рейсов: " + rows.length;
  $(".search-btn").onclick = () => {
    if (from.value === to.value) {
      alert("Выберите разные города вылета и прилёта.");
      return;
    }
    rows.forEach((row) => {
      $$(".time small", row)[0].textContent = from.value;
      $$(".time small", row)[1].textContent = to.value;
    });
  };
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }
  let profile = read("avia-profile-v2", {}),
    bookings = read("avia-bookings-v1", []);
  if (!Array.isArray(bookings)) bookings = [];
  const dialog = $("#dialog");
  function show(html) {
    dialog.innerHTML = html;
    dialog.showModal();
    const close = $("[data-close]", dialog);
    if (close) close.onclick = () => dialog.close();
  }
  const form = document.createElement("form");
  form.id = "profile-form";
  form.className = "info-grid";
  const profileFields = [
    ["name", "Фамилия, имя и отчество", "text"],
    ["birthday", "Дата рождения", "date"],
    ["phone", "Номер телефона", "tel"],
    ["email", "Электронная почта", "email"],
  ];
  const oldGrid = $(".info-grid");
  $$(".info-box", oldGrid).forEach((box, i) => {
    const [key, label, type] = profileFields[i];
    const input = document.createElement("input");
    input.type = type;
    input.name = key;
    input.required = true;
    input.value = profile[key] || "";
    input.placeholder =
      {
        name: "Иванов Иван Иванович",
        phone: "+7 (999) 123-45-67",
        email: "name@example.ru",
      }[key] || label;
    input.autocomplete = {
      name: "name",
      birthday: "bday",
      phone: "tel",
      email: "email",
    }[key];
    input.id = "profile-" + key;
    const caption = $(".small", box);
    caption.textContent = label;
    input.setAttribute("aria-label", label);
    $(".big", box).replaceChildren(input);
    form.append(box);
  });
  oldGrid.replaceWith(form);
  const phone = form.elements.phone;
  function formatPhone(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.length === 10) digits = "7" + digits;
    if (digits.length === 11 && ["7", "8"].includes(digits[0]))
      return (
        "+7 (" +
        digits.slice(1, 4) +
        ") " +
        digits.slice(4, 7) +
        "-" +
        digits.slice(7, 9) +
        "-" +
        digits.slice(9, 11)
      );
    return value;
  }
  phone.value = formatPhone(phone.value);
  phone.inputMode = "tel";
  phone.oninput = () => phone.setCustomValidity("");
  phone.onblur = () => {
    phone.value = formatPhone(phone.value);
    const count = phone.value.replace(/\D/g, "").length;
    phone.setCustomValidity(
      phone.value && (count < 10 || count > 15)
        ? "Введите номер телефона полностью."
        : "",
    );
  };
  const submit = $(".edit-btn");
  submit.hidden = false;
  submit.textContent = "Сохранить данные";
  submit.type = "submit";
  submit.setAttribute("form", "profile-form");
  const actions = document.createElement("div");
  actions.className = "profile-actions";
  actions.append(submit);
  $(".details-card").append(actions);
  const erase = document.createElement("button");
  erase.type = "button";
  erase.className = "delete-profile";
  erase.textContent = "Удалить данные";
  actions.append(erase);
  $(".details-head p").textContent = "Ваши данные для оформления авиабилетов";
  function registered() {
    return ["name", "birthday", "phone", "email"].every(
      (key) => typeof profile[key] === "string" && profile[key].trim(),
    );
  }
  function profileName() {
    erase.hidden = !registered();
    submit.textContent = registered()
      ? "Сохранить данные"
      : "Зарегистрироваться";
    $(".details-head p").textContent = profile.name
      ? "Данные пассажира: " + profile.name
      : "Заполните данные пассажира для оформления билетов";
  }
  profileName();
  $(".info-note").hidden = true;
  $(".info-note").setAttribute("role", "status");
  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    for (const key of ["name", "birthday", "phone", "email"])
      data[key] = data[key].trim();
    if (!data.name) {
      form.elements.name.focus();
      return;
    }
    $(".info-note").hidden = false;
    if (!save("avia-profile-v2", data)) {
      $(".info-note").textContent =
        "Не удалось сохранить данные. Попробуйте ещё раз.";
      return;
    }
    const first = !registered();
    profile = data;
    profileName();
    $(".info-note").textContent = first
      ? "Регистрация завершена."
      : "Данные сохранены.";
  };

  erase.onclick = () => {
    show(
      '<h2>Удалить данные профиля?</h2><p>ФИО, дата рождения, телефон и почта будут удалены. Оформленные билеты останутся.</p><div class="modal-actions"><button type="button" data-close>Отмена</button><button type="button" class="confirm" data-delete>Удалить данные</button></div>',
    );
    $("[data-delete]", dialog).onclick = () => {
      try {
        localStorage.removeItem("avia-profile-v2");
      } catch (e) {
        return;
      }
      profile = {};
      form.reset();
      $$("input", form).forEach((input) => (input.value = ""));
      profileName();
      $(".info-note").hidden = false;
      $(".info-note").textContent = "Данные удалены.";
      dialog.close();
    };
  };
  function readableDate(value) {
    const d = new Date(value + "T12:00:00");
    return Number.isNaN(d.getTime())
      ? value
      : new Intl.DateTimeFormat("ru-RU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
          .format(d)
          .replace(" г.", "");
  }
  function renderTickets() {
    const list = $(".ticket-list");
    const shown = bookings;
    list.innerHTML = shown.length
      ? shown
          .map(
            (t) =>
              `<article class="booked-ticket"><div class="booked-main"><div class="booked-head"><strong>${escape(t.airline)}</strong></div><p class="booking-number">${escape(t.flight)} · Заказ ${escape(t.id)}</p><div class="booked-route"><div><b>${escape(t.departure)}</b><span>${escape(t.from)}</span></div><div class="booked-duration">${escape(t.duration)}<div class="ticket-flight-path"><span></span><i data-lucide="plane"></i><span></span></div></div><div><b>${escape(t.arrival)}</b><span>${escape(t.to)}</span></div></div><div class="booked-foot"><span>${escape(readableDate(t.date))}</span><span>Пассажир: ${escape(t.passenger)}</span><span>${escape(t.count)} пасс.</span></div></div><div class="booked-price"><span>Стоимость</span><strong>${new Intl.NumberFormat("ru-RU").format(t.price)} ₽</strong></div></article>`,
          )
          .join("")
      : `<div class="guest-tickets"><h2>${bookings.length ? "В этой категории пока нет билетов" : "У вас пока нет билетов"}</h2><p>Выберите рейс и нажмите «Купить».</p><button class="guest-search">Найти рейсы</button></div>`;
    lucide.createIcons();
    const search = $(".guest-search");
    if (search) search.onclick = () => setView("search");
  }
  renderTickets();
  $$(".pick-btn").forEach(
    (btn) =>
      (btn.onclick = () => {
        if (from.value === to.value || !date.value) {
          show(
            "<h2>Проверьте маршрут</h2><p>Укажите разные города и дату вылета.</p><button data-close>Закрыть</button>",
          );
          return;
        }
        const row = btn.closest(".result-row"),
          count = Number($("select", fields[3]).value),
          price =
            Number($(".price", row).textContent.replace(/\D/g, "")) * count;
        show(
          `<h2>Оформление билета</h2><p>${escape($(".airline-name", row).textContent)} · ${escape($(".airline-sub", row).textContent)}</p><p>${escape(from.value)} → ${escape(to.value)}</p><p>${escape($(".date-display").textContent)} · ${count} пасс.</p><form id="purchase-form"><p class="purchase-price">${new Intl.NumberFormat("ru-RU").format(price)} ₽</p><p class="purchase-error" role="status" hidden></p><div class="modal-actions"><button type="button" data-close>Отмена</button><button class="confirm" type="submit">Купить</button></div></form>`,
        );
        $("#purchase-form").onsubmit = (e) => {
          e.preventDefault();
          if (!registered()) {
            dialog.close();
            show(
              '<h2>Сначала зарегистрируйтесь</h2><p>Заполните и сохраните данные в разделе «Мой профиль».</p><div class="modal-actions"><button type="button" data-close>Закрыть</button><button type="button" class="confirm" data-register>Мой профиль</button></div>',
            );
            $("[data-register]", dialog).onclick = () => {
              dialog.close();
              setView("profile");
              form.elements.name.focus();
            };
            return;
          }
          const passenger = profile.name;
          const ticket = {
            id: Date.now().toString(36).toUpperCase(),
            airline: $(".airline-name", row).textContent,
            flight: $(".airline-sub", row).textContent,
            from: from.value,
            to: to.value,
            date: date.value,
            departure: $(".time", row).childNodes[0].textContent.trim(),
            arrival: $$(".time", row)[1].childNodes[0].textContent.trim(),
            duration: $$("span", $(".route-line", row))[1].textContent,
            passenger,
            count,
            price,
          };
          const next = [ticket, ...bookings];
          if (!save("avia-bookings-v1", next)) {
            let warning = $(".purchase-error", dialog);
            warning.hidden = false;
            warning.textContent =
              "Не удалось сохранить билет в браузере. Проверьте настройки хранения.";
            return;
          }
          bookings = next;
          renderTickets();
          dialog.close();
          setView("tickets");
        };
      }),
  );

  // Единый набор тонких контурных значков для всех разделов.
  function icon(selector, name) {
    $$(selector).forEach((el) => {
      const old = el.querySelector("svg");
      if (old) {
        const i = document.createElement("i");
        i.setAttribute("data-lucide", name);
        old.replaceWith(i);
      }
    });
  }
  icon('.nav-btn[data-view="search"]', "search");
  icon('.nav-btn[data-view="tickets"]', "ticket");
  icon(".profile-chip", "user-round");
  ["plane-takeoff", "plane-landing", "calendar-days", "user-round"].forEach(
    (name, i) => icon(".search-card .field:nth-of-type(" + (i + 1) + ")", name),
  );
  icon(".search-btn", "search");
  ["user-round", "calendar-days", "phone", "mail"].forEach((name, i) =>
    icon(".info-box:nth-child(" + (i + 1) + ")", name),
  );
  icon(".info-note", "info");
  $$(".route-line").forEach((el) => {
    const spans = $$("span", el);
    [spans[0], spans[spans.length - 1]].forEach((span) => {
      span.innerHTML = '<i data-lucide="plane"></i>';
    });
  });
  $(".swap").innerHTML = '<i data-lucide="arrow-left-right"></i>';
  lucide.createIcons();
})();
