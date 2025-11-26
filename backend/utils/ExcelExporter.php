<?php
/**
 * Excel Export Utility
 * Generates Excel reports using PhpSpreadsheet
 */
require_once '../vendor/autoload.php'; // For Composer dependencies
require_once '../utils/Logger.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Use PhpSpreadsheet if available, otherwise provide fallback
if (class_exists('PhpOffice\PhpSpreadsheet\Spreadsheet')) {

    class ExcelExporter {
        private $logger;

        public function __construct() {
            $this->logger = new Logger();
        }

        /**
         * Export sales report as Excel
         */
        public function exportSalesReport($reportData) {
            try {
                $this->logger->info("Exporting sales report as Excel");

                // Create new Spreadsheet
                $spreadsheet = new Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();

                // Set document properties
                $spreadsheet->getProperties()
                    ->setCreator('Aunt Joy Restaurant System')
                    ->setLastModifiedBy('Aunt Joy Restaurant')
                    ->setTitle('Sales Report')
                    ->setSubject('Monthly Sales Report');

                // Set headers and title
                $sheet->setCellValue('A1', 'Aunt Joy Restaurant - Sales Report');
                $sheet->mergeCells('A1:E1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                $sheet->getStyle('A1')->getAlignment()->setHorizontal('center');

                $sheet->setCellValue('A2', 'Period: ' . $reportData['metadata']['period']);
                $sheet->setCellValue('A3', 'Generated: ' . $reportData['metadata']['generated_at']);

                // Key Metrics
                $sheet->setCellValue('A5', 'Key Metrics');
                $sheet->getStyle('A5')->getFont()->setBold(true)->setSize(14);

                $metrics = [
                    ['Total Revenue', 'MK ' . number_format($reportData['total_revenue'], 2)],
                    ['Total Orders', $reportData['total_orders']],
                    ['Average Order Value', 'MK ' . number_format($reportData['average_order_value'], 2)],
                    ['Active Customers', $reportData['active_customers']]
                ];

                $row = 6;
                foreach ($metrics as $metric) {
                    $sheet->setCellValue('A' . $row, $metric[0]);
                    $sheet->setCellValue('B' . $row, $metric[1]);
                    $row++;
                }

                $row += 2;

                // Top Selling Items
                if (!empty($reportData['top_selling_items'])) {
                    $sheet->setCellValue('A' . $row, 'Top Selling Items');
                    $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
                    $row++;

                    // Table header
                    $sheet->setCellValue('A' . $row, 'Meal Name');
                    $sheet->setCellValue('B' . $row, 'Quantity');
                    $sheet->setCellValue('C' . $row, 'Revenue');
                    $sheet->getStyle('A' . $row . ':C' . $row)->getFont()->setBold(true);
                    $row++;

                    // Table data
                    foreach ($reportData['top_selling_items'] as $item) {
                        $sheet->setCellValue('A' . $row, $item['meal_name']);
                        $sheet->setCellValue('B' . $row, $item['total_quantity']);
                        $sheet->setCellValue('C' . $row, $item['total_revenue']);
                        $row++;
                    }
                }

                // Auto-size columns
                foreach (range('A', 'C') as $column) {
                    $sheet->getColumnDimension($column)->setAutoSize(true);
                }

                // Create Excel file
                $writer = new Xlsx($spreadsheet);
                
                // Output to browser
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment;filename="sales-report-' . $reportData['metadata']['period'] . '.xlsx"');
                header('Cache-Control: max-age=0');
                
                $writer->save('php://output');
                $this->logger->info("Excel report exported successfully");

            } catch (Exception $e) {
                $this->logger->error("Excel export error: " . $e->getMessage());
                throw new Exception('Failed to generate Excel: ' . $e->getMessage());
            }
        }
    }
} else {
    // Fallback implementation if PhpSpreadsheet is not available
    class ExcelExporter {
        private $logger;

        public function __construct() {
            $this->logger = new Logger();
        }

        /**
         * Fallback Excel export - returns CSV instead
         */
        public function exportSalesReport($reportData) {
            $this->logger->warning("PhpSpreadsheet not available, using fallback Excel export");
            
            // Instead of Excel, return CSV data
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="sales-report-' . $reportData['metadata']['period'] . '.csv"');
            
            $output = fopen('php://output', 'w');
            
            // Write header
            fputcsv($output, ['Aunt Joy Restaurant - Sales Report']);
            fputcsv($output, ['Period:', $reportData['metadata']['period']]);
            fputcsv($output, ['Generated:', $reportData['metadata']['generated_at']]);
            fputcsv($output, []); // Empty line
            
            // Write key metrics
            fputcsv($output, ['Key Metrics']);
            fputcsv($output, ['Total Revenue', 'MK ' . number_format($reportData['total_revenue'], 2)]);
            fputcsv($output, ['Total Orders', $reportData['total_orders']]);
            fputcsv($output, ['Average Order Value', 'MK ' . number_format($reportData['average_order_value'], 2)]);
            fputcsv($output, ['Active Customers', $reportData['active_customers']]);
            fputcsv($output, []); // Empty line
            
            // Write top selling items
            if (!empty($reportData['top_selling_items'])) {
                fputcsv($output, ['Top Selling Items']);
                fputcsv($output, ['Meal Name', 'Quantity', 'Revenue']);
                
                foreach ($reportData['top_selling_items'] as $item) {
                    fputcsv($output, [
                        $item['meal_name'],
                        $item['total_quantity'],
                        'MK ' . number_format($item['total_revenue'], 2)
                    ]);
                }
            }
            
            fclose($output);
            exit;
        }
    }
}
?>