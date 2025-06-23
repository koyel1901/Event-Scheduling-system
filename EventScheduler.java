
import static spark.Spark.*;
import com.google.gson.*;
import java.util.*;
import spark.Spark;

public class EventScheduler {
    private static Map<String, Map<String, List<Event>>> schedule = new HashMap<>();
    private static Gson gson = new GsonBuilder().setDateFormat("HH:mm").create();

    public static void main(String[] args) {
        port(4567);
        
        // Enable CORS
        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }
            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }
            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type");
            response.type("application/json");
        });

        post("/schedule", (req, res) -> {
            try {
                EventRequest eventRequest = gson.fromJson(req.body(), EventRequest.class);
                
                // Validate input
                if (eventRequest == null || 
                    isNullOrEmpty(eventRequest.title) ||
                    isNullOrEmpty(eventRequest.venue) || 
                    isNullOrEmpty(eventRequest.date) || 
                    isNullOrEmpty(eventRequest.startTime) || 
                    isNullOrEmpty(eventRequest.endTime)) {
                    res.status(400);
                    return gson.toJson(Map.of("message", "All fields are required"));
                }

                // Validate time format
                if (!isValidTimeFormat(eventRequest.startTime) || !isValidTimeFormat(eventRequest.endTime)) {
                    res.status(400);
                    return gson.toJson(Map.of("message", "Invalid time format. Use HH:mm format"));
                }

                // Validate date format
                if (!eventRequest.date.matches("\\d{4}-\\d{2}-\\d{2}")) {
                    res.status(400);
                    return gson.toJson(Map.of("message", "Invalid date format. Use YYYY-MM-DD format"));
                }

                String date = eventRequest.date;
                String venue = eventRequest.venue;

                schedule.putIfAbsent(date, new HashMap<>());
                schedule.get(date).putIfAbsent(venue, new ArrayList<>());

                List<Event> events = schedule.get(date).get(venue);
                Event newEvent = new Event(eventRequest.title, eventRequest.startTime, eventRequest.endTime);

                for (Event e : events) {
                    if (e.overlaps(newEvent)) {
                        res.status(409);
                        return gson.toJson(Map.of(
                            "message", 
                            "Time conflict! Slot " + e.startTime + " - " + e.endTime + " is already booked."
                        ));
                    }
                }

                events.add(newEvent);
                events.sort(Comparator.comparing(e -> e.startTime));

                res.status(201);
                return gson.toJson(Map.of("message", "Event scheduled successfully!"));
            } catch (JsonSyntaxException e) {
                res.status(400);
                return gson.toJson(Map.of("message", "Invalid request format"));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(Map.of("message", "Internal server error"));
            }
        });

        get("/schedule", (req, res) -> {
            try {
                String date = req.queryParams("date");
                
                if (date == null || !date.matches("\\d{4}-\\d{2}-\\d{2}")) {
                    res.status(400);
                    return gson.toJson(Map.of("message", "Invalid date format. Use YYYY-MM-DD format"));
                }

                Map<String, List<Event>> dateSchedule = schedule.getOrDefault(date, new HashMap<>());
                return gson.toJson(dateSchedule);
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(Map.of("message", "Internal server error"));
            }
        });

        // Handle exceptions
        exception(Exception.class, (e, req, res) -> {
            res.status(500);
            res.body(gson.toJson(Map.of("message", "Internal server error")));
        });
    }

    private static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private static boolean isValidTimeFormat(String time) {
        return time.matches("([01]?[0-9]|2[0-3]):[0-5][0-9]");
    }

    static class EventRequest {
        String title;
        String venue;
        String date;
        String startTime;
        String endTime;
    }

    static class Event {
        String title;
        String startTime;
        String endTime;

        Event(String title, String startTime, String endTime) {
            this.title = title;
            this.startTime = startTime;
            this.endTime = endTime;
        }

        boolean overlaps(Event other) {
            return this.startTime.compareTo(other.endTime) < 0 && 
                   other.startTime.compareTo(this.endTime) < 0;
        }
    }
}
