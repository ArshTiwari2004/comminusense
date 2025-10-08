# comminusense


ComminuSense is a software platform that ingests high-frequency machine telemetry (real sensors or simulated IoT), stores time-series data, runs ML models (energy optimizer, predictive maintenance), exposes model recommendations and simulation results (digital twin), and provides a role-based dashboard for Operators / Engineers / Maintenance / Management. The system supports simulated closed-loop control (for demo) and a path to safe on-site integration (edge gateway, IEC/ISA security guidance


## Roles:

Operator — view live telemetry, acknowledge alarms, start/stop local simulator runs. (Can’t change model thresholds.)

Shift Supervisor — all Operator + accept/implement AI suggestions, manual setpoint override.

Process Engineer — can run simulations, view ML model explainability data, change recommended setpoint tolerances, export reports.

Maintenance Engineer — view PdM alerts, schedule maintenance tasks, download vibration logs.

Plant Manager — view KPIs, confirm major parameter changes, approve maintenance budgets.

NMDC Admin / Auditor — view audit logs, system health; higher-level governance access (read-only to raw data, download permitted).



## Quickstart (dev)
- to be updated
1. Install Docker & Docker Compose
2. `docker-compose up --build`
3. Open http://localhost:3000 (frontend)
4. Run `python simulator/iot_simulator.py` to publish telemetry (optional)

## Components
- frontend: Next.js dashboard
- ingestion-service: MQTT/REST ingestion into Influx
- api-service: main API & auth
- model-service: model predictions

## Contributing
- Follow coding standards; run tests before PR.
- See docs/ for architecture & SIH submission.

## Contact
Team Synapsee — *arshtiwari12345@gmail.com*
