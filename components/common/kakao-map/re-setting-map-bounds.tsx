'use client';

import { useMemo } from 'react';
import { useMap } from 'react-kakao-maps-sdk';

export default function ReSetttingMapBounds({
  points,
}: {
  points: { lat: number; lng: number }[];
}) {
  const map = useMap();
  const latLngBounds = useMemo(() => {
    const bounds = new kakao.maps.LatLngBounds();

    points.forEach((point) => {
      bounds.extend(new kakao.maps.LatLng(point.lat, point.lng));
    });

    map.setBounds(bounds);

    return bounds;
  }, [points]);

  return <></>;
}
