<?php
/**
 * PDF Export Utility
 * Generates PDF reports using TCPDF
 */
require_once __DIR__ . '/../vendor/autoload.php'; // For Composer dependencies
require_once __DIR__ . '/Logger.php';

// Use TCPDF if available, otherwise provide fallback
if (class_exists('TCPDF')) {
    class PDFExporter extends TCPDF {
        private $logger;

        public function __construct() {
            parent::__construct();
            $this->logger = new Logger();
        }

        /**
         * Export sales report as PDF
         */
        public function exportSalesReport($reportData) {
            try {
                $this->logger->info("Exporting sales report as PDF");

                // Create new PDF document
                $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

                // Set document information
                $pdf->SetCreator('Aunt Joy Restaurant System');
                $pdf->SetAuthor('Aunt Joy Restaurant');
                $pdf->SetTitle('Sales Report');
                $pdf->SetSubject('Monthly Sales Report');

                // Add a page
                $pdf->AddPage();

                // Set font
                $pdf->SetFont('helvetica', 'B', 16);

                // Title
                $pdf->Cell(0, 10, 'Aunt Joy Restaurant - Sales Report', 0, 1, 'C');
                $pdf->SetFont('helvetica', '', 12);
                $pdf->Cell(0, 10, 'Period: ' . $reportData['metadata']['period'], 0, 1, 'C');
                $pdf->Cell(0, 10, 'Generated: ' . $reportData['metadata']['generated_at'], 0, 1, 'C');

                // Add some space
                $pdf->Ln(10);

                // Key Metrics
                $pdf->SetFont('helvetica', 'B', 14);
                $pdf->Cell(0, 10, 'Key Metrics', 0, 1);
                $pdf->SetFont('helvetica', '', 12);

                $metrics = [
                    'Total Revenue' => 'MK ' . number_format($reportData['total_revenue'], 2),
                    'Total Orders' => $reportData['total_orders'],
                    'Average Order Value' => 'MK ' . number_format($reportData['average_order_value'], 2),
                    'Active Customers' => $reportData['active_customers']
                ];

                foreach ($metrics as $label => $value) {
                    $pdf->Cell(100, 10, $label . ':', 0, 0);
                    $pdf->Cell(0, 10, $value, 0, 1);
                }

                $pdf->Ln(10);

                // Top Selling Items
                if (!empty($reportData['top_selling_items'])) {
                    $pdf->SetFont('helvetica', 'B', 14);
                    $pdf->Cell(0, 10, 'Top Selling Items', 0, 1);
                    $pdf->SetFont('helvetica', '', 10);

                    // Table header
                    $pdf->SetFillColor(240, 240, 240);
                    $pdf->Cell(100, 10, 'Meal Name', 1, 0, 'L', true);
                    $pdf->Cell(30, 10, 'Quantity', 1, 0, 'C', true);
                    $pdf->Cell(40, 10, 'Revenue', 1, 1, 'R', true);

                    // Table rows
                    foreach ($reportData['top_selling_items'] as $item) {
                        $pdf->Cell(100, 10, $item['meal_name'], 1, 0, 'L');
                        $pdf->Cell(30, 10, $item['total_quantity'], 1, 0, 'C');
                        $pdf->Cell(40, 10, 'MK ' . number_format($item['total_revenue'], 2), 1, 1, 'R');
                    }

                    $pdf->Ln(10);
                }

                // Output PDF
                $filename = 'sales-report-' . $reportData['metadata']['period'] . '.pdf';
                $pdf->Output($filename, 'D'); // Download

                $this->logger->info("PDF report exported successfully");

            } catch (Exception $e) {
                $this->logger->error("PDF export error: " . $e->getMessage());
                throw new Exception('Failed to generate PDF: ' . $e->getMessage());
            }
        }
    }
} else {
    // Fallback implementation if TCPDF is not available
    class PDFExporter {
        private $logger;

        public function __construct() {
            $this->logger = new Logger();
        }

        /**
         * Fallback PDF export - returns JSON instead
         */
        public function exportSalesReport($reportData) {
            $this->logger->warning("TCPDF not available, using fallback PDF export");

            // Instead of PDF, return JSON data
            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="sales-report-' . $reportData['metadata']['period'] . '.json"');

            echo json_encode([
                'success' => true,
                'message' => 'PDF export not available. Here is the report data in JSON format.',
                'data' => $reportData
            ]);
            exit;
        }
    }
}
?>
