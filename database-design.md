Create a full GIS Infrastructure Module for AquaBill Water Billing System using Laravel, React, Tailwind CSS, React Leaflet, and OpenStreetMap.

This system is for a water utility organization and must support GIS visualization of water infrastructure and service points.

IMPORTANT:
- Use Leaflet as the GIS/map rendering engine.
- Use OpenStreetMap as the map tile/data provider.
- Do NOT use Google Maps.
- Use React Leaflet components throughout the frontend.
- Meters are normal/manual meters only.
- Customer coordinates remain on customers table.
- Do NOT add GPS coordinates to meters table because meters can be changed/replaced.
- Explore the existing AquaBill codebase first and follow existing architecture, naming conventions, layouts, permissions, API style, and UI patterns.

====================================
TECH STACK
====================================

Backend:
- Laravel
- RESTful APIs
- MySQL
- Existing AquaBill backend structure

Frontend:
- React
- Tailwind CSS
- React Leaflet
- OpenStreetMap
- Existing AquaBill frontend layout/components

Install required packages if missing:

Frontend:
npm install leaflet react-leaflet leaflet-defaulticon-compatibility

====================================
DATABASE MODULES
====================================

1. water_point_types

Fields:
- id
- name unique
- slug unique
- description nullable
- timestamps

Seed with:
- Filling Station
- Public Tap
- Water Kiosk
- Standpipe
- Borehole
- Tank

====================================

2. water_points

Fields:
- id
- code unique
- name
- water_point_type_id foreign key
- zone_id nullable foreign key
- latitude decimal(10,7) nullable
- longitude decimal(10,7) nullable
- manager_name nullable
- manager_phone nullable
- status enum:
  - active
  - inactive
  - maintenance
  - damaged
  default active
- description nullable
- timestamps

====================================

3. pipes

Fields:
- id
- pipe_code unique
- zone_id nullable foreign key
- pipe_type enum:
  - main
  - distribution
  - service
  default distribution
- material nullable
- diameter decimal(8,2) nullable
- length decimal(10,2) nullable
- coordinates JSON
- status enum:
  - active
  - inactive
  - damaged
  - maintenance
  default active
- installation_date nullable
- description nullable
- timestamps

coordinates JSON example:
[
  [4.85941,31.57125],
  [4.86010,31.57200],
  [4.86120,31.57310]
]

====================================

4. valves

Fields:
- id
- valve_code unique
- zone_id nullable foreign key
- pipe_id nullable foreign key
- valve_type enum:
  - main
  - control
  - isolation
  - washout
  - air_release
  default main
- latitude decimal(10,7)
- longitude decimal(10,7)
- status enum:
  - open
  - closed
  - damaged
  - maintenance
  default open
- installation_date nullable
- description nullable
- timestamps

====================================
MODEL RELATIONSHIPS
====================================

WaterPointType:
- hasMany WaterPoints

WaterPoint:
- belongsTo WaterPointType
- belongsTo Zone

Pipe:
- belongsTo Zone
- hasMany Valves

Valve:
- belongsTo Pipe
- belongsTo Zone

Zone:
- hasMany WaterPoints
- hasMany Pipes
- hasMany Valves

====================================
BACKEND FEATURES
====================================

Create:
- migrations
- models
- factories if needed
- seeders
- controllers
- form requests
- API resources if project uses them
- RESTful API routes

Add:
- pagination
- validation
- searching
- filtering
- sorting

====================================
SEARCH/FILTERS
====================================

Water Points:
- search by code/name/manager phone
- filter by type
- filter by zone
- filter by status

Pipes:
- search by pipe_code/material
- filter by pipe_type
- filter by zone
- filter by status

Valves:
- search by valve_code
- filter by valve_type
- filter by zone
- filter by pipe
- filter by status

====================================
FRONTEND PAGES
====================================

Create pages for:

Water Point Types:
- list
- create
- edit
- view

Water Points:
- list
- create
- edit
- view

Pipes:
- list
- create
- edit
- view

Valves:
- list
- create
- edit
- view

GIS Dashboard:
- full GIS infrastructure map page

====================================
LEAFLET + OPENSTREETMAP GIS FEATURES
====================================

Use:
- MapContainer
- TileLayer
- Marker
- Popup
- Polyline
- LayersControl

Use OpenStreetMap tiles:

https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

Default map center:
Juba, South Sudan

====================================
GIS DASHBOARD FEATURES
====================================

Display:
- Water points as markers
- Valves as markers
- Pipes as polylines

Add layer controls:
- Toggle Water Points
- Toggle Pipes
- Toggle Valves

Add filters:
- Zone
- Type
- Status

Add map popups.

Water Point popup:
- code
- name
- type
- zone
- manager phone
- status

Valve popup:
- valve_code
- valve_type
- pipe
- zone
- status

Pipe popup:
- pipe_code
- pipe_type
- material
- diameter
- length
- zone
- status

====================================
GIS INTERACTION FEATURES
====================================

Water Point Form:
- Allow picking location from Leaflet map
- Clicking map sets latitude/longitude automatically

Valve Form:
- Allow picking valve location from map

Pipe Form:
- Allow user to click multiple points on map
- Automatically build polyline coordinates JSON
- Show live polyline preview while drawing

====================================
MAP STYLING
====================================

Use different colors/styles:

Pipes:
- Main pipes → thick blue
- Distribution pipes → medium green
- Service pipes → thin orange

Markers:
- Water points → blue markers
- Valves → red markers

====================================
UI/UX REQUIREMENTS
====================================

- Use Tailwind CSS
- Responsive design
- Professional utility dashboard look
- Reuse existing AquaBill components
- Use status badges
- Use modals or drawers if project already uses them
- Add delete confirmation dialogs
- Add loading states
- Add empty state UI
- Add validation messages

====================================
SEEDERS
====================================

Create realistic seed data:
- water_point_types
- water_points
- pipes
- valves

Use realistic Juba coordinates for sample data.

====================================
FINAL GOAL
====================================

Build a professional GIS infrastructure management module for AquaBill capable of:
- Water connection GIS registry
- Filling station GIS
- Public tap GIS
- Pipe network visualization
- Main valve point visualization
- Zone-based GIS reporting
- Infrastructure mapping using Leaflet and OpenStreetMap