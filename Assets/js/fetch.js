async function fetchNearbyDepartures() {
  const url = "./.netlify/functions/bus";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function parseDepartures(data) {


  if (!data || !Array.isArray(data.Departure)) {
    return [];
  }

  return data.Departure.map((element) => {
    const dateStr = element.rtDate || element.date;
    const timeStr = element.rtTime || element.time;

    const [year, month, day] = dateStr.split("-").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);

    const departureDate = new Date(year, month - 1, day, hour, minute, 0, 0);

    return {
      line: element.ProductAtStop?.line || element.line,
      direction: element.direction,
      departureDate,
      timeLabel: timeStr.slice(0, 5), // HH:MM
    };
  });
}

function getMinutesUntil(departureDate) {
  const diffMs = departureDate - new Date();
  return Math.floor(diffMs / 60000);
}

function renderDepartures(departures) {
  const bustider = document.getElementById("bustider");
  if (!bustider) {
    return;
  }

  bustider.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "bus";
  bustider.appendChild(wrapper);

  const busHeader = document.createElement("div");
  busHeader.className = "bus-header";
  wrapper.appendChild(busHeader);

  const busIconLeft = document.createElement("div");
  busIconLeft.className = "bus-icon-left";
  busHeader.appendChild(busIconLeft);

  const busTitleWrap = document.createElement("div");
  busTitleWrap.className = "bus-title-wrap";
  busHeader.appendChild(busTitleWrap);

  const busTitle = document.createElement("span");
  busTitle.className = "bus-title";
  busTitle.textContent = "Bustider";
  busTitleWrap.appendChild(busTitle);

  const busIconRight = document.createElement("div");
  busIconRight.className = "bus-icon-right";
  busHeader.appendChild(busIconRight);

  const busList = document.createElement("ul");
  busList.className = "bus-list";
  wrapper.appendChild(busList);

  const upcoming = departures
    .map((d) => ({ ...d, minutesUntil: getMinutesUntil(d.departureDate) }))
    .filter((d) => d.minutesUntil >= 0)
    .sort((a, b) => a.departureDate - b.departureDate)
    .slice(0, 6);

  if (upcoming.length === 0) {
    bustider.innerHTML = "<h3>Ingen kommende afgange</h3>";
    return;
  }

  upcoming.forEach((d) => {
    const mins = d.minutesUntil === 0 ? "Nu" : `${d.minutesUntil} min`;

    const item = document.createElement("div");
    item.className="busTitle"

    const left = document.createElement("h3");
    left.textContent = `${d.line} ${d.direction}`;

    const right = document.createElement("h3");
    right.textContent = `${mins}`;

    item.appendChild(left);
    item.appendChild(right);

    busList.appendChild(item);
  });
}




function isWithinOperatingHours() {
  // Get current time in Copenhagen timezone
  const now = new Date();
  const copenhagenTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Copenhagen" }));
  const hour = copenhagenTime.getHours();
  
  // Check if time is between 6:00 and 23:00 (6am to 11pm)
  return hour >= 6 && hour < 23;
}

async function updateBusTimes() {
  // Check if we're within operating hours (6am - 11pm Copenhagen time)
  if (!isWithinOperatingHours()) {
    return;
  }

  try {
    const data = await fetchNearbyDepartures();
    const departures = parseDepartures(data);
    renderDepartures(departures);

  } catch (err) {
    console.error("Fejl ved bustider", err);
  }
}


updateBusTimes();  

setInterval(updateBusTimes, 55000);   // update every 55 sec