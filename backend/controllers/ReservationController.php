// backend/controllers/ReservationController.php
<?php

class ReservationController {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function store($request) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required = ['name', 'email', 'phone', 'date', 'time', 'guests'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field $field is required"]);
                return;
            }
        }
        
        // Insert into database
        $query = "INSERT INTO reservations (name, email, phone, date, time, guests, notes, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['date'],
            $data['time'],
            $data['guests'],
            $data['notes'] ?? ''
        ]);
        
        // Send confirmation email (simplified)
        $this->sendConfirmationEmail($data);
        
        http_response_code(201);
        echo json_encode(['message' => 'Reservation created successfully']);
    }
    
    private function sendConfirmationEmail($data) {
        // Email sending logic using your EmailService
        $emailService = new EmailService();
        $subject = "Reservation Confirmation";
        $message = "Dear {$data['name']},\n\nYour table has been reserved for {$data['date']} at {$data['time']} for {$data['guests']} guests.";
        
        $emailService->send($data['email'], $subject, $message);
    }
}