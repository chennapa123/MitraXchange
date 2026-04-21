import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icon
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component for getting user's current location
function SetUserLocation({ setPosition, onLocationSet }) {
  const map = useMap();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!map || isInitialized) return;

    const timer = setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            try {
              const coords = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              };
              if (map && map._container) {
                map.setView([coords.lat, coords.lng], 13);
              }
              setPosition(coords);
              onLocationSet && onLocationSet(coords);
              setIsInitialized(true);
            } catch (e) {
              console.error('Map initialization error:', e);
            }
          },
          (err) => {
            console.error('Geolocation error:', err);
            try {
              if (map && map._container) {
                map.setView([20, 78], 5);
              }
              setIsInitialized(true);
            } catch (e) {
              console.error('Map initialization error:', e);
            }
          }
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [map, setPosition, onLocationSet, isInitialized]);

  return null;
}

// Component for handling map clicks to select location
function LocationSelector({ setPosition, isSelectable }) {
  useMapEvents({
    click(e) {
      if (isSelectable) {
        setPosition(e.latlng);
      }
    },
  });
  return null;
}

export default function MapView({
  items = [],
  onSelectLocation = null,
  selectable = false,
  showUserLocation = true,
}) {
  const [position, setPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  const handleLocationSet = (coords) => {
    setUserLocation(coords);
  };

  const handlePositionChange = (pos) => {
    setPosition(pos);
    onSelectLocation && onSelectLocation(pos);
  };

  return (
    <div style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        key={mapKey}
        center={[20, 78]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showUserLocation && <SetUserLocation setPosition={setPosition} onLocationSet={handleLocationSet} />}

        {/* Existing items markers */}
        {items.map((item, idx) => (
          <Marker
            key={idx}
            position={[item.lat || item.location?.lat || 20, item.lng || item.location?.lng || 78]}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>{item.title}</h4>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#666' }}>
                  {item.ownerId?.name}
                </p>
                {item.distance && (
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#22c55e' }}>
                    📍 {item.distance?.toFixed(2)} km away
                  </p>
                )}
                <small style={{ color: '#999' }}>
                  Category: {item.category}
                </small>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Location selector */}
        {selectable && (
          <LocationSelector setPosition={handlePositionChange} isSelectable={selectable} />
        )}

        {/* Selected location marker */}
        {position && (
          <Marker position={[position.lat, position.lng]}>
            <Popup>
              <div>
                <strong>📍 Selected Location</strong>
                <p>Lat: {position.lat.toFixed(4)}</p>
                <p>Lng: {position.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User location marker (if available and different from selection) */}
        {userLocation && !position && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div>
                <strong>📍 Your Location</strong>
                <p>Lat: {userLocation.lat.toFixed(4)}</p>
                <p>Lng: {userLocation.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
