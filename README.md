# IDPC-Sentinel: AI-Driven Blockchain Security System

An advanced, multi-layered Intrusion Detection and Prevention System (IDPS) that integrates real-time network monitoring, machine learning threat classification, and blockchain-backed log integrity.

## 🚀 Project Overview
IDPC-Sentinel is designed to protect enterprise networks by combining traditional rule-based detection with modern AI analysis. By leveraging the ELK stack for observability and Blockchain for non-repudiation, the system ensures that network logs are not only monitored but also secured against unauthorized tampering.

---

## 🏗️ Architecture & Tech Stack
The project is divided into four core modules, each handled by a specialized team member:

* **Infrastructure & Data Pipeline (Project Lead):** Ubuntu VM, Mininet (Network Emulation), Suricata (IDS), and ELK Stack (Elasticsearch, Logstash, Kibana).
* **AI/ML Module:** Threat classification using models (Random Forest/LSTM) trained on Kaggle/CIC-IDS datasets for zero-day attack detection.
* **Cybersecurity & Blockchain:** Log integrity layer using SHA-256 hashing and Blockchain ledgers to ensure data immutability.
* **Cloud & DevOps:** Containerization via Docker and deployment on Cloud infrastructure (AWS/Azure).

---

## 🛠️ Key Features
* **Real-time Network Emulation:** Uses Mininet to create virtual topologies and simulate live traffic.
* **Deep Packet Inspection:** Suricata scans traffic for malicious patterns (DDoS, Port Scanning, etc.).
* **Centralized Logging:** Automated shipping of JSON logs from Suricata to Elasticsearch via Filebeat.
* **AI-Powered Inference:** Real-time threat prediction through a FastAPI-based AI service.
* **Immutable Records:** Blockchain verification to detect if any network logs have been altered by an attacker.

---

## 📂 Project Structure
text
├── configs/
│   ├── suricata/          # Suricata rules and yaml configurations
│   ├── filebeat/          # Log shipping configurations
│   └── elk/               # Elasticsearch and Kibana setup files
├── scripts/
│   ├── traffic_gen.py     # Mininet automation scripts
│   └── parser.py          # JSON log parser for AI inference
├── frontend/              # React + Tailwind CSS Dashboard (Live Monitor)
├── backend/               # FastAPI central hub (Integration Layer)
└── docs/                  # Architecture diagrams and technical reports

⚙️ Setup & Installation
1. Prerequisites
Ubuntu 22.04+ (VirtualBox recommended)

Python 3.10+

Java (for ELK Stack)

2. Installation
3. # Clone the repository
git clone [https://github.com/Sanskritiiiiiiiii/IDPC-Sentinel.git](https://github.com/Sanskritiiiiiiiii/IDPC-Sentinel.git)
cd IDPC-Sentinel

# Start the Data Pipeline
sudo service filebeat start
sudo suricata -c /etc/suricata/suricata.yaml -i s1-eth1

Running mininet
sudo mn --controller remote --topo single,3

👥 Team & Responsibilities
Sanskriti Pal: Full-Stack Integration & Infrastructure

Soham Kadam: AI/ML Model Training & Prediction API

Arun kumar: Cybersecurity Lead | Blockchain Integration

Kunal Boro: Cloud Deployment & DevOps (Dockerization)
