# ============================================================
#  CK-APP fixes v2 — line-ending tolerant
# ============================================================

Set-Location "."
$Branch = "main"

if (-not (Test-Path ".git")) {
  Write-Host "ERROR: not a git repo." -ForegroundColor Red
  exit 1
}

function Replace-InFile {
  param([string]$Path,[string]$Find,[string]$Replace,[string]$Label)
  if (-not (Test-Path $Path)) {
    Write-Host "SKIP (missing): $Path" -ForegroundColor Yellow
    return
  }
  # Read raw, normalize BOTH the file and the patterns to LF for matching,
  # then write back with LF (VS Code / git handle this fine on Windows).
  $content = (Get-Content -Raw -Path $Path) -replace "`r`n","`n"
  $find    = $Find    -replace "`r`n","`n"
  $repl    = $Replace -replace "`r`n","`n"

  if ($content -notmatch [regex]::Escape($find)) {
    Write-Host "SKIP (pattern not found): $Label in $Path" -ForegroundColor Yellow
    return
  }
  $content = $content.Replace($find, $repl)
  Set-Content -Path $Path -Value $content -NoNewline
  Write-Host "OK: $Label" -ForegroundColor Green
}

# ------------------------------------------------------------
# 1. TodosScreen.tsx
# ------------------------------------------------------------
$todos = "components\screens\TodosScreen.tsx"

Replace-InFile -Path $todos `
  -Find "      paddingBottom: 100," `
  -Replace "      paddingBottom: 180," `
  -Label "TodosScreen list paddingBottom 100 -> 180"

Replace-InFile -Path $todos `
  -Find "      right: 20,
      bottom: 30," `
  -Replace "      right: 20,
      bottom: 108,
      zIndex: 20," `
  -Label "TodosScreen FAB bottom 30 -> 108"

Replace-InFile -Path $todos `
  -Find "headerAction: { width: 30 }," `
  -Replace "headerAction: { width: 44, height: 44, alignItems: `"center`", justifyContent: `"center`", marginLeft: -6 }," `
  -Label "TodosScreen headerAction 30 -> 44"

Replace-InFile -Path $todos `
  -Find "<TouchableOpacity onPress={onMenuPress} style={styles.headerAction}>" `
  -Replace "<TouchableOpacity onPress={onMenuPress} activeOpacity={0.6} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.headerAction}>" `
  -Label "TodosScreen menu button hitSlop"

# ------------------------------------------------------------
# 2. StreaksScreen.tsx
# ------------------------------------------------------------
$streaks = "components\screens\StreaksScreen.tsx"

Replace-InFile -Path $streaks `
  -Find "      right: 20,
      bottom: 30," `
  -Replace "      right: 20,
      bottom: 108,
      zIndex: 20," `
  -Label "StreaksScreen FAB bottom 30 -> 108"

Replace-InFile -Path $streaks `
  -Find "contentContainerStyle={{ paddingBottom: 24 }}" `
  -Replace "contentContainerStyle={{ paddingBottom: 180 }}" `
  -Label "StreaksScreen list paddingBottom 24 -> 180"

# ------------------------------------------------------------
# 3. Notes list — app\notes\index.tsx
# ------------------------------------------------------------
$notesList = "app\notes\index.tsx"

Replace-InFile -Path $notesList `
  -Find "    list: { paddingBottom: 104 }," `
  -Replace "    list: { paddingBottom: 180 }," `
  -Label "NotesList list paddingBottom 104 -> 180"

Replace-InFile -Path $notesList `
  -Find "      right: 20,
      bottom: 28," `
  -Replace "      right: 20,
      bottom: 108,
      zIndex: 20," `
  -Label "NotesList FAB bottom 28 -> 108"

# ------------------------------------------------------------
# 4. ProfileDrawer.tsx
# ------------------------------------------------------------
$drawer = "components\ProfileDrawer.tsx"

Replace-InFile -Path $drawer `
  -Find "const EDGE_ZONE_WIDTH = 36;" `
  -Replace "const EDGE_ZONE_WIDTH = 44;" `
  -Label "ProfileDrawer EDGE_ZONE_WIDTH 36 -> 44"

Replace-InFile -Path $drawer `
  -Find "    left: 0,
    top: 0,
    bottom: 0,
    width: EDGE_ZONE_WIDTH," `
  -Replace "    left: 0,
    top: 80,
    bottom: 0,
    width: EDGE_ZONE_WIDTH," `
  -Label "ProfileDrawer edge zone top 0 -> 80"

# ------------------------------------------------------------
# 5. Tabs index — app\(tabs)\index.tsx
# ------------------------------------------------------------
$tabs = "app\(tabs)\index.tsx"

Replace-InFile -Path $tabs `
  -Find "        onPageSelected={handlePageSelected}
      >" `
  -Replace "        onPageSelected={handlePageSelected}
        scrollEnabled={!drawerOpen}
      >" `
  -Label "TabsIndex PagerView scrollEnabled toggle"

Write-Host "`n--- Done. ---" -ForegroundColor Cyan