<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MonitorApiRequests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:monitor {--filter=mobile : Filter by request type (mobile, web, all)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor API requests in real-time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Starting API Request Monitor...');
        $this->info('Press Ctrl+C to stop monitoring');
        $this->newLine();

        $filter = $this->option('filter');
        $logFile = storage_path('logs/laravel.log');
        
        if (!File::exists($logFile)) {
            $this->error('Log file not found: ' . $logFile);
            return 1;
        }

        $this->info("Monitoring log file: {$logFile}");
        $this->info("Filter: {$filter}");
        $this->newLine();

        // Clear screen
        system('cls');

        $this->info('🚀 API Request Monitor Started');
        $this->info('================================');
        $this->newLine();

        // Monitor the log file
        $this->monitorLogFile($logFile, $filter);

        return 0;
    }

    private function monitorLogFile($logFile, $filter)
    {
        $handle = fopen($logFile, 'r');
        
        if (!$handle) {
            $this->error('Could not open log file');
            return;
        }

        // Go to end of file
        fseek($handle, 0, SEEK_END);

        while (true) {
            $line = fgets($handle);
            
            if ($line !== false) {
                $this->processLogLine($line, $filter);
            } else {
                // No new data, wait a bit
                usleep(100000); // 100ms
            }
        }

        fclose($handle);
    }

    private function processLogLine($line, $filter)
    {
        // Look for API Request Debug entries
        if (str_contains($line, 'API Request Debug')) {
            $this->parseAndDisplayRequest($line, $filter);
        }
    }

    private function parseAndDisplayRequest($line, $filter)
    {
        try {
            // Extract JSON from log line
            $jsonStart = strpos($line, '{');
            if ($jsonStart === false) return;

            $jsonString = substr($line, $jsonStart);
            $data = json_decode($jsonString, true);

            if (!$data) return;

            // Apply filter
            if ($filter === 'mobile' && !($data['is_mobile_app'] ?? false)) {
                return;
            }
            
            if ($filter === 'web' && ($data['is_mobile_app'] ?? false)) {
                return;
            }

            // Display request info
            $timestamp = $data['timestamp'] ?? 'Unknown';
            $method = $data['method'] ?? 'Unknown';
            $path = $data['path'] ?? 'Unknown';
            $ip = $data['ip'] ?? 'Unknown';
            $appType = $data['app_type'] ?? 'Unknown';
            $isMobile = $data['is_mobile_app'] ?? false;

            $this->line("📱 {$timestamp}");
            $this->line("   {$method} {$path}");
            $this->line("   IP: {$ip}");
            $this->line("   Type: {$appType}");
            $this->line("   Mobile: " . ($isMobile ? '✅ Yes' : '❌ No'));
            
            if (isset($data['user_agent'])) {
                $this->line("   User Agent: {$data['user_agent']}");
            }
            
            if (isset($data['origin'])) {
                $this->line("   Origin: {$data['origin']}");
            }
            
            $this->newLine();

        } catch (\Exception $e) {
            // Ignore parsing errors
        }
    }
}
