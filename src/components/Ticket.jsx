import { forwardRef } from "react";
import { EVENT } from "../lib/constants";

const Ticket = forwardRef(function Ticket(
  { teamId, teamName, track, leaderName, leaderRollNo, leaderEmail, leaderPhone, members = [], memberCount },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        margin: "0 auto",
        width: "100%",
        maxWidth: "64rem",
        backgroundColor: "#fffdf8",
        border: "1px solid rgba(255, 191, 93, 0.2)",
        borderRadius: "32px",
        boxShadow: "0 30px 80px rgba(15, 23, 42, 0.08)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#111827",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(255, 191, 93, 0.1)",
          borderRadius: "32px",
          padding: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            borderBottom: "1px solid rgba(255, 191, 93, 0.2)",
            paddingBottom: "24px",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              maxWidth: "42rem",
            }}
          >
            <p
              style={{
                color: "#8b6a17",
                fontSize: "10px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
              }}
            >
              {EVENT.college}
            </p>
            <h1
              style={{
                marginTop: "8px",
                fontSize: "2rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.24em",
                color: "#111827",
              }}
            >
              {EVENT.name}
            </h1>
            <p
              style={{
                marginTop: "8px",
                maxWidth: "42rem",
                fontSize: "0.875rem",
                lineHeight: 1.5,
                color: "#475569",
              }}
            >
              {EVENT.venueLabel}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "1px solid #d1fae5",
              backgroundColor: "#ecfdf5",
              boxShadow: "0 10px 20px rgba(15, 23, 42, 0.06)",
              borderRadius: "24px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "44px",
                width: "44px",
                borderRadius: "9999px",
                backgroundColor: "#d1fae5",
                color: "#047857",
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
            >
              ✓
            </div>
            <div>
              <p
                style={{
                  color: "#8b6a17",
                  fontSize: "10px",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Registered
              </p>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", margin: 0 }}>
                Confirmation
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#8b6a17",
              fontSize: "10px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
            }}
          >
            {EVENT.dateLabel}
          </p>
          <h2
            style={{
              marginTop: "12px",
              fontSize: "2rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "#111827",
            }}
          >
            Registration Acknowledgement
          </h2>
          <p
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "16px",
              maxWidth: "42rem",
              fontSize: "0.9375rem",
              lineHeight: 1.75,
              color: "#475569",
            }}
          >
            Dear {leaderName || teamName}, congratulations on completing your registration. This letter confirms your team registration for the hackathon, with the details recorded below.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          <DetailCard label="Team name" value={teamName || "—"} />
          <DetailCard label="Track" value={track || "Unassigned"} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <DetailCard label="Team leader" value={leaderName || "—"} />
          <DetailCard label="Team size" value={`${memberCount} members`} />
        </div>

        <div
          style={{
            marginTop: "32px",
            overflow: "hidden",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#0f172a",
            boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "64px minmax(0, 1fr) minmax(0, 1fr) 160px",
              gap: "16px",
              padding: "16px",
              borderBottom: "1px solid #334155",
              color: "#cbd5e1",
              fontSize: "0.625rem",
              textTransform: "uppercase",
              letterSpacing: "0.35em",
            }}
          >
            <div>S.No</div>
            <div>Name</div>
            <div>Role</div>
            <div>Contact</div>
          </div>
          <TicketRow
            index={1}
            name={leaderName || teamName}
            role="Team leader"
            contact={leaderEmail || leaderPhone || leaderRollNo || "—"}
          />
          {members.map((m, i) => (
            <TicketRow
              key={i}
              index={i + 2}
              name={m.name || "—"}
              role="Member"
              contact={m.email || m.phone || m.roll_no || "—"}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: "32px",
            borderRadius: "24px",
            border: "1px solid rgba(255, 191, 93, 0.2)",
            backgroundColor: "#ffffff",
            boxShadow: "0 10px 20px rgba(15, 23, 42, 0.05)",
            padding: "24px",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8b6a17",
            }}
          >
            Instructions to the team
          </p>
          <ol
            style={{
              marginTop: "16px",
              display: "grid",
              gap: "12px",
              fontSize: "0.9375rem",
              lineHeight: 1.75,
              color: "#475569",
            }}
          >
            <li>01 Arrive at least 30 minutes before the event begins.</li>
            <li>02 Keep this acknowledgement ready at check-in.</li>
            <li>03 Bring your team details and registration confirmation.</li>
            <li>04 Stay on schedule and follow the event instructions.</li>
            <li>05 Enjoy the hackathon and have fun collaborating.</li>
          </ol>
        </div>

        <div
          style={{
            marginTop: "40px",
            borderTop: "1px solid rgba(255, 191, 93, 0.2)",
            paddingTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>
              Congratulations, and welcome to the alumni family.
            </p>
            <p style={{ marginTop: "8px", fontSize: "0.875rem", color: "#64748b" }}>
              {EVENT.college} · {EVENT.place}
            </p>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              borderRadius: "24px",
              border: "1px solid rgba(255, 191, 93, 0.3)",
              backgroundColor: "#ffffff",
              color: "#8b6a17",
              padding: "12px 16px",
              width: "fit-content",
            }}
          >
            BVC
          </div>
        </div>
      </div>
    </div>
  );
});

function DetailCard({ label, value }) {
  return (
    <div
      style={{
        borderRadius: "24px",
        padding: "20px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
        boxShadow: "0 10px 20px rgba(15, 23, 42, 0.05)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#8b6a17",
        }}
      >
        {label}
      </p>
      <p style={{ marginTop: "12px", fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>{value}</p>
    </div>
  );
}

function TicketRow({ index, name, role, contact }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "64px minmax(0, 1fr) minmax(0, 1fr) 160px",
        gap: "16px",
        padding: "16px",
        borderBottom: "1px solid #334155",
        color: "#cbd5e1",
        fontSize: "0.9375rem",
      }}
    >
      <div>{index}</div>
      <div style={{ color: "#ffffff" }}>{name}</div>
      <div style={{ color: "#ffffff" }}>{role}</div>
      <div style={{ color: "#ffffff" }}>{contact}</div>
    </div>
  );
}

export default Ticket;