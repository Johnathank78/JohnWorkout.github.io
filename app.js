// Workouts - export only.
// Reads the data the Workouts PWA left in localStorage on this origin and
// exports it in the exact same format as the app (session_list.txt, reminder_list.txt,
// parameters.txt, stats.txt, weights.txt), ready to be imported in the new app.

const TEXT = {
    french: {
        selectElements: "Choisissez",
        sessionList: "Seances",
        reminderList: "Rappels",
        preferences: "Paramètres",
        stats: "Statistiques",
        weightList: "Pesés",
        emptyMessage: "Aucun élément sauvegardé",
        export: "Exporter",
        submit: "Confirmer",
        exported: "Données exportées avec succès",
        write: "Permission d'écriture refusée",
        nothing: "Rien n'est sélectionné"
    },
    english: {
        selectElements: "Select elements",
        sessionList: "Sessions",
        reminderList: "Reminders",
        preferences: "Preferences",
        stats: "Statistics",
        weightList: "Weights",
        emptyMessage: "Nothing saved",
        export: "Export",
        submit: "Submit",
        exported: "Data successfully exported",
        write: "Write permission error",
        nothing: "Nothing selected"
    }
};

// ---------- Storage (same keys as the app) ----------

function readJSON(key, fallback){
    try{
        const raw = localStorage.getItem(key);
        if(raw === null || raw === "") return fallback;
        return JSON.parse(raw);
    }catch(e){
        console.error("Unreadable key: " + key, e);
        return fallback;
    }
}

const hasParameters = (() => { try{ return !!localStorage.getItem("parameterss"); }catch(e){ return false; } })();

const session_list  = readJSON("sessions_list", []);
const reminder_list = readJSON("reminders_list", []);
const parameters    = readJSON("parameterss", { language: "english", weightUnit: "kg" });
const stats         = readJSON("stats", null);
const weightData    = readJSON("weightData", {});

const lang = TEXT[parameters.language] ? parameters.language : "english";
const T = TEXT[lang];
const unit = parameters.weightUnit || "kg";

// ---------- Unit conversion (copied from the app) ----------

function convertToUnit(val, from, to){
    let out = false;

    if(from == "lbs" && to == "kg"){
        out = (val * 0.453592);
        if(parseInt(out) == out) out = parseInt(out);
    }else if(from == "kg" && to == "lbs"){
        out = (val * 2.2046223302272);
        if(parseInt(out) == out) out = parseInt(out);
    }else if(from == to){
        out = val;
    }

    return out;
}

function updateSessionUnits(data, from, to){
    return data.map(session => {
        if(session.type == "W"){
            return {
                ...session,
                exoList: session.exoList.map(exo => {
                    if(exo.type == "Uni." || exo.type == "Bi."){
                        return { ...exo, weight: convertToUnit(exo.weight, from, to) };
                    }
                    return exo;
                })
            };
        }
        return session;
    });
}

function updateTrackerUnits(data, from, to){
    return Object.keys(data).reduce((acc, key) => {
        acc[key] = convertToUnit(data[key], from, to);
        return acc;
    }, {});
}

// ---------- DOM ----------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const page          = $(".saveLoad_page");
const header        = $(".saveLoad_headerText");
const mainContainer = $(".saveLoad_mainContainer");
const sessionCont   = $(".saveLoad_sessionContainer");
const reminderCont  = $(".saveLoad_reminderContainer");
const submitBtn     = $(".saveLoad_btn_submit");
const emptyMsg      = $(".saveLoad_emptyMsg");
const notif         = $(".bottomNotification");

const cbSL = $("#saveLoad_sl");
const cbRL = $("#saveLoad_rl");
const cbPA = $("#saveLoad_pa");
const cbST = $("#saveLoad_st");
const cbWE = $("#saveLoad_we");

let subPage = "main";
let sessionChecked  = generateCheckedList(session_list, false);
let reminderChecked = generateCheckedList(reminder_list, false);

function generateCheckedList(data, fill){
    const out = {};
    data.forEach(item => { out[item.id] = fill; });
    return out;
}

function escapeHTML(str){
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
}

function generateCheckedItems(data, container){
    container.innerHTML = data.map(item =>
        '<div class="saveLoad_item"><input type="checkbox" name="' + escapeHTML(item.id) + '" class="saveLoad_checkbox">' +
        '<span class="saveLoad_itemText">' + escapeHTML(item.name) + '</span></div>'
    ).join("");
}

function applyLanguage(){
    document.documentElement.lang = lang == "french" ? "fr" : "en";
    header.textContent = T.selectElements;
    cbSL.parentElement.querySelector(".saveLoad_itemText").textContent = T.sessionList;
    cbRL.parentElement.querySelector(".saveLoad_itemText").textContent = T.reminderList;
    cbPA.parentElement.querySelector(".saveLoad_itemText").textContent = T.preferences;
    cbST.parentElement.querySelector(".saveLoad_itemText").textContent = T.stats;
    cbWE.parentElement.querySelector(".saveLoad_itemText").textContent = T.weightList;
    emptyMsg.textContent = T.emptyMessage;
    submitBtn.textContent = T.export;
}

function statsIsEmpty(s){
    if(!s) return true;
    return Object.entries(s).every(([k, v]) => k === "since" || k === "missedSessions" || v === 0);
}

function setVisible(el, visible, display = "flex"){
    el.style.display = visible ? display : "none";
}

function showPage(name){
    subPage = name;
    setVisible(mainContainer, name == "main");
    setVisible(sessionCont,  name == "session");
    setVisible(reminderCont, name == "reminder");
    submitBtn.textContent = name == "main" ? T.export : T.submit;
}

function init(){
    applyLanguage();

    generateCheckedItems(session_list, sessionCont);
    generateCheckedItems(reminder_list, reminderCont);

    const show = {
        sl: session_list.length > 0,
        rl: reminder_list.length > 0,
        pa: hasParameters,
        st: !statsIsEmpty(stats),
        we: weightData && Object.keys(weightData).length > 0
    };

    setVisible(cbSL.parentElement, show.sl);
    setVisible(cbRL.parentElement, show.rl);
    setVisible(cbPA.parentElement, show.pa);
    setVisible(cbST.parentElement, show.st);
    setVisible(cbWE.parentElement, show.we);

    const atLeastOne = Object.values(show).some(Boolean);
    setVisible(emptyMsg, !atLeastOne, "inline-block");
    setVisible(submitBtn, atLeastOne);
    setVisible(header, atLeastOne, "inline-block");

    showPage("main");
}

// ---------- Selection ----------

function syncSubCheckboxes(container, checkedMap){
    $$(".saveLoad_checkbox", container).forEach(cb => {
        cb.checked = !!checkedMap[cb.name];
    });
}

function onCheckboxChange(cb){
    if(cb === cbSL){
        sessionChecked = generateCheckedList(session_list, cb.checked);
        syncSubCheckboxes(sessionCont, sessionChecked);
        cbSL.classList.remove("partial");
    }else if(cb === cbRL){
        reminderChecked = generateCheckedList(reminder_list, cb.checked);
        syncSubCheckboxes(reminderCont, reminderChecked);
        cbRL.classList.remove("partial");
    }
}

function setChecked(cb, value){
    if(cb.checked === value) return;
    cb.checked = value;
    onCheckboxChange(cb);
}

page.addEventListener("change", e => {
    if(e.target.classList.contains("saveLoad_checkbox")) onCheckboxChange(e.target);
});

page.addEventListener("click", e => {
    const goTo = e.target.closest(".saveLoad_goTo");
    if(goTo){
        const cb = goTo.parentElement.querySelector(".saveLoad_checkbox");
        if(cb === cbSL){ syncSubCheckboxes(sessionCont, sessionChecked); showPage("session"); }
        if(cb === cbRL){ syncSubCheckboxes(reminderCont, reminderChecked); showPage("reminder"); }
        return;
    }

    // Clicking the label toggles the checkbox (like the app)
    if(e.target.classList.contains("saveLoad_checkbox")) return;
    const item = e.target.closest(".saveLoad_item");
    if(item){
        const cb = item.querySelector(".saveLoad_checkbox");
        setChecked(cb, !cb.checked);
    }
});

// Touch: slide a finger over checkboxes to tick / untick many at once (like the app)
let isDragging = false;
let dragValue = null;

[mainContainer, sessionCont, reminderCont].forEach(container => {
    container.addEventListener("touchstart", e => {
        const cb = e.target.closest(".saveLoad_checkbox");
        if(!cb) return;
        e.preventDefault();
        isDragging = true;
        dragValue = !cb.checked;
        setChecked(cb, dragValue);
    }, { passive: false });

    container.addEventListener("touchmove", e => {
        if(!isDragging) return;
        e.preventDefault();
        const t = e.touches[0];
        const below = document.elementFromPoint(t.clientX, t.clientY);
        const item = below && below.closest(".saveLoad_item");
        if(item && container.contains(item)) setChecked(item.querySelector(".saveLoad_checkbox"), dragValue);
    }, { passive: false });

    const stop = () => { isDragging = false; dragValue = null; };
    container.addEventListener("touchend", stop);
    container.addEventListener("touchcancel", stop);
});

function submitSubPage(container, list, mainCb, setMap){
    const map = generateCheckedList(list, false);
    let count = 0;
    $$(".saveLoad_checkbox", container).forEach(cb => {
        if(cb.checked){ map[cb.name] = true; count++; }
    });
    setMap(map);

    mainCb.checked = count > 0;
    mainCb.classList.toggle("partial", count > 0 && count < list.length);
    showPage("main");
}

// ---------- Export ----------

function buildFiles(){
    const files = [];
    const mk = (data, name) => new File([JSON.stringify(data)], name, { type: "text/plain" });

    if(cbSL.checked){
        const selected = session_list.filter(s => sessionChecked[s.id]);
        files.push(mk(updateSessionUnits(selected, unit, "kg"), "session_list.txt"));
    }
    if(cbRL.checked){
        files.push(mk(reminder_list.filter(r => reminderChecked[r.id]), "reminder_list.txt"));
    }
    if(cbPA.checked) files.push(mk(parameters, "parameters.txt"));
    if(cbST.checked) files.push(mk(stats, "stats.txt"));
    if(cbWE.checked) files.push(mk(updateTrackerUnits(weightData, unit, "kg"), "weights.txt"));

    return files;
}

async function saveToFolder(files){
    const dir = await window.showDirectoryPicker({ mode: "readwrite" });
    for(const file of files){
        const handle = await dir.getFileHandle(file.name, { create: true });
        const w = await handle.createWritable();
        await w.write(file);
        await w.close();
    }
}

async function downloadFiles(files){
    for(const file of files){
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        await new Promise(r => setTimeout(r, 300));
    }
}

async function exportFiles(files){
    // 1. Desktop Chromium: pick a folder, write every file in it (same as the app)
    if(typeof window.showDirectoryPicker === "function"){
        try{
            await saveToFolder(files);
            return "ok";
        }catch(e){
            if(e && e.name === "AbortError") return "cancel";
            console.warn("Folder write failed, falling back", e);
        }
    }

    // 2. Mobile: share sheet (save to Files / Drive / send to yourself)
    if(navigator.canShare && navigator.canShare({ files })){
        try{
            await navigator.share({ files });
            return "ok";
        }catch(e){
            if(e && e.name === "AbortError") return "cancel";
            console.warn("Share failed, falling back", e);
        }
    }

    // 3. Last resort: classic downloads
    try{
        await downloadFiles(files);
        return "ok";
    }catch(e){
        console.error(e);
        return "error";
    }
}

let notifTimer = null;
function notify(msg, isError = false){
    notif.textContent = msg;
    notif.classList.toggle("error", isError);
    notif.classList.add("show");
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => notif.classList.remove("show"), 2500);
}

submitBtn.addEventListener("click", async () => {
    if(subPage == "session"){
        submitSubPage(sessionCont, session_list, cbSL, m => { sessionChecked = m; });
        return;
    }
    if(subPage == "reminder"){
        submitSubPage(reminderCont, reminder_list, cbRL, m => { reminderChecked = m; });
        return;
    }

    const files = buildFiles();
    if(files.length == 0){
        notify(T.nothing, true);
        return;
    }

    const result = await exportFiles(files);
    if(result == "ok") notify(T.exported);
    else if(result == "error") notify(T.write, true);
});

init();
