'use client';

import { useEffect, useState } from 'react';
import { MapMarker } from 'react-kakao-maps-sdk';
import ReSetttingMapBounds from './re-setting-map-bounds';

export default function CustomMapMaker({
  address,
}: {
  address: string;
}): React.ReactElement {
  const [coordinates, setCoordinates] = useState({
    lat: 37.5665,
    lng: 126.978,
  });

  const handleAddressSearch = () => {
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const { y, x } = result[0];
        const newCoordinates = { lat: parseFloat(y), lng: parseFloat(x) };
        setCoordinates(newCoordinates);
        new kakao.maps.LatLng(newCoordinates.lat, newCoordinates.lng);
      }
    });
  };

  useEffect(() => {
    handleAddressSearch();
  }, [address]);

  return (
    <div>
      <MapMarker position={coordinates} />
      <ReSetttingMapBounds points={[coordinates]} />
    </div>
  );
}
