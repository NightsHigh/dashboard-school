export function showWeatherLoading(container) {
  container.innerHTML = '<p>Henter vejr...</p>'
}

export function showWeatherError(container) {
  container.innerHTML = '<p>Kunne ikke hente vejret.</p>'
}

export function showWeatherEmpty(container) {
  container.innerHTML = '<p>Ingen vejrdata.</p>'
}

export function renderWeather(container, weather) {
  if (!weather) {
    showWeatherEmpty(container)
    return
  }

  const { temp, description } = weather

  container.innerHTML = `
    <div class="weather">
      <div class="weather-temp">
        <span class="value">${temp}</span><span class="deg">°</span>
      </div>
    </div>
  `
}
