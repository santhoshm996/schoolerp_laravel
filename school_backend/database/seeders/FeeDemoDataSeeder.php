<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Session;
use App\Models\ClassRoom;
use App\Models\Section;
use App\Models\Student;
use App\Models\FeeGroup;
use App\Models\FeeType;
use App\Models\FeeMaster;
use App\Models\StudentFee;
use App\Models\FeeTransaction;
use App\Models\User;
use Carbon\Carbon;

class FeeDemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Fee Demo Data Seeding...');

        // Get or create active session
        $session = $this->getOrCreateSession();
        
        // Get existing classes and sections
        $classes = ClassRoom::all();
        $sections = Section::all();
        
        if ($classes->isEmpty() || $sections->isEmpty()) {
            $this->command->error('No classes or sections found. Please run SectionClassSeeder first.');
            return;
        }

        // Get or create users for fee collection
        $users = $this->getOrCreateUsers();

        // Create comprehensive fee structure
        $this->createFeeStructure($session, $classes);
        
        // Create student fee assignments
        $this->createStudentFeeAssignments($session, $classes, $sections);
        
        // Create fee transactions (payments)
        $this->createFeeTransactions($session, $users);

        $this->command->info('Fee Demo Data Seeding completed successfully!');
    }

    private function getOrCreateSession()
    {
        $session = Session::where('status', 'active')->first();
        
        if (!$session) {
            $session = Session::create([
                'name' => 'Academic Year 2024-25',
                'start_date' => '2024-06-01',
                'end_date' => '2025-05-31',
                'status' => 'active'
            ]);
            $this->command->info('Created new active session: ' . $session->name);
        }
        
        return $session;
    }

    private function getOrCreateUsers()
    {
        $users = [];
        
        // Create admin user if not exists
        $admin = User::where('email', 'admin@school.com')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'School Admin',
                'email' => 'admin@school.com',
                'username' => 'admin',
                'password' => bcrypt('password'),
                'status' => 'active'
            ]);
            $admin->assignRole('admin');
        }
        $users[] = $admin;

        // Create fee collector user if not exists
        $collector = User::where('email', 'collector@school.com')->first();
        if (!$collector) {
            $collector = User::create([
                'name' => 'Fee Collector',
                'email' => 'collector@school.com',
                'username' => 'collector',
                'password' => bcrypt('password'),
                'status' => 'active'
            ]);
            $collector->assignRole('accountant');
        }
        $users[] = $collector;

        return $users;
    }

    private function createFeeStructure($session, $classes)
    {
        $this->command->info('Creating fee structure...');

        // Create comprehensive fee groups
        $feeGroups = [
            [
                'name' => 'Tuition & Academic Fees',
                'description' => 'Core academic fees including tuition, examination, and development fees',
                'is_active' => true
            ],
            [
                'name' => 'Transportation Fees',
                'description' => 'Bus and van transportation services',
                'is_active' => true
            ],
            [
                'name' => 'Library & Resources',
                'description' => 'Library membership, books, and learning resources',
                'is_active' => true
            ],
            [
                'name' => 'Sports & Activities',
                'description' => 'Sports equipment, swimming pool, and extracurricular activities',
                'is_active' => true
            ],
            [
                'name' => 'Technology Fees',
                'description' => 'Computer lab, smart classroom, and digital learning resources',
                'is_active' => true
            ]
        ];

        foreach ($feeGroups as $groupData) {
            $groupData['session_id'] = $session->id;
            $feeGroup = FeeGroup::updateOrCreate(
                ['name' => $groupData['name'], 'session_id' => $session->id],
                $groupData
            );
            
            $this->createFeeTypesForGroup($feeGroup, $classes);
        }
    }

    private function createFeeTypesForGroup($feeGroup, $classes)
    {
        $feeTypes = [];

        switch ($feeGroup->name) {
            case 'Tuition & Academic Fees':
                $feeTypes = [
                    ['name' => 'Tuition Fee', 'amount' => 2000.00, 'frequency' => 'monthly'],
                    ['name' => 'Examination Fee', 'amount' => 800.00, 'frequency' => 'quarterly'],
                    ['name' => 'Development Fee', 'amount' => 1500.00, 'frequency' => 'yearly'],
                    ['name' => 'Laboratory Fee', 'amount' => 400.00, 'frequency' => 'monthly'],
                    ['name' => 'Activity Fee', 'amount' => 300.00, 'frequency' => 'monthly']
                ];
                break;

            case 'Transportation Fees':
                $feeTypes = [
                    ['name' => 'Bus Transportation', 'amount' => 1200.00, 'frequency' => 'monthly'],
                    ['name' => 'Van Transportation', 'amount' => 1500.00, 'frequency' => 'monthly'],
                    ['name' => 'Fuel Surcharge', 'amount' => 200.00, 'frequency' => 'monthly']
                ];
                break;

            case 'Library & Resources':
                $feeTypes = [
                    ['name' => 'Library Membership', 'amount' => 300.00, 'frequency' => 'yearly'],
                    ['name' => 'Book Deposit', 'amount' => 800.00, 'frequency' => 'one_time'],
                    ['name' => 'Digital Resources', 'amount' => 200.00, 'frequency' => 'monthly']
                ];
                break;

            case 'Sports & Activities':
                $feeTypes = [
                    ['name' => 'Sports Equipment', 'amount' => 250.00, 'frequency' => 'monthly'],
                    ['name' => 'Swimming Pool', 'amount' => 600.00, 'frequency' => 'monthly'],
                    ['name' => 'Coaching Fee', 'amount' => 400.00, 'frequency' => 'monthly']
                ];
                break;

            case 'Technology Fees':
                $feeTypes = [
                    ['name' => 'Computer Lab', 'amount' => 350.00, 'frequency' => 'monthly'],
                    ['name' => 'Smart Classroom', 'amount' => 200.00, 'frequency' => 'monthly'],
                    ['name' => 'Digital Learning', 'amount' => 150.00, 'frequency' => 'monthly']
                ];
                break;
        }

        foreach ($feeTypes as $typeData) {
            $typeData['fee_group_id'] = $feeGroup->id;
            $typeData['session_id'] = $feeGroup->session_id;
            $typeData['description'] = $typeData['name'] . ' for ' . $feeGroup->name;
            $typeData['due_date'] = $this->getDueDate($typeData['frequency']);
            $typeData['is_active'] = true;

            $feeType = FeeType::updateOrCreate(
                [
                    'name' => $typeData['name'],
                    'fee_group_id' => $feeGroup->id,
                    'session_id' => $feeGroup->session_id
                ],
                $typeData
            );

            // Create fee master entries for each class
            foreach ($classes as $class) {
                $amount = $this->adjustAmountForClass($typeData['amount'], $class->name);
                
                FeeMaster::updateOrCreate(
                    [
                        'fee_type_id' => $feeType->id,
                        'class_id' => $class->id,
                        'session_id' => $feeGroup->session_id
                    ],
                    [
                        'fee_group_id' => $feeGroup->id,
                        'amount' => $amount
                    ]
                );
            }
        }
    }

    private function getDueDate($frequency)
    {
        switch ($frequency) {
            case 'monthly':
                return now()->addDays(5)->format('Y-m-d');
            case 'quarterly':
                return now()->addDays(30)->format('Y-m-d');
            case 'yearly':
                return now()->addDays(60)->format('Y-m-d');
            default:
                return now()->addDays(15)->format('Y-m-d');
        }
    }

    private function adjustAmountForClass($baseAmount, $className)
    {
        // Adjust fees based on class level
        if (str_contains($className, '1')) {
            return $baseAmount * 0.8; // 20% discount for lower classes
        } elseif (str_contains($className, '2')) {
            return $baseAmount * 0.9; // 10% discount for middle classes
        }
        return $baseAmount; // Full amount for higher classes
    }

    private function createStudentFeeAssignments($session, $classes, $sections)
    {
        $this->command->info('Creating student fee assignments...');

        $students = Student::all();
        $feeTypes = FeeType::where('session_id', $session->id)->get();

        foreach ($students as $student) {
            $class = $classes->where('id', $student->class_id)->first();
            
            foreach ($feeTypes as $feeType) {
                // Get fee master amount for this student's class
                $feeMaster = FeeMaster::where('fee_type_id', $feeType->id)
                    ->where('class_id', $student->class_id)
                    ->where('session_id', $session->id)
                    ->first();

                if ($feeMaster) {
                    // Randomly assign some fees as already paid or partial
                    $status = $this->getRandomStatus();
                    $amountPaid = $this->getAmountPaid($status, $feeMaster->amount);

                    StudentFee::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'fee_type_id' => $feeType->id,
                            'session_id' => $session->id
                        ],
                        [
                            'amount_due' => $feeMaster->amount,
                            'amount_paid' => $amountPaid,
                            'status' => $status,
                            'due_date' => $feeType->due_date,
                            'notes' => $this->getRandomNotes($status)
                        ]
                    );
                }
            }
        }
    }

    private function getRandomStatus()
    {
        $statuses = ['pending', 'partial', 'paid', 'overdue'];
        $weights = [30, 25, 35, 10]; // 30% pending, 25% partial, 35% paid, 10% overdue
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $index => $weight) {
            $cumulative += $weight;
            if ($random <= $cumulative) {
                return $statuses[$index];
            }
        }
        
        return 'pending';
    }

    private function getAmountPaid($status, $totalAmount)
    {
        switch ($status) {
            case 'paid':
                return $totalAmount;
            case 'partial':
                return $totalAmount * (rand(20, 80) / 100); // 20-80% paid
            case 'overdue':
                return $totalAmount * (rand(0, 30) / 100); // 0-30% paid
            default:
                return 0;
        }
    }

    private function getRandomNotes($status)
    {
        $notes = [
            'pending' => ['Fee due', 'Payment pending', 'Reminder sent'],
            'partial' => ['Partial payment received', 'Balance pending', 'Installment paid'],
            'paid' => ['Payment completed', 'Receipt issued', 'Full payment received'],
            'overdue' => ['Payment overdue', 'Late fee applicable', 'Urgent payment required']
        ];

        $statusNotes = $notes[$status] ?? ['No notes'];
        return $statusNotes[array_rand($statusNotes)];
    }

    private function createFeeTransactions($session, $users)
    {
        $this->command->info('Creating fee transactions...');

        $studentFees = StudentFee::where('session_id', $session->id)
            ->where('amount_paid', '>', 0)
            ->get();

        $paymentModes = ['cash', 'online', 'cheque', 'bank_transfer'];
        $startDate = Carbon::parse($session->start_date);
        $endDate = Carbon::now();

        foreach ($studentFees as $studentFee) {
            if ($studentFee->amount_paid > 0) {
                // Create transaction for paid amount
                $paymentDate = $this->getRandomPaymentDate($startDate, $endDate);
                $paymentMode = $paymentModes[array_rand($paymentModes)];
                $collector = $users[array_rand($users)];

                FeeTransaction::create([
                    'student_id' => $studentFee->student_id,
                    'fee_type_id' => $studentFee->fee_type_id,
                    'amount_paid' => $studentFee->amount_paid,
                    'payment_date' => $paymentDate,
                    'payment_mode' => $paymentMode,
                    'receipt_no' => FeeTransaction::generateReceiptNo(),
                    'session_id' => $session->id,
                    'collected_by' => $collector->id,
                    'notes' => $this->getTransactionNotes($paymentMode, $studentFee->status),
                    'reference_no' => $this->getReferenceNumber($paymentMode)
                ]);
            }
        }

        // Create some additional partial payment transactions
        $this->createPartialPaymentTransactions($session, $users, $startDate, $endDate);
    }

    private function getRandomPaymentDate($startDate, $endDate)
    {
        $daysDiff = $startDate->diffInDays($endDate);
        $randomDays = rand(0, $daysDiff);
        return $startDate->copy()->addDays($randomDays);
    }

    private function getTransactionNotes($paymentMode, $status)
    {
        $notes = [
            'cash' => ['Cash payment received', 'Payment collected in cash'],
            'online' => ['Online payment successful', 'Digital payment received'],
            'cheque' => ['Cheque payment received', 'Cheque cleared'],
            'bank_transfer' => ['Bank transfer received', 'NEFT payment successful']
        ];

        $modeNotes = $notes[$paymentMode] ?? ['Payment received'];
        return $modeNotes[array_rand($modeNotes)];
    }

    private function getReferenceNumber($paymentMode)
    {
        if ($paymentMode === 'online') {
            return 'TXN' . strtoupper(uniqid());
        } elseif ($paymentMode === 'bank_transfer') {
            return 'NEFT' . date('Ymd') . rand(1000, 9999);
        } elseif ($paymentMode === 'cheque') {
            return 'CHQ' . date('Ymd') . rand(1000, 9999);
        }
        return null;
    }

    private function createPartialPaymentTransactions($session, $users, $startDate, $endDate)
    {
        $partialFees = StudentFee::where('session_id', $session->id)
            ->where('status', 'partial')
            ->get();

        foreach ($partialFees as $studentFee) {
            if ($studentFee->amount_paid > 0) {
                // Create multiple transactions for partial payments
                $remainingAmount = $studentFee->amount_due - $studentFee->amount_paid;
                $installments = rand(2, 4);
                $installmentAmount = $remainingAmount / $installments;

                for ($i = 0; $i < $installments; $i++) {
                    $paymentDate = $this->getRandomPaymentDate($startDate, $endDate);
                    $paymentMode = ['cash', 'online', 'cheque', 'bank_transfer'][array_rand([0, 1, 2, 3])];
                    $collector = $users[array_rand($users)];

                    FeeTransaction::create([
                        'student_id' => $studentFee->student_id,
                        'fee_type_id' => $studentFee->fee_type_id,
                        'amount_paid' => $installmentAmount,
                        'payment_date' => $paymentDate,
                        'payment_mode' => $paymentMode,
                        'receipt_no' => FeeTransaction::generateReceiptNo(),
                        'session_id' => $session->id,
                        'collected_by' => $collector->id,
                        'notes' => "Installment " . ($i + 1) . " of " . $installments,
                        'reference_no' => $this->getReferenceNumber($paymentMode)
                    ]);
                }
            }
        }
    }
}
