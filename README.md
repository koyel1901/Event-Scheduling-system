# 📅 Event Scheduling System

## 📝 About

The **Event Scheduling System** is a web-based application that efficiently selects the **maximum number of non-overlapping events** across multiple venues. It is particularly useful in settings like universities, auditoriums, and conference halls where resource allocation must be optimized. The system applies a **Greedy Algorithm based on the Activity Selection Problem**, scheduling events that end earliest and do not overlap with previously selected events.

---

## 🧠 Project Abstract

Our solution addresses scheduling conflicts by allocating events to **three available venues**, ensuring that no overlapping events are scheduled in the same venue. Initially built as a **command-line application** in Java, the system has evolved into a **web-based platform** with interactive UI, leveraging a **Java backend** and **RESTful API** for real-time communication.

Unscheduled or conflicting events are flagged and may be reassigned based on availability. The final system promotes maximum time-slot utilization and better event management.

---

## 🏗️ Project Approach & Architecture

The Event Scheduling System is developed using a **modular and layered architecture**:

### ⚙️ Backend (Java with Spark Framework)

- **Event Class**: Models each event with start/end time and assigned venue.
- **Greedy Scheduler**: Selects and assigns events to venues by sorting on end times.
- **REST API**: Exposes endpoints to schedule events (`POST`) and fetch schedules (`GET`).

### 🎨 Frontend (HTML/CSS/JS)

- Responsive web interface with a **dark and chromy theme**.
- Users input start and end times, view venue availability, and receive real-time feedback.
- Communicates with backend using `fetch()` API for POST and GET requests.

---

## ✅ Features

- Schedule non-overlapping events in **three venues**
- Responsive UI for event creation and schedule display
- Real-time feedback for event conflicts
- Input validation (e.g., invalid times, overlaps)
- Modular Java backend with RESTful API
- Ready for future scalability to multiple venues##
  
---
  
## 🧱 Challenges & Roadblocks

- **Scalability**: Current design supports only three venues. Scaling requires a priority queue or heap-based scheduling.
- **Input Validation**: Ensuring correctness of start/end times was critical.
- **GUI Transition**: Migrating from Java Swing to HTML/CSS/JS required redesigning the interface.
- **Integration Issues**: Syncing backend and frontend APIs introduced early bugs, resolved through modular code structure and testing.

---

## 🚀 Future Scope

- 🔄 **Dynamic venue support** using data structures like min-heaps or priority queues
- 📆 **Calendar Integration** (Google/Outlook) for reminders and visibility
- 🎯 **Drag-and-drop UI** with conflict resolution suggestions
- 📊 **Analytics dashboard** for venue utilization
- ☁️ **Cloud deployment**, multi-user login, real-time updates, and persistent storage (DB)
- 🌐 **Multilingual interface** for wider accessibility

---

## 🎯 Project Outcome / Deliverables

- ✅ Fully functioning **web-based event scheduler**
- ✅ **Java backend** with greedy algorithm and REST API
- ✅ Frontend UI in **HTML/CSS/JavaScript**
- ✅ Input validation and error handling
- ✅ Source code, documentation & complexity analysis
- ✅ Tested logic and UI, deployment-ready
