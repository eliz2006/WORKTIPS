<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\InkConsumption;
use App\Models\InkType;
use App\Models\IssueReport;
use App\Models\KnowledgeItem;
use App\Models\MaintenanceRecord;
use App\Models\Printer;
use App\Models\PrinterPart;
use App\Models\PrintingJob;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Anna Reyes',
            'email' => 'admin@worktips.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'department' => 'Operations',
        ]);

        $employee = User::create([
            'name' => 'Eliza Silongan',
            'email' => 'eliza@worktips.test',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'department' => 'Press Floor',
        ]);

        $mark = User::create([
            'name' => 'Mark Dela Cruz',
            'email' => 'mark@worktips.test',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'department' => 'Press Floor',
        ]);

        $categories = collect([
            ['name' => 'Printer', 'scope' => 'knowledge'],
            ['name' => 'Ink', 'scope' => 'knowledge'],
            ['name' => 'Maintenance', 'scope' => 'knowledge'],
            ['name' => 'Safety', 'scope' => 'knowledge'],
            ['name' => 'Troubleshooting', 'scope' => 'troubleshooting'],
        ])->map(fn ($row) => Category::create($row));

        $inks = collect([
            ['name' => 'EcoTank Black', 'color' => 'Black', 'brand' => 'Epson', 'formula' => 'dye'],
            ['name' => 'EcoTank Cyan', 'color' => 'Cyan', 'brand' => 'Epson', 'formula' => 'dye'],
            ['name' => 'EcoTank Magenta', 'color' => 'Magenta', 'brand' => 'Epson', 'formula' => 'dye'],
            ['name' => 'EcoTank Yellow', 'color' => 'Yellow', 'brand' => 'Epson', 'formula' => 'dye'],
            ['name' => 'Light Cyan', 'color' => 'Light Cyan', 'brand' => 'Epson', 'formula' => 'dye'],
            ['name' => 'Sublimation Black', 'color' => 'Black', 'brand' => 'InkTec', 'formula' => 'sublimation'],
        ])->map(fn ($row) => InkType::create($row + ['unit' => 'ml', 'low_stock_threshold' => 400]));

        $l805 = Printer::create([
            'name' => 'Epson L805',
            'brand' => 'Epson',
            'model' => 'L805',
            'type' => 'inkjet',
            'serial_number' => 'EP-L805-001',
            'printing_category' => 'sticker',
            'condition' => 'active',
            'maintenance_interval_days' => 30,
            'last_maintenance_at' => now()->subDays(20),
            'next_maintenance_at' => now()->addDays(10),
            'location' => 'Press Bay 1',
        ]);
        $hp = Printer::create([
            'name' => 'HP LaserJet Pro',
            'brand' => 'HP',
            'model' => 'M404dn',
            'type' => 'laser',
            'serial_number' => 'HP-M404-014',
            'printing_category' => 'digital',
            'condition' => 'active',
            'maintenance_interval_days' => 45,
            'last_maintenance_at' => now()->subDays(10),
            'next_maintenance_at' => now()->addDays(35),
            'location' => 'Office docs',
        ]);
        $canon = Printer::create([
            'name' => 'Canon G2010',
            'brand' => 'Canon',
            'model' => 'G2010',
            'type' => 'inkjet',
            'serial_number' => 'CN-G2010-008',
            'printing_category' => 'other',
            'condition' => 'maintenance',
            'maintenance_interval_days' => 30,
            'last_maintenance_at' => now()->subDays(40),
            'next_maintenance_at' => now()->subDays(2),
            'location' => 'Press Bay 2',
        ]);
        $sub = Printer::create([
            'name' => 'Epson F570',
            'brand' => 'Epson',
            'model' => 'SureColor F570',
            'type' => 'sublimation',
            'serial_number' => 'EP-F570-003',
            'printing_category' => 'sublimation',
            'condition' => 'active',
            'maintenance_interval_days' => 21,
            'last_maintenance_at' => now()->subDays(5),
            'next_maintenance_at' => now()->addDays(16),
            'location' => 'Apparel station',
        ]);
        $tarp = Printer::create([
            'name' => 'Roland TrueVIS VG3',
            'brand' => 'Roland',
            'model' => 'VG3-540',
            'type' => 'eco_solvent',
            'serial_number' => 'RL-VG3-540-02',
            'printing_category' => 'tarpaulin',
            'condition' => 'active',
            'maintenance_interval_days' => 14,
            'last_maintenance_at' => now()->subDays(8),
            'next_maintenance_at' => now()->addDays(6),
            'location' => 'Wide format bay',
        ]);

        $l805->inkTypes()->sync($inks->take(5)->pluck('id'));
        $sub->inkTypes()->sync([$inks->last()->id]);

        $l805->commonProblems()->createMany([
            ['title' => 'Ink not printing properly', 'description' => 'Missing nozzles or faded output.', 'recommended_solution' => "1. Confirm tanks are filled with compatible EcoTank ink.\n2. Run a nozzle check.\n3. Run a print-head cleaning cycle and reprint a test."],
            ['title' => 'Paper jam', 'description' => 'Media stuck in the path.', 'recommended_solution' => "1. Power off the printer.\n2. Pull paper in the feed direction.\n3. Check rollers for scraps before restarting."],
        ]);
        $canon->commonProblems()->create([
            'title' => 'Printer not turning on',
            'description' => 'No power LED.',
            'recommended_solution' => "1. Check the power cable and outlet.\n2. Confirm the switch is on.\n3. Escalate electrical faults to a supervisor — do not open the PSU.",
        ]);

        $printhead = PrinterPart::create([
            'name' => 'Printhead', 'sku' => 'PH-L805-01', 'part_type' => 'printhead',
            'quantity_on_hand' => 2, 'condition' => 'good', 'unit_cost' => 4200, 'reorder_level' => 1,
        ]);
        $tank = PrinterPart::create([
            'name' => 'Ink tank', 'sku' => 'IT-L805-02', 'part_type' => 'ink_tank',
            'quantity_on_hand' => 4, 'condition' => 'good', 'unit_cost' => 350, 'reorder_level' => 2,
        ]);
        $mbox = PrinterPart::create([
            'name' => 'Maintenance box', 'sku' => 'MB-HP-04', 'part_type' => 'maintenance_box',
            'quantity_on_hand' => 1, 'condition' => 'low_stock', 'unit_cost' => 1800, 'reorder_level' => 1,
        ]);
        $rollers = PrinterPart::create([
            'name' => 'Paper feed rollers', 'sku' => 'PF-CAN-03', 'part_type' => 'rollers',
            'quantity_on_hand' => 3, 'condition' => 'good', 'unit_cost' => 620, 'reorder_level' => 1,
        ]);
        $wiper = PrinterPart::create([
            'name' => 'Wiper blade', 'sku' => 'WB-VG3-11', 'part_type' => 'wiper_blade',
            'quantity_on_hand' => 5, 'condition' => 'good', 'unit_cost' => 890, 'reorder_level' => 2,
        ]);

        $printhead->printers()->sync([$l805->id]);
        $tank->printers()->sync([$l805->id]);
        $mbox->printers()->sync([$hp->id]);
        $rollers->printers()->sync([$canon->id]);
        $wiper->printers()->sync([$tarp->id]);

        KnowledgeItem::create([
            'user_id' => $mark->id,
            'category_id' => $categories[0]->id,
            'printer_id' => $l805->id,
            'title' => 'How to fix paper jam – Epson L805',
            'type' => 'troubleshooting',
            'status' => 'approved',
            'body' => "Turn the printer off. Open the rear cover and pull paper slowly in the direction of the path. Never yank media against the rollers. Inspect for torn scraps, reload media square, then run a test print.",
            'views' => 128,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subDays(12),
        ]);
        KnowledgeItem::create([
            'user_id' => $admin->id,
            'category_id' => $categories[1]->id,
            'title' => 'Best ink for Epson printers',
            'type' => 'documentation',
            'status' => 'approved',
            'body' => "Use dye EcoTank inks on L-series printers. Confirm bottle color matches the tank cap. Sublimation inks are only for dedicated sublimation machines such as the F570.",
            'views' => 96,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subDays(20),
        ]);
        KnowledgeItem::create([
            'user_id' => $employee->id,
            'category_id' => $categories[2]->id,
            'printer_id' => $l805->id,
            'title' => 'Cleaning the print head',
            'type' => 'procedure',
            'status' => 'approved',
            'body' => "Run a nozzle check first. If gaps remain, run one cleaning cycle, wait for the printer to finish, then check again. Avoid repeated cleanings that flood the waste ink pad.",
            'views' => 77,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now()->subDays(8),
        ]);
        KnowledgeItem::create([
            'user_id' => $mark->id,
            'category_id' => $categories[0]->id,
            'title' => 'Reset printer error 0x97',
            'type' => 'tutorial',
            'status' => 'pending',
            'body' => "Record the exact error and model. Power off, wait 60 seconds, and restart only if the manual allows. If the error returns, stop and file an issue report.",
            'views' => 41,
        ]);

        IssueReport::create([
            'user_id' => $employee->id,
            'printer_id' => $l805->id,
            'title' => 'Ink not printing properly',
            'details' => 'Cyan channel missing on nozzle check after refill.',
            'priority' => 'high',
            'status' => 'open',
            'recommended_solution' => $l805->commonProblems()->first()->recommended_solution,
        ]);
        IssueReport::create([
            'user_id' => $mark->id,
            'printer_id' => $hp->id,
            'title' => 'Paper jam',
            'details' => 'Duplex path jam on 80gsm bond.',
            'priority' => 'medium',
            'status' => 'in_progress',
        ]);
        IssueReport::create([
            'user_id' => $employee->id,
            'printer_id' => $canon->id,
            'title' => 'Printer not turning on',
            'details' => 'No LED after power cycle.',
            'priority' => 'high',
            'status' => 'resolved',
            'resolved_at' => now()->subDays(2),
            'recommended_solution' => $canon->commonProblems()->first()->recommended_solution,
        ]);

        $products = [
            ['Tarpaulin 2x3', 'tarpaulin', $tarp, 1378, 35],
            ['Tarpaulin 3x4', 'tarpaulin', $tarp, 1245, 29],
            ['Vinyl sticker', 'sticker', $l805, 1102, 24],
            ['Sublimation shirt', 'sublimation', $sub, 1050, 18],
            ['Digital copies', 'digital', $hp, 18, 40],
        ];

        foreach (range(1, 12) as $month) {
            foreach ($products as [$name, $type, $printer, $price, $qtyBase]) {
                $qty = max(1, (int) round($qtyBase * (0.6 + ($month / 20))));
                $job = PrintingJob::create([
                    'printer_id' => $printer->id,
                    'sold_by' => $month % 2 ? $employee->id : $admin->id,
                    'customer_name' => 'Walk-in',
                    'printing_type' => $type,
                    'product_name' => $name,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'job_date' => Carbon::create(2026, $month, min(28, 4 + $month)),
                    'status' => 'completed',
                ]);

                $ink = $printer->inkTypes()->first() ?? $inks->first();
                InkConsumption::create([
                    'ink_type_id' => $ink->id,
                    'printer_id' => $printer->id,
                    'printing_job_id' => $job->id,
                    'recorded_by' => $admin->id,
                    'quantity' => round(8 + $month * 1.4 + $qty * 0.15, 2),
                    'unit' => 'ml',
                    'consumed_on' => $job->job_date,
                ]);
            }
        }

        $record = MaintenanceRecord::create([
            'printer_id' => $l805->id,
            'performed_by' => $admin->id,
            'performed_at' => now()->subDays(20),
            'work_type' => 'parts_replacement',
            'notes' => 'Replaced wiper and inspected printhead.',
            'next_due_at' => now()->addDays(10),
        ]);
        $record->parts()->create(['printer_part_id' => $printhead->id, 'quantity' => 1]);
        MaintenanceRecord::create([
            'printer_id' => $canon->id,
            'performed_by' => $admin->id,
            'performed_at' => now()->subDays(2),
            'work_type' => 'repair',
            'notes' => 'Power supply inspection in progress.',
            'next_due_at' => now()->subDays(2),
        ])->parts()->create(['printer_part_id' => $rollers->id, 'quantity' => 1]);
    }
}
