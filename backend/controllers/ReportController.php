<?php
/**
 * Report Controller - Handles report generation and exports
 */
require_once '../models/Report.php';
require_once '../utils/PDFExporter.php';
require_once '../utils/ExcelExporter.php';
require_once '../middleware/AuthMiddleware.php';
require_once '../utils/Response.php';
require_once '../utils/Logger.php';

class ReportController {
    private $reportModel;
    private $authMiddleware;
    private $logger;

    public function __construct() {
        $this->reportModel = new Report();
        $this->authMiddleware = new AuthMiddleware();
        $this->logger = new Logger();
    }

    /**
     * Generate sales report
     */
    public function generateSalesReport() {
        try {
            $this->logger->info("Generating sales report via API");

            // Authenticate manager or admin
            $user = $this->authMiddleware->requireRoles(['admin', 'manager']);
            if (!$user) return;

            // Get month and year from query parameters
            $month = $_GET['month'] ?? date('n');
            $year = $_GET['year'] ?? date('Y');

            // Validate parameters
            if (!is_numeric($month) || $month < 1 || $month > 12) {
                Response::error('Invalid month parameter');
                return;
            }

            if (!is_numeric($year) || $year < 2020 || $year > 2030) {
                Response::error('Invalid year parameter');
                return;
            }

            $report = $this->reportModel->generateSalesReport($month, $year);
            
            if ($report === false) {
                Response::error('Failed to generate report');
                return;
            }

            $this->logger->info("Sales report generated successfully for {$user['email']}");
            Response::success('Report generated successfully', $report);

        } catch (Exception $e) {
            $this->logger->error("Error in generateSalesReport: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Export report in various formats
     */
    public function exportReport() {
        try {
            $this->logger->info("Exporting report");

            // Authenticate manager or admin
            $user = $this->authMiddleware->requireRoles(['admin', 'manager']);
            if (!$user) return;

            // Get parameters
            $month = $_GET['month'] ?? date('n');
            $year = $_GET['year'] ?? date('Y');
            $format = $_GET['format'] ?? 'pdf';

            // Validate parameters
            if (!is_numeric($month) || $month < 1 || $month > 12) {
                Response::error('Invalid month parameter');
                return;
            }

            if (!is_numeric($year) || $year < 2020 || $year > 2030) {
                Response::error('Invalid year parameter');
                return;
            }

            $allowedFormats = ['pdf', 'excel'];
            if (!in_array($format, $allowedFormats)) {
                Response::error('Invalid format. Use: pdf or excel');
                return;
            }

            // Generate report data
            $reportData = $this->reportModel->generateSalesReport($month, $year);
            if ($reportData === false) {
                Response::error('Failed to generate report data');
                return;
            }

            // Add metadata
            $reportData['metadata'] = [
                'generated_by' => $user['email'],
                'generated_at' => date('Y-m-d H:i:s'),
                'period' => "{$month}/{$year}",
                'restaurant_name' => "Aunt Joy's Restaurant"
            ];

            // Export based on format
            switch ($format) {
                case 'pdf':
                    $exporter = new PDFExporter();
                    $exporter->exportSalesReport($reportData);
                    break;

                case 'excel':
                    $exporter = new ExcelExporter();
                    $exporter->exportSalesReport($reportData);
                    break;

                default:
                    Response::error('Unsupported export format');
                    return;
            }

            $this->logger->info("Report exported successfully in {$format} format");

        } catch (Exception $e) {
            $this->logger->error("Error in exportReport: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get financial summary
     */
    public function getFinancialSummary() {
        try {
            $this->logger->info("Getting financial summary");

            // Authenticate manager or admin
            $user = $this->authMiddleware->requireRoles(['admin', 'manager']);
            if (!$user) return;

            // Get date range from query parameters
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-t');

            $summary = $this->reportModel->generateFinancialSummary($startDate, $endDate);
            
            if ($summary === false) {
                Response::error('Failed to generate financial summary');
                return;
            }

            $this->logger->info("Financial summary generated successfully");
            Response::success('Financial summary retrieved', $summary);

        } catch (Exception $e) {
            $this->logger->error("Error in getFinancialSummary: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get popular categories report
     */
    public function getPopularCategories() {
        try {
            $this->logger->info("Getting popular categories report");

            // Authenticate staff
            $user = $this->authMiddleware->requireStaff();
            if (!$user) return;

            $limit = $_GET['limit'] ?? 5;
            $categories = $this->reportModel->getPopularCategories($limit);
            
            if ($categories === false) {
                Response::error('Failed to retrieve popular categories');
                return;
            }

            $this->logger->info("Popular categories report generated");
            Response::success('Popular categories retrieved', $categories);

        } catch (Exception $e) {
            $this->logger->error("Error in getPopularCategories: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get customer insights
     */
    public function getCustomerInsights() {
        try {
            $this->logger->info("Getting customer insights");

            // Authenticate manager or admin
            $user = $this->authMiddleware->requireRoles(['admin', 'manager']);
            if (!$user) return;

            // This would typically include:
            // - New customers per period
            // - Repeat customer rate
            // - Customer lifetime value
            // - etc.
            
            $insights = [
                'new_customers_this_month' => 0,
                'repeat_customer_rate' => '0%',
                'average_orders_per_customer' => 0,
                'top_customers' => []
            ];

            $this->logger->info("Customer insights generated");
            Response::success('Customer insights retrieved', $insights);

        } catch (Exception $e) {
            $this->logger->error("Error in getCustomerInsights: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }
}
?>