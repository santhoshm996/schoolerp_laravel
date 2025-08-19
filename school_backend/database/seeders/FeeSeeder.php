<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FeeGroup;
use App\Models\FeeType;
use App\Models\Session;

class FeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the active session
        $session = Session::where('status', 'active')->first();
        
        if (!$session) {
            $this->command->info('No active session found. Please create a session first.');
            return;
        }

        // Create fee groups
        $feeGroups = [
            [
                'name' => 'Class 1 Fees',
                'description' => 'Standard fees for Class 1 students',
                'session_id' => $session->id,
                'is_active' => true
            ],
            [
                'name' => 'Class 2 Fees',
                'description' => 'Standard fees for Class 2 students',
                'session_id' => $session->id,
                'is_active' => true
            ],
            [
                'name' => 'Transportation Fees',
                'description' => 'Bus transportation fees for all classes',
                'session_id' => $session->id,
                'is_active' => true
            ],
            [
                'name' => 'Library Fees',
                'description' => 'Library membership and book fees',
                'session_id' => $session->id,
                'is_active' => true
            ],
            [
                'name' => 'Sports Fees',
                'description' => 'Sports equipment and facility fees',
                'session_id' => $session->id,
                'is_active' => true
            ]
        ];

        foreach ($feeGroups as $feeGroupData) {
            $feeGroup = FeeGroup::create($feeGroupData);
            
            // Create fee types for each group
            switch ($feeGroup->name) {
                case 'Class 1 Fees':
                    $this->createClassFees($feeGroup, 1);
                    break;
                case 'Class 2 Fees':
                    $this->createClassFees($feeGroup, 2);
                    break;
                case 'Transportation Fees':
                    $this->createTransportationFees($feeGroup);
                    break;
                case 'Library Fees':
                    $this->createLibraryFees($feeGroup);
                    break;
                case 'Sports Fees':
                    $this->createSportsFees($feeGroup);
                    break;
            }
        }

        $this->command->info('Fee groups and types seeded successfully!');
    }

    private function createClassFees($feeGroup, $classNumber)
    {
        $feeTypes = [
            [
                'name' => 'Tuition Fee',
                'description' => 'Monthly tuition fee',
                'amount' => 1500.00,
                'frequency' => 'monthly',
                'due_date' => now()->addDays(5)->format('Y-m-d'),
                'is_active' => true
            ],
            [
                'name' => 'Computer Lab Fee',
                'description' => 'Computer lab usage fee',
                'amount' => 300.00,
                'frequency' => 'monthly',
                'due_date' => now()->addDays(5)->format('Y-m-d'),
                'is_active' => true
            ],
            [
                'name' => 'Examination Fee',
                'description' => 'Term examination fee',
                'amount' => 500.00,
                'frequency' => 'quarterly',
                'due_date' => now()->addDays(30)->format('Y-m-d'),
                'is_active' => true
            ],
            [
                'name' => 'Development Fee',
                'description' => 'School development fee',
                'amount' => 1000.00,
                'frequency' => 'yearly',
                'due_date' => now()->addDays(60)->format('Y-m-d'),
                'is_active' => true
            ]
        ];

        foreach ($feeTypes as $feeTypeData) {
            $feeTypeData['fee_group_id'] = $feeGroup->id;
            $feeTypeData['session_id'] = $feeGroup->session_id;
            FeeType::create($feeTypeData);
        }
    }

    private function createTransportationFees($feeGroup)
    {
        $feeTypes = [
            [
                'name' => 'Bus Fee',
                'description' => 'Monthly bus transportation fee',
                'amount' => 800.00,
                'frequency' => 'monthly',
                'due_date' => now()->addDays(5)->format('Y-m-d'),
                'is_active' => true
            ],
            [
                'name' => 'Van Fee',
                'description' => 'Monthly van transportation fee',
                'amount' => 1000.00,
                'frequency' => 'monthly',
                'due_date' => now()->addDays(5)->format('Y-m-d'),
                'is_active' => true
            ]
        ];

        foreach ($feeTypes as $feeTypeData) {
            $feeTypeData['fee_group_id'] = $feeGroup->id;
            $feeTypeData['session_id'] = $feeGroup->session_id;
            FeeType::create($feeTypeData);
        }
    }

    private function createLibraryFees($feeGroup)
    {
        $feeTypes = [
            [
                'name' => 'Library Membership',
                'description' => 'Annual library membership fee',
                'amount' => 200.00,
                'frequency' => 'yearly',
                'due_date' => now()->addDays(30)->format('Y-m-d'),
                'is_active' => true
            ],
            [
                'name' => 'Book Deposit',
                'description' => 'Refundable book deposit',
                'amount' => 500.00,
                'frequency' => 'one_time',
                'due_date' => now()->addDays(15)->format('Y-m-d'),
                'is_active' => true
            ]
        ];

        foreach ($feeTypes as $feeTypeData) {
            $feeTypeData['fee_group_id'] = $feeGroup->id;
            $feeTypeData['session_id'] = $feeGroup->session_id;
            FeeType::create($feeTypeData);
        }
    }

    private function createSportsFees($feeGroup)
    {
        $feeTypes = [
            [
                'name' => 'Sports Equipment',
                'description' => 'Sports equipment usage fee',
                'amount' => 150.00,
                'frequency' => 'monthly',
                'due_date' => now()->addDays(5)->format('Y-m-d'),
                'is_active' => true
            ],
            [
                'name' => 'Swimming Pool',
                'description' => 'Swimming pool access fee',
                'amount' => 400.00,
                'frequency' => 'monthly',
                'due_date' => now()->addDays(5)->format('Y-m-d'),
                'is_active' => true
            ]
        ];

        foreach ($feeTypes as $feeTypeData) {
            $feeTypeData['fee_group_id'] = $feeGroup->id;
            $feeTypeData['session_id'] = $feeGroup->session_id;
            FeeType::create($feeTypeData);
        }
    }
}
