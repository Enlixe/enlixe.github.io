const MC_DAY = 1200000;
const MC_MONTH = 37200000;
const MC_YEAR = 446400000; //Real Life ms
const MC_HOUR = MC_DAY / 24;
const MC_MINUTE = MC_HOUR / 60;
const SB_NEWYEAR = 1560275700000; //Skyblock Year 1
const IRL_HOUR = 3600000;
const SB_SEASON_NAMES = [
  "Early Spring",
  "Spring",
  "Late Spring",

  "Early Summer",
  "Summer",
  "Late Summer",

  "Early Autumn",
  "Autumn",
  "Late Autumn",

  "Early Winter",
  "Winter",
  "Late Winter",
];

function formatTime(x) {
  x = Math.floor(x / 1000);
  var d = Math.floor(x / 86400);
  var h = Math.floor((x % 86400) / 3600);
  var m = Math.floor((x % 3600) / 60);
  var s = x % 60;

  var ret = "";
  if (x >= 3600) {
    if (x >= 86400) {
      ret += `${d}d `;
    }
    ret += `${h}h `;
  }
  ret += `${m}m ${s}s`;
  return ret;
}

function sbGetSeason(n) {
  return SB_SEASON_NAMES[n - 1];
}

var CUSTOM_OFFSET = 0;
window.__defineGetter__("FISHING_FESTIVAL", function () {
  return localStorage.FISHING_FESTIVAL === "true";
});
window.__defineSetter__("FISHING_FESTIVAL", function (x) {
  localStorage.FISHING_FESTIVAL = Boolean(x);
});

function sbGetYear(time) {
  var sbCurtime = (time - SB_NEWYEAR) % MC_YEAR;
  var sbCurYear = time - sbCurtime;
  return 1 + (sbCurYear - SB_NEWYEAR) / MC_YEAR;
}
function sbDayOfTheYear(time) {
  var sbCurtime = (time - SB_NEWYEAR) % MC_YEAR;
  return Math.floor(sbCurtime / MC_DAY) + 1;
}
function timeToSBDate(time, hours, obj) {
  var year = sbGetYear(time);
  time -= SB_NEWYEAR;
  var month = (Math.floor(time / MC_MONTH) % 12) + 1;
  var day = (Math.floor(time / MC_DAY) % 31) + 1;
  var hour = Math.floor(time / MC_HOUR) % 24;
  var min = Math.floor(time / MC_MINUTE) % 60;
  hour = hour.toString().padStart(2, 0);
  min = min.toString().padStart(2, 0);

  if (obj) {
    return {
      day: day,
      month: month,
      year: year,
      hour: hour,
      min: min,
    };
  }
  var daytime = hours ? ` ${hour}:${min}` : "";
  return `${day}/${month}/${year}${daytime}`;
}

function sbDate(d = 1, m = 1) {
  d = d - 1;
  m = m - 1;
  return d * MC_DAY + m * MC_MONTH;
}

function date2sbDate(curtime, raw) {
  curtime -= SB_NEWYEAR;
  if (raw) return curtime;
  return [
    Math.floor((curtime / MC_DAY) % 31) + 1,
    Math.floor((curtime / MC_MONTH) % 12) + 1,
    Math.floor(curtime / MC_YEAR) + 1,
  ];
}
function sbGetNextEvents() {
  var curtime = new Date().getTime() + CUSTOM_OFFSET;

  var sbCurtime = (curtime - SB_NEWYEAR) % MC_YEAR;
  var sbCurYear = curtime - sbCurtime;

  function fishingFestival(offset) {
    offset = offset || 1;
    if (sbCurtime % MC_MONTH < IRL_HOUR) {
      offset--;
    }
    var start = sbCurtime - (sbCurtime % MC_MONTH) + MC_MONTH * offset;
    var end = start + IRL_HOUR;
    return [start, end];
  }

  function specialMayorElections() {
    var SB_YEAR = sbGetYear(curtime);
    var SpecialYear = SB_YEAR % 8 !== 0 ? 8 - (SB_YEAR % 8) : 0;
    var SpecialDiff = SB_YEAR - Math.floor(SB_YEAR / 8) * 8;
    if (SpecialDiff === 1 && sbCurtime < sbDate(27, 3)) {
      return sbEvent(27 - 372, 6, 279);
    }
    return sbEvent(27 + 372 * SpecialYear, 6, 279);
  }

  function sbEvent(day, month, duration) {
    var start = sbDate(day, month);
    var end = start + MC_DAY * duration;
    if (end < sbCurtime) {
      start += MC_YEAR;
      end += MC_YEAR;
    }
    return [start, end];
  }

  function darkAuction() {
    var start = sbCurtime - (sbCurtime % IRL_HOUR) + IRL_HOUR;
    var end = start + 34166;
    return [start, end];
  }

  function jacobEvent() {
    var hmins = sbCurtime % IRL_HOUR;

    if (hmins < MC_DAY * 2) {
      hmins += IRL_HOUR;
    }
    var start = sbCurtime - hmins + IRL_HOUR + MC_DAY;
    var end = start + MC_DAY;
    return [start, end];
  }

  var sbEvents = [
    ["Election Over", sbEvent(27, 3, 0)],
    ["Traveling Zoo", sbEvent(1, 4, 3)],
    ["Election Start", sbEvent(27, 6, 0)],
    ["Spooky Festival", sbEvent(29, 8, 3)],
    ["Traveling Zoo", sbEvent(1, 10, 3)],
    ["Jerry's Workshop", sbEvent(1, 12, 31)],
    ["Season Of Jerry", sbEvent(24, 12, 3)],
    ["New Year Cake", sbEvent(29, 12, 3)],
    ["Dark Auction", darkAuction()],
    ["Jacob's Farming Contest", jacobEvent()],
    ["Special Mayor Election", specialMayorElections()],
  ];
  if (FISHING_FESTIVAL) {
    sbEvents.push(["Fishing Festival", fishingFestival()]);
    sbEvents.push(["Fishing Festival", fishingFestival(2)]);
    sbEvents.push(["Fishing Festival", fishingFestival(3)]);
    sbEvents.push(["Fishing Festival", fishingFestival(4)]);
    sbEvents.push(["Fishing Festival", fishingFestival(5)]);
    sbEvents.push(["Fishing Festival", fishingFestival(6)]);
  }
  //NextEvents =
  return sbEvents
    .sort((x, y) => x[1][0] > y[1][0])
    .map((x) => {
      return [
        x[0],
        {
          start: new Date(sbCurYear + x[1][0]),
          end: new Date(sbCurYear + x[1][1]),
          startTime: sbCurYear + x[1][0],
          endTime: sbCurYear + x[1][1],
          TimeLeft: sbCurYear + x[1][0] - curtime,
          SBDate: timeToSBDate(sbCurYear + x[1][0]),
        },
      ];
    });
}

function showNextEvents(update) {
  document.getElementById("fishFestCheck").checked = FISHING_FESTIVAL;

  var curtime = new Date().getTime() + CUSTOM_OFFSET;

  var SB_YEAR = sbGetYear(curtime);
  document.getElementById("sbYear").innerHTML =
    "CURRENT SKYBLOCK YEAR: " + SB_YEAR;
  var s = document.getElementById("events");
  if (!update) {
    clearInterval(window.UTL);
    s.classList.toggle("show");
  }
  if (!s.classList.contains("show")) {
    clearInterval(window.UTL);
    document.body.style.overflow = "";
    scrollTo(0, 0);
    return;
  }
  document.body.style.overflow = "hidden";
  window.UTL = setInterval(updateTimeLeft, 1000);

  var tb = document.getElementById("tbEvents");
  Array.from(tb.children).map((x) => {
    x.remove();
    return x;
  });
  var events = sbGetNextEvents();
  function ctd(val, parent) {
    var d = document.createElement("td");
    d.innerHTML = val;
    parent.appendChild(d);
    return d;
  }
  for (var k = 0; k < events.length; k++) {
    var v = events[k][1];
    var row = document.createElement("tr");
    //console.log(v);
    var eventName = events[k][0];
    var eventTitle = ctd(eventName, row);
    if (eventName == "Special Mayor Election") {
      eventTitle.style.backgroundColor = "#FF55FF";
    } else if (eventName == "Jerry's Workshop") {
      // Make the background White
      eventTitle.style.backgroundColor = "#FFFFFF";
      // Make the text Black
      eventTitle.style.color = "#000000";
    } else if (eventName == "Season Of Jerry") {
      // eventTitle.style.backgroundColor = "#FF55FF";
    } else if (eventName == "Dark Auction") {
      eventTitle.style.backgroundColor = "#000000";
      eventTitle.style.color = "#FFFFFF";
    } else if (eventName == "Jacob's Farming Contest") {
      // gold
      eventTitle.style.backgroundColor = "#FFD700";
    } else if (eventName == "Fishing Festival") {
      // light blue
      eventTitle.style.backgroundColor = "#ADD8E6";
      // Make the text Black
      eventTitle.style.color = "#000000";
    }
    ctd(v.start.toLocaleString(), row);
    ctd(v.end.toLocaleString(), row);
    var timeLeft = ctd(formatTime(v.TimeLeft), row);
    timeLeft.classList.add("eventTime");

    timeLeft.dataset.datetime = v.start.getTime();
    var endtime = v.end.getTime();
    timeLeft.dataset.endtime = endtime;

    if (v.TimeLeft < 0) {
      row.classList.add("eventActive");
      timeLeft.innerHTML = formatTime(endtime - curtime);
    } else if (v.TimeLeft < 600000) {
      row.classList.add("eventSoon");
    }

    ctd(sbGetSeason(timeToSBDate(v.startTime, false, true).month), row);
    ctd(v.SBDate, row);
    tb.appendChild(row);

    RELOAD_EVENT_TABLE_TIME = curtime + 60000 - (curtime % 60000); //600000 is 10 Minutes
  }
}
var RELOAD_EVENT_TABLE_TIME;
function updateTimeLeft() {
  var curtime = new Date().getTime() + CUSTOM_OFFSET;
  if (curtime > RELOAD_EVENT_TABLE_TIME) {
    showNextEvents(true);
    return;
  }
  Array.from(document.getElementsByClassName("eventTime")).map((x) => {
    var time = parseInt(x.dataset.datetime) - curtime;
    if (time < 0) {
      time = parseInt(x.dataset.endtime) - curtime;
      if (time < 0) {
        showNextEvents(true);
      }
    }
    //time=numeral(time/1000).format('0:0');
    x.innerHTML = formatTime(time);
    return x;
  });
}
