import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "../styles/Trips.css";

export default function Routes() {
  const [trips, setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/trips")
      .then(res => setTrips(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derive routes from trips
  const routeMap = trips.reduce((acc, trip) => {
    const key = `${trip.departureCity}||${trip.destination}`;
    if (!acc[key]) {
      acc[key] = {
        origin:      trip.departureCity,
        dest:        trip.destination,
        activeTrips: 0,
        totalBookings: 0,
      };
    }
    acc[key].activeTrips++;
    acc[key].totalBookings += trip.bookings?.length || 0;
    return acc;
  }, {});

  const routes = Object.values(routeMap);

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Routes</h1>
          <p className="page-sub">All origin–destination pairs across your trips</p>
        </div>
      </div>

      {loading ? (
        <div className="skel" style={{ height: 200 }} />
      ) : (
        <table className="gtable animate-in">
          <thead>
            <tr>
              <th>#</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Active Trips</th>
              <th>Total Bookings</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 ? (
              <tr><td colSpan="5">
                <div className="empty-state">
                  <span className="empty-state-icon">🗺️</span>
                  No routes yet. Create trips to see routes here.
                </div>
              </td></tr>
            ) : routes.map((r, i) => (
              <tr key={i}>
                <td style={{ color:"var(--text-tertiary)", fontFamily:"var(--mono)", width:40 }}>
                  {String(i+1).padStart(2,"0")}
                </td>
                <td style={{ fontWeight:600 }}>{r.origin}</td>
                <td style={{ fontWeight:600 }}>{r.dest}</td>
                <td>
                  <span className="pill pill-blue">{r.activeTrips} trip{r.activeTrips !== 1 ? "s" : ""}</span>
                </td>
                <td style={{ fontFamily:"var(--mono)", fontWeight:600 }}>{r.totalBookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
