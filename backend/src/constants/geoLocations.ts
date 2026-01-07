// Geo locations with accurate lat/lng coordinates
// Used for geographic NPS visualization

export interface GeoLocation {
  city: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
}

export const GEO_LOCATIONS: Record<string, GeoLocation> = {
  // Europe
  prague: { city: "Prague", country: "Czech Republic", region: "Europe", lat: 50.0755, lng: 14.4378 },
  berlin: { city: "Berlin", country: "Germany", region: "Europe", lat: 52.5200, lng: 13.4050 },
  london: { city: "London", country: "UK", region: "Europe", lat: 51.5074, lng: -0.1278 },
  paris: { city: "Paris", country: "France", region: "Europe", lat: 48.8566, lng: 2.3522 },
  amsterdam: { city: "Amsterdam", country: "Netherlands", region: "Europe", lat: 52.3676, lng: 4.9041 },
  dublin: { city: "Dublin", country: "Ireland", region: "Europe", lat: 53.3498, lng: -6.2603 },
  madrid: { city: "Madrid", country: "Spain", region: "Europe", lat: 40.4168, lng: -3.7038 },
  stockholm: { city: "Stockholm", country: "Sweden", region: "Europe", lat: 59.3293, lng: 18.0686 },
  zurich: { city: "Zurich", country: "Switzerland", region: "Europe", lat: 47.3769, lng: 8.5417 },
  
  // North America
  sanFrancisco: { city: "San Francisco", country: "USA", region: "North America", lat: 37.7749, lng: -122.4194 },
  newYork: { city: "New York", country: "USA", region: "North America", lat: 40.7128, lng: -74.0060 },
  seattle: { city: "Seattle", country: "USA", region: "North America", lat: 47.6062, lng: -122.3321 },
  austin: { city: "Austin", country: "USA", region: "North America", lat: 30.2672, lng: -97.7431 },
  toronto: { city: "Toronto", country: "Canada", region: "North America", lat: 43.6532, lng: -79.3832 },
  vancouver: { city: "Vancouver", country: "Canada", region: "North America", lat: 49.2827, lng: -123.1207 },
  mexicoCity: { city: "Mexico City", country: "Mexico", region: "North America", lat: 19.4326, lng: -99.1332 },
  
  // South America
  saoPaulo: { city: "São Paulo", country: "Brazil", region: "South America", lat: -23.5505, lng: -46.6333 },
  buenosAires: { city: "Buenos Aires", country: "Argentina", region: "South America", lat: -34.6037, lng: -58.3816 },
  bogota: { city: "Bogotá", country: "Colombia", region: "South America", lat: 4.7110, lng: -74.0721 },
  
  // Asia Pacific
  bangalore: { city: "Bangalore", country: "India", region: "Asia Pacific", lat: 12.9716, lng: 77.5946 },
  mumbai: { city: "Mumbai", country: "India", region: "Asia Pacific", lat: 19.0760, lng: 72.8777 },
  delhi: { city: "Delhi", country: "India", region: "Asia Pacific", lat: 28.6139, lng: 77.2090 },
  tokyo: { city: "Tokyo", country: "Japan", region: "Asia Pacific", lat: 35.6762, lng: 139.6503 },
  singapore: { city: "Singapore", country: "Singapore", region: "Asia Pacific", lat: 1.3521, lng: 103.8198 },
  sydney: { city: "Sydney", country: "Australia", region: "Asia Pacific", lat: -33.8688, lng: 151.2093 },
  melbourne: { city: "Melbourne", country: "Australia", region: "Asia Pacific", lat: -37.8136, lng: 144.9631 },
  seoul: { city: "Seoul", country: "South Korea", region: "Asia Pacific", lat: 37.5665, lng: 126.9780 },
  shanghai: { city: "Shanghai", country: "China", region: "Asia Pacific", lat: 31.2304, lng: 121.4737 },
  hongKong: { city: "Hong Kong", country: "China", region: "Asia Pacific", lat: 22.3193, lng: 114.1694 },
  
  // Middle East & Africa
  dubai: { city: "Dubai", country: "UAE", region: "Middle East", lat: 25.2048, lng: 55.2708 },
  telAviv: { city: "Tel Aviv", country: "Israel", region: "Middle East", lat: 32.0853, lng: 34.7818 },
  cairo: { city: "Cairo", country: "Egypt", region: "Africa", lat: 30.0444, lng: 31.2357 },
  johannesburg: { city: "Johannesburg", country: "South Africa", region: "Africa", lat: -26.2041, lng: 28.0473 },
  nairobi: { city: "Nairobi", country: "Kenya", region: "Africa", lat: -1.2921, lng: 36.8219 },
};

// Helper function to get location by key
export const getLocation = (key: string): GeoLocation | undefined => {
  return GEO_LOCATIONS[key];
};

// Get all locations in a region
export const getLocationsByRegion = (region: string): GeoLocation[] => {
  return Object.values(GEO_LOCATIONS).filter(loc => loc.region === region);
};

// Get all unique regions
export const getRegions = (): string[] => {
  return [...new Set(Object.values(GEO_LOCATIONS).map(loc => loc.region))];
};

/**
 * Project lat/lng to Mercator map coordinates
 * @param lat Latitude (-90 to 90)
 * @param lng Longitude (-180 to 180)
 * @param width Map width in pixels
 * @param height Map height in pixels
 * @returns {x, y} coordinates on the map
 */
export function projectToMap(
  lat: number, 
  lng: number, 
  width: number, 
  height: number
): { x: number; y: number } {
  // X coordinate: simple linear mapping of longitude
  const x = ((lng + 180) / 360) * width;
  
  // Y coordinate: Mercator projection
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (width * mercN) / (2 * Math.PI);
  
  return { x, y };
}

/**
 * Convert lat/lng to coordinates for react-simple-maps
 * react-simple-maps expects [longitude, latitude] format
 */
export function toMapCoordinates(location: GeoLocation): [number, number] {
  return [location.lng, location.lat];
}

export default GEO_LOCATIONS;

