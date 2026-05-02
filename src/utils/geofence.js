import { DEV_MODE } from "../config/devmode";

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function checkGeofence(userPos, stage) {
  if (DEV_MODE) {
    return { inside: true, distance: 0 };
  }
  const distance = haversineDistance(
    userPos.lat,
    userPos.lng,
    stage.lat,
    stage.lng
  );
  return {
    inside: distance <= stage.radius,
    distance: Math.round(distance),
  };
}

export function getCurrentPosition() {
  if (DEV_MODE) {
    return Promise.resolve({ lat: 51.5074, lng: -0.1278, accuracy: 5 });
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export function watchPosition(callback, errorCallback) {
  if (DEV_MODE) {
    callback({ lat: 51.5074, lng: -0.1278, accuracy: 5 });
    return null;
  }
  if (!navigator.geolocation) return null;
  return navigator.geolocation.watchPosition(
    (pos) => callback({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    }),
    errorCallback,
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
}
