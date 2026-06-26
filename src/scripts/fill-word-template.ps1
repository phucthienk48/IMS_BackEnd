param(
  [Parameter(Mandatory = $true)][string]$Type,
  [Parameter(Mandatory = $true)][string]$TemplatePath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][string]$DataPath
)

$ErrorActionPreference = "Stop"

function Get-Text($v) {
  if ($null -eq $v) { return "" }
  return [string]$v
}

function Has-Value($v) {
  return -not [string]::IsNullOrWhiteSpace([string]$v)
}

function Pick-Value {
  foreach ($v in $args) {
    if (Has-Value $v) { return [string]$v }
  }
  return ""
}

function Format-DateVN($v) {
  if (-not (Has-Value $v)) { return ".........." }

  try {
    return ([datetime]$v).ToString("dd/MM/yyyy")
  }
  catch {
    return ".........."
  }
}

function ApplyTemplateFont($range){

  try{

    $range.Font.Name = "Times New Roman"

    $range.Font.Size = 13

    $range.Font.Bold = $false

    $range.Font.Italic = $false

  }catch{}

}

function ApplyCellFont($range){

  try{

    $range.Font.Name = "Times New Roman"

    $range.Font.Size = 10

    $range.Font.Bold = $false

  }catch{}

}

function Set-ParagraphText($doc,[int]$index,[string]$text){

  try{

    if($index -gt $doc.Paragraphs.Count){
      return
    }

    $range=$doc.Paragraphs.Item($index).Range

    if($range.End -gt $range.Start){
      $range.End--
    }

    $range.Text=$text

    ApplyTemplateFont $range

  }catch{}

}

function Set-CellText($table,[int]$row,[int]$col,[string]$text){

  try{

    $range=$table.Cell($row,$col).Range

    if($range.End -gt $range.Start){
      $range.End--
    }

    $range.Text=$text

    ApplyCellFont $range

    $range.ParagraphFormat.Alignment = 0
    $range.ParagraphFormat.SpaceAfter = 0
    $range.ParagraphFormat.SpaceBefore = 0

  }catch{}

}

function Set-WeekCell($table,$row,$week,$obj){

  $from=Format-DateVN $obj.fromDate
  $to=Format-DateVN $obj.toDate

  Set-CellText $table $row 1 "$week`rTừ ngày`r$from`rđến ngày`r$to"
}

function Get-ItemByWeek($list,$week){

  foreach($i in $list){

    if([int]$i.week -eq $week){
      return $i
    }

  }

  return [pscustomobject]@{
    fromDate=""
    toDate=""
    content=""
    feedback=""
    hoursOrSessions=""
  }

}

function Get-AcademicYear($app){

  $date=Pick-Value $app.startDate $app.topic.startday

  try{

    if($date){

      $d=[datetime]$date

      if($d.Month -ge 9){
        return "$($d.Year)-$($d.Year+1)"
      }

      return "$($d.Year-1)-$($d.Year)"

    }

  }catch{}

  $now=Get-Date

  if($now.Month -ge 9){
    return "$($now.Year)-$($now.Year+1)"
  }

  return "$($now.Year-1)-$($now.Year)"
}

$word=$null
$doc=$null

try{

  Copy-Item $TemplatePath $OutputPath -Force

  Start-Sleep -Milliseconds 500

  $payload=Get-Content $DataPath -Raw -Encoding UTF8 | ConvertFrom-Json

  $app=$payload.application
  $center=$payload.center

  $reports=@()
  if($payload.reports){
    $reports=@($payload.reports)
  }

  $assignments=@()
  if($payload.assignments){
    $assignments=@($payload.assignments)
  }

  $topic=$app.topic

  $companyName=Pick-Value $center.name $app.companyName $topic.companyName
  $companyAddress=Pick-Value $center.address $app.companyAddress
  $companyPhone=Pick-Value $center.phone $app.companyPhone

  $supervisorName=Pick-Value $topic.lecturer.username $app.supervisorName
  $supervisorPhone=Pick-Value $topic.supervisorPhone $app.supervisorPhone
  $supervisorEmail=Pick-Value $topic.lecturer.email $app.supervisorEmail

  $fullName=Get-Text $app.fullName
  $studentCode=Get-Text $app.studentCode
  $classCode=Get-Text $app.classCode
  $major=Get-Text $app.major

  $startDate=Pick-Value $app.startDate $topic.startday
  $endDate=Pick-Value $app.endDate $topic.endday

  $projectedTasks=Pick-Value `
      $app.projectedTasks `
      $topic.description `
      $topic.requirement

  $today=Get-Date

  $word=New-Object -ComObject Word.Application

  $word.Visible=$false
  $word.DisplayAlerts=0

  $doc=$word.Documents.Open($OutputPath)

  if($Type -eq "phieu-nhan"){

      Set-ParagraphText $doc 3 "Thời gian thực tập: từ $(Format-DateVN $startDate) đến $(Format-DateVN $endDate)"

      Set-ParagraphText $doc 5 "Tên cơ quan: $companyName"

      Set-ParagraphText $doc 7 "Địa chỉ: $companyAddress"

      Set-ParagraphText $doc 8 "Số điện thoại: $companyPhone"

      Set-ParagraphText $doc 9 "Cán bộ phụ trách: $supervisorName - $supervisorPhone"

      Set-ParagraphText $doc 10 "Email: $supervisorEmail"

      Set-ParagraphText $doc 14 "Họ tên: $fullName     MSSV: $studentCode"

      Set-ParagraphText $doc 15 "Mã lớp: $classCode     Ngành: $major"

      if($doc.Tables.Count -ge 1){

        $table=$doc.Tables.Item(1)

        Set-CellText $table 2 1 $projectedTasks

        Set-CellText $table 2 2 "$($app.workHoursPerDay) giờ/ngày"
      }

  }

    elseif ($Type -eq "giao-viec") {

        Set-ParagraphText $doc 2 "Học kỳ III, năm học $(Get-AcademicYear $app)"
        Set-ParagraphText $doc 4 "Họ và tên sinh viên: $fullName     MSSV: $studentCode"
        Set-ParagraphText $doc 5 "Cơ quan thực tập: $companyName"
        Set-ParagraphText $doc 6 "Họ và tên cán bộ hướng dẫn: $supervisorName"
        Set-ParagraphText $doc 7 "Thời gian thực tập: từ ngày $(Format-DateVN $startDate) đến $(Format-DateVN $endDate)"

        if ($doc.Tables.Count -gt 0) {

            $table = $doc.Tables.Item(1)

            for ($week = 1; $week -le 12; $week++) {

                $a = Get-ItemByWeek $assignments $week

                # Hiển thị tuần + ngày
                Set-WeekCell $table ($week + 1) $week $a

                $content = ""
                $hours = ""

                if ($a) {
                    $content = Get-Text $a.content
                    $hours = Get-Text $a.hoursOrSessions
                }

                Set-CellText $table ($week + 1) 2 $content
                Set-CellText $table ($week + 1) 3 $hours
            }
        }
    }

    elseif ($Type -eq "theo-doi") {

        Set-ParagraphText $doc 4 "Họ và tên sinh viên: $fullName     MSSV: $studentCode"
        Set-ParagraphText $doc 5 "Cơ quan thực tập: $companyName"
        Set-ParagraphText $doc 6 "Họ và tên cán bộ hướng dẫn: $supervisorName"
        Set-ParagraphText $doc 7 "Thời gian thực tập: từ ngày $(Format-DateVN $startDate) đến $(Format-DateVN $endDate)"

        if ($doc.Tables.Count -gt 0) {

            $table = $doc.Tables.Item(1)

            for ($week = 1; $week -le 12; $week++) {

                $r = Get-ItemByWeek $reports $week

                # Hiển thị tuần + ngày
                Set-WeekCell $table ($week + 1) $week $r

                $content = ""
                $feedback = ""
                $hours = ""

                if ($r) {
                    $content = Get-Text $r.content
                    $feedback = Get-Text $r.feedback
                    $hours = Get-Text $r.hoursOrSessions
                }

                Set-CellText $table ($week + 1) 2 $content
                Set-CellText $table ($week + 1) 3 $feedback
                Set-CellText $table ($week + 1) 4 $hours
            }
        }
    }

  $doc.Save()

}
finally{

  try{
    if($doc){
      $doc.Close([ref]$false)
    }
  }catch{}

  try{
    if($word){
      $word.Quit()
    }
  }catch{}

  try{
    if($doc){
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc)|Out-Null
    }

    if($word){
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)|Out-Null
    }
  }catch{}

  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()

}