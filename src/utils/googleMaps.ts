type MappablePlace = {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
};

export function getGoogleMapsUrl(place: MappablePlace) {
  const query = `${place.name} ${formatCoordinates(place)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getGoogleMapsEmbedUrl(place: MappablePlace) {
  const query = `${formatCoordinates(place)} (${place.name})`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
}

export function formatCoordinates(place: MappablePlace) {
  return `${place.location.lat.toFixed(5)},${place.location.lng.toFixed(5)}`;
}
