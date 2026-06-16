try {
    [void][System.Reflection.Assembly]::LoadWithPartialName("System.Runtime.WindowsRuntime")
    [void][Windows.Services.Store.StoreContext, Windows.Services.Store, ContentType=WindowsRuntime]
    
    $context = [Windows.Services.Store.StoreContext]::GetDefault()
    if ($null -eq $context) {
        Write-Output "INACTIVE"
        exit 0
    }

    $licenseTask = $context.GetAppLicenseAsync()
    # Wait for the task to complete with a strict 10s timeout to prevent infinite hangs
    $timeoutMs = 10000
    $elapsedMs = 0
    $intervalMs = 100
    while (-not $licenseTask.IsCompleted -and $elapsedMs -lt $timeoutMs) {
        Start-Sleep -Milliseconds $intervalMs
        $elapsedMs += $intervalMs
    }
    
    if (-not $licenseTask.IsCompleted) {
        Write-Output "INACTIVE_TIMEOUT"
        exit 0
    }
    
    $appLicense = $licenseTask.GetResults()
    if ($null -eq $appLicense) {
        Write-Output "INACTIVE"
        exit 0
    }

    $subscriptionStoreId = "9NBLGGH4RKVV"
    
    if ($appLicense.AddOnLicenses.ContainsKey($subscriptionStoreId)) {
        $license = $appLicense.AddOnLicenses[$subscriptionStoreId]
        if ($license.IsActive) {
            Write-Output "ACTIVE"
            exit 0
        }
    }
    Write-Output "INACTIVE"
} catch {
    Write-Output "INACTIVE_ERROR: $($_.Exception.Message)"
}
