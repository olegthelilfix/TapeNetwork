#!/usr/bin/env bash
#
# Add a GitHub issue to the TapeNetwork Kanban board and set Status = Backlog.
#
# Usage: add-to-board.sh <issue-url> [status-name] [project-title-match]
#   issue-url            full URL, e.g. https://github.com/olegthelilfix/TapeNetwork/issues/42
#   status-name          single-select Status option to set (default: "Backlog")
#   project-title-match  case-insensitive substring of the project title (default: "Kanban")
#
# Requires: gh (with `project` scope), jq.
# Exits non-zero with a human-readable reason on any failure.

set -euo pipefail

OWNER="olegthelilfix"
ISSUE_URL="${1:-}"
STATUS_NAME="${2:-Backlog}"
PROJECT_MATCH="${3:-Kanban}"

fail() { echo "add-to-board: $*" >&2; exit 1; }

[ -n "$ISSUE_URL" ] || fail "missing <issue-url> argument"
command -v gh >/dev/null || fail "gh CLI not found"
command -v jq >/dev/null || fail "jq not found"

# Preflight: confirm the token has the project scope.
if ! gh project list --owner "$OWNER" --limit 1 >/dev/null 2>&1; then
  err=$(gh project list --owner "$OWNER" --limit 1 2>&1 || true)
  if echo "$err" | grep -qi "scope"; then
    fail "gh token lacks the 'project' scope. Run: gh auth refresh -s project,read:project  then re-run this script."
  fi
  fail "cannot list projects for owner '$OWNER': $err"
fi

# 1) Find the project number by title substring.
PROJECTS_JSON=$(gh project list --owner "$OWNER" --format json 2>/dev/null)
PROJECT_NUMBER=$(echo "$PROJECTS_JSON" | jq -r --arg m "$PROJECT_MATCH" '
  .projects[] | select(.title | ascii_downcase | contains($m | ascii_downcase)) | .number' | head -1)

if [ -z "$PROJECT_NUMBER" ] || [ "$PROJECT_NUMBER" = "null" ]; then
  echo "Available projects:" >&2
  echo "$PROJECTS_JSON" | jq -r '.projects[] | "  #\(.number)  \(.title)"' >&2
  fail "no project whose title contains '$PROJECT_MATCH'. Pass the correct title match as arg 3."
fi

PROJECT_ID=$(echo "$PROJECTS_JSON" | jq -r --argjson n "$PROJECT_NUMBER" '.projects[] | select(.number==$n) | .id')
PROJECT_TITLE=$(echo "$PROJECTS_JSON" | jq -r --argjson n "$PROJECT_NUMBER" '.projects[] | select(.number==$n) | .title')

# 2) Add the issue to the project; capture the created item id.
ITEM_ID=$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$ISSUE_URL" --format json 2>/dev/null | jq -r '.id')
[ -n "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ] || fail "failed to add issue to project #$PROJECT_NUMBER ($PROJECT_TITLE)"

# 3) Resolve the Status field id and the target option id.
FIELDS_JSON=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>/dev/null)
STATUS_FIELD_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name=="Status") | .id' | head -1)

if [ -z "$STATUS_FIELD_ID" ] || [ "$STATUS_FIELD_ID" = "null" ]; then
  echo "Added issue to '$PROJECT_TITLE' (#$PROJECT_NUMBER) but found no 'Status' field to set." >&2
  echo "Fields present:" >&2
  echo "$FIELDS_JSON" | jq -r '.fields[] | "  \(.name) [\(.type)]"' >&2
  exit 1
fi

OPTION_ID=$(echo "$FIELDS_JSON" | jq -r --arg s "$STATUS_NAME" '
  .fields[] | select(.name=="Status") | .options[]? | select(.name | ascii_downcase == ($s | ascii_downcase)) | .id' | head -1)

if [ -z "$OPTION_ID" ] || [ "$OPTION_ID" = "null" ]; then
  echo "Added issue to '$PROJECT_TITLE' (#$PROJECT_NUMBER) but Status has no option named '$STATUS_NAME'." >&2
  echo "Available Status options:" >&2
  echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name=="Status") | .options[]?.name | "  \(.)"' >&2
  exit 1
fi

# 4) Set the Status.
gh project item-edit \
  --project-id "$PROJECT_ID" \
  --id "$ITEM_ID" \
  --field-id "$STATUS_FIELD_ID" \
  --single-select-option-id "$OPTION_ID" >/dev/null \
  || fail "added issue but failed to set Status to '$STATUS_NAME'"

echo "OK: added issue to '$PROJECT_TITLE' (#$PROJECT_NUMBER) with Status = $STATUS_NAME"
