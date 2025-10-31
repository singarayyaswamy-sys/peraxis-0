class SecureMapLoader {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
  }

  async loadGoogleMaps() {
    if (window.google && window.google.maps) {
      this.isLoaded = true;
      return Promise.resolve();
    }

    if (this.isLoading) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadMapsScript();
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
    } catch (error) {
      this.isLoading = false;
      throw error;
    }

    return this.loadPromise;
  }

  async loadMapsScript() {
    try {
      const response = await fetch('http://localhost:8080/api/location/map-script');
      if (!response.ok) {
        throw new Error('Failed to load map script');
      }

      const scriptContent = await response.text();
      const scriptElement = document.createElement('script');
      scriptElement.textContent = scriptContent;
      document.head.appendChild(scriptElement);

      // Wait for Google Maps to load
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            resolve();
          } else if (window.googleMapsLoaded) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        
        checkLoaded();
        
        setTimeout(() => {
          if (!window.google) {
            reject(new Error('Google Maps failed to load'));
          }
        }, 10000);
      });

    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw error;
    }
  }

  async getMapConfig() {
    try {
      const response = await fetch('http://localhost:8080/api/location/map-config');
      if (!response.ok) {
        throw new Error('Failed to get map config');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting map config:', error);
      return {
        mapId: 'peraxis-location-map',
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 15
      };
    }
  }
}

export default new SecureMapLoader();