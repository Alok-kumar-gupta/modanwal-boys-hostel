/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink, Key, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const HOSTEL_LOCATION = {
  lat: 26.9520482,
  lng: 81.0947021,
};

const MAP_DIRECTIONS_URL = "https://www.google.com/maps/dir//Modanwal+boys+hostel,+Deva+Matiyari+Road,+near+Ram+Swaroop+University,+Hadori,+Tindola,+Uttar+Pradesh+225003/@26.9520482,81.0947021,17z";

function MapMarkerWithInfo() {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={HOSTEL_LOCATION}
        onClick={() => setInfoOpen(true)}
        title="Modanwal Boys Hostel"
      >
        <Pin background="#0f172a" glyphColor="#f59e0b" borderColor="#0f172a" scale={1.2} />
      </AdvancedMarker>

      {infoOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setInfoOpen(false)}
          className="p-1 max-w-xs"
        >
          <div className="p-1 space-y-1.5 text-slate-900 font-sans">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-950">
              <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Modanwal Boys Hostel</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Deva Matiyari Road, near Ram Swaroop University (SRMU), Hadori, Tindola, UP 225003
            </p>
            <div className="pt-1 flex items-center justify-between border-t border-slate-100">
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 300m from SRMU
              </span>
              <a
                href={MAP_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
              >
                Directions <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function HostelMap() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0" id="hostel-google-map-section">
      {/* Header Banner */}
      <div className="p-6 bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-lg text-white">
              Location Map & Directions (लोकेशन और गूगल मैप्स)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Modanwal Boys Hostel • Deva Matiyari Road, Near SRMU, Tindola, Uttar Pradesh 225003
          </p>
        </div>

        <a
          href={MAP_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-sm shrink-0"
          id="btn-get-directions"
        >
          <Navigation className="w-4 h-4" />
          <span>Get Live Directions</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Map Area */}
      <div className="relative w-full h-[400px] bg-slate-100" id="hostel-map-canvas-container">
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={HOSTEL_LOCATION}
              defaultZoom={16}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '400px' }}
            >
              <MapMarkerWithInfo />
            </Map>
          </APIProvider>
        ) : (
          /* High quality fallback view + iframe map when API Key is not yet configured in AIS Secrets */
          <div className="relative w-full h-full flex flex-col">
            <iframe
              title="Modanwal Boys Hostel Location Map"
              src="https://maps.google.com/maps?q=26.9520482,81.0947021&z=16&output=embed"
              className="w-full h-full border-0 filter contrast-[102%]"
              loading="lazy"
              allowFullScreen
            />

            {/* Overlay instruction banner for Google Maps API Key setup */}
            <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Key className="w-4 h-4 shrink-0" />
                <span>Google Maps Native API Key Setup</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                For interactive custom tiles & native controls, add your Google Maps API key in <strong>Settings ⚙️ → Secrets</strong> as <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono">GOOGLE_MAPS_PLATFORM_KEY</code>.
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-slate-800 text-[10px] text-slate-400">
                <span>Coordinates: 26.9520° N, 81.0947° E</span>
                <a
                  href={MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                >
                  Open Google Maps <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Details Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></div>
          <span className="font-semibold">300m (3 mins walk) to SRMU Campus Gate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
          <span className="font-semibold">Deva Matiyari Main Road Connectivity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
          <span className="font-semibold">Tindola, Barabanki, UP 225003</span>
        </div>
      </div>
    </div>
  );
}
