// Load Google Maps API through backend
function loadGoogleMaps() {
  if (window.google && window.google.maps) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    fetch('http://localhost:8080/api/location/maps-config')
      .then(response => response.json())
      .then(config => {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places,marker&loading=async`
        script.async = true
        script.defer = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      .catch(reject)
  })
}

// Auto-load when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGoogleMaps)
} else {
  loadGoogleMaps()
}