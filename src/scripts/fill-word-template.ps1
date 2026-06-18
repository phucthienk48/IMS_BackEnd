param(
  [Parameter(Mandatory = $true)][string]$Type,
  [Parameter(Mandatory = $true)][string]$TemplatePath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][string]$DataPath
)

$ErrorActionPreference = "Stop"

function Get-Text($value) {
  if ($null -eq $value) { return "" }
  return [string]$value
}

function Format-DateVN($value) {
  if ([string]::IsNullOrWhiteSpace([string]$value)) { return ".........."}
  try {
    return ([datetime]$value).ToString("dd'/'MM'/'yyyy")
  } catch {
    return ".........."
  }
}

function Has-Value($value) {
  return -not [string]::IsNullOrWhiteSpace([string]$value)
}

function Pick-Value {
  foreach ($value in $args) {
    if (Has-Value $value) { return [string]$value }
  }
  return ""
}

function Set-ParagraphText($doc, [int]$index, [string]$text) {
  if ($index -gt $doc.Paragraphs.Count) { return }
  $range = $doc.Paragraphs.Item($index).Range
  if ($range.End -gt $range.Start) { $range.End = $range.End - 1 }
  $range.Text = $text
}

function Set-CellText($table, [int]$row, [int]$col, [string]$text) {
  try {
    $range = $table.Cell($row, $col).Range
    if ($range.End -gt $range.Start) { $range.End = $range.End - 1 }
    $range.Text = $text
  } catch {
    # Ignore missing merged cells; templates are fixed but Word may report them oddly.
  }
}

function Set-WeekCell($table, [int]$row, [int]$week, $report) {
  $fromDate = Format-DateVN $report.fromDate
  $toDate = Format-DateVN $report.toDate
  Set-CellText $table $row 1 "$week`rTừ ngày`r$fromDate`rđến ngày`r$toDate"
}

function Get-AcademicYear($app) {
  $dateValue = Pick-Value $app.startDate $app.topic.startday
  if (Has-Value $dateValue) {
    try {
      $d = [datetime]$dateValue
      if ($d.Month -ge 9) {
        return "$($d.Year)-$($d.Year + 1)"
      }
      return "$($d.Year - 1)-$($d.Year)"
    } catch {}
  }

  $now = Get-Date
  if ($now.Month -ge 9) { return "$($now.Year)-$($now.Year + 1)" }
  return "$($now.Year - 1)-$($now.Year)"
}

function Get-ReportByWeek($reports, [int]$week) {
  foreach ($report in $reports) {
    if ([int]$report.week -eq $week) { return $report }
  }

  return [pscustomobject]@{
    fromDate = $null
    toDate = $null
    content = ""
    feedback = ""
    hoursOrSessions = ""
  }
}

function Get-AssignmentByWeek($assignments, [int]$week) {
  foreach ($assignment in $assignments) {
    if ([int]$assignment.week -eq $week) { return $assignment }
  }

  return [pscustomobject]@{
    fromDate = $null
    toDate = $null
    content = ""
    hoursOrSessions = ""
  }
}

$payload = Get-Content -Raw -Encoding UTF8 $DataPath | ConvertFrom-Json
$app = $payload.application
$center = $payload.center
$reports = if ($payload.reports) { @($payload.reports) } else { @() }
$assignments = if ($payload.assignments) { @($payload.assignments) } else { @() }

$topic = $app.topic
$companyName = Pick-Value $center.name $app.companyName $topic.companyName
$companyAddress = Pick-Value $center.address $app.companyAddress $topic.companyAddress
$companyPhone = Pick-Value $center.phone $app.companyPhone $topic.companyPhone
$supervisorName = Pick-Value $topic.lecturer.username $topic.supervisorName $app.supervisorName
$supervisorPhone = Pick-Value $topic.supervisorPhone $app.supervisorPhone
$supervisorEmail = Pick-Value $topic.lecturer.email $topic.supervisorEmail $app.supervisorEmail $center.email
$projectedTasks = Pick-Value $app.projectedTasks $topic.description $topic.requirement
$startDate = Pick-Value $app.startDate $topic.startday
$endDate = Pick-Value $app.endDate $topic.endday
$fullName = Get-Text $app.fullName
$studentCode = Get-Text $app.studentCode
$classCode = Get-Text $app.classCode
$major = Get-Text $app.major
$hasOfficeText = if ([bool]$center.hasOffice -or [bool]$app.hasOffice) { "Có" } else { "Không" }
$hasComputerText = if ([bool]$center.hasComputer -or [bool]$app.hasComputer) { "Có" } else { "Không" }
$today = Get-Date

$word = $null
$doc = $null

try {
  Copy-Item -LiteralPath $TemplatePath -Destination $OutputPath -Force

  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($OutputPath, $false, $false)

  if ($Type -eq "phieu-nhan") {
    Set-ParagraphText $doc 3 "Thời gian thực tập: từ $(Format-DateVN $startDate) đến $(Format-DateVN $endDate)"
    Set-ParagraphText $doc 5 "Tên cơ quan: `t$companyName"
    Set-ParagraphText $doc 7 "Địa chỉ: `t$companyAddress"
    Set-ParagraphText $doc 8 "Số điện thoại (đề nghị ghi rõ để tiện liên hệ):`t$companyPhone"
    Set-ParagraphText $doc 9 "Họ tên cán bộ phụ trách: `t$supervisorName`tĐiện thoại: $supervisorPhone"
    Set-ParagraphText $doc 10 "Email cán bộ phụ trách:`t$supervisorEmail"
    Set-ParagraphText $doc 11 "Cơ quan có điều kiện cho SV thực tập gồm: Phòng làm việc: $hasOfficeText, Máy tính: $hasComputerText"
    Set-ParagraphText $doc 14 "Họ tên:`t$fullName`tMASV:`t$studentCode"
    Set-ParagraphText $doc 15 "Mã lớp: $classCode. Ngành:`t$major"
    Set-ParagraphText $doc 42 "`t...................., ngày $($today.Day) tháng $($today.Month) năm $($today.Year)"

    if ($doc.Tables.Count -ge 1) {
      $table = $doc.Tables.Item(1)
      Set-CellText $table 2 1 $projectedTasks
      Set-CellText $table 2 2 "$(Get-Text $app.workHoursPerDay) giờ/ngày`r$(Get-Text $app.workDaysPerWeek) ngày/tuần"
    }
  } elseif ($Type -eq "giao-viec") {
    Set-ParagraphText $doc 2 "Học kỳ III, năm học $(Get-AcademicYear $app)"
    Set-ParagraphText $doc 4 "Họ và tên sinh viên:`t$fullName`tMSSV:`t$studentCode"
    Set-ParagraphText $doc 5 "Cơ quan thực tập:`t$companyName"
    Set-ParagraphText $doc 6 "Họ và tên cán bộ hướng dẫn:`t$supervisorName"
    Set-ParagraphText $doc 7 "Thời gian thực tập: từ ngày $(Format-DateVN $startDate) đến $(Format-DateVN $endDate)"

    $table = $doc.Tables.Item(1)
    for ($week = 1; $week -le 12; $week++) {
      $assignment = Get-AssignmentByWeek $assignments $week
      $row = $week + 1
      Set-WeekCell $table $row $week $assignment
      Set-CellText $table $row 2 (Get-Text $assignment.content)
      Set-CellText $table $row 3 (Get-Text $assignment.hoursOrSessions)
    }
  } elseif ($Type -eq "theo-doi") {
    Set-ParagraphText $doc 2 "Học kỳ III, năm học $(Get-AcademicYear $app)"
    Set-ParagraphText $doc 4 "Họ và tên sinh viên:`t$fullName`tMSSV:`t$studentCode"
    Set-ParagraphText $doc 5 "Cơ quan thực tập:`t$companyName"
    Set-ParagraphText $doc 6 "Họ và tên cán bộ hướng dẫn:`t$supervisorName"
    Set-ParagraphText $doc 7 "Thời gian thực tập: từ ngày  $(Format-DateVN $startDate)   đến   $(Format-DateVN $endDate)"

    $table = $doc.Tables.Item(1)
    for ($week = 1; $week -le 12; $week++) {
      $report = Get-ReportByWeek $reports $week
      $row = $week + 1
      Set-WeekCell $table $row $week $report
      Set-CellText $table $row 2 (Get-Text $report.content)
      Set-CellText $table $row 3 (Get-Text $report.feedback)
      Set-CellText $table $row 4 (Get-Text $report.hoursOrSessions)
    }
  } else {
    throw "Unknown export type: $Type"
  }

  $doc.Save()
} finally {
  if ($null -ne $doc) { $doc.Close($true) | Out-Null }
  if ($null -ne $word) { $word.Quit() | Out-Null }
}
