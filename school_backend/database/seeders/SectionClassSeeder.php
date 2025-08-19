<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Section;
use App\Models\ClassRoom;

class SectionClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample sections
        $sections = [
            'Section A',
            'Section B',
            'Section C',
            'Section D'
        ];

        foreach ($sections as $sectionName) {
            Section::create(['name' => $sectionName]);
        }

        // Create sample classes
        $classes = [
            ['name' => 'Class 1', 'section_id' => 1],
            ['name' => 'Class 2', 'section_id' => 1],
            ['name' => 'Class 1', 'section_id' => 2],
            ['name' => 'Class 2', 'section_id' => 2],
            ['name' => 'Class 1', 'section_id' => 3],
            ['name' => 'Class 2', 'section_id' => 3],
            ['name' => 'Class 1', 'section_id' => 4],
            ['name' => 'Class 2', 'section_id' => 4],
        ];

        foreach ($classes as $classData) {
            ClassRoom::create($classData);
        }
    }
}
